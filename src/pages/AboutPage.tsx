import React from 'react';
import { Info, BookOpen, Cpu, Target, Sparkles } from 'lucide-react';
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
      content: "Built with React and Vite. It leverages browser-based storage (LocalStorage) for the vector store and Google Gemini's state-of-the-art models for embeddings and grounded natural language generation."
    },
    {
      title: "Workflow",
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
        <div className="inline-block bg-pink-100 dark:bg-pink-900/30 p-4 rounded-3xl mb-6">
          <Info className="w-12 h-12 text-pink-500" />
        </div>
        <h1 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-4">
          About the Project
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
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
            <Card className="h-full" withBow>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
                  <section.icon className="w-6 h-6 text-pink-500" />
                </div>
                <h3 className="text-xl font-display font-bold text-pink-800 dark:text-pink-200">{section.title}</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {section.content}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>

    </div>
  );
};
