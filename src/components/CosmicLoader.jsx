import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';


export function CosmicLoader({ message = 'Reading the stars…' }) {
  return (
    <Box sx={{ display:'flex', flexDirection:'column', alignItems:'center',
               justifyContent:'center', gap:2.5, py:5 }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        style={{ width:40, height:40, position:'relative' }}
      >
        {[...Array(8)].map((_, i) => (
          <motion.span
            key={i}
            animate={{ opacity: [0.15, 1, 0.15] }}
            transition={{ duration:1.6, repeat:Infinity, delay: i * 0.2, ease:'easeInOut' }}
            style={{
              position:'absolute', top:'50%', left:'50%',
              width:3, height:3, borderRadius:'50%',
              background:'#3b82f6',
              transform:`rotate(${i*45}deg) translateY(-16px) translate(-50%,-50%)`,
            }}
          />
        ))}
      </motion.div>
      <Typography sx={{
        fontFamily: '"Geist Mono", sans-serif',
        fontSize: '0.75rem',
        letterSpacing: '0.08em',
        color: '#6b6b6b',
      }}>
        {message}
      </Typography>

    </Box>
  );
}
