import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, Stack, Tabs, Tab, Button, 
  Switch, FormControlLabel, IconButton, Divider, Grid,
  Dialog, DialogTitle, DialogContent, Slider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useProfile } from '../lib/ProfileContext';
import { useToast } from '../lib/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import { PageTransition, FadeUp, StaggerParent, StaggerChild } from '../lib/animations';
import ProfileCard from '../components/ProfileCard';
import ProfileForm from '../components/ProfileForm';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import TuneIcon from '@mui/icons-material/Tune';
import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';

export default function Settings() {
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const { settings, updateSettings, activeProfile, setActiveProfile } = useProfile();
  
  const [tab, setTab] = useState(0);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
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
      message: 'Are you sure you want to end your session?',
      confirmText: 'Sign Out',
      confirmColor: 'error'
    });
    if (ok) {
      await supabase.auth.signOut();
      toast.success('Signed Out', 'Your session has ended.');
      navigate('/auth');
    }
  };

  const handleFontSizeChange = (e, newValue) => {
    updateSettings({ fontSizeScale: newValue });
  };

  const toggleFontFamily = () => {
    updateSettings({ 
      fontFamily: settings.fontFamily === 'Geist' ? 'Geist Mono' : 'Geist' 
    });
  };

  return (
    <PageTransition>
      <Box sx={{ minHeight: '100vh', bgcolor: '#000', color: '#fff', pb: 12 }}>
        <AppBar position="sticky" sx={{ bgcolor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #1a1a1a', boxShadow: 'none' }}>
          <Toolbar>
            <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 2, color: '#fff' }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={600} sx={{ flexGrow: 1 }}>Settings</Typography>
            <Button 
                startIcon={<LogoutIcon />} 
                onClick={handleLogout} 
                sx={{ color: '#ef4444' }}
            >
                Logout
            </Button>
          </Toolbar>
          <Tabs 
            value={tab} 
            onChange={(e, val) => setTab(val)} 
            variant="fullWidth"
            sx={{ '& .MuiTab-root': { py: 2 } }}
          >
            <Tab icon={<TuneIcon />} iconPosition="start" label="App" />
            <Tab icon={<PersonIcon />} iconPosition="start" label="Profiles" />
            <Tab icon={<InfoIcon />} iconPosition="start" label="Support" />
          </Tabs>
        </AppBar>

        <Container maxWidth="sm" sx={{ mt: 4 }}>
          {tab === 0 && (
            <FadeUp>
              <Typography variant="overline" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>Visual Preference</Typography>
              <Box sx={{ p: 4, background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '12px', mb: 4 }}>
                <Stack spacing={4}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>Monospaced Interface</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Use high-precision Geist Mono font system</Typography>
                    </Box>
                    <Switch 
                        checked={settings.fontFamily === 'Geist Mono'} 
                        onChange={toggleFontFamily} 
                    />
                  </Box>
                  
                  <Divider sx={{ borderColor: '#1a1a1a' }} />
                  
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>Interface Scale</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                        Current scale: {settings.fontSizeScale.toFixed(2)}x
                    </Typography>
                    <Slider 
                        value={settings.fontSizeScale}
                        min={0.8}
                        max={1.4}
                        step={0.05}
                        onChange={handleFontSizeChange}
                        valueLabelDisplay="auto"
                    />
                  </Box>
                </Stack>
              </Box>
            </FadeUp>
          )}

          {tab === 1 && (
            <FadeUp>
               <Typography variant="overline" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>Identity Management</Typography>
               <Button 
                  fullWidth variant="outlined" 
                  startIcon={<AddIcon />}
                  onClick={() => { setEditingProfile(null); setShowProfileForm(true); }}
                  sx={{ mb: 4, py: 1.5, borderColor: '#1a1a1a', color: '#fff', '&:hover': { borderColor: '#333' } }}
               >
                  New Profile
               </Button>
               
               <Stack spacing={2}>
                  {profiles.map((p) => (
                    <ProfileCard 
                        key={p.id} 
                        profile={p} 
                        active={activeProfile?.id === p.id}
                        onSelect={() => setActiveProfile(p)}
                        onEdit={() => { setEditingProfile(p); setShowProfileForm(true); }}
                    />
                  ))}
               </Stack>
            </FadeUp>
          )}

          {tab === 2 && (
            <FadeUp>
               <Typography variant="overline" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>About & Legal</Typography>
               <Stack spacing={2}>
                  {[
                    { label: 'About Developer', path: '/about', desc: 'Sanskar Sontakke profile' },
                    { label: 'Privacy Policy', path: '/privacy', desc: 'Local data promise' },
                    { label: 'Terms of Service', path: '/terms', desc: 'Interpretive nature statement' }
                  ].map((item, idx) => (
                    <Box 
                        key={idx}
                        onClick={() => navigate(item.path)}
                        sx={{ 
                            p: 3, background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '12px',
                            cursor: 'pointer', '&:hover': { borderColor: '#3b82f6' }
                        }}
                    >
                        <Typography variant="subtitle1" fontWeight={600}>{item.label}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{item.desc}</Typography>
                    </Box>
                  ))}
               </Stack>
            </FadeUp>
          )}
        </Container>

        {/* Profile Form Dialog */}
        <Dialog 
            open={showProfileForm} 
            onClose={() => setShowProfileForm(false)}
            fullWidth maxWidth="xs"
        >
          <DialogTitle sx={{ p: 4, pb: 2, fontWeight: 700 }}>
            {editingProfile ? 'Edit Profile' : 'New Profile'}
          </DialogTitle>
          <DialogContent sx={{ p: 4, pt: 0 }}>
            <ProfileForm 
                userId={userId}
                profile={editingProfile}
                onSuccess={() => { setShowProfileForm(false); fetchProfiles(); }}
                onCancel={() => setShowProfileForm(false)}
            />
          </DialogContent>
        </Dialog>
      </Box>
    </PageTransition>
  );
}

import { AppBar, Toolbar } from '@mui/material';
