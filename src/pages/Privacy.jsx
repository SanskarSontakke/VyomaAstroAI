import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock, EyeOff, Database, History } from 'lucide-react';
import { PageTransition, FadeUp } from '../lib/animations';
import { Layout } from '../components/Shared/Layout';
import { Card } from '../components/Shared/Card';
import { Badge } from '../components/Shared/Badge';
import { useTitle } from '../hooks/useTitle';

export default function Privacy() {
  useTitle('Privacy Protocol');
  const navigate = useNavigate();

  const SECTIONS = [
    {
      title: 'Local-First Philosophy',
      icon: Database,
      content: "VyomaAstroAI is built with a focus on data ownership. Your birth data, coordinate calculations, and session preferences are stored exclusively within your browser's secure local storage. We do not transmit sensitive birth details to external processing servers."
    },
    {
      title: 'Identity Synchronization',
      icon: Lock,
      content: "For users who opt to create a persistent account, we utilize Supabase for encrypted identity management. This data is handled according to SOC2 compliance standards and is only used to restore your profile access across authorized devices."
    },
    {
      title: 'Algorithm Integrity',
      icon: EyeOff,
      content: "All astrological calculations are executed client-side. We do not employ third-party tracking, cross-site pixels, or hidden analytics that could compromise your digital imprint. Your cosmic curiosity remains your own."
    },
    {
      title: 'Retention & Control',
      icon: History,
      content: "You maintain absolute control over your archived identities. You may delete individual profiles or purge your entire synchronized history at any time through the Archive Settings interface."
    }
  ];

  return (
    <Layout>
      <PageTransition>
        <div className="max-w-3xl mx-auto space-y-12 pb-20">
          
          {/* Header */}
          <button 
             onClick={() => navigate(-1)}
             className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-white transition-colors"
          >
             <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
             Return to Archive
          </button>

          <header className="space-y-4">
             <div className="flex items-center gap-2">
                <Badge variant="blue">Data Mandate</Badge>
                <ShieldCheck size={14} className="text-blue-500" />
             </div>
             <h1 className="text-5xl font-bold text-white tracking-tight uppercase italic font-serif">Privacy Protocol</h1>
             <p className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.3em] font-bold">Effective Cycle: 2026.03.30</p>
          </header>

          {/* Reading Layout */}
          <div className="grid grid-cols-1 gap-6">
             {SECTIONS.map((s, i) => {
               const Icon = s.icon;
               return (
                 <FadeUp key={i} delay={i * 0.1}>
                    <Card className="p-8 space-y-4 bg-gray-900/5 hover:bg-gray-900/10 transition-colors border-gray-900 group">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-700 group-hover:text-blue-500 transition-colors">
                             <Icon size={18} />
                          </div>
                          <h3 className="text-lg font-bold text-white uppercase tracking-tight">{s.title}</h3>
                       </div>
                       <p className="text-gray-400 font-medium leading-relaxed max-w-2xl pl-14">
                          {s.content}
                       </p>
                    </Card>
                 </FadeUp>
               );
             })}
          </div>

        </div>
      </PageTransition>
    </Layout>
  );
}
