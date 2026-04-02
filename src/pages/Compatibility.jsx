import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useProfiles, useCompatibility } from '../hooks/useAstro';
import { useProfile } from '../lib/ProfileContext';
import { useTitle } from '../hooks/useTitle';
import { 
  Heart, 
  Users, 
  ArrowRightLeft, 
  ShieldCheck, 
  Zap, 
  Info,
  ChevronDown
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  PageTransition, FadeUp, StaggerParent, StaggerChild 
} from '../lib/animations';
import { Layout } from '../components/Shared/Layout';
import { Card } from '../components/Shared/Card';
import { useToast } from '../lib/ToastContext';

export default function Compatibility() {
  useTitle('Match Analysis');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { activeProfile } = useProfile();
  const toast = useToast();
  
  const [profileA, setProfileA] = useState(null);
  const [profileB, setProfileB] = useState(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) navigate('/');
      else setUser(user);
    };
    checkUser();
  }, [navigate]);

  const { data: profiles = [] } = useProfiles(user?.id);

  useEffect(() => {
    if (activeProfile && !profileA) setProfileA(activeProfile);
  }, [activeProfile, profileA]);

  const { data: result, isLoading } = useCompatibility(
    showResults ? profileA : null, 
    showResults ? profileB : null
  );

  const handleCalculate = () => {
    if (profileA && profileB) {
      if (profileA.id === profileB.id) {
        toast.error('Selection Error', 'Please select two different profiles.');
        return;
      }
      setShowResults(true);
    }
  };

  const scoreColor = result ? getScoreColor(result.totalScore) : 'text-gray-500';

  return (
    <Layout>
      <PageTransition>
        <div className="space-y-12">
          
          {/* Hero Header - Responsive Text */}
          <section className="text-center space-y-4 px-4">
            <div className="flex justify-center flex-col items-center gap-2">
               <span className="badge-blue">Ashtakoot Milan</span>
               <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">Match Interpretation</h1>
               <p className="text-gray-400 text-sm md:text-lg max-w-xl mx-auto italic">
                 Synthesizing 8 dimensions of lunar compatibility to calculate energetic resonance.
               </p>
            </div>
          </section>

          {/* Centered Selectors - Responsive Stack */}
          <section className="max-w-4xl mx-auto w-full px-4 md:px-0">
            <Card className="relative overflow-visible p-6 md:p-8">
              <div className="flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] items-center gap-6 md:gap-12 relative">
                
                {/* Profile A */}
                <div className="w-full space-y-2 md:space-y-3">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest px-1">Primary Subject</span>
                  <div className="relative group">
                    <select 
                      value={profileA?.id || ''}
                      onChange={(e) => {
                        const p = profiles.find(p => p.id === e.target.value);
                        setProfileA(p);
                        setShowResults(false);
                      }}
                      className="select-custom"
                    >
                      <option value="" disabled>Select Profile</option>
                      {profiles.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                  {profileA && <div className="text-[10px] mono text-blue-500/60 px-1">{profileA.dob_date}</div>}
                </div>

                {/* Switcher Icon - Adjusted for stack */}
                <div className="flex justify-center shrink-0">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-500 shadow-xl">
                    <ArrowRightLeft size={18} className="rotate-90 md:rotate-0" />
                  </div>
                </div>

                {/* Profile B */}
                <div className="w-full space-y-2 md:space-y-3">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest px-1">Secondary Subject</span>
                  <div className="relative">
                    <select 
                      value={profileB?.id || ''}
                      onChange={(e) => {
                        const p = profiles.find(p => p.id === e.target.value);
                        setProfileB(p);
                        setShowResults(false);
                      }}
                      className="select-custom"
                    >
                      <option value="" disabled>Select Profile</option>
                      {profiles.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                  {profileB && <div className="text-[10px] mono text-blue-500/60 px-1">{profileB.dob_date}</div>}
                </div>
              </div>

              <button 
                onClick={handleCalculate}
                disabled={!profileA || !profileB || isLoading}
                className={`
                  w-full mt-8 md:mt-12 py-4 md:py-5 rounded-xl text-xs md:text-sm font-bold uppercase tracking-widest transition-all
                  ${!profileA || !profileB ? 'bg-gray-900 text-gray-600 border border-gray-800 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20 active:scale-[0.98]'}
                `}
              >
                {isLoading ? 'Decrypting Sync...' : 'Calculate Synergy'}
              </button>
            </Card>
          </section>

          {/* Results Analysis */}
          <AnimatePresence>
            {showResults && result && (
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12 pb-12"
              >
                {/* Score Hero - Scaled for Mobile */}
                <section className="flex flex-col items-center text-center px-4">
                   <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
                     <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        {/* Background track */}
                        <circle 
                          cx="50" cy="50" r="40" 
                          className="stroke-gray-900 fill-none" 
                          strokeWidth="6" 
                        />
                        {/* Progress track with glow */}
                        <motion.circle 
                          cx="50" cy="50" r="40" 
                          className={`fill-none ${scoreColor.replace('text', 'stroke')}`}
                          strokeWidth="6"
                          strokeLinecap="round"
                          initial={{ strokeDashoffset: 251.327 }}
                          animate={{ strokeDashoffset: 251.327 - (result.totalScore / 36) * 251.327 }}
                          style={{ strokeDasharray: 251.327 }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                     </svg>
                     
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="flex flex-col items-center translate-y-1">
                          <span className={`text-6xl md:text-7xl font-black tracking-tighter leading-none ${scoreColor}`}>
                            {result.totalScore.toFixed(0)}
                          </span>
                          <span className="text-gray-600 mono font-bold text-sm md:text-base mt-2 tracking-widest uppercase opacity-60">
                            Points
                          </span>
                        </div>
                     </div>
                   </div>

                   <div className="mt-8 space-y-2">
                     <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight uppercase">{result.grade}</h2>
                     <p className="badge-blue inline-block">{result.percentage.toFixed(0)}% Energetic Compatibility</p>
                   </div>
                   
                   {result.nadiDosha && (
                     <div className="mt-6 flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-full">
                       <Zap size={14} className="text-red-500" />
                       <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Nadi Dosha Detected</span>
                     </div>
                   )}
                </section>

                {/* Kuta Matrix - Responsive Grid (2x2 on Mobile) */}
                <section className="space-y-6 px-4 md:px-0">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 uppercase">Synergy Matrix</h3>
                    <span className="hidden sm:inline text-[10px] text-gray-600 uppercase">8 Dimensions</span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {Object.values(result.kutas).map((kuta) => (
                      <Card key={kuta.name} className="flex flex-col gap-3 md:gap-4 group p-4">
                        <div className="flex justify-between items-start gap-2">
                           <div className="flex flex-col min-w-0">
                              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest truncate">{kuta.name}</span>
                              <span className="text-[10px] text-gray-400 leading-tight mt-1 line-clamp-2 md:line-clamp-none">{kuta.desc}</span>
                           </div>
                           <span className="mono text-[10px] md:text-sm font-bold text-white whitespace-nowrap">{kuta.score}/{kuta.max}</span>
                        </div>
                        
                        <div className="w-full h-1 bg-gray-900 rounded-full overflow-hidden mt-auto">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${(kuta.score / kuta.max) * 100}%` }}
                             transition={{ duration: 1 }}
                             className={`h-full rounded-full ${kuta.score === kuta.max ? 'bg-blue-500' : (kuta.score > 0 ? 'bg-blue-500/40' : 'bg-red-500/40')}`}
                           />
                        </div>
                      </Card>
                    ))}
                  </div>
                </section>

                {/* Summary Card */}
                <Card className="bg-gradient-to-br from-gray-900/40 to-transparent border-gray-800 p-8">
                  <div className="flex gap-6 items-start">
                     <div className="w-12 h-12 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-500 shrink-0">
                        <Info size={24} />
                     </div>
                     <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white tracking-tight">Computational Summary</h3>
                        <p className="text-gray-400 leading-relaxed text-lg italic">
                          "{result.summary}"
                        </p>
                        <div className="flex gap-3">
                           <span className="badge-blue">Tithi: {result.totalScore > 18 ? 'Saman' : 'Asaman'}</span>
                           <span className="badge-blue">Sync: {result.percentage > 70 ? 'Optimal' : 'Variable'}</span>
                        </div>
                     </div>
                  </div>
                </Card>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageTransition>
    </Layout>
  );
}

function getScoreColor(score) {
  if (score >= 28) return 'text-green-500';
  if (score >= 21) return 'text-blue-500';
  if (score >= 15) return 'text-amber-500';
  return 'text-red-500';
}
