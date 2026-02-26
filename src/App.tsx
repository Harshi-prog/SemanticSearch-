import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { UploadPage } from './pages/UploadPage';
import { AboutPage } from './pages/AboutPage';
import { LoginPage } from './pages/LoginPage';
import { BowIcon } from './components/UI';
import { Moon, Sun } from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = localStorage.getItem('current_user');
  if (!user) {
    return <LoginPage />;
  }
  return <>{children}</>;
};

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    if (isDark) {
      root.classList.add('dark');
      body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('current_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    const handleAuthChange = () => {
      const saved = localStorage.getItem('current_user');
      setUser(saved ? JSON.parse(saved) : null);
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  return (
    <Router>
      <div className="min-h-screen pink-gradient transition-colors duration-300">
        <Navbar />
        
        {/* Dark Mode Toggle Button */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="fixed bottom-6 right-6 z-50 bg-white dark:bg-slate-800 p-3 rounded-full shadow-xl border border-pink-100 dark:border-slate-700 hover:scale-110 transition-all group"
          title="Toggle Dark Mode"
        >
          <div className="relative">
            <BowIcon className={`w-8 h-8 transition-all duration-500 ${isDark ? 'text-pink-400 rotate-180' : 'text-pink-500'}`} />
            <div className="absolute -top-1 -right-1">
              {isDark ? (
                <Sun className="w-4 h-4 text-yellow-400 animate-pulse" />
              ) : (
                <Moon className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </div>
        </button>

        <main className="container mx-auto px-4 pb-20">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
