import React, { Component } from 'react';
import { Bug, Home, AlertOctagon } from 'lucide-react';
import { log } from '../lib/logger';
import { motion } from 'framer-motion';

export class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null, info: null }; }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    log.error('ErrorBoundary', 'Uncaught render error', { 
      error, 
      componentStack: info.componentStack 
    });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        {/* Deep Red Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/10 blur-[120px] rounded-full pointer-events-none opacity-50" />
        
        <div className="space-y-10 relative z-10 max-w-lg">
          <div className="flex flex-col items-center gap-6">
             <div className="w-16 h-16 rounded-3xl bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-500 shadow-lg shadow-red-600/10">
                <AlertOctagon size={32} />
             </div>
             
             <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-white uppercase italic font-serif">Celestial Anomaly</h1>
                <p className="text-gray-500 font-medium tracking-tight text-sm uppercase tracking-widest opacity-80">
                   Unexpected Cosmic Shift Detected
                </p>
             </div>
          </div>

          <div className="space-y-3 bg-red-900/5 p-6 rounded-2xl border border-red-900/20">
             <p className="text-sm font-medium text-gray-400 leading-relaxed">
                {this.state.error?.message || 'A calculation error occurred in the celestial engine. The current session has been interrupted.'}
             </p>
             <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-red-500/60">
                <Bug size={12} />
                Technical logs isolated
             </div>
          </div>

          <div className="flex flex-col gap-3">
             <button 
               onClick={() => { this.setState({ error: null }); window.location.href = '/'; }}
               className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-500 shadow-xl shadow-blue-600/20 transition-all active:scale-95"
             >
                <Home size={18} />
                Return to Base
             </button>
             <p className="text-[9px] font-bold text-gray-700 uppercase tracking-widest">
                Instance ID: {Math.random().toString(36).substring(7).toUpperCase()}
             </p>
          </div>
        </div>
      </div>
    );
  }
}
