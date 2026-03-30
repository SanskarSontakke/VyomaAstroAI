import { createContext, useContext, useCallback, useReducer } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Box, IconButton, Typography, Stack } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon        from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon        from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon        from '@mui/icons-material/InfoOutlined';
import CloseIcon               from '@mui/icons-material/Close';

const TOAST_CONFIG = {
  success: { color:'#4ade80', bg:'rgba(0,0,0,0.92)', border:'#1a3a1a', duration:4000,
             Icon: CheckCircleOutlineIcon },
  error:   { color:'#f87171', bg:'rgba(0,0,0,0.92)', border:'#3a1a1a', duration:7000,
             Icon: ErrorOutlineIcon },
  warning: { color:'#fbbf24', bg:'rgba(0,0,0,0.92)', border:'#3a2a0a', duration:5500,
             Icon: WarningAmberIcon },
  info:    { color:'#60a5fa', bg:'rgba(0,0,0,0.92)', border:'#1a2a3a', duration:4500,
             Icon: InfoOutlinedIcon },
};


const ToastContext = createContext(null);
let _id = 0;

function toastReducer(state, action) {
  switch(action.type) {
    case 'ADD':    return [...state, action.toast];
    case 'REMOVE': return state.filter(t => t.id !== action.id);
    default:       return state;
  }
}

function ToastItem({ toast, onDismiss }) {
  const cfg = TOAST_CONFIG[toast.type];
  const { Icon } = cfg;
  return (
    <motion.div
      layout
      initial={{ opacity:0, x:80, scale:0.92 }}
      animate={{ opacity:1, x:0,  scale:1    }}
      exit={{    opacity:0, x:80, scale:0.90, transition:{ duration:0.22 } }}
      transition={{ type:'spring', stiffness:320, damping:28 }}
      style={{ position:'relative', overflow:'hidden' }}
    >
      <Box sx={{
        display:'flex', alignItems:'flex-start', gap:1.5,
        minWidth:300, maxWidth:420, p:'14px 16px',
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderLeft: `2px solid ${cfg.color}`,
        backdropFilter: 'blur(20px)',
        borderRadius: '8px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
      }}>

        <Icon sx={{ color:cfg.color, mt:'1px', fontSize:20, flexShrink:0 }} />
        <Box sx={{ flex:1, minWidth:0 }}>
          {toast.title && (
            <Typography sx={{
              fontFamily: '"Geist", sans-serif',
              fontSize: '0.8125rem',
              fontWeight: 500,
              letterSpacing: '-0.01em',
              color: cfg.color,
              mb: toast.message ? 0.4 : 0,
            }}>
              {toast.title}
            </Typography>
          )}

          {toast.message && (
            <Typography sx={{
              fontFamily: '"Geist", sans-serif',
              fontSize: '0.875rem',
              color: '#a1a1a1',
              lineHeight: 1.55,
              letterSpacing: '-0.005em',
            }}>
              {toast.message}
            </Typography>
          )}

        </Box>
        <IconButton size="small" onClick={() => onDismiss(toast.id)}
          sx={{ color:'rgba(237,232,208,0.40)', p:0.3, mt:'-2px',
                '&:hover':{ color:'rgba(237,232,208,0.80)', background:'transparent' } }}>
          <CloseIcon sx={{ fontSize:15 }} />
        </IconButton>
      </Box>
      {/* countdown progress bar */}
      <motion.div
        initial={{ scaleX:1 }}
        animate={{ scaleX:0 }}
        transition={{ duration: cfg.duration / 1000, ease:'linear' }}
        style={{
          position:'absolute', bottom:0, left:0, right:0, height:2,
          background:`linear-gradient(90deg, ${cfg.color}, ${cfg.color}88)`,
          transformOrigin:'left center',
        }}
      />
    </motion.div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const dismiss = useCallback((id) => dispatch({ type:'REMOVE', id }), []);

  const toast = useCallback((type, title, message) => {
    const id = ++_id;
    const cfg = TOAST_CONFIG[type] || TOAST_CONFIG.info;
    dispatch({ type:'ADD', toast:{ id, type, title, message } });
    setTimeout(() => dismiss(id), cfg.duration);
    return id;
  }, [dismiss]);

  /* convenience shorthands */
  toast.success = (title, msg) => toast('success', title, msg);
  toast.error   = (title, msg) => toast('error',   title, msg);
  toast.warning = (title, msg) => toast('warning', title, msg);
  toast.info    = (title, msg) => toast('info',    title, msg);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <Box sx={{ position:'fixed', bottom:24, right:24, zIndex:9999, pointerEvents:'none' }}>
        <Stack spacing={1.2} sx={{ pointerEvents:'all' }}>
          <AnimatePresence mode="popLayout">
            {toasts.map(t => (
              <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
            ))}
          </AnimatePresence>
        </Stack>
      </Box>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
