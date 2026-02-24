import React from 'react';
import { Info, BookOpen, Cpu, Target, Rocket, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Card, SectionTitle, BowIcon } from '../components/UI';

export const AboutPage = () => {
  const sections = [
    {
      title: "Project Overview",
      icon: BookOpen,
      content: "This Semantic Search Engine is a Retrieval-Augmented Generation (RAG) system designed to provide accurate, context-aware answers from a private collection of documents. Unlike traditional keyword search, it understands the meaning behind queries."
    },
    {
      title: "Objectives",
      icon: Target,
      content: "The primary goal is to eliminate AI hallucinations by grounding responses strictly in verified data. It provides a professional interface for academic and corporate document management with high-precision retrieval."
    },
    {
      title: "Core Technologies",
      icon: Cpu,
      content: "Built with React, Node.js, and SQLite. It leverages Google Gemini's state-of-the-art embedding models for vector representation and LLMs for grounded natural language generation."
    },
    {
      title: "RAG Pipeline",
      icon: Sparkles,
      content: "1. Document Chunking -> 2. Vector Embedding -> 3. Semantic Similarity Search -> 4. Contextual Prompting -> 5. Grounded Answer Generation."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="inline-block bg-pink-100 p-4 rounded-3xl mb-6">
          <Info className="w-12 h-12 text-pink-500" />
        </div>
        <h1 className="text-4xl font-display font-bold text-slate-900 mb-4">
          About the Project 🎀
        </h1>
        <p className="text-slate-600 text-lg">
          BCA Final Year Project: Semantic Search Engine with Vector Databases
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {sections.map((section, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-pink-50 rounded-xl">
                  <section.icon className="w-6 h-6 text-pink-500" />
                </div>
                <h3 className="text-xl font-display font-bold text-slate-800">{section.title}</h3>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {section.content}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="bg-pink-600 text-white overflow-hidden relative">
        <div className="relative z-10">
          <SectionTitle icon={Rocket}><span className="text-white">Future Scope</span></SectionTitle>
          <ul className="space-y-4 text-pink-50">
            <li className="flex items-start gap-3">
              <div className="mt-1 bg-white/20 p-1 rounded-full"><Sparkles className="w-3 h-3" /></div>
              <span>Integration with cloud vector databases like Pinecone for massive scalability.</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 bg-white/20 p-1 rounded-full"><Sparkles className="w-3 h-3" /></div>
              <span>Support for multi-modal search including images and audio transcripts.</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 bg-white/20 p-1 rounded-full"><Sparkles className="w-3 h-3" /></div>
              <span>Real-time collaborative document indexing and shared search workspaces.</span>
            </li>
          </ul>
        </div>
        <BowIcon className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 rotate-12" />
      </Card>

      <div className="mt-16 text-center text-slate-400 text-sm">
        <p>© 2026 SemanticSearch Project • Developed for BCA Academic Evaluation</p>
        <div className="flex justify-center gap-2 mt-2">
          <BowIcon className="w-4 h-4" />
          <BowIcon className="w-4 h-4" />
          <BowIcon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
