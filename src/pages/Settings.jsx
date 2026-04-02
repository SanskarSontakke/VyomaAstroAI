import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useProfile } from '../lib/ProfileContext';
import { useToast } from '../lib/ToastContext';
import { invalidateCachedChart } from '../lib/chartCache';
import { useQueryClient } from '@tanstack/react-query';
import { useConfirm } from '../components/ConfirmDialog';
import { PageTransition, FadeUp, StaggerParent, StaggerChild } from '../lib/animations';
import ProfileCard from '../components/ProfileCard';
import ProfileForm from '../components/ProfileForm';
import { 
  Settings as SettingsIcon, 
  User, 
  ShieldCheck, 
  Bell, 
  LogOut, 
  Plus, 
  ExternalLink,
  ChevronRight,
  Monitor,
  Type,
  Layout as LayoutIcon,
  HelpCircle,
  Clock,
  Activity
} from 'lucide-react';
import { Layout } from '../components/Shared/Layout';
import { Card } from '../components/Shared/Card';
import { Badge } from '../components/Shared/Badge';
import { useTitle } from '../hooks/useTitle';
import { scheduleDailyNotification, cancelNotifications } from '../lib/notifications';
import { motion, AnimatePresence } from 'framer-motion';

export default function Settings() {
  useTitle('Settings');
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const { settings, updateSettings, activeProfile, setActiveProfile } = useProfile();
  const queryClient = useQueryClient();
  
  const [tab, setTab] = useState(0);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [userId, setUserId] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem('notifEnabled') === 'true'
  );

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/landing');
      return;
    }
    setUserId(user.id);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    setProfiles(data || []);
    setLoading(false);
  };

  const handleLogout = async () => {
    const ok = await confirm({
      title: 'Sign Out',
      message: 'Are you sure you want to end your current session?',
      confirmText: 'Sign Out',
      confirmColor: 'error'
    });
    if (ok) {
      await supabase.auth.signOut();
      toast.success('Signed Out', 'Your session has ended.');
      navigate('/landing');
    }
  };

  const toggleNotifications = async () => {
    if (notificationsEnabled) {
      cancelNotifications();
      setNotificationsEnabled(false);
      localStorage.setItem('notifEnabled', 'false');
      toast.info('Notifications Off', 'Daily briefings disabled.');
    } else {
      const scheduled = await scheduleDailyNotification(activeProfile);
      if (scheduled) {
        setNotificationsEnabled(true);
        localStorage.setItem('notifEnabled', 'true');
        toast.success('Notifications On', 'Your daily briefing is set for 7:00 AM.');
      } else {
        toast.warning(
          'Permission Required',
          'Please allow notifications in your browser settings.'
        );
      }
    }
  };

  const TABS = [
    { label: 'Preferences', icon: Monitor },
    { label: 'Identities', icon: User },
    { label: 'Archive Info', icon: HelpCircle }
  ];

  return (
    <Layout>
      <PageTransition>
        <div className="space-y-12">
          
          {/* Header Panel */}
          <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-1">
             <div className="space-y-1">
                <div className="flex items-center gap-2">
                   <Badge variant="blue">System Control</Badge>
                   <SettingsIcon size={14} className="text-blue-500" />
                </div>
                <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white italic font-serif uppercase">Archive Settings</h1>
                <p className="text-xs md:text-base text-gray-500 max-w-sm">Configure your celestial interface and identity management rules.</p>
             </div>
             
             <button 
                onClick={handleLogout}
                className="w-full md:w-auto flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-red-600/10 border border-red-600/20 text-red-500 font-black uppercase tracking-widest text-[10px] hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-xl"
             >
                <LogOut size={16} />
                Sign Out
             </button>
          </section>

          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12">
             
             {/* Sidebar Navigation - Horizontal on Mobile */}
             <aside className="lg:col-span-3 flex lg:flex-col overflow-x-auto no-scrollbar gap-2 -mx-4 px-4 lg:mx-0 lg:px-0 scroll-smooth snap-x">
                {TABS.map((t, i) => {
                   const Icon = t.icon;
                   const isActive = tab === i;
                   return (
                      <button 
                         key={t.label}
                         onClick={() => setTab(i)}
                         className={`
                            flex items-center gap-3 px-5 py-3 lg:py-4 rounded-xl transition-all font-bold text-xs lg:text-sm tracking-tight whitespace-nowrap snap-start
                            ${isActive ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03] bg-gray-900/40 lg:bg-transparent'}
                         `}
                      >
                         <Icon size={18} />
                         {t.label}
                         {isActive && <div className="hidden lg:block ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />}
                      </button>
                   );
                })}
             </aside>

             {/* Content Area */}
             <main className="lg:col-span-9 space-y-8 lg:space-y-12 min-h-[400px]">
                <AnimatePresence mode="wait">
                   {tab === 0 && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                         <div className="space-y-6">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 pl-2">Interface Preferences</h2>
                            <Card className="p-8 space-y-10 group">
                               {/* Monospaced Toggle */}
                               <div className="flex items-center justify-between">
                                  <div className="space-y-1">
                                     <h3 className="text-sm font-bold text-white uppercase tracking-tight">High-Precision Data Display</h3>
                                     <p className="text-xs text-gray-500 font-medium">Use the monospaced font system for all celestial calculations and table values.</p>
                                  </div>
                                  <button 
                                     onClick={() => updateSettings({ fontFamily: settings.fontFamily === 'Geist' ? 'Geist Mono' : 'Geist' })}
                                     className={`w-12 h-6 rounded-full p-1 transition-all ${settings.fontFamily === 'Geist Mono' ? 'bg-blue-600' : 'bg-gray-800'}`}
                                  >
                                     <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${settings.fontFamily === 'Geist Mono' ? 'translate-x-6 shadow-xl' : 'translate-x-0'}`} />
                                  </button>
                               </div>

                               <div className="h-px bg-gray-900/50" />

                               {/* Notifications Toggle */}
                               <div className="flex items-center justify-between">
                                  <div className="space-y-1">
                                     <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-bold text-white uppercase tracking-tight">Daily Cosmic Briefing</h3>
                                        {notificationsEnabled && <Badge variant="blue">Active</Badge>}
                                     </div>
                                     <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                        Receive your daily score and best auspicious window at 07:00 AM local time.
                                     </p>
                                  </div>
                                  <button 
                                     onClick={toggleNotifications}
                                     className={`w-12 h-6 rounded-full p-1 transition-all ${notificationsEnabled ? 'bg-blue-600' : 'bg-gray-800'}`}
                                  >
                                     <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${notificationsEnabled ? 'translate-x-6 shadow-xl' : 'translate-x-0'}`} />
                                  </button>
                               </div>

                               <div className="h-px bg-gray-900/50" />

                               {/* Scale Configuration */}
                               <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                     <div className="space-y-1">
                                        <h3 className="text-sm font-bold text-white uppercase tracking-tight">Interface Scale</h3>
                                        <p className="text-xs text-gray-500 font-medium">Calibrate the UI density for your specific display hardware.</p>
                                     </div>
                                     <span className="text-xs font-mono font-black text-blue-500 uppercase tracking-widest">{settings.fontSizeScale.toFixed(2)}x</span>
                                  </div>
                                  <input 
                                     type="range"
                                     min="0.8"
                                     max="1.4"
                                     step="0.05"
                                     value={settings.fontSizeScale}
                                     onChange={(e) => updateSettings({ fontSizeScale: parseFloat(e.target.value) })}
                                     className="w-full accent-blue-600 bg-gray-900 h-1.5 rounded-lg appearance-none cursor-pointer"
                                  />
                               </div>

                               <div className="h-px bg-gray-900/50" />

                               {/* Calculation Preferences */}
                               <div className="space-y-6">
                                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500/60">Calculation Protocol</h2>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                     <div className="space-y-3">
                                        <label className="label-text">Ayanamsa (Precession)</label>
                                        <select 
                                           value={settings.ayanamsaSystem}
                                           onChange={async (e) => {
                                              updateSettings({ ayanamsaSystem: e.target.value });
                                              if (activeProfile) {
                                                  await invalidateCachedChart(activeProfile.id);
                                                  queryClient.invalidateQueries({ queryKey: ['chartData'] });
                                              }
                                              toast.warning('Recalculating', 'Dynamic recalibration initiated across all charts.');
                                           }}
                                           className="select-custom"
                                        >
                                           <option value="lahiri">Lahiri (Indian Standard)</option>
                                           <option value="krishnamurti">Krishnamurti (KP System)</option>
                                           <option value="raman">Raman (B.V. Raman)</option>
                                           <option value="yukteshwar">Yukteshwar (Classical)</option>
                                           <option value="fagan">Fagan-Bradley (Western)</option>
                                        </select>
                                        <p className="text-[10px] text-gray-600 leading-relaxed uppercase tracking-tighter">
                                           Shifts all planetary positions based on earth's tilt. Lahiri is the official government standard.
                                        </p>
                                     </div>

                                     <div className="space-y-3">
                                        <label className="label-text">House System</label>
                                        <select 
                                           value={settings.houseSystem}
                                           onChange={async (e) => {
                                              updateSettings({ houseSystem: e.target.value });
                                              if (activeProfile) {
                                                  await invalidateCachedChart(activeProfile.id);
                                                  queryClient.invalidateQueries({ queryKey: ['chartData'] });
                                              }
                                           }}
                                           className="select-custom"
                                        >
                                           <option value="whole_sign">Whole Sign (Classical)</option>
                                           <option value="equal">Equal House (Modern)</option>
                                        </select>
                                        <p className="text-[10px] text-gray-600 leading-relaxed uppercase tracking-tighter">
                                           Determines how the 12 Bhavas are partitioned. Whole Sign is traditional in Vedic texts.
                                        </p>
                                     </div>
                                  </div>
                               </div>
                            </Card>
                         </div>
                      </motion.div>
                   )}

                   {tab === 1 && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                         <div className="flex justify-between items-end pl-2">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Active Identity Log</h2>
                            <button 
                               onClick={() => { setEditingProfile(null); setShowProfileForm(true); }}
                               className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600/10 border border-blue-600/20 text-blue-500 font-black uppercase tracking-widest text-[9px] hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                            >
                               <Plus size={14} />
                               Sync New Profile
                            </button>
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {profiles.map((p) => (
                              <ProfileCard 
                                  key={p.id} 
                                  profile={p} 
                                  active={activeProfile?.id === p.id}
                                  onSelect={() => setActiveProfile(p)}
                                  onEdit={() => { setEditingProfile(p); setShowProfileForm(true); }}
                              />
                            ))}
                         </div>
                      </motion.div>
                   )}

                   {tab === 2 && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                         <div className="space-y-6">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 pl-2">Celestial Archive Documentation</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               {[
                                 { label: 'Reading History', path: '/history', desc: 'Timeline of past cosmic scores', icon: Clock },
                                 { label: 'Comparison Engine', path: '/compare', desc: 'Parallel chart analysis', icon: GitCompare },
                                 { label: 'Muhurta Finder', path: '/muhurta', desc: 'Propitious timing utility', icon: Activity },
                                 { label: 'Privacy Protocol', path: '/privacy', desc: 'Identity shielding rules', icon: ShieldCheck },
                                 { label: 'Service Mandate', path: '/terms', desc: 'Interpretive guidelines', icon: LayoutIcon },
                                 { label: 'Developer ID', path: '/about', desc: 'Vedic Engineering Profile', icon: ExternalLink }
                               ].map((item, idx) => {
                                 const Icon = item.icon;
                                 return (
                                   <Card 
                                      key={idx}
                                      onClick={() => navigate(item.path)}
                                      className="cursor-pointer group hover:border-blue-600/40 relative overflow-hidden h-full"
                                   >
                                      <div className="flex items-start gap-4 h-full">
                                         <div className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-700 group-hover:text-blue-500 transition-colors shrink-0">
                                            <Icon size={18} />
                                         </div>
                                         <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                               <h3 className="text-sm font-bold text-white uppercase tracking-tight">{item.label}</h3>
                                               <ChevronRight size={14} className="text-gray-800 group-hover:text-blue-500 transition-all group-hover:translate-x-1" />
                                            </div>
                                            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                                         </div>
                                      </div>
                                   </Card>
                                 );
                               })}
                            </div>
                         </div>
                      </motion.div>
                   )}
                </AnimatePresence>
             </main>
          </div>

          {/* Profile Form Overlay */}
          <AnimatePresence>
             {showProfileForm && (
               <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <motion.div 
                     initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                     onClick={() => setShowProfileForm(false)}
                     className="absolute inset-0 bg-black/90 backdrop-blur-md" 
                  />
                  <motion.div 
                     initial={{ scale: 0.95, opacity: 0, y: 20 }}
                     animate={{ scale: 1, opacity: 1, y: 0 }}
                     exit={{ scale: 0.95, opacity: 0, y: 20 }}
                     className="relative w-full max-w-lg"
                  >
                     <Card className="shadow-2xl border-gray-800 p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between mb-8">
                           <h2 className="text-2xl font-bold text-white uppercase italic font-serif tracking-tight">
                              {editingProfile ? 'Refine Identity' : 'Establish New Identity'}
                           </h2>
                        </div>
                        <ProfileForm 
                            userId={userId}
                            profile={editingProfile}
                            onSuccess={() => { setShowProfileForm(false); fetchProfiles(); }}
                            onCancel={() => setShowProfileForm(false)}
                        />
                     </Card>
                  </motion.div>
               </div>
             )}
          </AnimatePresence>
          
        </div>
      </PageTransition>
    </Layout>
  );
}

// Stub for Missing Icon from mapping
function GitCompare({ size, className }) {
   return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
         <circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M11 18H8a2 2 0 0 1-2-2V9"/>
      </svg>
   );
}
