import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import PropTypes from 'prop-types';

export function EmptyState({ title, subtitle, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 px-6 border-2 border-dashed border-gray-900 rounded-2xl bg-gray-900/5 transition-all group hover:border-gray-800">
      <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-gray-700 group-hover:text-blue-500 transition-colors">
        <Sparkles size={24} />
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="text-sm font-bold text-white uppercase tracking-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-gray-500 leading-relaxed max-w-[280px] mx-auto font-medium">
            {subtitle}
          </p>
        )}
      </div>

      {actionLabel && (
        <button 
          onClick={onAction}
          className="mt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-colors"
        >
          {actionLabel}
          <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}

EmptyState.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
};
