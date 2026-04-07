import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useProfile } from '../lib/ProfileContext';

import { useChartData } from '../hooks/useAstro';
import { 
  Download, 
  Share2, 
  ChevronRight, 
  Calendar, 
  MapPin, 
  Activity,
  Layers,
  Zap
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  PageTransition, FadeUp, StaggerParent, StaggerChild, SlideIn 
} from '../lib/animations';
import { Layout } from '../components/Shared/Layout';
import { Card } from '../components/Shared/Card';
import NorthChart from '../components/Chart/NorthChart';
import { exportChartPDF } from '../lib/pdfExport';
import { useToast } from '../lib/ToastContext';
import { log } from '../lib/logger';
import { useTitle } from '../hooks/useTitle';
import { ChartSkeleton } from '../components/SkeletonLoaders';
import { getDailyInsights } from '../lib/astro/insights';
import { getPratyantarDasha } from '../lib/astro/dasha';
import { getKPSignificators } from '../lib/astro/kp';
import { findNextEclipses, eclipseAffectsChart } from '../lib/astro/eclipses';

import { Badge } from '../components/Shared/Badge';

export default function DeepChart() {
  useTitle('Interpretation');
  const [activeVarga, setActiveVarga] = useState('D1');
  const [exporting, setExporting] = useState(false);
  const [expandAntar, setExpandAntar] = useState(false);
  const [_kpMode, _setKpMode] = useState(false);
  const [_selectedTopic, _setSelectedTopic] = useState('Marriage');
  const [calcMode, setCalcMode] = useState('parashari');
  const [kpTopic, setKpTopic] = useState('career');
  const { activeProfile, settings, loading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) navigate('/');
    };
    checkUser();
  }, [navigate]);

  const {
    data: astro,
    isLoading: astroLoading,
    error: _astroError
  } = useChartData();

  const handleExport = async () => {
    if (!activeProfile || !astro) return;
    setExporting(true);
    try {
      const insights = getDailyInsights(activeProfile);
      await exportChartPDF(activeProfile, astro, insights);
      toast.success('Download Started', 'Your celestial report is being generated.');
    } catch (err) {
      log.error('Export', err.message);
      toast.error('Export Error', 'Unable to prepare PDF interpretation.');
    } finally {
      setExporting(false);
    }
  };

  if (profileLoading || astroLoading) {
    return (
      <Layout>
        <ChartSkeleton />
      </Layout>
    );
  }

  if (!activeProfile || !astro) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-500">No subject selected</h2>
          <button onClick={() => navigate('/dashboard')} className="mt-4 text-blue-500 underline">Return to Dashboard</button>
        </div>
      </Layout>
    );
  }

  const currentVarga = astro.vargas[activeVarga] || astro.vargas.D1;

  const vargasList = [
    { id: 'D1', label: 'Rashi (Life)', icon: '1' },
    { id: 'D9', label: 'Navamsha (Fruit)', icon: '9' },
    { id: 'D10', label: 'Dashamsha (Work)', icon: '10' },
    { id: 'D7', label: 'Saptamsha (Legacy)', icon: '7' },
    { id: 'D3', label: 'Drekkana (Energy)', icon: '3' },
  ];

  return (
    <Layout>
      <PageTransition>
        <div className="space-y-8 md:space-y-12">
          
          {/* Header Action Bar */}
          <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="badge-blue">Systemic Analysis</span>
                <span className="text-[10px] text-gray-600 uppercase tracking-[0.2em]">{activeProfile.name}</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white uppercase italic font-serif">Natal Interpretation</h1>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button 
                onClick={handleExport}
                disabled={exporting}
                className="btn-secondary flex-1 md:flex-none shadow-xl"
              >
                <Download size={14} className={exporting ? 'animate-bounce' : ''} />
                Export Data
              </button>
              <button className="flex items-center justify-center p-3.5 rounded-xl bg-blue-600/10 border border-blue-600/20 text-blue-500 hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-blue-600/5 active:scale-95 group">
                <Share2 size={16} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </section>

          {/* Core Layout: Chart then Timeline */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 items-start">
            
            {/* Chart Visualization */}
            <div className="w-full space-y-4 md:space-y-6">
              
              <div className="flex bg-gray-900/50 p-1 rounded-xl w-full sm:w-fit mb-2">
                <button 
                  onClick={() => setCalcMode('parashari')}
                  className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${calcMode === 'parashari' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                  Parashari
                </button>
                <button 
                  onClick={() => setCalcMode('kp')}
                  className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${calcMode === 'kp' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                  KP Mode
                </button>
              </div>

              {calcMode === 'kp' && settings?.ayanamsaSystem !== 'krishnamurti' && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4">
                  <p className="text-amber-500 text-xs font-medium">KP requires Krishnamurti ayanamsa for pinnacle accuracy. Please switch in Settings → Calculation Preferences.</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600">Divisional Projection</h2>
                <div className="flex gap-1 overflow-x-auto no-scrollbar pb-2 sm:pb-0 scroll-smooth snap-x">
                  {vargasList.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setActiveVarga(v.id)}
                      className={`
                        px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shrink-0 snap-start
                        ${activeVarga === v.id ? 'bg-blue-600/10 text-blue-500 border border-blue-600/20 shadow-blue-600/5 shadow-inner' : 'bg-gray-900 text-gray-600 hover:text-white border border-transparent'}
                      `}
                    >
                      {v.id}
                    </button>
                  ))}
                </div>
              </div>

              <Card className="flex items-center justify-center min-h-[350px] md:min-h-[500px] bg-gradient-to-br from-blue-950/20 via-[#030303] to-[#000000] p-2 md:p-10 overflow-hidden relative border-blue-600/20 group hover:border-blue-500/40 transition-colors duration-700 shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="w-full max-w-[320px] md:max-w-md lg:max-w-full aspect-square relative z-10 transition-transform duration-1000 group-hover:scale-[1.02]">
                  <NorthChart 
                    positions={currentVarga.positions} 
                    ascendantSign={currentVarga.ascendant.sign ?? currentVarga.ascendant.signIndex} 
                  />
                </div>
              </Card>

              <div className="grid grid-cols-3 gap-2 md:gap-4">
                <InfoChip label="Rising" value={astro.vargas.D1.ascendant.sign || astro.vargas.D1.ascendant.signIndex} subValue={`${Math.floor(astro.vargas.D1.ascendant.longitude % 30)}°`} />
                <InfoChip label="Nakshatra" value={astro.vargas.D1.positions.Moon.nakshatra} subValue={`Pada ${astro.vargas.D1.positions.Moon.pada}`} />
                <InfoChip label="Atmakaraka" value={astro.yogas?.[0]?.name || 'Jupiter'} />
              </div>
            </div>

            {/* Path of Time (Timeline) */}
            <div className="w-full space-y-6">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 px-1">Temporal Timeline</h2>
              <Card className="h-full max-h-[500px] md:max-h-[600px] overflow-y-auto no-scrollbar p-6">
                <div className="space-y-0 relative">
                  <div className="absolute left-[11px] top-4 bottom-4 w-px bg-gray-800" />
                  
                  <div className="flex flex-col gap-6 relative">
                    {(astro.dashaTimeline || astro.mahaDashas || []).map((d, index) => {
                      const isPast = new Date(d.endDate) < new Date();
                      const isActive = d.planet === astro.currentDasha?.maha.planet;
                      
                      return (
                        <div 
                          key={index} 
                          className={`flex items-start gap-4 md:gap-6 transition-all ${isActive ? 'scale-[1.02]' : (isPast ? 'opacity-40' : 'opacity-80')}`}
                        >
                          <div className={`
                            w-6 h-6 rounded-full flex items-center justify-center z-10 border-4 border-black shrink-0
                            ${isActive ? 'bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-gray-800'}
                          `}>
                            {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1">
                                <span className={`text-xs md:text-sm font-bold uppercase tracking-widest ${isActive ? 'text-blue-400' : 'text-gray-400'}`}>
                                    {d.planet} Maha Dasha
                                </span>
                                <span className="text-[10px] mono text-gray-500">
                                    {new Date(d.startDate).getFullYear()} - {new Date(d.endDate).getFullYear()}
                                </span>
                            </div>
                            <div 
                              onClick={() => isActive && setExpandAntar(!expandAntar)}
                              className={`p-3 md:p-4 rounded-xl border transition-all cursor-pointer ${isActive ? 'bg-blue-600/10 border-blue-600/30' : 'bg-gray-900/10 border-gray-900 hover:border-gray-800'}`}
                            >
                                <div className="flex justify-between items-center text-[10px] md:text-xs">
                                     <span className="text-gray-400 uppercase tracking-widest font-bold">Phase: <strong className="text-white ml-1">{isActive ? astro.currentDasha.antar.planet : 'Sequence Analysis'}</strong></span>
                                     <div className="flex items-center gap-2">
                                       {isActive && <Badge variant="blue" className="animate-pulse">Active Now</Badge>}
                                       {isActive && <ChevronRight size={14} className={`text-blue-400 transition-transform ${expandAntar ? 'rotate-90' : ''}`} />}
                                     </div>
                                </div>

                                <AnimatePresence>
                                  {isActive && expandAntar && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="overflow-hidden mt-4 pt-4 border-t border-blue-600/20"
                                    >
                                      <div className="space-y-2">
                                        {getPratyantarDasha({
                                          planet: astro.currentDasha.maha.planet,
                                          antarPlanet: astro.currentDasha.antar.planet,
                                          startDate: new Date(astro.currentDasha.antar.startDate),
                                          endDate: new Date(astro.currentDasha.antar.endDate)
                                        }).map((p, pIdx) => {
                                          const isPActive = p.pratyantarPlanet === astro.currentDasha.pratyantar?.planet;
                                          return (
                                            <div key={pIdx} className={`flex justify-between items-center p-2 rounded ${isPActive ? 'bg-blue-600/20 text-blue-400' : 'text-gray-500'}`}>
                                              <span className="text-[10px] font-bold uppercase tracking-tighter">{p.pratyantarPlanet}</span>
                                              <span className="text-[9px] mono opacity-60">
                                                {p.startDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - {p.endDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                              </span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Detailed Data Tables (Horizontally Scrollable on Mobile) */}
          {calcMode === 'parashari' && (
            <>
              <section className="space-y-6">
                <div className="flex items-center gap-3 px-1">
                  <Activity size={16} className="text-gray-500" />
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Planetary Metrics ({activeVarga})</h2>
                </div>
            
            <Card noPadding className="overflow-hidden">
               <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-[#050505] border-b border-gray-800">
                         <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Graha</th>
                         <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Rashi (Sign)</th>
                         <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Degrees</th>
                         <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Nakshatra</th>
                         <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Strength Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(currentVarga.positions).map(([name, data]) => {
                        const strength = astro.shadbala.find(s => s.planet === name);
                        return (
                          <tr key={name} className="border-b border-gray-900 group hover:bg-gray-900/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3 whitespace-nowrap">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] ${data.isUpagraha ? 'bg-amber-900/30 text-amber-500' : 'bg-gray-800 text-white'} uppercase`}>
                                  {name.slice(0, 2)}
                                </div>
                                <span className={`font-bold uppercase text-xs ${data.isUpagraha ? 'text-amber-500' : 'text-white'}`}>{name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-gray-300 text-sm font-medium whitespace-nowrap">{data.sign}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="mono text-gray-400 text-sm whitespace-nowrap">
                                {Math.floor(data.longitude % 30)}° {Math.floor((data.longitude % 1) * 60)}' {(data.isRetrograde ? ' (R)' : '')}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex flex-col whitespace-nowrap">
                                 <span className="text-xs font-semibold text-white">{data.nakshatra}</span>
                                 <span className="text-[10px] text-gray-500 uppercase">Pada {data.pada}</span>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               {strength ? (
                                 <div className="flex items-center gap-3 min-w-[120px]">
                                   <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-blue-600 rounded-full" 
                                        style={{ width: `${strength.percentage}%` }} 
                                      />
                                   </div>
                                   <span className={strength.grade === 'Strong' ? 'badge-green' : (strength.grade === 'Moderate' ? 'badge-blue' : 'badge-red')}>
                                     {strength.grade.slice(0, 4)}
                                   </span>
                                 </div>
                               ) : <span className="text-gray-600">—</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
               </div>
            </Card>
          </section>

          {/* Yogas & Strengths */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="flex flex-col gap-6">
               <div className="flex items-center gap-2">
                  <Layers size={18} className="text-blue-500" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-300">Active Yogas (D1)</h3>
               </div>
               <div className="space-y-4">
                  {astro.yogas?.slice(0, 4).map((y, i) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-gray-900/50 border border-gray-800">
                       <span className="text-sm font-bold uppercase text-white tracking-tight">{y.name}</span>
                       <span className={y.strength === 'Strong' ? "badge-green" : "badge-blue"}>{y.strength}</span>
                    </div>
                  ))}
                  {(!astro.yogas || astro.yogas.length === 0) && (
                    <div className="text-center py-4 text-gray-500 text-sm">No major yogas detected.</div>
                  )}
               </div>
            </Card>

            <Card className="flex flex-col gap-6">
               <div className="flex items-center gap-2">
                  <Zap size={18} className="text-amber-500" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-300">Transit Potentials (Ashtakavarga)</h3>
               </div>
               <div className="space-y-4">
                  {['Jupiter', 'Saturn'].map(p => {
                     const signIdx = astro.vargas.D1.positions[p].sign ?? astro.vargas.D1.positions[p].signIndex ?? 0;
                    const score = astro.ashtakavarga[p].scores[signIdx];
                    return (
                      <div key={p} className="space-y-1">
                        <div className="flex justify-between items-center text-xs mb-1">
                           <span className="text-gray-400 font-bold uppercase tracking-tighter">{p} Transit Score</span>
                           <span className="mono text-white">{score} / 8</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(score/8)*100}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className={`h-full rounded-full ${score >= 4 ? 'bg-green-500' : 'bg-red-500'}`} 
                          />
                        </div>
                      </div>
                    );
                  })}
               </div>
            </Card>
          </section>
          </>
          )}

          {calcMode === 'kp' && (() => {
            const kpSigs = getKPSignificators(astro.vargas.D1.positions, astro.vargas.D1.ascendant.sign ?? astro.vargas.D1.ascendant.signIndex);
            const KP_TOPICS = {
              'marriage': { label: 'Marriage', houses: [2, 7, 11] },
              'career':   { label: 'Career', houses: [2, 6, 10, 11] },
              'health':   { label: 'Health', houses: [1, 6, 8, 12] },
              'finance':  { label: 'Finance', houses: [2, 6, 10, 11] },
              'foreign':  { label: 'Foreign', houses: [3, 9, 12] },
              'education':{ label: 'Education', houses: [4, 5, 9] },
            };
            const topicHouses = KP_TOPICS[kpTopic].houses;

            // Find planets that strongly signify topic houses
            const topicPlanets = Object.entries(kpSigs)
              .filter(([_, data]) => data.primarySignificators.some(h => topicHouses.includes(h)))
              .map(([Graha]) => Graha);

            const activeMaha = astro.currentDasha?.maha.planet;
            const activeAntar = astro.currentDasha?.antar?.planet;

            return (
              <div className="space-y-12">
                <section className="space-y-6">
                  <div className="flex items-center gap-3 px-1">
                    <Activity size={16} className="text-indigo-500" />
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500">KP Planet Significators</h2>
                  </div>
                  
                  <Card noPadding className="overflow-hidden border-indigo-600/20">
                     <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                          <thead>
                            <tr className="bg-indigo-900/10 border-b border-indigo-600/20">
                               <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Planet</th>
                               <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">House</th>
                               <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Star Lord</th>
                               <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Sub Lord</th>
                               <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-indigo-400">Signifies</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(kpSigs).map(([name, data]) => {
                              return (
                                <tr key={name} className="border-b border-gray-900 group hover:bg-indigo-900/10 transition-colors">
                                  <td className="px-6 py-4">
                                    <span className={`font-bold uppercase text-xs text-white`}>{name}</span>
                                  </td>
                                  <td className="px-6 py-4 text-gray-300 text-sm">{data.occupiedHouse}</td>
                                  <td className="px-6 py-4 text-blue-300 text-sm font-bold">{data.starLord}</td>
                                  <td className="px-6 py-4 text-indigo-300 text-sm font-bold">{data.subLord}</td>
                                  <td className="px-6 py-4">
                                     <div className="flex gap-2 flex-wrap">
                                        {data.primarySignificators.map(h => (
                                          <Badge key={h} variant="indigo" className="text-[9px]">{h}</Badge>
                                        ))}
                                     </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                     </div>
                  </Card>
                </section>

                <section className="space-y-6">
                   <div className="flex items-center gap-3 px-1">
                      <Zap size={16} className="text-indigo-500" />
                      <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500">House Query Engine</h2>
                   </div>

                   <Card className="p-8 border-indigo-600/20 bg-indigo-900/5">
                      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-6">
                        {Object.entries(KP_TOPICS).map(([key, topic]) => (
                          <button
                            key={key}
                            onClick={() => setKpTopic(key)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest shrink-0 transition-all ${kpTopic === key ? 'bg-indigo-600 text-white' : 'bg-gray-900 text-gray-500 hover:text-white'}`}
                          >
                            {topic.label}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-6">
                        <div>
                          <p className="text-xs text-gray-400 mb-2 uppercase tracking-widest">Active Houses: <span className="text-white font-bold">{topicHouses.join(', ')}</span></p>
                          <p className="text-sm text-gray-300 leading-relaxed">
                            For <strong className="text-white">{KP_TOPICS[kpTopic].label}</strong>, the key signalling planets are: <br/>
                            <span className="text-indigo-400 font-bold uppercase tracking-widest mt-2 block">{topicPlanets.length > 0 ? topicPlanets.join(' • ') : 'None Strongly Signified'}</span>
                          </p>
                        </div>
                        
                        <div className="p-4 bg-black/50 border border-gray-800 rounded-xl space-y-2">
                           <p className="text-xs text-gray-500 uppercase tracking-widest">Dasha Alignment Check</p>
                           <p className="text-sm">
                             Current Dasha: <span className="font-bold text-white uppercase">{activeMaha}</span> / <span className="font-bold text-white uppercase">{activeAntar}</span>
                           </p>
                           <p className="text-sm">
                             {topicPlanets.includes(activeMaha) 
                               ? <span className="text-green-400">Maha Dasha Lord ({activeMaha}) strongly signals {KP_TOPICS[kpTopic].label}.</span>
                               : <span className="text-gray-500">Maha Dasha Lord ({activeMaha}) is not a primary signifier.</span>
                             }
                           </p>
                           <p className="text-sm">
                             {topicPlanets.includes(activeAntar) 
                               ? <span className="text-green-400">Antar Dasha Lord ({activeAntar}) strongly signals {KP_TOPICS[kpTopic].label}.</span>
                               : <span className="text-gray-500">Antar Dasha Lord ({activeAntar}) is not a primary signifier.</span>
                             }
                           </p>
                        </div>
                      </div>
                   </Card>
                </section>
              </div>
            );
          })()}

          {/* Upcoming Eclipses Section */}
          <FadeUp delay={0.8}>
            <section className="space-y-6">
              <div className="flex items-center gap-3 px-1">
                <Calendar size={16} className="text-gray-500" />
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 px-1">Upcoming Eclipses</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {findNextEclipses(activeProfile.latitude, activeProfile.longitude, 6).map((ecl, i) => {
                  const impact = eclipseAffectsChart(ecl, currentVarga.positions);
                  const moonSignNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
                  const moonSignName = moonSignNames[ecl.moonSign];
                  
                  return (
                    <Card key={i} className="flex flex-col gap-4 border-gray-900 hover:border-gray-800 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className={`${ecl.type === 'solar' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-600/20'} px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider border`}>
                            {ecl.type.toUpperCase()} ECLIPSE
                          </span>
                          <div className="text-sm font-bold text-white">{ecl.formattedDate}</div>
                        </div>
                        {ecl.isSignificant && <Zap size={14} className="text-amber-500 animate-pulse" />}
                      </div>
                      
                      <div className="text-[10px] uppercase tracking-widest text-gray-500 font-medium">
                        Moon in <span className="text-gray-300">{moonSignName}</span>
                      </div>

                      {impact.isSignificant && (
                        <div className="mt-2 space-y-2">
                          <div className="text-[9px] font-bold text-amber-500/80 uppercase">Potential Natal Impact:</div>
                          <div className="flex flex-wrap gap-2">
                            {impact.affected.map((a, ai) => (
                              <Badge key={ai} variant="red" className="text-[8px]">
                                {a.planet} ({a.orb}°)
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </section>
          </FadeUp>

        </div>
      </PageTransition>
    </Layout>
  );
}

function InfoChip({ label, value, subValue }) {
  return (
    <Card className="flex flex-col items-center justify-center gap-1 py-4">
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
      <span className="text-lg font-bold text-white tracking-tight leading-none">{value}</span>
      {subValue && <span className="text-[10px] mono text-gray-500">{subValue}</span>}
    </Card>
  );
}
