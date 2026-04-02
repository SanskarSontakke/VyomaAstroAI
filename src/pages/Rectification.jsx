import React, { useState } from 'react';
import { useProfiles } from '../hooks/useAstro';
import { getRectificationQuestions, rectifyBirthTime } from '../lib/astro/rectification';
import { PageTransition, FadeUp } from '../lib/animations';
import { Layout } from '../components/Shared/Layout';
import { Card } from '../components/Shared/Card';
import { Badge } from '../components/Shared/Badge';
import CosmicLoader from '../components/CosmicLoader';
import { 
  Zap, 
  History, 
  Search, 
  Info, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../lib/ToastContext';
import { Slider } from '@mui/material';

export default function Rectification() {
  const { data: profiles } = useProfiles();
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [uncertainty, setUncertainty] = useState(60);
  const [lifeEvents, setLifeEvents] = useState({});
  const [results, setResults] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const toast = useToast();

  const questions = getRectificationQuestions();
  const selectedProfile = profiles?.find(p => p.id === selectedProfileId);

  const handleEventChange = (key, year) => {
    setLifeEvents(prev => ({
      ...prev,
      [key]: year
    }));
  };

  const handleAnalyze = async () => {
    if (!selectedProfile) {
      toast.error('Identity Required', 'Please select a profile to rectify.');
      return;
    }

    const eventList = Object.entries(lifeEvents)
      .filter(([_, year]) => year)
      .map(([type, year]) => ({ type, year }));

    if (eventList.length === 0) {
      toast.error('Data Insufficient', 'Provide at least one life event year for analysis.');
      return;
    }

    setAnalyzing(true);
    // Artificial delay for cosmics
    await new Promise(r => setTimeout(r, 2000));
    
    try {
      const result = rectifyBirthTime(selectedProfile, eventList, uncertainty);
      setResults(result);
      toast.success('Analysis Complete', 'Calculated the most probable birth windows.');
    } catch (e) {
      toast.error('Computation Error', e.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Layout>
      <PageTransition>
        <div className="max-w-4xl mx-auto py-12 px-6 space-y-12 pb-32">
          
          {/* Header */}
          <section className="text-center space-y-4">
            <FadeUp>
              <div className="space-y-2">
                <Badge variant="blue">BIRTH TIME RECTIFICATION</Badge>
                <h1 className="text-5xl font-black text-white uppercase italic font-serif tracking-tight leading-none">
                  Temporal Calibration
                </h1>
                <p className="text-gray-500 max-w-lg mx-auto text-sm leading-relaxed">
                  If your birth time is uncertain, providing key life events allows us to mathematically align your chart with historical dasha sub-periods.
                </p>
              </div>
            </FadeUp>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Control Panel */}
            <div className="md:col-span-5 space-y-6">
              <Card className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Search size={16} className="text-blue-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Target Identity</span>
                  </div>
                  <select 
                    value={selectedProfileId}
                    onChange={(e) => setSelectedProfileId(e.target.value)}
                    className="select-custom"
                  >
                    <option value="">Select a Profile...</option>
                    {profiles?.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-blue-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Uncertainty Window</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-blue-500">{uncertainty} MIN</span>
                  </div>
                  <Slider 
                    value={uncertainty}
                    onChange={(_, v) => setUncertainty(v)}
                    min={15}
                    max={180}
                    step={15}
                    sx={{
                      color: '#3b82f6',
                      '& .MuiSlider-thumb': {
                        width: 12,
                        height: 12,
                        '&:hover, &.Mui-focusVisible': {
                          boxShadow: '0 0 0 8px rgba(59, 130, 246, 0.16)',
                        },
                      },
                    }}
                  />
                  <p className="text-[9px] font-bold text-gray-700 uppercase tracking-tighter">
                    Total scan range: ±{uncertainty/2} minutes from stated time.
                  </p>
                </div>

                <div className="pt-4">
                   <button 
                     onClick={handleAnalyze}
                     disabled={analyzing}
                     className="w-full btn-primary"
                   >
                     {analyzing ? 'Calculating Probabilities...' : 'Analyze Sequence'}
                     <Zap size={16} />
                   </button>
                </div>
              </Card>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/20">
                <AlertTriangle size={18} className="text-yellow-500 shrink-0 mt-1" />
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500">Experimental Tool</span>
                  <p className="text-[10px] text-gray-500 leading-relaxed italic">
                    This is a mathematical guide based on statistical dasha alignment. Consult a qualified professional for formal BTR.
                  </p>
                </div>
              </div>
            </div>

            {/* Life Events Grid */}
            <div className="md:col-span-7 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <History size={18} className="text-blue-500" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Known Life Milestones</h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {questions.map((q) => (
                  <div key={q.key} className="group">
                    <div className="flex items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-2xl group-hover:border-blue-500/20 transition-all">
                      <div className="flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">{q.label}</span>
                        <input 
                          type="number"
                          placeholder={q.placeholder}
                          value={lifeEvents[q.key] || ''}
                          onChange={(e) => handleEventChange(q.key, e.target.value)}
                          className="bg-transparent border-none text-white font-mono text-lg focus:ring-0 w-full p-0 h-8"
                        />
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center border border-gray-800">
                        <Badge variant="blue" className="px-2">{q.key[0].toUpperCase()}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Results Section */}
          <AnimatePresence>
            {analyzing && <CosmicLoader message="Rectifying Temporal Flux..." />}
            
            {results && !analyzing && (
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8 pt-12 border-t border-gray-900"
              >
                <div className="text-center">
                   <h2 className="text-2xl font-black text-white uppercase italic font-serif">Probability Distribution</h2>
                   <p className="text-gray-500 text-xs">Based on {results.totalScanned} temporal snapshots</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {results.topCandidates.map((c, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ scale: 1.01 }}
                      className={`
                        p-6 rounded-2xl flex items-center gap-6 border transition-all
                        ${i === 0 ? 'bg-blue-600/10 border-blue-600/30' : 'bg-black border-gray-900'}
                      `}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-blue-500 mb-1">RANK</span>
                        <span className="text-3xl font-black text-white font-serif italic">#{i+1}</span>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h4 className="text-2xl font-black text-white font-mono">{c.time}</h4>
                          <div className="w-1 h-1 rounded-full bg-gray-800" />
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{c.ascendantSign !== undefined ? c.ascendantSign : ''} Ascendant</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {c.matches.map((m, idx) => (
                             <span key={idx} className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[9px] font-bold text-blue-400 uppercase tracking-tighter">
                               {m}
                             </span>
                           ))}
                           {c.matches.length === 0 && <span className="text-[9px] text-gray-700 italic">No dasha matches in this slot</span>}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] font-black text-gray-600 mb-1 uppercase tracking-widest">Score</div>
                        <div className="flex items-center gap-2 justify-end">
                           <Award size={16} className={i === 0 ? 'text-blue-500' : 'text-gray-800'} />
                           <span className="text-2xl font-black text-white">{c.score}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {results.topCandidates.length > 0 && (
                  <div className="bg-blue-600/5 p-8 rounded-[32px] border border-blue-600/10 text-center space-y-6">
                    <div className="space-y-2">
                      <h4 className="text-xs font-black uppercase tracking-[0.3em] text-blue-500">Recommended Adjustment</h4>
                      <p className="text-3xl font-black text-white uppercase italic font-serif">Shift observed birth to {results.bestTime}</p>
                    </div>
                    <div className="flex items-center justify-center gap-12">
                       <div className="text-center">
                          <span className="block text-[10px] font-black text-gray-600 uppercase mb-1">New Lagna</span>
                          <span className="text-white font-bold">{results.bestAscendant}</span>
                       </div>
                       <div className="text-center">
                          <span className="block text-[10px] font-black text-gray-600 uppercase mb-1">Confidence</span>
                          <span className="text-white font-bold">{Math.min(100, results.topCandidates[0].score * 20)}%</span>
                       </div>
                    </div>
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>

        </div>
      </PageTransition>
    </Layout>
  );
}
