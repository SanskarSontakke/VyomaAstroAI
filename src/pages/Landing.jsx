import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Sparkles, 
  Shield, 
  Activity, 
  ArrowRight,
  Database,
  Globe,
  Circle
} from 'lucide-react';

import { motion } from 'framer-motion';
import { PageTransition, WordReveal, StaggerParent, StaggerChild, FadeUp } from '../lib/animations';
import { useTitle } from '../hooks/useTitle';
import { useProfile } from '../lib/ProfileContext';
import { Card } from '../components/Shared/Card';

export default function Landing() {
  const navigate = useNavigate();
  useTitle('Vyoma — Celestial Precision');
  const { loading: profileLoading } = useProfile();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate('/dashboard');
      }
      setChecking(false);
    };
    checkUser();
  }, [navigate]);

  if (checking || profileLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="bg-[#000] text-white min-h-screen relative overflow-hidden">
        
        {/* Background Atmosphere */}
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-blue-600/10 blur-[160px] rounded-full -translate-y-1/2 opacity-50" />
        <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-blue-600/5 blur-[160px] rounded-full translate-y-1/2 opacity-30" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 md:py-20 relative z-10">
          
          {/* Hero Section */}
          <section className="text-center space-y-8 sm:space-y-10 py-10 sm:py-14 md:py-20">
            <FadeUp>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                 <Sparkles size={12} />
                 The Next Generation of Vedic Analytics
              </div>
            </FadeUp>

            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] text-white">
                <span className="block italic font-light text-gray-500 text-2xl sm:text-3xl md:text-5xl mb-3 sm:mb-4 font-serif">The Sky is a</span>
                Precision <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600">Instrument.</span>
              </h1>
              
              <div className="max-w-2xl mx-auto">
                <WordReveal 
                  text="High-fidelity ephemeris calculation for modern observers. Explore your celestial code with sub-degree accuracy."
                  className="text-base sm:text-lg md:text-xl text-gray-400 font-medium tracking-tight px-2"
                />
              </div>
            </div>

            <FadeUp delay={0.6}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                 <button 
                   onClick={() => navigate('/login')}
                   className="w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-[11px] sm:text-xs hover:bg-gray-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] active:scale-95"
                 >
                   Enter the Archive
                 </button>
                 <button 
                    onClick={() => navigate('/about')}
                    className="w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-5 rounded-2xl bg-gray-900 border border-gray-800 text-gray-400 font-black uppercase tracking-widest text-[11px] sm:text-xs hover:text-white hover:bg-gray-800 transition-all active:scale-95"
                 >
                    Architect Info
                 </button>
              </div>
            </FadeUp>
          </section>

          {/* Feature Grid */}
          <section className="pt-10 sm:pt-16 md:pt-20">
            <StaggerParent stagger={0.1}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FeatureCard 
                  icon={<Activity size={24} />}
                  title="Sub-Degree Precision"
                  desc="Calculated using real-time astronomical algorithms. No approximations, strictly Nirayana."
                />
                <FeatureCard 
                  icon={<Database size={24} />}
                  title="Local Integrity"
                  desc="All calculations run locally on your hardware. Your celestial metrics remain private and secure."
                />
                <FeatureCard 
                  icon={<Globe size={24} />}
                  title="Universal Logic"
                  desc="Pure Parashari principles applied through a modern editorial lens. No distractions."
                />
              </div>
            </StaggerParent>
          </section>

          {/* Footer Branding */}
          <footer className="mt-16 sm:mt-24 md:mt-40 pt-8 sm:pt-12 border-t border-gray-900/50 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
             <div className="flex items-center gap-3">
                <h2 className="text-xl font-black tracking-tighter text-white">Vyoma</h2>
                <span className="w-px h-4 bg-gray-800" />
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">v1.0 Legacy Edition</span>
             </div>
             <div className="flex gap-8 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                <button onClick={() => navigate('/privacy')} className="hover:text-blue-500 transition-colors">Privacy Policy</button>
                <button onClick={() => navigate('/terms')} className="hover:text-blue-500 transition-colors">Terms of Service</button>
             </div>
          </footer>
        </div>
      </div>
    </PageTransition>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <StaggerChild y={20}>
      <Card className="h-full border-gray-900 hover:border-gray-700 hover:bg-gray-900/5 group transition-all duration-500">
        <div className="space-y-6">
          <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-500 shadow-inner">
            {icon}
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white tracking-tight uppercase">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">{desc}</p>
          </div>
          <div className="pt-4 flex items-center gap-2 text-[10px] font-black text-blue-500 opacity-0 group-hover:opacity-100 uppercase tracking-widest transition-opacity translate-x-[-10px] group-hover:translate-x-0">
             Learn More <ArrowRight size={12} />
          </div>
        </div>
      </Card>
    </StaggerChild>
  );
}
