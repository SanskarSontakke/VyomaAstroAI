import React from 'react';
import { PageTransition, FadeUp } from '../lib/animations';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Github, 
  Globe, 
  Linkedin, 
  Twitter, 
  Code2, 
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';
import { useTitle } from '../hooks/useTitle';
import { Layout } from '../components/Shared/Layout';
import { Card } from '../components/Shared/Card';
import { Badge } from '../components/Shared/Badge';

export default function About() {
  useTitle('Architect Info');
  const navigate = useNavigate();

  return (
    <Layout>
      <PageTransition>
        <div className="max-w-2xl mx-auto space-y-12 pb-20">
          
          {/* Back Button */}
          <button 
             onClick={() => navigate(-1)}
             className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-white transition-colors"
          >
             <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
             Return to Archive
          </button>

          {/* Profile Section */}
          <section className="text-center space-y-6">
             <FadeUp>
                <div className="relative inline-block">
                   <div className="absolute inset-0 bg-blue-600 blur-2xl opacity-20 rounded-full animate-pulse" />
                   <img 
                      src="https://github.com/sanskarsontakke.png"
                      alt="Sanskar Sontakke"
                      className="relative w-32 h-32 rounded-3xl border-2 border-gray-900 shadow-2xl mx-auto"
                   />
                </div>
             </FadeUp>
             <div className="space-y-2">
                <h1 className="text-4xl font-bold text-white tracking-tight uppercase italic font-serif">Sanskar Sontakke</h1>
                <p className="text-gray-400 font-medium tracking-tight">Full-Stack Architect & Vedic System Designer</p>
             </div>
          </section>

          {/* Manifest Section */}
          <FadeUp delay={0.1}>
             <Card className="p-10 space-y-6 bg-gradient-to-br from-blue-600/5 to-transparent border-blue-600/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full" />
                <div className="flex items-center gap-2">
                   <Badge variant="blue">The Vision</Badge>
                   <Sparkles size={14} className="text-blue-500" />
                </div>
                <p className="text-lg text-gray-200 leading-relaxed font-serif italic">
                  VyomaAstroAI represents the convergence of high-precision computational geometry and ancient Vedic insights. 
                  My objective was to strip away the clutter of traditional astrology tools and build a cinematic, data-dense interface 
                  that feels like an archive of the universe.
                </p>
                <div className="pt-4 flex flex-wrap gap-4">
                   <TechBadge icon={Cpu} label="React 19" />
                   <TechBadge icon={Code2} label="Tailwind CSS" />
                   <TechBadge icon={Layers} label="Framer Motion" />
                   <TechBadge icon={CheckCircle2} label="Supabase Core" />
                </div>
             </Card>
          </FadeUp>

          {/* Social Connects */}
          <FadeUp delay={0.2}>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SocialLink 
                   href="https://sanskarsontakke.vercel.app" 
                   label="Digital Portfolio" 
                   sub="Vercel Deployment"
                   icon={Globe} 
                />
                <SocialLink 
                   href="https://github.com/sanskarsontakke" 
                   label="Source Repository" 
                   sub="github.com/sanskarsontakke"
                   icon={Github} 
                />
             </div>
          </FadeUp>

          {/* Footer Metadata */}
          <footer className="text-center pt-12 space-y-4">
             <div className="w-12 h-px bg-gray-900 mx-auto" />
             <p className="text-[10px] font-black font-mono text-gray-700 uppercase tracking-[0.3em]">
               System Version 2.4.0 — Build 2026.03
             </p>
          </footer>

        </div>
      </PageTransition>
    </Layout>
  );
}

function TechBadge({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900/50 border border-gray-800 text-[10px] font-black uppercase tracking-widest text-gray-500">
       <Icon size={12} className="text-blue-500" />
       {label}
    </div>
  );
}

function SocialLink({ href, label, sub, icon: Icon }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center gap-4 p-5 rounded-2xl bg-gray-900/10 border border-gray-900 hover:border-blue-600/40 transition-all group relative overflow-hidden"
    >
       <div className="absolute top-0 right-0 w-16 h-16 bg-blue-600/5 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-500" />
       <div className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-700 group-hover:text-blue-500 transition-colors shrink-0">
          <Icon size={18} />
       </div>
       <div className="space-y-0.5">
          <h4 className="text-sm font-bold text-white uppercase tracking-tight">{label}</h4>
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{sub}</p>
       </div>
    </a>
  );
}
