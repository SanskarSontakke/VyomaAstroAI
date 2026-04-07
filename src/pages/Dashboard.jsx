import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useProfile } from '../lib/ProfileContext';
import { useQueryClient } from '@tanstack/react-query';
import { useProfiles, useAstroData } from '../hooks/useAstro';
import { 
  RefreshCw, 
  ChevronRight, 
  Star, 
  Clock, 
  Zap, 
  Circle,
  Settings as SettingsIcon,
  Plus as PlusIcon
} from 'lucide-react';

import { motion } from 'framer-motion';
import { 
  PageTransition, FadeUp, SlideIn, StaggerParent, StaggerChild 
} from '../lib/animations';
import { useToast } from '../lib/ToastContext';
import { log } from '../lib/logger';
import { Layout } from '../components/Shared/Layout';
import { Card } from '../components/Shared/Card';
import { DashboardSkeleton } from '../components/SkeletonLoaders';
import { SectionError } from '../components/SectionError';
import { useTitle } from '../hooks/useTitle';

export default function Dashboard() {
  useTitle('Dashboard');
  const [user, setUser] = useState(null);
  const { activeProfile, setActiveProfile, loading: profileContextLoading } = useProfile();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) navigate('/');
      else setUser(user);
    };
    checkUser();
  }, [navigate]);

  const { 
    data: profiles = [], 
    isLoading: profilesLoading,
    isRefetching: profilesRefetching,
    error: profilesError 
  } = useProfiles(user?.id);

  const {
    data: insights,
    isLoading: astroLoading,
    isRefetching: astroRefetching,
    error: astroError
  } = useAstroData(activeProfile);

  const _handleRefresh = () => {
    toast.info('Synchronizing', 'Refreshing cosmic coordinates...');
    queryClient.invalidateQueries({ queryKey: ['astroData'] });
    queryClient.invalidateQueries({ queryKey: ['profiles'] });
  };

  if (profilesLoading || profileContextLoading || !user) {
    return (
      <Layout>
        <DashboardSkeleton />
      </Layout>
    );
  }

  const errorState = profilesError || astroError;
  const _isSyncing = profilesRefetching || astroRefetching;

  return (
    <Layout>
      <PageTransition>
        <div className="space-y-6 md:space-y-12">
          
          {/* Profile Selection - Responsive Pills */}
          <section className="flex flex-col items-center gap-3 md:gap-6">
            <div className="flex items-center justify-between w-full">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">Subject Selection</h2>
              <button 
                onClick={() => navigate('/vault')}
                className="text-[10px] font-semibold text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-widest"
              >
                Archive Vault
              </button>
            </div>
            
            <div className="flex flex-nowrap items-center gap-2 p-1 bg-gray-900/40 rounded-2xl border border-gray-800/40 w-full overflow-x-auto no-scrollbar scroll-smooth snap-x">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => setActiveProfile(profile)}
                  className={`
                    px-4 md:px-6 py-2 rounded-xl text-xs font-semibold md:text-sm transition-all duration-300 whitespace-nowrap snap-start
                    ${activeProfile?.id === profile.id 
                      ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                      : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'}
                  `}
                >
                  {profile.name}
                </button>
              ))}
              <button 
                onClick={() => navigate('/vault')}
                className="p-2 px-4 text-gray-500 hover:text-white transition-colors border-l border-gray-800/50 ml-1"
                aria-label="Add Archive"
              >
                <PlusIcon size={16} />
              </button>
            </div>
          </section>

          {astroLoading ? (
            <DashboardSkeleton />
          ) : errorState ? (
            <SectionError title="Celestial Drift" detail={errorState.message} />
          ) : insights && (
            <StaggerParent stagger={0.1}>
              <div className="space-y-6 md:space-y-12">
                
                {/* Daily Score Banner */}
                <FadeUp>
                  <Card className="relative overflow-hidden group p-6 md:p-10 border-blue-600/20 bg-gradient-to-br from-blue-900/10 via-[#030303] to-[#010105] hover:border-blue-600/30 transition-all duration-500">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="absolute top-0 right-0 p-4 md:p-8 opacity-5 group-hover:opacity-15 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                      <Star size={120} className="text-blue-500" />
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12 relative z-10">
                      <div className="flex flex-col items-center shrink-0">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500/60 mb-1">Daily Score</span>
                        <div className="relative">
                          <span className="text-5xl md:text-8xl font-black tracking-tighter leading-none text-white">
                            {insights.dailyOutlook.score}
                          </span>
                          <span className="absolute -top-1 -right-4 text-sm md:text-lg font-bold text-gray-700">/5</span>
                        </div>
                      </div>
                      
                      <div className="flex-1 text-center md:text-left space-y-2 md:space-y-4">
                        <h1 className="text-xl md:text-4xl font-bold tracking-tight text-white leading-tight text-balance">
                           {insights.dailyOutlook.title}
                        </h1>
                        <p className="text-gray-400 leading-relaxed text-[13px] md:text-lg max-w-2xl mx-auto md:mx-0">
                          {insights.dailyOutlook.description}
                        </p>
                      </div>

                      <div className="w-full md:w-auto bg-gray-900/60 p-4 rounded-2xl border border-gray-800/50 flex flex-col items-center justify-center min-w-[140px] shadow-2xl">
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Moon Phase</span>
                        <span className="text-base md:text-lg font-bold text-white uppercase tracking-wider">{insights.tithi.name.split(' ')[0]}</span>
                      </div>
                    </div>
                  </Card>
                </FadeUp>

                {/* Timings Grid */}
                <section className="space-y-4">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 px-1 text-center md:text-left">Critical Windows</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-center">
                    <TimingCard 
                      label="Rahu Kaal" 
                      time={`${insights.timings.rahuKaal.formattedStart} - ${insights.timings.rahuKaal.formattedEnd}`} 
                      isWarning 
                    />
                    <TimingCard 
                      label="Yamaghanda" 
                      time={`${insights.timings.yamaghanda.formattedStart} - ${insights.timings.yamaghanda.formattedEnd}`} 
                      isWarning 
                    />
                    <TimingCard 
                      label="Guli Kaal" 
                      time={`${insights.timings.guliKaal.formattedStart} - ${insights.timings.guliKaal.formattedEnd}`} 
                      isWarning 
                    />
                    <TimingCard 
                      label="Abhijit" 
                      time={`${insights.timings.abhijitMuhurta.formattedStart} - ${insights.timings.abhijitMuhurta.formattedEnd}`} 
                      isBeneficial 
                    />
                  </div>
                </section>

                {/* 5-Limb Panchang Grid */}
                <section className="space-y-4">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 px-1 text-center md:text-left">Daily Panchang (5 Limbs)</h2>
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 text-center">
                    <PanchangCard label="Vara" value={insights.vara.name} subValue={insights.vara.lord} />
                    <PanchangCard 
                      label="Tithi" 
                      value={insights.tithi.name} 
                      subValue={insights.tithi.paksha} 
                      status={insights.tithi.isRikta ? 'Heavy' : 'Fluid'} 
                      isWarning={insights.tithi.isRikta}
                    />
                    <PanchangCard 
                      label="Nakshatra" 
                      value={insights.nakshatra.name} 
                      subValue={`Lord: ${insights.nakshatra.lord}`} 
                    />
                    <PanchangCard 
                      label="Yoga" 
                      value={insights.yoga.name} 
                      status={insights.yoga.inauspicious ? 'Avoid' : 'Good'} 
                      isWarning={insights.yoga.inauspicious}
                    />
                    <PanchangCard 
                      label="Karana" 
                      value={insights.karana.name} 
                      status={insights.karana.inauspicious ? 'Bhadra' : 'Favorable'} 
                      isWarning={insights.karana.inauspicious}
                    />
                  </div>
                </section>

                {/* Lucky Strip - Adaptive Matrix */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <ResponsiveWidget label="Tara Bala" value={insights.taraBala.name}>
                    <span className={insights.taraBala.favorable ? "badge-blue" : "badge-red"}>
                      {insights.taraBala.favorable ? 'Beneficial' : 'Caution'}
                    </span>
                  </ResponsiveWidget>

                  <ResponsiveWidget label="Lucky Color">
                    <div className="flex flex-col items-center gap-2">
                       <div 
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 shadow-2xl transition-transform hover:scale-110 duration-500"
                        style={{ backgroundColor: getColorHex(insights.luckyColor), boxShadow: `0 0 20px ${getColorHex(insights.luckyColor)}44` }}
                       />
                       <span className="text-xs font-bold text-white tracking-widest uppercase">{insights.luckyColor}</span>
                    </div>
                  </ResponsiveWidget>

                  <ResponsiveWidget label="Lucky Number">
                    <span className="text-6xl md:text-7xl font-black text-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.4)] mono leading-none py-2">
                       {insights.luckyNumber}
                    </span>
                  </ResponsiveWidget>

                  <ResponsiveWidget label="Current Phase" value={`${insights.tithi.percent.toFixed(0)}%`}>
                     <div className="w-full h-1 bg-gray-900 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${insights.tithi.percent}%` }} />
                     </div>
                  </ResponsiveWidget>
                </div>

                {/* Dasha Highlight - Vertical Stack on Mobile */}
                <FadeUp>
                  <Card className="border-l-4 border-l-blue-600 bg-gradient-to-r from-blue-600/5 to-transparent p-6 md:p-8">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 md:gap-12">
                      <div className="flex items-center gap-4 md:gap-5">
                        <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500 shrink-0">
                          <Zap size={24} />
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Active Maha Dasha</span>
                          <h3 className="text-xl md:text-2xl font-bold text-white">{insights.currentDasha.maha}</h3>
                        </div>
                      </div>
                      
                      <div className="h-px w-full md:w-px md:h-12 bg-gray-800" />

                      <div className="flex-1">
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Antar Dasha Phase</span>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-1">
                          <span className="text-lg md:text-xl font-semibold text-gray-200">{insights.currentDasha.antar}</span>
                          <span className="text-[10px] text-gray-500 mono uppercase tracking-wider">
                            Transitions {new Date(insights.currentDasha.antarEnds).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </FadeUp>

                {/* Monthly Cycle */}
                <SlideIn from="bottom">
                  <div className="space-y-4">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 px-1 text-center md:text-left">Monthly Cycle</h2>
                    <Card className={`relative border-l-4 ${insights.monthlyTheme.favorable ? 'border-l-green-500 bg-green-500/5' : 'border-l-orange-500 bg-orange-500/5'} p-6 md:p-8`}>
                      <div className="flex flex-col gap-3">
                         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">{insights.monthlyTheme.title}</h3>
                            <span className={insights.monthlyTheme.favorable ? 'badge-green' : 'badge-gold'}>
                                {insights.monthlyTheme.favorable ? 'Growth Phase' : 'Reflection'}
                            </span>
                         </div>
                         <p className="text-gray-400 leading-relaxed italic text-sm md:text-base md:pr-12">"{insights.monthlyTheme.description}"</p>
                      </div>
                    </Card>
                  </div>
                </SlideIn>
              </div>
            </StaggerParent>
          )}
        </div>
      </PageTransition>
    </Layout>
  );
}

function ResponsiveWidget({ label, value, children }) {
  return (
    <Card className="flex flex-col items-center text-center gap-3 py-6 px-4">
      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
      {value && <span className="text-base md:text-lg font-bold text-white tracking-tight">{value}</span>}
      {children}
    </Card>
  );
}

function TimingCard({ label, time, isWarning, isBeneficial }) {
  return (
    <Card className={`
      flex flex-col items-center justify-center gap-3 py-6 text-center transition-all duration-300
      ${isWarning ? 'bg-red-500/5 border-red-500/10 hover:border-red-500/30' : ''}
      ${isBeneficial ? 'bg-blue-600/5 border-blue-600/10 hover:border-blue-600/30' : ''}
    `}>
      <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isWarning ? 'text-red-400' : (isBeneficial ? 'text-blue-400' : 'text-gray-500')}`}>
        {label}
      </span>
      <span className="text-sm font-bold text-white mono tracking-tighter">
        {time}
      </span>
      <div className="flex gap-1">
        {[1, 2, 3].map(i => (
          <div key={i} className={`w-1 h-1 rounded-full ${isWarning ? 'bg-red-500/30' : (isBeneficial ? 'bg-blue-500/30' : 'bg-gray-800')}`} />
        ))}
      </div>
    </Card>
  );
}

function PanchangCard({ label, value, subValue, status, isWarning }) {
  return (
    <Card className={`
      flex flex-col items-center justify-center gap-2 py-6 text-center transition-all duration-300
      ${isWarning ? 'bg-red-500/5 border-red-500/10 hover:border-red-500/30' : 'bg-gray-900/10 hover:border-gray-800'}
    `}>
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
      <span className="text-sm md:text-base font-black text-white tracking-tight leading-none px-2 uppercase">{value}</span>
      {subValue && <span className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter">{subValue}</span>}
      {status && (
        <span className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${isWarning ? 'text-red-400' : 'text-green-500'}`}>
          {status}
        </span>
      )}
    </Card>
  );
}

function getColorHex(name) {
  const colors = {
    'Yellow': '#FACC15',
    'White': '#FFFFFF',
    'Red': '#EF4444',
    'Green': '#22C55E',
    'Blue': '#3B82F6',
    'Pink': '#EC4899',
    'Grey': '#6B7280',
    'Orange': '#F59E0B',
    'Smoky Gray': '#4B5563',
    'Brown': '#78350F'
  };
  return colors[name] || '#3b82f6';
}
