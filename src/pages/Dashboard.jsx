import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useProfile } from '../lib/ProfileContext';
import { useQueryClient } from '@tanstack/react-query';
import { useProfiles, useAstroData } from '../hooks/useAstro';
import RefreshIcon from '@mui/icons-material/Refresh';

import {
  AppBar, Toolbar, Container, Card, CardContent,
  Chip, Divider, IconButton, Typography, Box, Stack,
  Tabs, Tab, Button, Paper
} from '@mui/material';
import Grid from '@mui/material/Grid';

import LogoutIcon from '@mui/icons-material/Logout';
import TimelineIcon from '@mui/icons-material/Timeline';
import { motion } from 'framer-motion';
import {
  PageTransition, FadeUp, GlowPulse, SlideIn, StaggerParent, StaggerChild
} from '../lib/animations';
import { useToast } from '../lib/ToastContext';
import { log } from '../lib/logger';
import { SectionError } from '../components/SectionError';
import { DashboardSkeleton } from '../components/SkeletonLoaders';
import ProfileCard from '../components/ProfileCard';
import SettingsIcon from '@mui/icons-material/Settings';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const { activeProfile, setActiveProfile, loading: profileContextLoading } = useProfile();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  // 1. Auth Sync
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) navigate('/');
      else setUser(user);
    };
    checkUser();
  }, [navigate]);

  // 2. Caching - Profiles
  const { 
    data: profiles = [], 
    isLoading: profilesLoading,
    isRefetching: profilesRefetching,
    error: profilesError 
  } = useProfiles(user?.id);

  // 3. Caching - Astronomical Data
  const {
    data: insights,
    isLoading: astroLoading,
    isRefetching: astroRefetching,
    error: astroError
  } = useAstroData(activeProfile);

  const handleRefresh = () => {
    toast.info('Synchronizing', 'Refreshing cosmic coordinates...');
    queryClient.invalidateQueries({ queryKey: ['astroData'] });
    queryClient.invalidateQueries({ queryKey: ['profiles'] });
  };

  if (profilesLoading || profileContextLoading || !user) {
    return (
      <Container maxWidth="md" sx={{ py: 6, pb: 16 }}>
        <DashboardSkeleton />
      </Container>
    );
  }

  const errorState = profilesError || astroError;
  const isSyncing = profilesRefetching || astroRefetching;

  return (
    <>
      <PageTransition>
        <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid #1a1a1a', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)' }}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>

          <Typography variant="overline" sx={{ letterSpacing: '0.15em', fontWeight: 600, color: '#ededed' }}>
            VYOMA
          </Typography>

          <Box display="flex" alignItems="center" gap={3}>
            <IconButton 
              size="small" 
              onClick={handleRefresh}
              disabled={isSyncing}
              sx={{ 
                color: 'text.secondary', 
                animation: isSyncing ? 'spin 2s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>

            <Typography variant="caption" sx={{ display: { xs: 'none', md: 'block' }, color: 'text.secondary', textTransform: 'none' }}>
               {user?.email}
             </Typography>

            <IconButton 
              size="small" 
              onClick={() => navigate('/settings')}
              sx={{ color: 'text.secondary' }}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 6, pb: 16 }}>
        {/* Profile Selection - Boxed & Big */}
        <Box mb={8}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="overline" sx={{ color: 'text.secondary' }}>Subject Selection</Typography>
            <Button 
                size="small" 
                startIcon={<AutoFixHighIcon sx={{ fontSize: 14 }} />}
                onClick={() => navigate('/settings')}
                sx={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
                Edit Profiles
            </Button>
          </Box>
          
          <StaggerParent stagger={0.05}>
            <Grid container spacing={2}>
              {profiles.map((profile) => (
                <Grid item xs={12} sm={6} key={profile.id}>
                  <StaggerChild y={10}>
                    <ProfileCard 
                        profile={profile} 
                        active={activeProfile?.id === profile.id}
                        onSelect={() => setActiveProfile(profile)}
                    />
                  </StaggerChild>
                </Grid>
              ))}
              {profiles.length === 0 && (
                <Grid item xs={12}>
                   <Button 
                      fullWidth variant="outlined" 
                      onClick={() => navigate('/settings')}
                      sx={{ py: 4, borderStyle: 'dashed', borderColor: '#262626', color: 'text.secondary' }}
                   >
                      Add your first profile in Settings
                   </Button>
                </Grid>
              )}
            </Grid>
          </StaggerParent>
        </Box>

        {astroLoading ? (
            <DashboardSkeleton />
        ) : errorState ? (
          <SectionError title="Celestial Drift" detail={errorState.message} />
        ) : insights && (
          <Box>
            {/* Daily Score Card (Minimal) */}
            <FadeUp delay={0.1}>
              <Box className="stat-block" sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 4, py: 4, minHeight: 200 }}>
                <Box sx={{ minWidth: 140, textAlign: 'center' }}>
                  <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Daily Score</Typography>

                  <Box display="flex" alignItems="baseline" justifyContent="center">
                    <Typography
                      variant="h1"
                      sx={{
                        fontSize: '5rem',
                        lineHeight: 1,
                        color: insights.dailyOutlook.score >= 4 ? '#ffffff' : (insights.dailyOutlook.score >= 3 ? '#a1a1a1' : '#f87171')
                      }}
                    >
                      {insights.dailyOutlook.score}
                    </Typography>
                    <Typography sx={{ color: 'text.disabled', ml: 0.5, fontFamily: '"Geist Mono"' }}>/5</Typography>
                  </Box>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />
                <Box flex={1}>
                  <Typography variant="h4" sx={{ mb: 1, letterSpacing: '-0.02em' }}>{insights.dailyOutlook.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{insights.dailyOutlook.description}</Typography>
                </Box>
              </Box>
            </FadeUp>

            {/* Timings Grid */}
            <Typography variant="overline" sx={{ mb: 2, display: 'block' }}>Window Availability</Typography>
            <Grid container spacing={2} mb={6} alignItems="stretch">
              <Grid item xs={6} md={3}>
                <TimingBlock label="Rahu Kaal" time={`${insights.timings.rahuKaal.formattedStart} - ${insights.timings.rahuKaal.formattedEnd}`} color="#f87171" />
              </Grid>
              <Grid item xs={6} md={3}>
                <TimingBlock label="Yamaghanda" time={`${insights.timings.yamaghanda.formattedStart} - ${insights.timings.yamaghanda.formattedEnd}`} color="#f87171" />
              </Grid>
              <Grid item xs={6} md={3}>
                <TimingBlock label="Guli Kaal" time={`${insights.timings.guliKaal.formattedStart} - ${insights.timings.guliKaal.formattedEnd}`} color="#f87171" />
              </Grid>
              <Grid item xs={6} md={3}>
                <TimingBlock label="Abhijit" time={`${insights.timings.abhijitMuhurta.formattedStart} - ${insights.timings.abhijitMuhurta.formattedEnd}`} color="#3b82f6" />
              </Grid>
            </Grid>

            {/* Tithi + Tara Bala */}
            <Grid container spacing={2} mb={6} alignItems="stretch">
              <Grid item xs={12} md={6}>
                <Box className="stat-block" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', py: 4 }}>
                  <Typography variant="overline">Current Tithi</Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                    <Typography variant="h5">{insights.tithi.name}</Typography>
                    <Chip
                      label={insights.tithi.isRikta ? 'Rikta' : 'Favorable'}
                      size="small"
                      className={insights.tithi.isRikta ? 'chip-warning' : 'chip-auspicious'}
                    />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box className="stat-block" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', py: 4 }}>
                  <Typography variant="overline">Tara Bala</Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                    <Typography variant="h5">{insights.taraBala.name}</Typography>
                    <Chip
                      label={insights.taraBala.favorable ? 'Beneficial' : 'Caution'}
                      size="small"
                      className={insights.taraBala.favorable ? 'chip-auspicious' : 'chip-warning'}
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* Lucky Strip */}
            <Grid container spacing={2} mb={6} alignItems="stretch">
              <Grid item xs={6}>
                <Box className="stat-block" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', py: 4 }}>
                  <Typography variant="overline">Lucky Color</Typography>
                  <Box sx={{ width: 40, height: 40, borderRadius: '50%', background: getColorHex(insights.luckyColor), border: '2px solid rgba(255,255,255,0.1)', my: 2 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{insights.luckyColor}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box className="stat-block" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', py: 4 }}>
                  <Typography variant="overline">Lucky Number</Typography>
                  <Typography variant="h1" sx={{ color: '#3b82f6', mt: 1, fontFamily: '"Geist Mono"' }}>{insights.luckyNumber}</Typography>
                </Box>
              </Grid>
            </Grid>


            {/* Maha Dasha */}
            <Box className="stat-block dot-grid" sx={{ mb: 6, p: 4 }}>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <GlowPulse color="#3b82f6" size={8} />
                    <Box>
                      <Typography variant="overline">Maha Dasha</Typography>
                      <Typography variant="h3" sx={{ mt: 0.5 }}>{insights.currentDasha.maha}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={2} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                  <Divider orientation="vertical" flexItem sx={{ borderStyle: 'solid', borderColor: '#1a1a1a', height: 40 }} />
                </Grid>
                <Grid item xs={12} md={5}>
                  <Typography variant="overline">Antar Dasha</Typography>
                  <Typography variant="h4" sx={{ mt: 0.5 }}>{insights.currentDasha.antar}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 0.5 }} className="mono">
                    Begins transition: {new Date(insights.currentDasha.antarEnds).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Monthly Theme Card */}
            <SlideIn from="bottom" delay={0.5}>
              <Box className="stat-block" sx={{ borderLeft: insights.monthlyTheme.favorable ? '4px solid #3b82f6' : '1px solid #1a1a1a' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                  <Typography variant="overline">Monthly Cycle</Typography>
                  {insights.monthlyTheme.favorable && <Chip label="Favorable" size="small" className="chip-auspicious" />}
                </Box>
                <Typography variant="h4" sx={{ mb: 1.5 }}>{insights.monthlyTheme.title}</Typography>
                <Typography variant="body2" color="#a1a1a1" sx={{ maxWidth: 600 }}>{insights.monthlyTheme.description}</Typography>
              </Box>
            </SlideIn>
          </Box>
        )}
      </Container>
      </PageTransition>

      {/* Bottom Navigation Tabs */}
      <Box sx={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        zIndex: 1000, background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(20px)', borderTop: '1px solid #1a1a1a'
      }}>
        <Tabs
          value={0}
          centered
          variant="fullWidth"
          TabIndicatorProps={{ style: { top: 0, height: 1, background: '#3b82f6' } }}
          sx={{ height: 60 }}
        >
          <Tab label="Dashboard" onClick={() => navigate('/dashboard')} />
          <Tab label="Vault" onClick={() => navigate('/vault')} />
          <Tab label="Detailed Chart" onClick={() => navigate('/chart')} />
        </Tabs>
      </Box>
    </>
  );
}

function TimingBlock({ label, time, color }) {
  return (
    <Box className="stat-block" sx={{ textAlign: 'center', py: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Typography variant="overline" sx={{ color: 'text.disabled', mb: 2, display: 'block', fontSize: '0.6rem' }}>{label}</Typography>
      <Typography sx={{ color, fontFamily: '"Geist Mono", monospace', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em' }}>
        {time}
      </Typography>
    </Box>
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
