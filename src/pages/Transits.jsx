import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useProfile } from '../lib/ProfileContext';
import { useChartData } from '../hooks/useAstro';
import { useCalculation } from '../lib/CalculationContext';
import { getZodiacSign } from '../lib/astro/ephemeris';
import { 
  Activity, 
  MapPin, 
  Clock, 
  Zap, 
  Info,
  Circle
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  PageTransition, FadeUp, StaggerParent, StaggerChild, GlowPulse 
} from '../lib/animations';
import { Layout } from '../components/Shared/Layout';
import { Card } from '../components/Shared/Card';
import TransitWheel from '../components/Chart/TransitWheel';

const SIGN_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export default function Transits() {
  useTitle('Live Sky');
  const navigate = useNavigate();
  const { activeProfile } = useProfile();
  const { transitData } = useCalculation();
  const { data: natalData } = useChartData();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) navigate('/');
    };
    checkUser();
  }, [navigate]);

  if (!activeProfile || !natalData || !transitData) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
           <div className="w-12 h-12 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
           <p className="text-gray-500 font-medium">Synchronizing with live celestial coordinates...</p>
        </div>
      </Layout>
    );
  }

  const transitPositions = transitData.positions;
  const lastUpdated = transitData.lastUpdated;
  const natalMoonSign = natalData.positions.Moon.signIndex || 0;

  const highlights = [];
  Object.entries(transitPositions).forEach(([planet, data]) => {
    const lon = data.longitude;
    const currentSign = getZodiacSign(lon);
    const houseFromMoon = (currentSign - natalMoonSign + 12) % 12 + 1;
    if (currentSign === natalMoonSign) {
      highlights.push({ label: `${planet} conjunct Moon`, type: 'warning', desc: `${planet} energy merging with your lunar subconscious.` });
    }
    if (planet === 'Saturn' && [1, 4, 7, 8].includes(houseFromMoon)) {
      highlights.push({ label: `Saturn Influence`, type: 'error', desc: `Heavy transit through the ${houseFromMoon}H resonance.` });
    }
    if (planet === 'Jupiter' && [2, 5, 7, 9, 11].includes(houseFromMoon)) {
      highlights.push({ label: `Jupiter Grace`, type: 'success', desc: `Expansion occurring in the house of ${houseFromMoon}H.` });
    }
  });

  return (
    <Layout>
      <PageTransition>
        <div className="space-y-12">
          
          {/* Header - Responsive Layout */}
          <section className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 text-center md:text-left px-4">
            <div className="space-y-2">
               <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="badge-blue">Real-Time Precision</span>
                  <GlowPulse size={6} color="#3b82f6" />
               </div>
               <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">The Live Sky</h1>
               <p className="text-gray-400 text-sm md:text-base">Current planetary transits compared against your natal imprint.</p>
            </div>
            <div className="bg-gray-900/50 px-4 py-2 border border-gray-800 rounded-lg">
               <span className="text-[10px] mono text-gray-500 uppercase tracking-widest">
                  Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </span>
            </div>
          </section>

          {/* Core Layout: Transit Wheel then Data (Vertical on Mobile) */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 items-start">
            
            {/* Left: Transit Wheel Visualization */}
            <div className="w-full space-y-6 px-4 md:px-0">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 px-1 text-center md:text-left">Geometric Alignment</h2>
              <Card className="flex items-center justify-center p-2 md:p-4 bg-gradient-to-b from-[#0a0a0a] to-[#040404] aspect-square overflow-hidden">
                 <div className="w-full max-w-[320px] md:max-w-full">
                    <TransitWheel 
                        currentPositions={transitPositions}
                        natalPositions={natalData.positions}
                        ascendant={natalData.ascendant}
                    />
                 </div>
              </Card>
              <div className="flex justify-center gap-6">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                    <span className="text-[10px] uppercase font-bold text-gray-400">Transit</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-600" />
                    <span className="text-[10px] uppercase font-bold text-gray-400">Natal</span>
                 </div>
              </div>
            </div>

            {/* Right: Insights & Data Table */}
            <div className="w-full space-y-8 px-4 md:px-0">
              
              {/* Highlights List - More compact for mobile */}
              <section className="space-y-4">
                 <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 px-1 text-center md:text-left">Cosmic Intersections</h2>
                 <div className="space-y-3">
                    {highlights.map((h, i) => (
                      <Card key={i} className="p-4 hover:border-gray-700 transition-colors">
                        <div className="flex items-start gap-4">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-gray-800 ${h.type === 'success' ? 'bg-green-500/10 text-green-500' : (h.type === 'warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500')}`}>
                              <Activity size={18} />
                           </div>
                           <div className="flex-1 space-y-1">
                              <div className="flex justify-between items-center gap-2">
                                 <h4 className="text-xs md:text-sm font-bold text-white uppercase tracking-tight truncate">{h.label}</h4>
                                 <span className={`${h.type === 'success' ? 'badge-green' : (h.type === 'warning' ? 'badge-gold' : 'badge-red')} text-[9px]`}>{h.type.slice(0, 4)}</span>
                              </div>
                              <p className="text-[11px] md:text-xs text-gray-500 leading-relaxed italic line-clamp-2">{h.desc}</p>
                           </div>
                        </div>
                      </Card>
                    ))}
                    {highlights.length === 0 && (
                      <div className="text-center py-10 text-gray-600 text-sm italic border border-dashed border-gray-800 rounded-2xl">
                        Celestial harmony found. No major intersections.
                      </div>
                    )}
                 </div>
              </section>

              {/* Data Table - Scrollable */}
              <section className="space-y-4">
                 <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 px-1 text-center md:text-left">Position Symmetry</h2>
                 <Card noPadding className="overflow-hidden">
                    <div className="overflow-x-auto no-scrollbar">
                      <table className="w-full text-left border-collapse min-w-[500px]">
                        <thead>
                            <tr className="bg-[#050505] border-b border-gray-800">
                                <th className="px-4 py-3 text-[10px] font-bold uppercase text-gray-500">Planet</th>
                                <th className="px-4 py-3 text-[10px] font-bold uppercase text-gray-500">Transit</th>
                                <th className="px-4 py-3 text-[10px] font-bold uppercase text-gray-500">Natal</th>
                                <th className="px-4 py-3 text-[10px] font-bold uppercase text-gray-500 text-right">House</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(transitPositions).map(([planet, data]) => {
                                const lon = data.longitude;
                                const currentSign = getZodiacSign(lon);
                                const natalSign = natalData.positions[planet].sign ?? natalData.positions[planet].signIndex ?? 0;
                                const houseFromNatal = (currentSign - natalSign + 12) % 12 + 1;
                                return (
                                <tr key={planet} className="border-b border-gray-900 group hover:bg-gray-900/30">
                                    <td className="px-4 py-3 text-xs font-bold text-white uppercase">{planet}</td>
                                    <td className="px-4 py-3 text-xs mono text-gray-400">
                                        {Math.floor(lon % 30)}° {SIGN_NAMES[currentSign].substring(0,3)}
                                    </td>
                                    <td className="px-4 py-3 text-xs mono text-gray-600">
                                        {SIGN_NAMES[natalSign].substring(0,3)}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className={`text-[10px] font-black mono ${houseFromNatal === 1 ? 'text-blue-500' : 'text-gray-500'}`}>
                                            {houseFromNatal}H
                                        </span>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                      </table>
                    </div>
                 </Card>
              </section>
            </div>
          </div>
    </div>
      </PageTransition>
    </Layout>
  );
}

function useTitle(title) {
  useEffect(() => {
    document.title = `${title} | Vyoma`;
  }, [title]);
}
