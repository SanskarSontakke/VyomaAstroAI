import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Search, 
  ChevronRight, 
  Target, 
  User, 
  Clock, 
  Star,
  Activity,
  ArrowRight,
  TrendingUp,
  MapPin,
  ChevronDown
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useProfiles, useMuhurta } from '../hooks/useAstro';
import { useProfile } from '../lib/ProfileContext';
import { useToast } from '../lib/ToastContext';
import { useTitle } from '../hooks/useTitle';
import { PageTransition, FadeUp, StaggerParent, StaggerChild } from '../lib/animations';
import CosmicLoader from '../components/CosmicLoader';
import { Layout } from '../components/Shared/Layout';
import { Card } from '../components/Shared/Card';
import { Badge } from '../components/Shared/Badge';

const GOALS = [
  { id: 'travel', label: 'Travel', icon: '✈️' },
  { id: 'finance', label: 'Financial / Signing', icon: '✍️' },
  { id: 'marriage', label: 'Marriage / Engagement', icon: '💍' },
  { id: 'education', label: 'Education / Exam', icon: '🎓' },
  { id: 'business', label: 'Business Launch', icon: '🚀' },
  { id: 'surgery', label: 'Medical / Surgery', icon: '🏥' },
];

export default function Muhurta() {
  useTitle('Muhurta Finder');
  const navigate = useNavigate();
  const { activeProfile } = useProfile();
  const toast = useToast();
  const [user, setUser] = useState(null);

  // Form State
  const [selectedGoal, setSelectedGoal] = useState('travel');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });

  const [triggered, setTriggered] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  // Auth & Profiles
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) navigate('/landing');
      else setUser(user);
    };
    checkUser();
  }, [navigate]);

  const { data: profiles = [] } = useProfiles(user?.id);

  useEffect(() => {
    if (activeProfile && !selectedProfile) {
      setSelectedProfile(activeProfile);
    }
  }, [activeProfile, selectedProfile]);

  // Muhurta Hook
  const { data: results, isLoading, isError: _isError } = useMuhurta(
    triggered ? selectedProfile : null,
    triggered ? selectedGoal : null,
    triggered ? startDate : null,
    triggered ? endDate : null
  );

  const handleFind = () => {
    if (selectedProfile && selectedGoal) {
      if (new Date(startDate) > new Date(endDate)) {
        toast.error('Invalid Range', 'The start date cannot be after the end date.');
        return;
      }
      setTriggered(true);
      setExpandedRow(null);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 50) return 'text-blue-500';
    return 'text-amber-500';
  };

  const getScoreBg = (score) => {
    if (score >= 70) return 'bg-green-500 shadow-green-500/20';
    if (score >= 50) return 'bg-blue-600 shadow-blue-600/20';
    return 'bg-amber-500 shadow-amber-500/20';
  };

  return (
    <Layout>
      <PageTransition>
        <div className="space-y-12">
          
          {/* Header */}
          <section className="space-y-4">
             <div className="flex items-center gap-2">
                <Badge variant="blue">Propitious Timing</Badge>
                <Clock size={14} className="text-blue-500" />
             </div>
             <h1 className="text-4xl font-bold tracking-tight text-white italic font-serif uppercase">Muhurta Finder</h1>
             <p className="text-gray-400 max-w-2xl leading-relaxed">
               Analyzes Chandra Gochar, Tithi, Tara Bala, and Panchanga rules across your selected range 
               to isolate high-energy cosmic windows for specific life events.
             </p>
          </section>

          {/* Search Form (Centralized Cluster) */}
          <Card className="p-8 bg-gray-900/10 border-gray-900 relative group overflow-hidden">
             {/* Background glow overlay */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full" />
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                {/* Goal Selector */}
                <div className="space-y-2">
                   <label className="label-text">Select Event</label>
                   <div className="relative group/sel">
                      <Target size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/sel:text-blue-500 transition-colors pointer-events-none" />
                      <select 
                         value={selectedGoal}
                         onChange={(e) => { setSelectedGoal(e.target.value); setTriggered(false); }}
                         className="select-custom pl-11 pr-10"
                      >
                         {GOALS.map(g => (
                            <option key={g.id} value={g.id}>{g.label}</option>
                         ))}
                      </select>
                   </div>
                </div>

                {/* Profile Selector */}
                <div className="space-y-2">
                   <label className="label-text">Identity Focus</label>
                   <div className="relative group/sel">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/sel:text-blue-500 transition-colors pointer-events-none" />
                      <select 
                         value={selectedProfile?.id || ''}
                         onChange={(e) => { setSelectedProfile(profiles.find(p => p.id === e.target.value)); setTriggered(false); }}
                         className="select-custom pl-11 pr-10"
                      >
                         <option value="" disabled>Select Profile</option>
                         {profiles.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                         ))}
                      </select>
                   </div>
                </div>

                {/* Range Selectors */}
                <div className="space-y-2">
                   <label className="label-text">Start Range</label>
                   <div className="relative group/sel">
                      <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/sel:text-blue-500 transition-colors pointer-events-none" />
                      <input 
                         type="date"
                         value={startDate}
                         onChange={(e) => { setStartDate(e.target.value); setTriggered(false); }}
                         className="input-custom pl-11 pr-4"
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="label-text">End Range</label>
                   <div className="relative group/sel">
                      <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/sel:text-blue-500 transition-colors pointer-events-none" />
                      <input 
                         type="date"
                         value={endDate}
                         onChange={(e) => { setEndDate(e.target.value); setTriggered(false); }}
                         className="input-custom pl-11 pr-4"
                      />
                   </div>
                </div>
             </div>

             <div className="mt-8 flex justify-center">
                <button 
                   onClick={handleFind}
                   disabled={!selectedProfile || isLoading}
                   className={`
                      w-full md:w-auto px-12 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[11px] 
                      transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3
                      ${!selectedProfile || isLoading ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'}
                   `}
                >
                   {isLoading ? (
                      <>
                        <Activity size={16} className="animate-pulse" />
                        Synchronizing...
                      </>
                   ) : (
                      <>
                        <Search size={16} />
                        Analyze Alignment
                      </>
                   )}
                </button>
             </div>
          </Card>

          {/* Results Analysis */}
          <AnimatePresence mode="wait">
             {isLoading ? (
               <div className="py-20 flex flex-col items-center justify-center space-y-8" key="loading">
                  <div className="relative">
                     <div className="w-24 h-24 rounded-full border-2 border-dashed border-blue-600/20 animate-spin transition-all duration-1000" />
                     <div className="absolute inset-0 flex items-center justify-center">
                        <Star size={32} className="text-blue-500 animate-pulse" />
                     </div>
                  </div>
                  <div className="text-center space-y-2">
                     <h3 className="text-xl font-bold text-white font-serif uppercase italic tracking-widest">Scanning Celestial Fabric</h3>
                     <p className="text-gray-500 text-xs font-mono uppercase tracking-[0.2em]">Executing Multi-dimensional Search ({results?.searchedDays || 30} Days)</p>
                  </div>
               </div>
             ) : triggered && results?.bestDay ? (
               <div className="space-y-12" key="results">
                  
                  {/* Highlighted Best Day */}
                   <section className="space-y-6">
                      <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-center text-blue-500">Optimum Alignment Found</h2>
                      <Card className="bg-gradient-to-br from-blue-600/5 to-transparent border-blue-600/30 p-10 overflow-hidden relative group">
                         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
                         
                         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
                            <div className="lg:col-span-4 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-gray-900 pb-12 lg:pb-0 lg:pr-12">
                               <div className="flex items-center gap-2 mb-4">
                                  <Badge variant="blue">Best Window</Badge>
                                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                               </div>
                               <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-tight font-serif italic">{results.bestDay.formattedDate}</h3>
                               <p className="text-xs font-black uppercase text-gray-500 tracking-[0.2em] mt-3">Recommended Start Phase</p>
                            </div>

                            <div className="lg:col-span-8 space-y-10">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <div className="space-y-1">
                                     <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Celestial Potency</span>
                                     <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black font-mono tracking-tighter text-blue-500">{results.bestDay.score}</span>
                                        <span className="text-xs font-black text-gray-600 uppercase">/ 100</span>
                                     </div>
                                  </div>
                                  <div className="space-y-1">
                                     <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Auspicious Span</span>
                                     <p className="text-2xl font-bold text-white tracking-tight">
                                        {results.bestDay.bestWindow.formattedStart} <span className="text-gray-700 mx-2">—</span> {results.bestDay.bestWindow.formattedEnd}
                                     </p>
                                  </div>
                               </div>

                               <div className="space-y-4">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block">Contributing Factors</span>
                                  <div className="flex flex-wrap gap-2">
                                     {results.bestDay.reasons.map((r, i) => (
                                       <div key={i} className="px-4 py-2 rounded-lg bg-gray-900/50 border border-gray-800 text-[10.5px] font-bold text-gray-300 flex items-center gap-2">
                                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                          {r}
                                       </div>
                                     ))}
                                  </div>
                               </div>
                            </div>
                         </div>
                      </Card>
                   </section>

                   {/* Secondary Options List */}
                   <section className="space-y-6 pt-12 border-t border-gray-900">
                      <div className="flex justify-between items-end">
                         <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Secondary Windows</h2>
                         <span className="text-[10px] font-mono text-gray-700 uppercase tracking-widest italic font-bold">Top 10 Alignments Range</span>
                      </div>
                      
                      <StaggerParent stagger={0.04}>
                        <div className="space-y-3">
                           {results.recommendations.map((res, i) => (
                             <StaggerChild key={res.date}>
                               <div 
                                 onClick={() => setExpandedRow(expandedRow === i ? null : i)}
                                 className={`
                                    py-4 px-6 rounded-2xl border transition-all cursor-pointer group flex flex-col
                                    ${expandedRow === i ? 'bg-gray-900/50 border-gray-800' : 'bg-transparent border-gray-900 hover:border-gray-800'}
                                 `}
                               >
                                  <div className="flex items-center justify-between">
                                     <div className="flex items-center gap-10">
                                        <div className="w-20 hidden md:block">
                                           <span className={`text-xl font-black font-mono tracking-tighter ${getScoreColor(res.score)}`}>{res.score}</span>
                                           <div className="w-full h-1 bg-gray-900 rounded-full mt-1 overflow-hidden">
                                              <motion.div initial={{ width: 0 }} animate={{ width: `${res.score}%` }} className={`h-full ${getScoreBg(res.score)}`} />
                                           </div>
                                        </div>
                                        <div className="space-y-0.5">
                                           <h4 className="text-sm font-bold text-white uppercase tracking-tight">{res.dayName}</h4>
                                           <p className="text-[10px] font-mono font-bold text-gray-600 uppercase tracking-widest">{res.formattedDate}</p>
                                        </div>
                                     </div>

                                     <div className="flex items-center gap-8">
                                        <div className="hidden lg:flex items-center gap-3 px-3 py-1 rounded bg-black/30 border border-gray-900">
                                           <Badge variant="blue">{res.bestWindow.formattedStart} Shift</Badge>
                                        </div>
                                        <ChevronDown size={18} className={`text-gray-700 transition-transform ${expandedRow === i ? 'rotate-180 text-blue-500' : 'group-hover:text-gray-400'}`} />
                                     </div>
                                  </div>

                                  <AnimatePresence>
                                     {expandedRow === i && (
                                       <motion.div 
                                         initial={{ height: 0, opacity: 0 }}
                                         animate={{ height: 'auto', opacity: 1 }}
                                         exit={{ height: 0, opacity: 0 }}
                                         className="overflow-hidden"
                                       >
                                          <div className="pt-6 mt-6 border-t border-gray-900/50 space-y-4">
                                             <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="blue">Dimensional Analysis</Badge>
                                             </div>
                                             <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-12">
                                                {res.reasons.map((r, idx) => (
                                                  <div key={idx} className="flex items-center gap-3 text-[10.5px] font-medium text-gray-500 hover:text-gray-300 transition-colors">
                                                     <div className="w-1.5 h-1.5 rounded-full bg-gray-800 group-hover:bg-blue-600 transition-colors shrink-0" />
                                                     {r}
                                                  </div>
                                                ))}
                                             </div>
                                          </div>
                                       </motion.div>
                                     )}
                                  </AnimatePresence>
                               </div>
                             </StaggerChild>
                           ))}
                        </div>
                      </StaggerParent>
                   </section>
               </div>
             ) : triggered ? (
               <div className="py-20 text-center space-y-6" key="none">
                  <div className="w-20 h-20 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center mx-auto text-gray-700">
                     <TrendingUp size={32} />
                  </div>
                  <div className="space-y-1">
                     <h3 className="text-white font-bold text-lg uppercase tracking-tight">Zero Alignment Convergence</h3>
                     <p className="text-gray-500 text-sm max-w-xs mx-auto">The requested range does not contain suitable celestial windows. Widening the date parameters is advised.</p>
                  </div>
               </div>
             ) : null}
          </AnimatePresence>
          
        </div>
      </PageTransition>
    </Layout>
  );
}
