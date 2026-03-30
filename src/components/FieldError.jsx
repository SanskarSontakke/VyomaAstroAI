import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export function FieldError({ message }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity:0, y:-6, height:0 }}
          animate={{ opacity:1, y:0,  height:'auto' }}
          exit={{    opacity:0, y:-4, height:0 }}
          transition={{ duration:0.22, ease:'easeOut' }}
          style={{ overflow:'hidden' }}
        >
          <Typography sx={{
            display: 'flex', alignItems: 'center', gap: 0.6,
            fontFamily: '"Geist", sans-serif',
            fontSize: '0.8125rem', 
            color: '#ef4444',
            mt: 0.5, lineHeight: 1.4,
          }}>
            <ErrorOutlineIcon sx={{ fontSize: 13, flexShrink: 0 }} />
            {message}
          </Typography>
        </motion.div>
      )}
    </AnimatePresence>

  );
}
