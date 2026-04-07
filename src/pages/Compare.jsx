import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../lib/ProfileContext';
import { useProfiles, useChartData } from '../hooks/useAstro';
import { calculateCompatibility } from '../lib/astro/compatibility';
import NorthChart from '../components/Chart/NorthChart';
import PlanetTable from '../components/Chart/PlanetTable';
import { PageTransition, FadeUp, StaggerParent, StaggerChild } from '../lib/animations';
import { useTitle } from '../hooks/useTitle';
import { 
  GitCompare, 
  ArrowRight, 
  AlertTriangle, 
  ChevronDown,
  User,
  Zap,
  Activity,
  Heart
} from 'lucide-react';
import { Layout } from '../components/Shared/Layout';
import { Card } from '../components/Shared/Card';
import { Badge } from '../components/Shared/Badge';

export default function Compare() {
  useTitle('Compare Charts');
  const { activeProfile } = useProfile();
  const navigate = useNavigate();
  const { data: profiles = [] } = useProfiles();

  const [idA, setIdA] = useState('');
  const [idB, setIdB] = useState('');

  useEffect(() => {
    if (profiles.length > 0 && !idA) {
      setIdA(activeProfile?.id || profiles[0].id);
    }
    if (profiles.length > 0 && !idB) {
      const firstId = activeProfile?.id || profiles[0].id;
      const secondId = profiles.find(p => p.id !== firstId)?.id || profiles[0].id;
      setIdB(secondId);
    }
  }, [profiles, activeProfile, idA, idB]);

  const profileA = profiles.find(p => p.id === idA);
  const profileB = profiles.find(p => p.id === idB);

  const { data: dataA } = useChartData(profileA);
  const { data: dataB } = useChartData(profileB);

  const differences = [];
  if (dataA && dataB) {
    if (dataA.ascendant.sign !== dataB.ascendant.sign) {
      differences.push({
        type: 'Fundamental',
        label: 'Ascendant (Lagna)',
        desc: `${profileA.name} is ${getSignName(dataA.ascendant.sign)} Rising, while ${profileB.name} is ${getSignName(dataB.ascendant.sign)} Rising.`
      });
    }

    if (dataA.positions.Moon.sign !== dataB.positions.Moon.sign) {
      differences.push({
        type: 'Temperament',
        label: 'Moon Placement',
        desc: `Moon in ${getSignName(dataA.positions.Moon.sign)} vs ${getSignName(dataB.positions.Moon.sign)} creates contrasting emotional needs.`
      });
    }

    Object.keys(dataA.positions).forEach(p => {
      const signA = dataA.positions[p].sign;
      const signB = dataB.positions[p].sign;
      if (signA !== signB) {
        const signDiff = Math.abs(signA - signB);
        const isAxisReversal = signDiff === 6;

        differences.push({
          type: isAxisReversal ? 'Phase Reversal' : 'Placement',
          label: p,
          desc: `${profileA.name}: ${getSignName(signA)} — ${profileB.name}: ${getSignName(signB)}`,
          warning: isAxisReversal
        });
      }
    });

    if (dataA.currentDasha?.maha.planet !== dataB.currentDasha?.maha.planet) {
      differences.push({
        type: 'Life Phase',
        label: 'Dasha Cycle',
        desc: `${profileA.name} is in ${dataA.currentDasha?.maha.planet} period; ${profileB.name} in ${dataB.currentDasha?.maha.planet}.`
      });
    }
  }

  const compat = (profileA && profileB) ? calculateCompatibility(profileA, profileB) : null;

  return (
    <Layout>
      <PageTransition>
        <div className="space-y-12">
          
          {/* Header */}
          <section className="text-center space-y-4">
             <div className="flex items-center justify-center gap-2">
                <Badge variant="blue">Side-by-Side Analysis</Badge>
                <GitCompare size={14} className="text-blue-500" />
             </div>
             <h1 className="text-4xl font-bold tracking-tight text-white">Cosmic Comparison</h1>
             <p className="text-gray-400 max-w-xl mx-auto">Evaluate two celestial imprints simultaneously to identify resonance patterns and phase alignment.</p>
          </section>

          {/* Dual Selector Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
             {/* Center Divider Decorative */}
             <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-800 to-transparent z-0" />
             
             {/* Profile A */}
             <div className="space-y-6 z-10">
                <ProfileSelector 
                  label="Primary Identity" 
                  profiles={profiles} 
                  value={idA} 
                  onChange={setIdA} 
                />
                
                {dataA && (
                  <FadeUp>
                    <Card className="hover:border-blue-600/20 group">
                       <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-6 group-hover:text-blue-500 transition-colors">
                         {profileA.name} Charts
                       </h3>
                       <div className="space-y-8">
                          <div className="flex justify-center">
                             <div className="scale-[0.85] origin-top">
                                <NorthChart positions={dataA.positions} ascendant={dataA.ascendant} />
                             </div>
                          </div>
                          <PlanetTable positions={dataA.positions} ascendant={dataA.ascendant} mini />
                       </div>
                    </Card>
                  </FadeUp>
                )}
             </div>

             {/* Profile B */}
             <div className="space-y-6 z-10">
                <ProfileSelector 
                  label="Target Identity" 
                  profiles={profiles} 
                  value={idB} 
                  onChange={setIdB} 
                />

                {dataB && (
                  <FadeUp delay={0.1}>
                    <Card className="hover:border-blue-600/20 group">
                       <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-6 group-hover:text-blue-500 transition-colors">
                         {profileB.name} Charts
                       </h3>
                       <div className="space-y-8">
                          <div className="flex justify-center">
                             <div className="scale-[0.85] origin-top">
                                <NorthChart positions={dataB.positions} ascendant={dataB.ascendant} />
                             </div>
                          </div>
                          <PlanetTable positions={dataB.positions} ascendant={dataB.ascendant} mini />
                       </div>
                    </Card>
                  </FadeUp>
                )}
             </div>
          </div>

          {/* Key Differences (Data-Dense 100% Grid) */}
          {differences.length > 0 && (
            <section className="space-y-6 pt-12 border-t border-gray-900">
               <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-center text-gray-600">
                 Identified Variances
               </h2>
               <StaggerParent stagger={0.05}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {differences.map((diff, i) => (
                      <StaggerChild key={i}>
                        <Card className={`h-full flex flex-col p-5 ${diff.warning ? 'border-amber-600/30 bg-amber-600/5' : 'border-gray-900 group-hover:border-gray-800'}`}>
                           <div className="flex justify-between items-start mb-2">
                              <span className="text-[9px] font-black uppercase tracking-widest text-gray-600">{diff.type}</span>
                              {diff.warning && <AlertTriangle size={12} className="text-amber-500" />}
                           </div>
                           <h4 className={`text-sm font-bold uppercase mb-2 ${diff.warning ? 'text-amber-500' : 'text-white'}`}>{diff.label}</h4>
                           <p className="text-[11px] text-gray-500 font-medium leading-relaxed mt-auto">
                              {diff.desc}
                           </p>
                        </Card>
                      </StaggerChild>
                    ))}
                  </div>
               </StaggerParent>
            </section>
          )}

          {/* Compatibility Anchor */}
          {compat && (
            <Card className="bg-gradient-to-r from-blue-600/10 to-transparent border-blue-600/20 overflow-hidden relative group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" />
               <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                        <Heart size={28} />
                     </div>
                     <div className="space-y-1">
                        <span className="badge-blue">Kuta Analysis Preview</span>
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                          Integrated Harmony: <span className="text-blue-500">{compat.totalScore}/36</span> Points
                        </h3>
                     </div>
                  </div>
                  <button 
                    onClick={() => navigate('/compat')}
                    className="flex items-center gap-3 px-8 py-4 rounded-xl bg-gray-900 border border-gray-800 text-white font-black uppercase tracking-widest text-[10px] hover:bg-gray-800 transition-all active:scale-95 shadow-xl"
                  >
                     Explore Full Report
                     <ArrowRight size={16} className="text-blue-500" />
                  </button>
               </div>
            </Card>
          )}

        </div>
      </PageTransition>
    </Layout>
  );
}

function ProfileSelector({ label, profiles, value, onChange }) {
  return (
    <div className="space-y-2">
       <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">{label}</label>
       <div className="relative group">
          <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
          <select 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="select-custom pl-11 pr-10 !py-4 font-bold uppercase tracking-widest text-xs"
          >
            {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
       </div>
    </div>
  );
}

function getSignName(idx) {
  return ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][idx];
}
