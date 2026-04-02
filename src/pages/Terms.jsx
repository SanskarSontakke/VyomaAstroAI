import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Scale, Info, ShieldAlert, Cpu, CheckCircle } from 'lucide-react';
import { PageTransition, FadeUp } from '../lib/animations';
import { Layout } from '../components/Shared/Layout';
import { Card } from '../components/Shared/Card';
import { Badge } from '../components/Shared/Badge';
import { useTitle } from '../hooks/useTitle';

export default function Terms() {
  useTitle('Service Mandate');
  const navigate = useNavigate();

  const SECTIONS = [
    {
      title: 'Interpretive Governance',
      icon: Scale,
      content: "VyomaAstroAI functions as a digital interpretive framework for Vedic astrological coordinates. It provides celestial data and traditional insights based on established texts. The service is intended for educational, personal, and informational purposes only."
    },
    {
      title: 'Precision & Algorithms',
      icon: Cpu,
      content: "We utilize high-precision ephemeris algorithms for all coordinate calculations. However, astrological insights are inherently subjective and interpretive. They should not substitute for critical judgment or professional counsel. You hold sole responsibility for actions taken as a result of using this interface."
    },
    {
      title: 'Identity Integrity',
      icon: ShieldAlert,
      content: "When syncing identities via the Supabase protocol, you are responsible for maintaining the confidentiality of your access keys and for all cosmic queries executed under your authorized session."
    },
    {
      title: 'System Evolution',
      icon: CheckCircle,
      content: "The Celestial Archive project is subject to periodic updates and refactors. We reserve the right to modify, rotate, or terminate any interface segment or calculation engine at any time without prior coordination."
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
                <Badge variant="blue">Service Mandate</Badge>
                <Info size={14} className="text-blue-500" />
             </div>
             <h1 className="text-5xl font-bold text-white tracking-tight uppercase italic font-serif">Terms of Service</h1>
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
