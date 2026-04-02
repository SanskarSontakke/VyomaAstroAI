import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import PropTypes from 'prop-types';

export function FieldError({ message }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -6, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -4, height: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="overflow-hidden"
        >
          <div className="flex items-center gap-2 mt-1.5 px-0.5 text-[#ef4444] animate-in fade-in duration-300">
            <AlertCircle size={12} className="shrink-0" />
            <span className="text-[11px] font-bold tracking-tight leading-none uppercase">
              {message}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

FieldError.propTypes = {
  message: PropTypes.string,
};
