import React from 'react';

/**
 * Standardized Card Component for Naksha Redesign
 * Enforces unified design language: rounded-xl, border-gray-800, p-6, dark surface.
 */
export const Card = ({ children, className = '', noPadding = false, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-[#0a0a0a] 
        border border-gray-800 
        rounded-xl 
        overflow-hidden
        transition-all duration-200
        ${noPadding ? '' : 'p-4 sm:p-5 lg:p-6'} 
        ${onClick ? 'cursor-pointer hover:border-gray-700 active:scale-[0.99]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action }) => (
  <div className="flex justify-between items-start mb-6">
    <div>
      {title && <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">{title}</h3>}
      {subtitle && <p className="text-xl font-bold text-white mt-1">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export default Card;
