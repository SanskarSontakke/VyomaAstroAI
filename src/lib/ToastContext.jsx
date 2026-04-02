import React, { createContext, useContext, useCallback, useReducer } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Info, 
  X 
} from 'lucide-react';

const TOAST_CONFIG = {
  success: { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', icon: CheckCircle2, duration: 4000 },
  error:   { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: XCircle, duration: 6000 },
  warning: { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: AlertCircle, duration: 5000 },
  info:    { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Info, duration: 4000 },
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
  const Icon = cfg.icon;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95, transition: { duration: 0.2 } }}
      className={`
        relative overflow-hidden w-full max-w-[360px] p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-start gap-4 pointer-events-auto
        ${cfg.bg} ${cfg.border}
      `}
    >
      <div className={`mt-0.5 shrink-0 ${cfg.color}`}>
        <Icon size={18} />
      </div>
      
      <div className="flex-1 min-w-0 space-y-1">
        {toast.title && (
          <h4 className={`text-xs font-black uppercase tracking-widest ${cfg.color}`}>
            {toast.title}
          </h4>
        )}
        {toast.message && (
          <p className="text-xs text-gray-400 leading-relaxed font-medium">
            {toast.message}
          </p>
        )}
      </div>

      <button 
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 p-1 rounded-md text-gray-600 hover:text-white transition-colors"
      >
        <X size={14} />
      </button>

      {/* Progress Bar */}
      <motion.div 
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: cfg.duration / 1000, ease: 'linear' }}
        className={`absolute bottom-0 left-0 right-0 h-0.5 origin-left ${cfg.color.replace('text', 'bg')}`}
      />
    </motion.div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(toastReducer, []);
  const dismiss = useCallback((id) => dispatch({ type: 'REMOVE', id }), []);

  const toast = useCallback((type, title, message) => {
    const id = ++_id;
    const cfg = TOAST_CONFIG[type] || TOAST_CONFIG.info;
    dispatch({ type: 'ADD', toast: { id, type, title, message } });
    setTimeout(() => dismiss(id), cfg.duration);
    return id;
  }, [dismiss]);

  toast.success = (title, msg) => toast('success', title, msg);
  toast.error   = (title, msg) => toast('error',   title, msg);
  toast.warning = (title, msg) => toast('warning', title, msg);
  toast.info    = (title, msg) => toast('info',    title, msg);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[6000] flex flex-col gap-3 items-end pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
