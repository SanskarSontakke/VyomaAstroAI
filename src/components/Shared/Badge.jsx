import React from 'react';

export const Badge = ({ children, variant = 'blue' }) => {
  const variants = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-600/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    gold: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border whitespace-nowrap ${variants[variant] || variants.blue}`}>
      {children}
    </span>
  );
};
