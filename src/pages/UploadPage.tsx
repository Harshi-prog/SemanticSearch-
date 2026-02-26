import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload as UploadIcon, File, X, CheckCircle, Loader2, Trash2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, SectionTitle, BowIcon } from '../components/UI';
import { generateEmbedding } from '../services/gemini';
import { vectorStore } from '../services/vectorStore';
import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker using a more reliable CDN link or local path
// For version 5.x, we ensure the worker matches the library version
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export const UploadPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [documents, setDocuments] = useState(vectorStore.getDocuments());
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  useEffect(() => {
    if (!process.env.GEMINI_API_KEY) {
      setApiKeyMissing(true);
    }
  }, []);

  const chunkText = (text: string, size: number = 1000, overlap: number = 200) => {
    const chunks = [];
    let start = 0;
    while (start < text.length) {
      const end = Math.min(start + size, text.length);
      chunks.push(text.slice(start, end));
      start += size - overlap;
    }
    return chunks;
  };

  const extractText = async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    if (ext === 'pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }
      return fullText;
    } else if (ext === 'docx') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } else {
      return await file.text();
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    }
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const text = await extractText(file);
          if (!text || text.trim().length === 0) {
            throw new Error(`No text could be extracted from ${file.name}`);
          }
          
          const chunks = chunkText(text);
          const chunkEmbeddings = [];
          
          for (let j = 0; j < chunks.length; j++) {
            const embedding = await generateEmbedding(chunks[j]);
            chunkEmbeddings.push({ content: chunks[j], embedding });
            setProgress(Math.round(((i * chunks.length + j + 1) / (files.length * chunks.length)) * 100));
          }
          
          vectorStore.addDocument(file.name, chunkEmbeddings);
        } catch (fileError: any) {
          console.error(`Error processing ${file.name}:`, fileError);
          alert(`Error processing ${file.name}: ${fileError.message || 'Unknown error'}`);
        }
      }

      setFiles([]);
      setDocuments(vectorStore.getDocuments());
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload some documents.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const deleteDoc = (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    vectorStore.deleteDocument(id);
    setDocuments(vectorStore.getDocuments());
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <SectionTitle icon={UploadIcon}>Upload Documents</SectionTitle>
      
      {apiKeyMissing && (
        <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl text-amber-800 dark:text-amber-200 text-sm flex items-center gap-3">
          <Sparkles className="w-5 h-5 flex-shrink-0" />
          <p>
            <strong>Note:</strong> GEMINI_API_KEY is not configured. The app will use a local deterministic fallback for embeddings. Search results may be less accurate.
          </p>
        </div>
      )}
      
      <Card className="mb-12" withBow>
        <div 
          {...getRootProps()} 
          className={`border-4 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer ${
            isDragActive 
              ? 'border-pink-400 bg-pink-50 dark:bg-pink-900/10' 
              : 'border-pink-100 dark:border-slate-800 hover:border-pink-200 dark:hover:border-slate-700'
          }`}
        >
          <input {...getInputProps()} />
          <div className="bg-pink-100 dark:bg-pink-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <UploadIcon className="w-10 h-10 text-pink-500" />
          </div>
          <h3 className="text-2xl font-display font-semibold text-slate-800 dark:text-white mb-2">
            Drag & Drop Files
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Support for PDF, DOCX, and TXT files.
          </p>
        </div>

        <AnimatePresence>
          {files.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 space-y-3"
            >
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between bg-pink-50/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-pink-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <File className="w-5 h-5 text-pink-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-200">{file.name}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button onClick={() => removeFile(idx)} className="text-slate-400 hover:text-pink-600 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
              
              <div className="pt-4">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-pink-200 dark:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Indexing... {progress}%
                    </>
                  ) : (
                    <>
                      Start Indexing
                      <BowIcon className="w-6 h-6 text-white" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <SectionTitle icon={File}>Indexed Documents ({documents.length})</SectionTitle>
      <div className="grid grid-cols-1 gap-4">
        {documents.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500 border-2 border-dashed border-pink-100 dark:border-slate-800 rounded-3xl">
            No documents indexed yet.
          </div>
        ) : (
          documents.map((doc) => (
            <Card key={doc.id} className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div className="bg-pink-100 dark:bg-pink-900/30 p-3 rounded-2xl">
                  <File className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white">{doc.filename}</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Indexed locally</p>
                </div>
              </div>
              <button 
                onClick={() => deleteDoc(doc.id)}
                className="p-2 text-slate-300 dark:text-slate-500 hover:text-pink-600 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
