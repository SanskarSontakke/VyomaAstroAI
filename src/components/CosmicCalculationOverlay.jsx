import React from 'react';
import { useCalculation } from '../lib/CalculationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CosmicLoader } from './CosmicLoader';

export function CosmicCalculationOverlay() {
  const { isCalculating, progress, currentTask } = useCalculation();

  return (
    <AnimatePresence>
      {isCalculating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm pointer-events-auto"
        >
          <div className="w-full max-w-md px-6 text-center space-y-8">
            {/* Spinner or Cosmic Animation */}
            <div className="relative flex items-center justify-center">
              <CosmicLoader size="large" />
              <div className="absolute inset-0 bg-blue-500/20 blur-[50px] rounded-full animate-pulse" />
            </div>

            {/* Dynamic Status Text */}
            <div className="space-y-2 h-16">
              <h2 className="text-xl font-bold text-white uppercase tracking-widest font-serif">
                Celestial Alignment
              </h2>
              <motion.p
                key={currentTask}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-sm font-medium text-blue-400 h-6"
              >
                {currentTask || 'Initiating computation...'}
              </motion.p>
            </div>

            {/* Smooth Progress Bar */}
            <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 50, damping: 15 }}
                className="bg-blue-500 h-full rounded-full"
              />
            </div>
            
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
              Please wait while the cosmic engine processes the coordinates...
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
