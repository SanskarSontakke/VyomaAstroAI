import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCalculation } from '../../lib/CalculationContext';

const TopProgressBar = () => {
  const { isCalculating, progress, currentTask } = useCalculation();

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
      <AnimatePresence>
        {isCalculating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            {/* Progress Bar */}
            <div className="h-[2px] bg-gray-900 overflow-hidden">
               <motion.div 
                  className="h-full bg-blue-500 shadow-[0_0_8px_white]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ type: 'spring', damping: 20, stiffness: 100 }}
               />
            </div>

            {/* Status Tooltip */}
            <div className="flex justify-center mt-2">
               <motion.div 
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="px-3 py-1 bg-black/80 backdrop-blur-md border border-gray-800 rounded-full flex items-center gap-2"
               >
                  <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">
                     {currentTask || 'Decoding Celestial Code'}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-blue-500">
                     {Math.round(progress)}%
                  </span>
               </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TopProgressBar;
