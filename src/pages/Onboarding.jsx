import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  Shield, 
  Database,
  ArrowLeft
} from 'lucide-react';

import ProfileForm from '../components/ProfileForm';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition, FadeUp, StaggerParent, StaggerChild } from '../lib/animations';
import { useToast } from '../lib/ToastContext';
import { log } from '../lib/logger';
import { CosmicLoader } from '../components/CosmicLoader';
import { Card } from '../components/Shared/Card';

export default function Onboarding() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [authTab, setAuthTab] = useState(0); // 0 = signin, 1 = signup
  const [user, setUser] = useState(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const checkProfile = useCallback(async (userId) => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (data && data.length > 0) {
      navigate('/dashboard');
    } else {
      setShowProfileSetup(true);
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        await checkProfile(user.id);
      }
      setIsInitializing(false);
    };
    checkUser();
  }, [checkProfile]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    const isSignUp = authTab === 1;

    let result;
    if (isSignUp) {
      result = await supabase.auth.signUp({ email, password });
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
    }

    const { data, error } = result;
    if (error) {
      toast.error('Auth Failed', error.message);
    } else if (data.user) {
      setUser(data.user);
      if (data.session) {
        await checkProfile(data.user.id);
      } else {
        toast.info("Verification Sent", "Please check your inbox to activate your account.");
      }
    }
    setLoading(false);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <CosmicLoader message="Syncing with the local ephemeris..." />
      </div>
    );
  }

  if (showProfileSetup) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-black flex items-center justify-center px-3 sm:px-4 md:px-0 py-6">
          <div className="w-full max-w-md space-y-6 sm:space-y-8">
            <div className="text-center space-y-2">
               <h1 className="text-3xl font-bold tracking-tight text-white uppercase">Initialize Presence</h1>
               <p className="text-gray-500 text-sm">
                 Configure your primary celestial imprint for precise natal calculations.
               </p>
            </div>
            
            <Card className="p-4 sm:p-6 md:p-8">
              <ProfileForm 
                userId={user?.id} 
                isPrimary={true} 
                onSuccess={() => navigate('/dashboard')} 
              />
            </Card>

            <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-gray-700 uppercase tracking-widest pt-4">
               <span className="flex items-center gap-1"><Shield size={12}/> Privacy First</span>
               <span className="flex items-center gap-1"><Database size={12}/> Local Sync</span>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-3 sm:px-4 overflow-hidden relative py-6">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full translate-y-1/2" />

        <div className="w-full max-w-[420px] space-y-7 sm:space-y-10 z-10">
          
          <div className="text-center space-y-3">
             <div className="flex items-center justify-center gap-3">
                <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-white">Vyoma</h1>
                <span className="badge-blue">Legacy v1.0</span>
             </div>
             <p className="text-gray-500 font-medium tracking-tight">Precision Vedic analytics. Zero clutter.</p>
          </div>

          <Card className="p-1 space-y-0 overflow-hidden">
             {/* Custom Tabs */}
             <div className="flex p-1 gap-1">
                <button 
                  onClick={() => setAuthTab(0)}
                  className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${authTab === 0 ? 'bg-gray-800 text-white shadow-xl' : 'text-gray-600 hover:text-gray-400'}`}
                >
                  Access Base
                </button>
                <button 
                  onClick={() => setAuthTab(1)}
                  className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${authTab === 1 ? 'bg-gray-800 text-white shadow-xl' : 'text-gray-600 hover:text-gray-400'}`}
                >
                  New Account
                </button>
             </div>

             <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
                <form onSubmit={handleAuth} className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">Email Interface</label>
                      <div className="relative">
                         <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700" />
                         <input 
                           type="email" 
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           required
                           placeholder="your@archive.com"
                           className="w-full bg-[#0a0a0a] border border-gray-900 rounded-xl pl-11 pr-4 py-4 text-white placeholder-gray-800 focus:outline-none focus:border-blue-600 transition-all font-medium"
                         />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">Access Cipher</label>
                      <div className="relative">
                         <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700" />
                         <input 
                           type="password" 
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           required
                           placeholder="••••••••"
                           className="w-full bg-[#0a0a0a] border border-gray-900 rounded-xl pl-11 pr-4 py-4 text-white placeholder-gray-800 focus:outline-none focus:border-blue-600 transition-all"
                         />
                      </div>
                   </div>

                   <button 
                     type="submit"
                     disabled={loading}
                     className={`w-full mt-4 flex items-center justify-center gap-2 py-4 rounded-xl font-black uppercase tracking-widest transition-all ${loading ? 'bg-gray-900 text-gray-700' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/20 active:scale-95'}`}
                   >
                     {loading ? (
                        <div className="w-5 h-5 border-2 border-gray-700 border-t-white rounded-full animate-spin" />
                     ) : (
                        <>
                          {authTab === 0 ? 'Initialize Session' : 'Create Identity'}
                          <ArrowRight size={18} />
                        </>
                     )}
                   </button>
                </form>
             </div>
          </Card>

          <div className="text-center space-y-4">
             <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                <Sparkles size={14} className="text-blue-500" />
                <span>Calculated on device</span>
             </div>
             <p className="text-[9px] text-gray-700 max-w-[280px] mx-auto leading-relaxed">
               All celestial data is processed locally. Your natal metrics are stored in an encrypted database for exclusive access.
             </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
