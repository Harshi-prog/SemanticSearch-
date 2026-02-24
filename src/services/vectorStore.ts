
export interface Chunk {
  id: string;
  doc_id: string;
  filename: string;
  content: string;
  embedding: number[];
}

export interface Document {
  id: string;
  filename: string;
}

class VectorStore {
  private chunks: Chunk[] = [];
  private documents: Document[] = [];

  constructor() {
    this.load();
  }

  private load() {
    const savedChunks = localStorage.getItem('vector_chunks');
    const savedDocs = localStorage.getItem('vector_docs');
    if (savedChunks) this.chunks = JSON.parse(savedChunks);
    if (savedDocs) this.documents = JSON.parse(savedDocs);
  }

  private save() {
    localStorage.setItem('vector_chunks', JSON.stringify(this.chunks));
    localStorage.setItem('vector_docs', JSON.stringify(this.documents));
  }

  addDocument(filename: string, newChunks: Omit<Chunk, 'id' | 'doc_id' | 'filename'>[]) {
    const docId = Math.random().toString(36).substring(7);
    this.documents.push({ id: docId, filename });
    
    const processedChunks = newChunks.map(c => ({
      ...c,
      id: Math.random().toString(36).substring(7),
      doc_id: docId,
      filename
    }));
    
    this.chunks.push(...processedChunks);
    this.save();
  }

  getDocuments() {
    return this.documents;
  }

  deleteDocument(docId: string) {
    this.documents = this.documents.filter(d => d.id !== docId);
    this.chunks = this.chunks.filter(c => c.doc_id !== docId);
    this.save();
  }

  search(queryEmbedding: number[], topK: number = 5) {
    const results = this.chunks.map(chunk => {
      const score = this.cosineSimilarity(queryEmbedding, chunk.embedding);
      return {
        ...chunk,
        score
      };
    });

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  private cosineSimilarity(vecA: number[], vecB: number[]) {
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

  clear() {
    this.chunks = [];
    this.documents = [];
    this.save();
  }
}

export const vectorStore = new VectorStore();
