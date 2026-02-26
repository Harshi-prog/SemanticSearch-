import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, ArrowRight, Sparkles, LogIn } from 'lucide-react';
import { Card, BowIcon } from '../components/UI';
import { useNavigate } from 'react-router-dom';

export const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      // Mock Login
      const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const user = users.find((u: any) => u.email === email && u.password === password);
      
      if (user) {
        localStorage.setItem('current_user', JSON.stringify(user));
        window.dispatchEvent(new Event('auth-change'));
        navigate('/');
      } else {
        setError('Invalid email or password');
      }
    } else {
      // Mock Register
      if (!name || !email || !password) {
        setError('Please fill in all fields');
        return;
      }

      const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
      if (users.find((u: any) => u.email === email)) {
        setError('Email already registered');
        return;
      }

      const newUser = { name, email, password };
      users.push(newUser);
      localStorage.setItem('mock_users', JSON.stringify(users));
      localStorage.setItem('current_user', JSON.stringify(newUser));
      window.dispatchEvent(new Event('auth-change'));
      navigate('/');
    }
  };

  return (
    <div className="max-w-md mx-auto py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-block bg-pink-100 dark:bg-pink-900/30 p-4 rounded-3xl mb-6">
          <LogIn className="w-12 h-12 text-pink-500" />
        </div>
        <h1 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-2">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          {isLogin ? 'Enter your credentials to access your documents' : 'Join us to start indexing your private documents'}
        </p>
      </motion.div>

      <Card withBow className="shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                key="name"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative"
              >
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-pink-50/50 dark:bg-slate-800/50 border-2 border-pink-100 dark:border-slate-700 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-pink-300 transition-all dark:text-slate-100"
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400 w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-pink-50/50 dark:bg-slate-800/50 border-2 border-pink-100 dark:border-slate-700 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-pink-300 transition-all dark:text-slate-100"
            />
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400 w-5 h-5" />
          </div>

          <div className="relative">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-pink-50/50 dark:bg-slate-800/50 border-2 border-pink-100 dark:border-slate-700 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-pink-300 transition-all dark:text-slate-100"
            />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400 w-5 h-5" />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center font-medium">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group shadow-lg shadow-pink-500/20"
          >
            {isLogin ? 'Sign In' : 'Register'}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-pink-100 dark:border-slate-800 text-center">
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-pink-600 dark:text-pink-400 font-bold hover:underline"
            >
              {isLogin ? 'Register Now' : 'Sign In'}
            </button>
          </p>
        </div>
      </Card>

      <div className="mt-12 flex justify-center gap-4 opacity-30">
        <BowIcon className="w-6 h-6" />
        <Sparkles className="w-6 h-6" />
        <BowIcon className="w-6 h-6" />
      </div>
    </div>
  );
};
