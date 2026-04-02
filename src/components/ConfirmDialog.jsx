import React, { useState, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, XCircle, Info, CheckCircle2, X } from 'lucide-react';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({ 
    open: false, 
    title: '', 
    message: '',
    confirmLabel: 'Confirm', 
    cancelLabel: 'Cancel',
    confirmVariant: 'danger', 
    resolve: null 
  });

  const confirm = useCallback(({ 
    title, 
    message, 
    confirmLabel = 'Confirm', 
    cancelLabel = 'Cancel',
    confirmVariant = 'danger' 
  }) =>
    new Promise(resolve => setState({
      open: true, title, message, confirmLabel, cancelLabel, confirmVariant, resolve
    })), []);

  const handleClose = (result) => {
    state.resolve?.(result);
    setState(s => ({ ...s, open: false }));
  };

  const colors = {
    danger: 'bg-red-600 hover:bg-red-500 shadow-red-600/20',
    primary: 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20',
    success: 'bg-green-600 hover:bg-green-500 shadow-green-600/20'
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AnimatePresence>
        {state.open && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => handleClose(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            {/* Modal */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 space-y-6">
                <div className="flex gap-4 items-start">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${state.confirmVariant === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                      {state.confirmVariant === 'danger' ? <AlertTriangle size={20} /> : <Info size={20} />}
                   </div>
                   <div className="space-y-1">
                      <h3 className="text-lg font-bold text-white tracking-tight">{state.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{state.message}</p>
                   </div>
                </div>

                <div className="flex gap-3 pt-2">
                   <button 
                     onClick={() => handleClose(false)}
                     className="flex-1 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-gray-500 border border-gray-800 hover:bg-white/5 transition-all"
                   >
                     {state.cancelLabel}
                   </button>
                   <button 
                     onClick={() => handleClose(true)}
                     className={`flex-1 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all shadow-lg ${colors[state.confirmVariant] || colors.primary}`}
                   >
                     {state.confirmLabel}
                   </button>
                </div>
              </div>
              
              <button 
                onClick={() => handleClose(false)}
                className="absolute top-4 right-4 p-1 text-gray-600 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);
