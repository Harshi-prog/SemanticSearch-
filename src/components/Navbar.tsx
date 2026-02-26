import React from 'react';
import { NavLink } from 'react-router-dom';
import { Search, Upload, Info, Sparkles } from 'lucide-react';
import { BowIcon } from './UI';

export const Navbar = () => {
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
            <NavLink 
              to="/about" 
              className={({ isActive }) => 
                `flex items-center gap-2 text-sm font-medium transition-colors ${isActive ? 'text-pink-600 dark:text-pink-400' : 'text-slate-600 dark:text-slate-400 hover:text-pink-500'}`
              }
            >
              <Info className="w-4 h-4" />
              About
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};
