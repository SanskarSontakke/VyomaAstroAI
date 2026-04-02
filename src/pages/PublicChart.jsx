import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getChartData } from '../hooks/useAstro';
import NorthChart from '../components/Chart/NorthChart';
import PlanetTable from '../components/Chart/PlanetTable';
import { PageTransition, FadeUp } from '../lib/animations';
import CosmicLoader from '../components/CosmicLoader';
import { useTitle } from '../hooks/useTitle';
import { 
  Lock, 
  ArrowRight, 
  Share2, 
  ShieldCheck, 
  Sparkle,
  Zap,
  Activity,
  User,
  Heart
} from 'lucide-react';
import { Layout } from '../components/Shared/Layout';
import { Card } from '../components/Shared/Card';
import { Badge } from '../components/Shared/Badge';

export default function PublicChart() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useTitle(profile ? `${profile.name}'s Chart` : 'Shared Chart');

  useEffect(() => {
    const fetchShared = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('public_slug', slug)
          .single();

        if (fetchError || !data) throw new Error('Link Invalid');

        const calculated = await getChartData(data);
        
        const redactedProfile = { ...data };
        delete redactedProfile.latitude;
        delete redactedProfile.longitude;
        delete redactedProfile.dob_time;
        delete redactedProfile.iana_timezone;
        delete redactedProfile.user_id;

        setProfile(redactedProfile);
        setChartData(calculated);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchShared();
  }, [slug]);

  if (loading) return <CosmicLoader message="Synchronizing Public Archive..." />;

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center space-y-8">
        <div className="w-16 h-16 rounded-2xl bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-500">
           <Lock size={32} />
        </div>
        <div className="space-y-2">
           <h2 className="text-2xl font-bold text-white uppercase italic font-serif">Celestial Link Expired</h2>
           <p className="text-gray-500 text-sm max-w-xs mx-auto">This astrological report is no longer public or the link has been removed by the owner.</p>
        </div>
        <button 
           onClick={() => navigate('/')}
           className="px-8 py-3 rounded-xl bg-gray-900 border border-gray-800 text-white font-black uppercase tracking-widest text-[10px] hover:bg-gray-800 transition-all active:scale-95 shadow-xl"
        >
           Return to Origin
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Public Header Banner */}
      <nav className="sticky top-0 z-50 bg-blue-600/10 border-b border-gray-900 backdrop-blur-xl">
         <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <Share2 size={16} className="text-blue-500" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Shared Archive Fragment</span>
            </div>
            <button 
               onClick={() => navigate('/auth')}
               className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black font-black uppercase tracking-widest text-[9px] hover:bg-gray-200 transition-all active:scale-95 shadow-xl"
            >
               Get Your Chart
               <ArrowRight size={14} />
            </button>
         </div>
      </nav>

      <PageTransition>
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
          
          {/* Identity Header */}
          <section className="text-center space-y-6">
             <FadeUp>
                <div className="space-y-3">
                   <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic font-serif leading-none">
                     {profile.name}
                   </h1>
                   <div className="flex items-center justify-center gap-4">
                      <span className="text-sm font-mono font-bold text-gray-500 uppercase tracking-widest">Born {profile.dob_date}</span>
                      <div className="w-1 h-1 rounded-full bg-gray-800" />
                      <div className="flex items-center gap-2 text-gray-600">
                         <ShieldCheck size={14} className="text-blue-500" />
                         <span className="text-[10px] font-bold uppercase tracking-widest">Coordinates Redacted</span>
                      </div>
                   </div>
                </div>
             </FadeUp>
          </section>

          {/* Core Chart Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
             {/* Left: Natal Visualization */}
             <div className="lg:col-span-12 xl:col-span-7">
                <Card className="p-8 lg:p-12 hover:border-blue-600/20 group">
                   <div className="flex justify-between items-start mb-8">
                      <div className="space-y-1">
                         <Badge variant="blue">Rashi D1</Badge>
                         <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-600 transition-colors group-hover:text-blue-500">Natal Configuration</h3>
                      </div>
                      <Sparkle size={18} className="text-blue-500 animate-pulse" />
                   </div>
                   <div className="flex justify-center">
                      <div className="w-full max-w-[600px] aspect-square relative flex items-center justify-center">
                         <NorthChart positions={chartData.positions} ascendant={chartData.ascendant} />
                      </div>
                   </div>
                </Card>
             </div>

             {/* Right: Data Analytics */}
             <div className="lg:col-span-12 xl:col-span-5 space-y-6">
                <Card className="hover:border-blue-600/20 group animate-in slide-in-from-right duration-700">
                   <div className="flex items-center gap-3 mb-8">
                      <Activity size={18} className="text-blue-500" />
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-600 group-hover:text-white transition-colors">Precision Positions</h3>
                   </div>
                   <PlanetTable positions={chartData.positions} ascendant={chartData.ascendant} mini />
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <Card className="bg-blue-600/5 border-blue-600/20 group">
                      <div className="space-y-4">
                         <div className="flex items-center gap-3">
                            <Zap size={18} className="text-blue-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 group-hover:text-blue-500 transition-colors uppercase">Current Dasha</span>
                         </div>
                         <h3 className="text-4xl font-black text-white font-mono tracking-tighter uppercase">{chartData.currentDasha.maha.planet}</h3>
                         <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">Present Maha Dasha Period Active</p>
                      </div>
                   </Card>

                   <Card className="border-gray-900 group">
                      <div className="space-y-4">
                         <div className="flex items-center gap-3">
                            <Activity size={18} className="text-blue-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 group-hover:text-blue-500 transition-colors uppercase">Yoga Count</span>
                         </div>
                         <h3 className="text-4xl font-black text-white font-mono tracking-tighter uppercase">{chartData.yogas?.length || 0}</h3>
                         <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">Significant Formations Identified</p>
                      </div>
                   </Card>
                </div>
             </div>
          </div>

          {/* Yoga Explorer */}
          {chartData.yogas && chartData.yogas.length > 0 && (
            <section className="space-y-12 py-12 border-t border-gray-900">
               <div className="text-center space-y-2">
                  <Badge variant="blue">Formation Archive</Badge>
                  <h2 className="text-3xl font-black text-white uppercase italic font-serif">Significant Planetary Yogas</h2>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {chartData.yogas.slice(0, 6).map((yoga, i) => (
                    <Card key={i} className="hover:bg-blue-600/5 transition-all group">
                       <div className="space-y-4">
                          <h4 className="text-blue-500 font-black uppercase tracking-[0.2em] text-[10px] group-hover:tracking-[0.3em] transition-all">{yoga.name}</h4>
                          <p className="text-sm text-gray-400 font-medium leading-relaxed italic pr-4">
                             {yoga.description}
                          </p>
                       </div>
                    </Card>
                  ))}
               </div>
            </section>
          )}

          {/* Call to Action Footer */}
          <footer className="pt-24 pb-12">
             <Card className="bg-gradient-to-tr from-gray-900 to-transparent border-gray-900 p-12 text-center space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2" />
                
                <div className="space-y-4 relative z-10">
                   <h2 className="text-4xl font-black text-white uppercase italic font-serif">Decode Your Own Destiny</h2>
                   <p className="text-gray-500 max-w-xl mx-auto font-medium leading-relaxed">
                     Naksha provides deep celestial analysis, real-time transits, and auspicious timing tailored to your unique birth coordinates.
                   </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 pt-4">
                   <button 
                      onClick={() => navigate('/auth')}
                      className="px-12 py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all active:scale-95 shadow-2xl flex items-center gap-3"
                   >
                      Create Free Profile
                      <ArrowRight size={18} />
                   </button>
                </div>
                
                <div className="pt-8 opacity-40 group-hover:opacity-100 transition-opacity">
                   <p className="text-[9px] font-black font-mono text-gray-700 uppercase tracking-[0.3em]">
                     Powered by High-Precision Ephemeris Engine 2.0
                   </p>
                </div>
             </Card>
          </footer>

        </div>
      </PageTransition>
    </div>
  );
}
