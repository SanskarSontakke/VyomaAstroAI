import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useProfile } from '../lib/ProfileContext';
import { useProfiles } from '../hooks/useAstro';
import { PageTransition, FadeUp, StaggerParent, StaggerChild } from '../lib/animations';
import { useTitle } from '../hooks/useTitle';
import { useQuery } from '@tanstack/react-query';
import { 
  History as HistoryIcon, 
  Calendar, 
  ChevronRight, 
  Activity, 
  Zap, 
  TrendingUp,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '../components/Shared/Layout';
import { Card } from '../components/Shared/Card';
import { Badge } from '../components/Shared/Badge';

export default function History() {
  useTitle('Reading History');
  const { activeProfile } = useProfile();
  const { data: profiles = [] } = useProfiles();
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [expandedDay, setExpandedDay] = useState(null);

  useEffect(() => {
    if (activeProfile && selectedProfileId !== activeProfile.id) {
      setSelectedProfileId(activeProfile.id);
    } else if (!activeProfile && profiles.length > 0 && selectedProfileId !== profiles[0].id) {
      setSelectedProfileId(profiles[0].id);
    }
  }, [activeProfile, profiles, selectedProfileId]);

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['readings', selectedProfileId],
    queryFn: async () => {
      if (!selectedProfileId) return [];
      const { data, error } = await supabase
        .from('readings_log')
        .select('*')
        .eq('profile_id', selectedProfileId)
        .order('read_date', { ascending: false })
        .limit(90);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedProfileId
  });

  const getScoreColor = (score) => {
    if (score >= 5) return 'bg-green-500 shadow-green-500/20';
    if (score >= 4) return 'bg-blue-600 shadow-blue-600/20';
    if (score >= 3) return 'bg-amber-500 shadow-amber-500/20';
    return 'bg-red-500 shadow-red-500/20';
  };

  // Group readings by month
  const months = history.reduce((acc, entry) => {
    const monthYear = new Date(entry.read_date).toLocaleDateString('default', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(entry);
    return acc;
  }, {});

  const last30 = history.filter(h => {
    const diff = new Date() - new Date(h.read_date);
    return diff < 30 * 24 * 60 * 60 * 1000;
  });
  
  const avgScore = last30.length > 0 ? (last30.reduce((s, h) => s + h.score, 0) / last30.length).toFixed(1) : '0.0';
  const favorableDays = last30.filter(h => h.score >= 4).length;
  const currentStreak = (() => {
    let streak = 0;
    for (let i = 0; i < history.length; i++) {
      if (history[i].score >= 3) streak++;
      else break;
    }
    return streak;
  })();

  return (
    <Layout>
      <PageTransition>
        <div className="space-y-12">
          
          {/* Header */}
          <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-2">
               <div className="flex items-center gap-2">
                  <Badge variant="blue">Cosmic Timeline</Badge>
                  <HistoryIcon size={14} className="text-blue-500" />
               </div>
               <h1 className="text-4xl font-bold tracking-tight text-white">Reading History</h1>
               <p className="text-gray-400">Archived celestial interpretations and score patterns for your primary identity.</p>
            </div>
            
            {/* Profile Filter */}
            <div className="flex items-center gap-2 bg-gray-900/50 p-1 rounded-xl border border-gray-800">
               {profiles.map(p => (
                 <button 
                    key={p.id}
                    onClick={() => setSelectedProfileId(p.id)}
                    className={`
                      px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
                      ${selectedProfileId === p.id ? 'bg-gray-800 text-white shadow-xl' : 'text-gray-600 hover:text-gray-400'}
                    `}
                 >
                    {p.name}
                 </button>
               ))}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Timeline (Left) */}
            <div className="lg:col-span-8 space-y-12">
              {Object.keys(months).length === 0 ? (
                <Card className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                   <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center text-gray-700">
                      <Calendar size={32} />
                   </div>
                   <div className="space-y-1">
                      <h3 className="text-white font-bold">No Readings Logged</h3>
                      <p className="text-gray-500 text-sm">Archived history will appear here once you view your daily brief.</p>
                   </div>
                </Card>
              ) : (
                Object.entries(months).map(([monthYear, entries]) => (
                  <div key={monthYear} className="space-y-6">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 pl-2">
                      {monthYear}
                    </h2>
                    
                    <div className="space-y-4">
                      {entries.map((entry) => (
                        <div key={entry.id} className="space-y-2">
                          <Card 
                            onClick={() => setExpandedDay(expandedDay === entry.id ? null : entry.id)}
                            className={`
                              group cursor-pointer transition-all border-l-4
                              ${expandedDay === entry.id ? 'bg-blue-600/5 border-blue-600' : 'hover:border-gray-700 border-gray-900'}
                            `}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-6">
                                <div className={`w-3 h-3 rounded-full shrink-0 shadow-lg ${getScoreColor(entry.score)}`} />
                                <div className="space-y-0.5">
                                   <h4 className="text-sm font-bold text-white uppercase tracking-tight truncate max-w-[200px]">
                                     {entry.title || 'Daily Interpretation'}
                                   </h4>
                                   <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                                     {new Date(entry.read_date).toLocaleDateString('default', { weekday: 'long', day: 'numeric' })}
                                   </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-8">
                                 <div className="hidden md:flex flex-col items-end">
                                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Luna House</span>
                                    <span className="text-xs font-bold text-gray-400">{entry.moon_house}</span>
                                 </div>
                                 <div className="flex items-center gap-4">
                                    <div className="text-right">
                                       <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest block">Score</span>
                                       <span className="text-sm font-mono text-white font-bold">{entry.score}/5</span>
                                    </div>
                                    <ChevronRight 
                                      size={18} 
                                      className={`text-gray-700 transition-transform ${expandedDay === entry.id ? 'rotate-90 text-blue-500' : 'group-hover:text-gray-400'}`} 
                                    />
                                 </div>
                              </div>
                            </div>

                            <AnimatePresence>
                               {expandedDay === entry.id && (
                                 <motion.div 
                                   initial={{ height: 0, opacity: 0 }}
                                   animate={{ height: 'auto', opacity: 1 }}
                                   exit={{ height: 0, opacity: 0 }}
                                   className="overflow-hidden"
                                 >
                                   <div className="pt-6 mt-6 border-t border-gray-900 flex flex-wrap gap-4">
                                      <HistoryDetail label="Tithi" value={entry.tithi} />
                                      <HistoryDetail label="Target Dasha" value={entry.maha_dasha} />
                                      <HistoryDetail label="Lunar Phase" value={entry.moon_phase || 'Standard'} />
                                      <HistoryDetail label="Transit ID" value={`TR-${entry.id.substring(0, 4).toUpperCase()}`} />
                                   </div>
                                 </motion.div>
                               )}
                            </AnimatePresence>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Side Stats (Right) */}
            <div className="lg:col-span-4 space-y-6">
               <Card className="bg-blue-600/5 border-blue-600/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-600/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
                  <div className="space-y-6 relative z-10">
                     <div className="space-y-1">
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Efficiency</span>
                        <h3 className="text-sm font-bold text-white uppercase pr-10">30-Day Aggregate Score</h3>
                     </div>
                     <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-black text-white leading-none font-mono tracking-tighter">{avgScore}</span>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">/ 5.0</span>
                     </div>
                     <div className="space-y-3">
                        <StatRow label="Favorable Cycles" value={favorableDays} color="text-green-500" />
                        <StatRow label="Lunar Success Rate" value={`${Math.round((favorableDays / 30) * 100)}%`} color="text-blue-500" />
                     </div>
                  </div>
               </Card>

               <Card className="border-gray-900 group">
                  <div className="flex items-center justify-between mb-4">
                     <TrendingUp size={18} className="text-gray-700 group-hover:text-amber-500 transition-colors" />
                     <Badge variant="blue">Streak Active</Badge>
                  </div>
                  <div className="space-y-1">
                     <span className="text-4xl font-black text-white font-mono tracking-tighter">{currentStreak}</span>
                     <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest leading-relaxed">
                        High-Energy Alignment Streak (Consecutive days score ≥ 3)
                     </p>
                  </div>
               </Card>
            </div>
          </div>

        </div>
      </PageTransition>
    </Layout>
  );
}

function HistoryDetail({ label, value }) {
  return (
    <div className="px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-900 flex flex-col gap-0.5 min-w-[120px]">
      <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{label}</span>
      <span className="text-[11px] font-bold text-gray-200">{value}</span>
    </div>
  );
}

function StatRow({ label, value, color = 'text-white' }) {
  return (
    <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-widest py-2 border-b border-gray-900/50">
       <span className="text-gray-600">{label}</span>
       <span className={color}>{value}</span>
    </div>
  );
}
