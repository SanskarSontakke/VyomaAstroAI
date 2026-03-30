import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import NorthChart from '../components/Chart/NorthChart';
import PlanetTable from '../components/Chart/PlanetTable';
import { Container, Box, Typography, Chip, Stack, Divider, Tabs, Tab, IconButton } from '@mui/material';
import Grid from '@mui/material/Grid';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import { useQueryClient } from '@tanstack/react-query';
import { useProfiles, useChartData } from '../hooks/useAstro';

import { PageTransition, TiltCard, FadeUp, SlideIn, GlowPulse } from '../lib/animations';
import { useToast } from '../lib/ToastContext';
import { DeepChartSkeleton } from '../components/SkeletonLoaders';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../lib/ProfileContext';
import ProfileCard from '../components/ProfileCard';
import { SectionError } from '../components/SectionError';

const DeepChart = () => {
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

    // 3. Caching - Astro Data
    const {
        data: astroData,
        isLoading: astroLoading,
        isRefetching: astroRefetching,
        error: astroError
    } = useChartData(activeProfile);

    const handleRefresh = () => {
        toast.info('Synchronizing', 'Refreshing cosmic coordinates...');
        queryClient.invalidateQueries({ queryKey: ['chartData'] });
        queryClient.invalidateQueries({ queryKey: ['profiles'] });
    };

    if (profilesLoading || profileContextLoading || !user) {
        return (
            <Container maxWidth="lg" sx={{ py: 6 }}>
                <DeepChartSkeleton />
            </Container>
        );
    }

    const isSyncing = profilesRefetching || astroRefetching;
    const errorState = profilesError || astroError;

    return (
        <>
        <PageTransition>
            <Box sx={{ 

                borderBottom: '1px solid #1a1a1a', 
                bgcolor: 'rgba(0,0,0,0.8)', 
                backdropFilter: 'blur(10px)',
                position: 'sticky', top: 0, zIndex: 1100
            }}>
                <Container maxWidth="lg">
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ height: 60 }}>
                        <Typography variant="overline" sx={{ fontWeight: 600 }}>Deep Interpretation</Typography>
                        <Box display="flex" alignItems="center" gap={2}>
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
                            <IconButton onClick={() => navigate('/settings')} size="small" sx={{ color: 'text.secondary' }}>
                                <SettingsIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Stack>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: 6, pb: 16 }}>
                <Box mb={6}>
                    <Typography variant="overline" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>Select Profile</Typography>
                    <Box sx={{ 
                        display: 'flex', gap: 2, overflowX: 'auto', pb: 2,
                        '&::-webkit-scrollbar': { height: '4px' },
                        '&::-webkit-scrollbar-thumb': { bgcolor: '#262626', borderRadius: '2px' }
                    }}>
                        {profiles.map((p) => (
                            <Box key={p.id} sx={{ minWidth: 320 }}>
                                <ProfileCard 
                                    profile={p} 
                                    active={activeProfile?.id === p.id}
                                    onSelect={() => setActiveProfile(p)}
                                />
                            </Box>
                        ))}
                    </Box>
                </Box>

                {astroLoading ? (
                    <DeepChartSkeleton />
                ) : errorState ? (
                    <SectionError title="Celestial Drift" detail={errorState.message} />
                ) : astroData ? (
                    <>
                        <Box mb={8}>
                            <Typography variant="overline" color="text.secondary">D1 — Birth Chart</Typography>
                            <Box display="flex" alignItems="center" gap={2} mt={1}>
                                <Typography variant="h2">{activeProfile?.name}</Typography>
                                <GlowPulse color="#3b82f6" size={8} />
                            </Box>
                            <Typography sx={{ mt: 1, color: 'text.secondary' }} className="mono">
                                {activeProfile?.dob_date} • {activeProfile?.dob_time} • {activeProfile?.latitude.toFixed(4)}N, {activeProfile?.longitude.toFixed(4)}E
                            </Typography>
                        </Box>

                        <Grid container spacing={8}>
                            <Grid item xs={12} lg={6}>
                                <Typography variant="overline" display="block" mb={3}>Lagna Kundli</Typography>
                                <FadeUp delay={0.2}>
                                    <TiltCard maxTilt={4}>
                                        <Box sx={{
                                            p: { xs: 2, md: 4 },
                                            display: 'flex',
                                            justifyContent: 'center',
                                            background: '#000',
                                            border: '1px solid #1a1a1a',
                                            borderRadius: '12px'
                                        }}>
                                            <NorthChart
                                                positions={astroData.positions}
                                                ascendantSign={astroData.ascendant.sign}
                                            />
                                        </Box>
                                    </TiltCard>
                                </FadeUp>
                            </Grid>

                            <Grid item xs={12} lg={6}>
                                <Typography variant="overline" display="block" mb={3}>Vimshottari Timeline</Typography>
                                <SlideIn from="right" delay={0.3}>
                                    <Stack spacing={0} sx={{ borderLeft: '1px solid #1a1a1a' }}>
                                        {astroData.dashaTimeline.map((d, i) => {
                                            const isActive = d.planet === astroData.currentDasha?.maha.planet;
                                            return (
                                                <Box
                                                    key={i}
                                                    sx={{
                                                        p: 3,
                                                        borderBottom: '1px solid #1a1a1a',
                                                        borderLeft: isActive ? '2px solid #3b82f6' : 'none',
                                                        background: isActive ? 'rgba(59,130,246,0.04)' : 'transparent',
                                                        transition: 'background 0.2s ease',
                                                        '&:hover': { background: 'rgba(255,255,255,0.02)' }
                                                    }}
                                                >
                                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                                        <Typography variant="body1" sx={{ color: isActive ? '#fff' : 'text.secondary', fontWeight: isActive ? 600 : 400 }}>
                                                            {d.planet} Maha Dasha
                                                        </Typography>
                                                        <Typography variant="caption" className="mono" sx={{ color: 'text.disabled' }}>
                                                            {d.startDate.getFullYear()} — {d.endDate.getFullYear()}
                                                        </Typography>
                                                    </Box>
                                                    {isActive && (
                                                        <Box mt={1.5} display="flex" alignItems="center" gap={1}>
                                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                                Current Antar: <Typography component="span" variant="caption" sx={{ color: '#3b82f6', fontWeight: 600 }}>{astroData.currentDasha.antar.planet}</Typography>
                                                            </Typography>
                                                            <Divider orientation="vertical" flexItem sx={{ height: 12, mx: 1 }} />
                                                            <Typography variant="caption" className="mono" sx={{ color: 'text.disabled' }}>
                                                                Ends {new Date(astroData.currentDasha.antar.endDate).toLocaleDateString()}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            );
                                        })}
                                    </Stack>
                                </SlideIn>
                            </Grid>
                        </Grid>

                        <Box mt={12}>
                            <Typography variant="overline" display="block" mb={3}>Coordinate Precision</Typography>
                            <FadeUp delay={0.4}>
                                <PlanetTable
                                    positions={astroData.positions}
                                    ascendant={astroData.ascendant}
                                    activeMahaPlanet={astroData.currentDasha?.maha.planet}
                                />
                            </FadeUp>
                        </Box>
                    </>
                ) : null}
            </Container>
        </PageTransition>

            <Box sx={{
                position: 'fixed', bottom: 0, left: 0, right: 0,
                zIndex: 1000, background: 'rgba(0,0,0,0.9)',
                backdropFilter: 'blur(20px)', borderTop: '1px solid #1a1a1a'
            }}>
                <Tabs
                    value={2}
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

};

export default DeepChart;
