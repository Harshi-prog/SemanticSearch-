import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Search, Upload, Info, Sparkles, LogOut, User } from 'lucide-react';
import { BowIcon } from './UI';

export const Navbar = () => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthChange = () => {
      const saved = localStorage.getItem('current_user');
      setUser(saved ? JSON.parse(saved) : null);
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('current_user');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/login');
  };
  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-pink-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="bg-pink-100 dark:bg-pink-900/30 p-2 rounded-xl">
              <Sparkles className="w-6 h-6 text-pink-500" />
            </div>
            <span className="text-xl font-display font-bold text-slate-800 dark:text-white tracking-tight">
              SemanticSearch
            </span>
            <BowIcon className="w-5 h-5 -mt-4 -ml-1" />
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {user && (
              <>
                <NavLink 
                  to="/" 
                  className={({ isActive }) => 
                    `flex items-center gap-2 text-sm font-medium transition-colors ${isActive ? 'text-pink-600 dark:text-pink-400' : 'text-slate-600 dark:text-slate-400 hover:text-pink-500'}`
                  }
                >
                  <Search className="w-4 h-4" />
                  Search
                </NavLink>
                <NavLink 
                  to="/upload" 
                  className={({ isActive }) => 
                    `flex items-center gap-2 text-sm font-medium transition-colors ${isActive ? 'text-pink-600 dark:text-pink-400' : 'text-slate-600 dark:text-slate-400 hover:text-pink-500'}`
                  }
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </NavLink>
              </>
            )}
            <NavLink 
              to="/about" 
              className={({ isActive }) => 
                `flex items-center gap-2 text-sm font-medium transition-colors ${isActive ? 'text-pink-600 dark:text-pink-400' : 'text-slate-600 dark:text-slate-400 hover:text-pink-500'}`
              }
            >
              <Info className="w-4 h-4" />
              About
            </NavLink>

            {user ? (
              <div className="flex items-center gap-4 pl-4 border-l border-pink-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="max-w-[100px] truncate">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-pink-500 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <NavLink 
                to="/login" 
                className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-pink-500/20"
              >
                Sign In
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
