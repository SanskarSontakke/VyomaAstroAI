import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useProfile } from '../lib/ProfileContext';
import ProfileForm from '../components/ProfileForm';
import {
  Container, Button, Dialog, DialogTitle, DialogContent,
  IconButton, Chip, Typography, Box, Stack, Avatar, Tabs, Tab, Divider
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { useQueryClient } from '@tanstack/react-query';
import { useProfiles } from '../hooks/useAstro';

import Grid from '@mui/material/Grid';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition, StaggerParent, StaggerChild } from '../lib/animations';
import { useToast } from '../lib/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import { log } from '../lib/logger';
import { EmptyState } from '../components/EmptyState';
import { VaultSkeleton } from '../components/SkeletonLoaders';
import ProfileCard from '../components/ProfileCard';

export default function Vault() {
  const [user, setUser] = useState(null);
  const [showAddProfile, setShowAddProfile] = useState(false);
  const { setActiveProfile, loading: profileContextLoading } = useProfile();
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

  const handleRefresh = () => {
    toast.info('Synchronizing', 'Refreshing cosmic vault...');
    queryClient.invalidateQueries({ queryKey: ['profiles'] });
  };

  const handleSwitchProfile = (profile) => {
    setActiveProfile(profile);
    navigate('/dashboard');
  };

  if (profilesLoading || profileContextLoading || !user) {
    return (
      <Container maxWidth="md" sx={{ py: 6, pb: 16 }}>
        <VaultSkeleton />
      </Container>
    );
  }

  const isSyncing = profilesRefetching;

  return (
    <>
      <PageTransition>
        <Box pt={4} pb={16} minHeight="100vh">

        <Container maxWidth="md">

          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="flex-end" mb={8}>
            <Box>
              <Typography variant="overline" color="text.secondary">The Vault</Typography>
              <Typography variant="h4" sx={{ mt: 0.5 }}>Celestial Identities</Typography>
            </Box>

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
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setShowAddProfile(true)}
                sx={{ borderColor: '#262626', color: '#ededed', '&:hover': { borderColor: '#3b82f6' } }}
              >
                Add Profile
              </Button>
            </Box>
          </Box>

          <StaggerParent stagger={0.08}>
            <Grid container spacing={3}>
              {profiles.map((p) => (
                <Grid item xs={12} sm={6} key={p.id}>
                  <StaggerChild y={20}>
                    <ProfileCard 
                        profile={p} 
                        active={false}
                        onSelect={() => handleSwitchProfile(p)}
                    />
                  </StaggerChild>
                </Grid>
              ))}

              {profiles.length === 0 && (
                <Grid item xs={12}>
                  <EmptyState
                    title="Vault Empty"
                    subtitle="No planetary profiles found in local storage."
                    actionLabel="Add Identity"
                    onAction={() => setShowAddProfile(true)}
                  />
                </Grid>
              )}
            </Grid>
          </StaggerParent>

          {/* Add Profile Dialog */}
          <AnimatePresence>
            {showAddProfile && (
              <Dialog
                open={true}
                onClose={() => setShowAddProfile(false)}
                fullWidth
                maxWidth="sm"
                PaperComponent={motion.div}
                PaperProps={{
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                  exit: { opacity: 0, y: 20 },
                  transition: { duration: 0.25 }
                }}
              >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, pt: 3, pb: 1 }}>
                  <Typography variant="h6">Add Profile</Typography>
                  <IconButton onClick={() => setShowAddProfile(false)} size="small" sx={{ color: 'text.disabled' }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </DialogTitle>
                <Box px={3}><Divider sx={{ borderColor: '#1a1a1a' }} /></Box>
                <DialogContent sx={{ p: 4, pt: 3 }}>
                  <ProfileForm
                    userId={user?.id}
                    isPrimary={false}
                    onSuccess={() => {
                      setShowAddProfile(false);
                      queryClient.invalidateQueries({ queryKey: ['profiles'] });
                    }}
                  />
                </DialogContent>
              </Dialog>
            )}
          </AnimatePresence>
        </Container>
      </Box>
      </PageTransition>

      {/* Bottom Navigation */}
      <Box sx={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        zIndex: 1000, background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(20px)', borderTop: '1px solid #1a1a1a'
      }}>
        <Tabs
          value={1}
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
