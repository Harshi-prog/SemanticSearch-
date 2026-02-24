import React from 'react';

export const BowIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={`${className} text-pink-400 bow-shadow`}
  >
    <path 
      d="M12 13C12 13 10 10 7 10C4 10 3 12 3 13C3 14 4 16 7 16C10 16 12 13 12 13Z" 
      fill="currentColor" 
      fillOpacity="0.2" 
      stroke="currentColor" 
      strokeWidth="1.5"
    />
    <path 
      d="M12 13C12 13 14 10 17 10C20 10 21 12 21 13C21 14 20 16 17 16C14 16 12 13 12 13Z" 
      fill="currentColor" 
      fillOpacity="0.2" 
      stroke="currentColor" 
      strokeWidth="1.5"
    />
    <circle cx="12" cy="13" r="1.5" fill="currentColor" />
    <path d="M11 14.5L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M13 14.5L15 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const SectionTitle = ({ children, icon: Icon }: { children: React.ReactNode, icon?: any }) => (
  <div className="flex items-center gap-2 mb-6">
    {Icon && <Icon className="w-6 h-6 text-pink-500" />}
    <h2 className="text-2xl font-display font-semibold text-slate-800">{children}</h2>
    <BowIcon className="w-5 h-5 ml-1 opacity-60" />
  </div>
);

export const Card = ({ children, className = "", withBow = false }: { children: React.ReactNode, className?: string, withBow?: boolean }) => (
  <div className={`glass rounded-3xl p-6 relative overflow-hidden ${className}`}>
    {withBow && <BowIcon className="absolute -top-2 -right-2 w-12 h-12 opacity-10 rotate-12 pointer-events-none" />}
    {children}
  </div>
);
