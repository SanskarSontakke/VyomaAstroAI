import React from 'react';
import { motion } from 'framer-motion';

export function CosmicLoader({ message = 'Reading the stars…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-10">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        className="relative w-10 h-10"
      >
        {[...Array(8)].map((_, i) => (
          <motion.span
            key={i}
            animate={{ opacity: [0.15, 1, 0.15], scale: [1, 1.5, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-blue-600"
            style={{
              transform: `rotate(${i * 45}deg) translateY(-16px) translate(-50%, -50%)`,
              boxShadow: '0 0 8px rgba(59, 130, 246, 0.5)'
            }}
          />
        ))}
      </motion.div>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500 animate-pulse">
        {message}
      </span>
    </div>
  );
}

export default CosmicLoader;
