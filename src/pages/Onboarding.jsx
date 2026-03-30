import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';

import ProfileForm from '../components/ProfileForm';
import { Box, Card, Typography, TextField, Button, Link, Chip, Tabs, Tab, Divider } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';

import { PageTransition, TerminalReveal, StaggerParent, StaggerChild } from '../lib/animations';

import { useToast } from '../lib/ToastContext';
import { log } from '../lib/logger';
import { CosmicLoader } from '../components/CosmicLoader';

export default function Onboarding() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [authTab, setAuthTab] = useState(0); // 0 = signin, 1 = signup
  const [user, setUser] = useState(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toast = useToast();

  const checkProfile = async (userId) => {
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
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (location.pathname === '/register') {
      setAuthTab(1);
    } else if (location.pathname === '/login') {
      setAuthTab(0);
    }
  }, [location.pathname]);



  const handleAuth = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    let result;

    const isSignUp = authTab === 1;

    if (isSignUp) {
      result = await supabase.auth.signUp({ email, password });
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
    }

    const { data, error } = result;
    if (error) {
      const AUTH_MESSAGES = {
        'invalid_credentials':     'Incorrect email or password.',
        'user_already_registered': 'An account with this email already exists.',
        'email_not_confirmed':     'Please verify your email before signing in.',
        'over_email_send_rate_limit': 'Too many attempts. Please wait a few minutes.',
      };
      
      const friendlyMsg = AUTH_MESSAGES[error.code] || error.message || 'Authentication failed.';
      toast.error('Auth Failed', friendlyMsg);
      log.error('Auth', `Auth error [${error.code || 'unknown'}]`, error);
    } else if (data.user) {
      setUser(data.user);
      log.info('Auth', 'User authenticated', { userId: data.user.id });
      if (data.session) {
        await checkProfile(data.user.id);
      } else {
        toast.info("Verification Required", "Please check your email for the confirmation link.");
      }
    }
    setLoading(false);
  };

  if (isInitializing) {
    return (
      <Box display="flex" minHeight="100vh" alignItems="center" justifyContent="center" bgcolor="background.default">
        <CosmicLoader message="Connecting..." />
      </Box>
    );
  }

  if (showProfileSetup) {
    return (
      <PageTransition>
        <Box display="flex" minHeight="100vh" alignItems="center" justifyContent="center" px={2} bgcolor="background.default">
          <Card sx={{ p: 4, width: '100%', maxWidth: 480, background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 3 }}>
            <Typography variant="h4" gutterBottom align="center" sx={{ mb: 1 }}>
              Cosmic Blueprint
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
              Enter your exact birth metrics to synchronize with the local planetary ephemeris.
            </Typography>
            <ProfileForm 
              userId={user?.id} 
              isPrimary={true} 
              onSuccess={() => navigate('/dashboard')} 
            />
          </Card>
        </Box>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Box display="flex" minHeight="100vh" alignItems="center" justifyContent="center" px={2} bgcolor="background.default" className="dot-grid">
        <Box width="100%" maxWidth={400} display="flex" flexDirection="column" gap={6}>
          
          <Box textAlign="center">
            <Box display="flex" alignItems="center" justifyContent="center" gap={1.5} mb={1}>
              <Typography variant="h1" sx={{ fontSize: '3.5rem' }}>Vyoma</Typography>
              <Chip label="v1.0" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem', borderColor: '#262626', color: 'text.secondary' }} />


            </Box>
            <TerminalReveal text="Precision Vedic astrology. No noise." delay={0.4} />
          </Box>
          
          <Card sx={{ p: '32px', background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '12px' }}>
            <Tabs 
              value={authTab} 
              onChange={(e, v) => setAuthTab(v)} 
              variant="fullWidth" 
              sx={{ mb: 3, minHeight: 40 }}
            >
              <Tab label="Sign In" />
              <Tab label="Get Started" />
            </Tabs>

            <AnimatePresence mode="wait">
              <motion.div
                key={authTab}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Box component="form" onSubmit={handleAuth} noValidate>
                  <StaggerParent stagger={0.08}>
                    <StaggerChild y={10}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        variant="outlined"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        margin="dense"
                        autoComplete="email"
                      />
                    </StaggerChild>
                    <StaggerChild y={10}>
                      <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        variant="outlined"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        margin="dense"
                        autoComplete="current-password"
                        sx={{ mt: 1 }}
                      />
                    </StaggerChild>
                    <StaggerChild y={10}>
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        size="large"
                        disabled={loading}
                        sx={{ mt: 3 }}
                      >
                        {loading ? <CosmicLoader message="" /> : (authTab === 0 ? 'Continue' : 'Create Account')}
                      </Button>
                    </StaggerChild>
                  </StaggerParent>
                </Box>
              </motion.div>
            </AnimatePresence>
          </Card>

          <Typography variant="caption" align="center" sx={{ color: 'text.disabled', maxWidth: 280, mx: 'auto' }}>

            All calculations run locally on your device. Nothing is sent to a server.
          </Typography>
        </Box>
      </Box>
    </PageTransition>
  );
}
