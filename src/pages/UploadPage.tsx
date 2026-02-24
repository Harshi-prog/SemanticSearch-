import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload as UploadIcon, File, X, CheckCircle, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, SectionTitle, BowIcon } from '../components/UI';
import { generateEmbedding } from '../services/gemini';

export const UploadPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [documents, setDocuments] = useState<any[]>([]);

  const fetchDocuments = async () => {
    const res = await fetch('/api/documents');
    const data = await res.json();
    setDocuments(data);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

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
        const formData = new FormData();
        formData.append('file', file);

        // 1. Extract text and chunk
        const extractRes = await fetch('/api/extract', {
          method: 'POST',
          body: formData
        });
        const { filename, chunks } = await extractRes.json();

        // 2. Generate embeddings for chunks
        const embeddings = [];
        for (let j = 0; j < chunks.length; j++) {
          const emb = await generateEmbedding(chunks[j]);
          embeddings.push(emb);
          setProgress(Math.round(((i * chunks.length + j + 1) / (files.length * chunks.length)) * 100));
        }

        // 3. Index in vector DB
        await fetch('/api/index', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename, chunks, embeddings })
        });
      }

      setFiles([]);
      fetchDocuments();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload some documents.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const deleteDoc = async (id: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    fetchDocuments();
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <SectionTitle icon={UploadIcon}>Upload Documents</SectionTitle>
      
      <Card className="mb-12" withBow>
        <div 
          {...getRootProps()} 
          className={`border-4 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer ${
            isDragActive ? 'border-pink-400 bg-pink-50' : 'border-pink-100 hover:border-pink-200'
          }`}
        >
          <input {...getInputProps()} />
          <div className="bg-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <UploadIcon className="w-10 h-10 text-pink-500" />
          </div>
          <h3 className="text-2xl font-display font-semibold text-slate-800 mb-2">
            Drag & Drop Files
          </h3>
          <p className="text-slate-500">
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
                <div key={idx} className="flex items-center justify-between bg-pink-50/50 p-4 rounded-2xl border border-pink-100">
                  <div className="flex items-center gap-3">
                    <File className="w-5 h-5 text-pink-500" />
                    <span className="font-medium text-slate-700">{file.name}</span>
                    <span className="text-xs text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
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
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-pink-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
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
          <div className="text-center py-12 text-slate-400 border-2 border-dashed border-pink-100 rounded-3xl">
            No documents indexed yet.
          </div>
        ) : (
          documents.map((doc) => (
            <Card key={doc.id} className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div className="bg-pink-100 p-3 rounded-2xl">
                  <File className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{doc.filename}</h4>
                  <p className="text-xs text-slate-400">Indexed on {new Date(doc.upload_date).toLocaleDateString()}</p>
                </div>
              </div>
              <button 
                onClick={() => deleteDoc(doc.id)}
                className="p-2 text-slate-300 hover:text-pink-600 transition-colors"
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
