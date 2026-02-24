import express, { Request } from 'express';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import { createRequire } from 'module';
import mammoth from 'mammoth';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const db = new Database('vector_store.db');

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS chunks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doc_id INTEGER,
    content TEXT,
    embedding BLOB,
    FOREIGN KEY (doc_id) REFERENCES documents(id)
  );
`);

const app = express();
app.use(express.json({ limit: '50mb' }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// API Routes
app.post('/api/extract', upload.single('file'), async (req: MulterRequest, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    let text = '';

    if (fileExt === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      text = data.text;
    } else if (fileExt === '.docx') {
      const dataBuffer = fs.readFileSync(filePath);
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      text = result.value;
    } else {
      text = fs.readFileSync(filePath, 'utf-8');
    }

    // Basic chunking
    const chunks = chunkText(text, 1000, 200);
    
    res.json({ 
      filename: req.file.originalname,
      chunks 
    });
  } catch (error) {
    console.error('Extraction error:', error);
    res.status(500).json({ error: 'Failed to extract text' });
  }
});

app.post('/api/index', (req, res) => {
  try {
    const { filename, chunks, embeddings } = req.body;
    
    const insertDoc = db.prepare('INSERT INTO documents (filename) VALUES (?)');
    const docResult = insertDoc.run(filename);
    const docId = docResult.lastInsertRowid;

    const insertChunk = db.prepare('INSERT INTO chunks (doc_id, content, embedding) VALUES (?, ?, ?)');
    
    const insertMany = db.transaction((data) => {
      for (const item of data) {
        // Store embedding as Float32Array buffer
        const buffer = Buffer.from(new Float32Array(item.embedding).buffer);
        insertChunk.run(docId, item.content, buffer);
      }
    });

    const data = chunks.map((content: string, i: number) => ({
      content,
      embedding: embeddings[i]
    }));

    insertMany(data);
    res.json({ success: true, docId });
  } catch (error) {
    console.error('Indexing error:', error);
    res.status(500).json({ error: 'Failed to index document' });
  }
});

app.get('/api/documents', (req, res) => {
  const docs = db.prepare('SELECT * FROM documents ORDER BY upload_date DESC').all();
  res.json(docs);
});

app.delete('/api/documents/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM chunks WHERE doc_id = ?').run(id);
  db.prepare('DELETE FROM documents WHERE id = ?').run(id);
  res.json({ success: true });
});

app.post('/api/search', (req, res) => {
  try {
    const { queryEmbedding, topK = 5, queryText } = req.body;
    const queryVec = new Float32Array(queryEmbedding);

    const allChunks = db.prepare(`
      SELECT chunks.content, chunks.embedding, documents.filename 
      FROM chunks 
      JOIN documents ON chunks.doc_id = documents.id
    `).all();

    // Check if we are using the fallback signature (flag in first dimension)
    const isFallback = queryVec[0] > 0.998;

    let results;
    if (isFallback && queryText) {
      // Keyword search fallback
      const keywords = queryText.toLowerCase().split(/\W+/).filter((k: string) => k.length > 2);
      results = allChunks.map((chunk: any) => {
        const contentLower = chunk.content.toLowerCase();
        let matchCount = 0;
        keywords.forEach((kw: string) => {
          if (contentLower.includes(kw)) matchCount++;
        });
        
        // Boost score if keywords match
        const keywordScore = keywords.length > 0 ? matchCount / keywords.length : 0;
        
        // Also use the deterministic vector similarity as a secondary signal
        const chunkVec = new Float32Array(chunk.embedding.buffer, chunk.embedding.byteOffset, chunk.embedding.byteLength / 4);
        const vecScore = cosineSimilarity(queryVec, chunkVec);
        
        return {
          content: chunk.content,
          filename: chunk.filename,
          score: (keywordScore * 0.7) + (vecScore * 0.3)
        };
      });
    } else {
      // Normal semantic search
      results = allChunks.map((chunk: any) => {
        const chunkVec = new Float32Array(chunk.embedding.buffer, chunk.embedding.byteOffset, chunk.embedding.byteLength / 4);
        const score = cosineSimilarity(queryVec, chunkVec);
        return {
          content: chunk.content,
          filename: chunk.filename,
          score
        };
      });
    }

    results.sort((a, b) => b.score - a.score);
    res.json(results.slice(0, topK));
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

function chunkText(text: string, size: number, overlap: number) {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + size));
    i += size - overlap;
  }
  return chunks;
}

function cosineSimilarity(vecA: Float32Array, vecB: Float32Array) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function startServer() {
  const PORT = 3000;
  
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
