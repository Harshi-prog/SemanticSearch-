# Semantic Search Engine with Vector Databases 🎀

A production-quality BCA Final Year Project implementing a Retrieval-Augmented Generation (RAG) pipeline.

## 🌟 Features
- **Semantic Search**: Uses Google Gemini embeddings for deep contextual understanding.
- **Vector Database**: Local SQLite-based vector storage with cosine similarity search.
- **RAG Pipeline**: Answers are strictly grounded in uploaded documents to prevent hallucinations.
- **Document Support**: PDF, DOCX, and TXT files.
- **Aesthetic UI**: Modern, responsive design with a soft baby pink theme and elegant animations.
- **Citations**: Clear source attribution with similarity scores.

## 🛠️ Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express, Better-SQLite3.
- **AI**: Google Gemini API (Embeddings & LLM).
- **Processing**: pdf-parse, mammoth.

## 🚀 Setup Instructions
1. **API Key**: Ensure your Gemini API key is configured in the environment.
2. **Install Dependencies**: `npm install`
3. **Run Development**: `npm run dev`

## 📁 Project Structure
- `/src/components`: UI components.
- `/src/services`: Gemini API and search logic.
- `/server.ts`: Express backend for file processing and vector storage.
- `/src/pages`: Home, Upload, and About pages.

## 🎀 Design Philosophy
The application follows a "Soft Professional" aesthetic, combining academic rigor with a pleasant, modern visual style. Subtle pink bows are integrated as decorative elements to meet project requirements while maintaining professionalism.
