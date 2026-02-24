import React, { useState } from 'react';
import { Search as SearchIcon, Sparkles, FileText, Quote, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, SectionTitle, BowIcon } from '../components/UI';
import { generateEmbedding, getAnswerFromContext } from '../services/gemini';
import Markdown from 'react-markdown';

export const HomePage = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<{
    answer: string;
    sources: any[];
  } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setResult(null);

    try {
      // 1. Generate query embedding
      const queryEmbedding = await generateEmbedding(query);

      // 2. Search vector DB
      const searchRes = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          queryEmbedding, 
          topK: 10,
          queryText: query // Pass raw text for keyword fallback
        }) 
      });
      let sources = await searchRes.json();

      if (sources.length === 0) {
        setResult({
          answer: "No documents have been uploaded yet. Please go to the Upload page.",
          sources: []
        });
        return;
      }

      // 3. Optional: Semantic Reranking (if we have many sources)
      // For this project, we'll use the top retrieved chunks directly 
      // but ensure they are relevant in the prompt.

      // 4. Construct context
      const context = sources
        .map((s: any) => `[Source: ${s.filename}] ${s.content}`)
        .join('\n\n');

      // 5. Get answer from Gemini
      const answer = await getAnswerFromContext(query, context);

      // Filter sources to only show those with a reasonable score
      const filteredSources = sources.slice(0, 4);

      setResult({ answer, sources: filteredSources });
    } catch (error) {
      console.error('Search error:', error);
      setResult({
        answer: "An error occurred during search. Please try again.",
        sources: []
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-display font-bold text-slate-900 mb-4 flex items-center justify-center gap-3">
          Semantic Search 🎀
        </h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
          Ask questions and get answers grounded strictly in your uploaded documents using advanced vector similarity.
        </p>
      </motion.div>

      <Card className="mb-8" withBow>
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your documents..."
            className="w-full bg-pink-50/50 border-2 border-pink-100 rounded-2xl py-4 pl-12 pr-32 focus:outline-none focus:border-pink-300 transition-all text-lg"
          />
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400 w-6 h-6" />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-2 top-2 bottom-2 bg-pink-500 hover:bg-pink-600 text-white px-6 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSearching ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
            ) : (
              <>Search</>
            )}
          </button>
        </form>
      </Card>

      <AnimatePresence>
        {isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <div className="relative">
              <div className="w-16 h-16 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin"></div>
              <BowIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8" />
            </div>
            <p className="mt-4 text-pink-600 font-medium animate-pulse">Analyzing documents...</p>
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <Card className="bg-white/90" withBow>
              <SectionTitle icon={Sparkles}>Answer</SectionTitle>
              <div className="prose prose-pink max-w-none text-slate-700 leading-relaxed">
                <Markdown>{result.answer}</Markdown>
              </div>
            </Card>

            {result.sources.length > 0 && (
              <div>
                <SectionTitle icon={Quote}>Sources & Citations</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.sources.map((source, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className="h-full bg-white/50 hover:bg-white/80 transition-colors border-pink-100">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2 text-pink-600 font-semibold">
                            <FileText className="w-4 h-4" />
                            <span className="text-sm truncate max-w-[150px]">{source.filename}</span>
                          </div>
                          <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full font-bold">
                            {Math.round(source.score * 100)}% Match
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-4 italic">
                          "{source.content}"
                        </p>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!result && !isSearching && (
        <div className="text-center py-20 opacity-40">
          <SearchIcon className="w-16 h-16 mx-auto mb-4 text-pink-300" />
          <p className="text-xl font-display">Your search results will appear here</p>
        </div>
      )}
    </div>
  );
};
