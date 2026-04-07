import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 sm:p-8 text-center relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="space-y-8 sm:space-y-12 relative z-10 max-w-lg">
        <div className="flex flex-col items-center gap-4 sm:gap-6">
           <div className="w-16 h-16 rounded-3xl bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-700 animate-in zoom-in duration-500">
              <Compass size={32} />
           </div>
           
           <div className="space-y-2">
              <h1 className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tighter italic">404</h1>
              <p className="text-gray-500 font-black uppercase text-[10px] tracking-[0.4em] opacity-80">
                 Celestial Coordinate Nullified
              </p>
           </div>
        </div>

        <div className="space-y-3 px-2 sm:px-6">
           <p className="text-sm font-medium text-gray-400 leading-relaxed italic font-serif">
             "The path you followed leads beyond the observable chart. These specific temporal coordinates have not been archived in the celestial database."
           </p>
        </div>

        <div className="flex flex-col gap-3">
           <button 
             onClick={() => navigate('/')}
             className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-blue-500 shadow-xl shadow-blue-600/20 transition-all active:scale-95"
           >
              <Home size={16} />
              Return to Base
           </button>
           <p className="text-[9px] font-bold text-gray-800 uppercase tracking-widest">
             Ref: INVALID_ROUTE_TRACE
           </p>
        </div>
      </div>
    </div>
  );
}
