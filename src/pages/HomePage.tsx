import React, { useState } from 'react';
import { Search as SearchIcon, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, SectionTitle, BowIcon } from '../components/UI';
import { generateEmbedding, getAnswerFromContext } from '../services/gemini';
import { vectorStore } from '../services/vectorStore';
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

      // 2. Search local vector store
      const sources = vectorStore.search(queryEmbedding, 10);

      if (sources.length === 0) {
        setResult({
          answer: "No documents have been indexed yet. Please go to the Upload page and add some documents.",
          sources: []
        });
        return;
      }

      // 3. Construct context
      const context = sources
        .map((s: any) => `[Source: ${s.filename}] ${s.content}`)
        .join('\n\n');

      // 4. Get answer from Gemini
      const answer = await getAnswerFromContext(query, context);

      // Filter sources to only show those with a reasonable score
      const filteredSources = sources.slice(0, 4);

      setResult({ answer, sources: filteredSources });
    } catch (error) {
      console.error('Search error:', error);
      setResult({
        answer: "An error occurred during search. Please ensure you have indexed documents and your API key is valid.",
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
        <h1 className="text-5xl font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-3">
          Semantic Search
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
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
            className="w-full bg-pink-50/50 dark:bg-slate-800/50 border-2 border-pink-100 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-32 focus:outline-none focus:border-pink-300 transition-all text-lg dark:text-slate-100"
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
              <div className="w-16 h-16 border-4 border-pink-100 dark:border-slate-800 border-t-pink-500 rounded-full animate-spin"></div>
              <BowIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8" />
            </div>
            <p className="mt-4 text-pink-600 dark:text-pink-400 font-medium animate-pulse">Analyzing documents...</p>
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <Card className="bg-white/90 dark:bg-slate-900/90" withBow>
              <SectionTitle icon={Sparkles}>Answer</SectionTitle>
              <div className="prose prose-pink dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed">
                <Markdown>{result.answer}</Markdown>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {!result && !isSearching && (
        <div className="text-center py-20 opacity-60">
          <SearchIcon className="w-16 h-16 mx-auto mb-4 text-pink-300 dark:text-slate-600" />
          <p className="text-xl font-display text-slate-400 dark:text-slate-500">Your search results will appear here</p>
        </div>
      )}
    </div>
  );
};
