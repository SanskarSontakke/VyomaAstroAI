import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export function SectionError({ title = 'Sync Interrupted', detail, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 px-6 border border-red-900/20 bg-red-900/5 rounded-2xl animate-in fade-in duration-500">
      <div className="w-10 h-10 rounded-full bg-red-900/10 flex items-center justify-center text-red-500">
        <AlertCircle size={20} />
      </div>
      
      <div className="text-center space-y-1">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500/80">
          {title}
        </h3>
        {detail && (
          <p className="text-xs text-gray-500 leading-relaxed max-w-[280px] mx-auto font-medium">
            {detail}
          </p>
        )}
      </div>

      {onRetry && (
        <button 
          onClick={onRetry}
          className="mt-2 flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/10 border border-red-600/20 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-600 hover:text-white transition-all active:scale-95"
        >
          <RotateCcw size={12} />
          Retry Sequence
        </button>
      )}
    </div>
  );
}
