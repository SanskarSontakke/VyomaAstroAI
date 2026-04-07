import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useProfile } from '../lib/ProfileContext';
import ProfileForm from '../components/ProfileForm';
import { useTitle } from '../hooks/useTitle';
import { 
  Users, 
  Plus, 
  Search, 
  Trash2, 
  Download, 
  Share2, 
  MoreVertical,
  X,
  Database,
  Archive
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useProfiles } from '../hooks/useAstro';


import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition, StaggerParent, StaggerChild, FadeUp } from '../lib/animations';
import { useToast } from '../lib/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import ProfileCard from '../components/ProfileCard';
import { Layout } from '../components/Shared/Layout';
import { Card } from '../components/Shared/Card';

export default function Vault() {
  useTitle('The Archive');
  const [user, setUser] = useState(null);
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [_exporting, _setExporting] = useState(false);
  const { activeProfile, setActiveProfile } = useProfile();
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) navigate('/');
      else setUser(user);
    };
    checkUser();
  }, [navigate]);

  const { data: profiles = [], isLoading: profilesLoading } = useProfiles(user?.id);

  const handleSwitchProfile = (profile) => {
    setActiveProfile(profile);
    navigate('/dashboard');
  };

  const handleDelete = async (profile) => {
    const ok = await confirm({
      title: 'De-Archive Identity?',
      message: `Permanently remove ${profile.name} from your celestial database? This cannot be undone.`,
      confirmLabel: 'Delete Profile',
      confirmVariant: 'danger'
    });

    if (ok) {
      try {
        const { error } = await supabase.from('profiles').delete().eq('id', profile.id);
        if (error) throw error;
        toast.success('Identity Removed', `${profile.name} has been purged.`);
        queryClient.invalidateQueries({ queryKey: ['profiles'] });
      } catch (err) {
        toast.error('Deletion Failed', err.message);
      }
    }
  };

  const filteredProfiles = profiles.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <PageTransition>
        <div className="space-y-12">
          
          {/* Vault Header - Responsive Layout */}
          <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-4 md:px-0">
            <div className="space-y-2">
               <div className="flex items-center gap-2">
                  <span className="badge-blue">Celestial Records</span>
                  <Archive size={14} className="text-blue-500" />
               </div>
               <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white uppercase tracking-tighter">The Archive</h1>
               <p className="text-gray-400 text-sm md:text-base max-w-md">Manage and access saved planetary imprints within your secure vault.</p>
            </div>
            
            <button 
              onClick={() => setShowAddProfile(true)}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
            >
              <Plus size={18} />
              New Identity
            </button>
          </section>

          {/* Search & Stats Bar - Responsive Stack */}
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between px-4 md:px-0">
             <div className="relative w-full lg:max-w-md">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search records by name..."
                  className="w-full bg-gray-900/50 border border-gray-800 rounded-xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-blue-600 transition-all font-medium"
                />
             </div>
             <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                <div className="flex items-center gap-2 bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-800">
                  <span className="text-gray-600">Total:</span>
                  <strong className="text-white">{profiles.length}</strong>
                </div>
                <div className="flex items-center gap-2 bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-800">
                  <span className="text-gray-600">Sync:</span>
                  <strong className="text-green-500">Live</strong>
                </div>
             </div>
          </div>

          {/* Records Grid - 1 Col on Mobile */}
          <section className="px-4 md:px-0 pb-12">
            <StaggerParent stagger={0.05}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredProfiles.map((p) => (
                  <StaggerChild key={p.id} y={20}>
                    <ProfileCard 
                      profile={p}
                      active={activeProfile?.id === p.id}
                      onSelect={() => handleSwitchProfile(p)}
                      onDelete={() => handleDelete(p)}
                      onExport={() => toast.info('Exporting...', 'Generating PDF interpretation.')}
                      onShare={() => toast.info('Linking...', 'Generating public access token.')}
                    />
                  </StaggerChild>
                ))}

                {/* Empty State */}
                {filteredProfiles.length === 0 && !profilesLoading && (
                  <div className="col-span-full border border-dashed border-gray-800 rounded-2xl py-20 flex flex-col items-center justify-center text-center space-y-4 bg-gray-900/20">
                     <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-700">
                        <Users size={32} />
                     </div>
                     <div className="space-y-1">
                        <h3 className="text-white font-bold uppercase tracking-widest text-xs">No Records Found</h3>
                        <p className="text-gray-500 text-[11px]">Expand your database by adding a new planetary imprint.</p>
                     </div>
                     <button 
                        onClick={() => setShowAddProfile(true)}
                        className="p-3 bg-blue-600/10 text-blue-500 border border-blue-600/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600/20 transition-all"
                     >
                        Initialize New Identity
                     </button>
                  </div>
                )}
              </div>
            </StaggerParent>
          </section>

        </div>
      </PageTransition>

      {/* Slide-over Form Overlay */}
      <AnimatePresence>
        {showAddProfile && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddProfile(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[2000]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#050505] border-l border-gray-800 z-[2001] shadow-2xl overflow-y-auto"
            >
              <div className="p-8 space-y-8">
                 <div className="flex justify-between items-center">
                    <div className="space-y-1">
                       <h2 className="text-2xl font-bold text-white tracking-tight">New Record</h2>
                       <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Archive Initialization</p>
                    </div>
                    <button 
                      onClick={() => setShowAddProfile(false)}
                      className="p-2 rounded-full bg-gray-900 border border-gray-800 text-gray-500 hover:text-white"
                    >
                      <X size={20} />
                    </button>
                 </div>

                 <Card className="bg-gray-900/10">
                    <ProfileForm 
                      userId={user?.id}
                      onSuccess={() => {
                        setShowAddProfile(false);
                        queryClient.invalidateQueries({ queryKey: ['profiles'] });
                      }}
                      onCancel={() => setShowAddProfile(false)}
                    />
                 </Card>

                 <div className="space-y-4">
                    <div className="flex gap-4 p-4 rounded-xl bg-blue-600/5 border border-blue-600/10">
                       <Database size={20} className="text-blue-500 shrink-0" />
                       <div className="space-y-1">
                          <h4 className="text-xs font-bold text-white uppercase tracking-tight">Secure Storage</h4>
                          <p className="text-[10px] text-gray-500 leading-relaxed">
                            Profiles are encrypted and synced across your authenticated sessions for immediate access.
                          </p>
                       </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Layout>
  );
}
