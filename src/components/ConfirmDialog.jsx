import { useState, useCallback, createContext, useContext } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText,
         DialogActions, Button, Box } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { motion } from 'framer-motion';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({ open:false, title:'', message:'',
    confirmLabel:'Confirm', confirmColor:'error', resolve:null });

  const confirm = useCallback(({ title, message, confirmLabel='Confirm', confirmColor='error' }) =>
    new Promise(resolve => setState({
      open:true, title, message, confirmLabel, confirmColor, resolve
    })), []);

  const handleClose = (result) => {
    setState(s => { s.resolve?.(result); return { ...s, open:false }; });
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog
        open={state.open}
        onClose={() => handleClose(false)}
        PaperComponent={motion.div}
        PaperProps={{
          initial:{ scale:0.88, opacity:0 },
          animate:{ scale:1,    opacity:1 },
          exit:{    scale:0.88, opacity:0 },
          transition:{ duration:0.25, ease:[0.22,0.61,0.36,1] },
          background: '#111111',
          border: '1px solid #262626',
          borderRadius: 12,
          boxShadow: '0 24px 80px rgba(0,0,0,0.9)',
          padding: '4px',
        }}

      >
        <DialogTitle sx={{
          display:'flex', alignItems:'center', gap:1.2,
          fontFamily: '"Geist", sans-serif',
          fontSize: '0.9375rem',
          fontWeight: 500,
          letterSpacing: '-0.015em',
          color: '#ededed',
          pb: 1,
        }}>

          <Box sx={{
            width:32, height:32, borderRadius:'50%',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.20)',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
          }}>

            <WarningAmberIcon sx={{ fontSize:16, color:'#E57373' }} />
          </Box>
          {state.title}
        </DialogTitle>
        <DialogContent sx={{ pt:0.5 }}>
          <DialogContentText sx={{
            fontFamily: '"Geist", sans-serif',
            fontSize: '0.875rem',
            color: '#6b6b6b',
            lineHeight: 1.65,
            letterSpacing: '-0.005em',
          }}>

            {state.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px:3, pb:3, gap:1.5 }}>
          <Button 
            variant="text" 
            onClick={() => handleClose(false)}
            sx={{
              color: '#6b6b6b',
              textTransform: 'none',
              '&:hover': { color: '#ededed', background: 'transparent' },
            }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={() => handleClose(true)}
            sx={{
              textTransform: 'none',
              background: state.confirmColor === 'error' ? '#ef4444' : '#3b82f6',
              color: '#fff',
              px: 3,
            }}>
            {state.confirmLabel}
          </Button>
        </DialogActions>

      </Dialog>
    </ConfirmContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useConfirm = () => useContext(ConfirmContext);
