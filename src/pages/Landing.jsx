import React from 'react';
import { Box, Container, Typography, Button, Stack, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageTransition, TerminalReveal, StaggerParent, StaggerChild, GlowPulse } from '../lib/animations';
import Grid from '@mui/material/Grid';
import { supabase } from '../lib/supabase';
import { useProfile } from '../lib/ProfileContext';

const FeatureCard = ({ title, desc, delay }) => (
  <StaggerChild y={20} delay={delay}>
    <Box sx={{
      p: 3,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      background: '#0a0a0a',
      border: '1px solid #1a1a1a',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      cursor: 'default',
      '&:hover': {
        borderColor: '#3b82f6',
        transform: 'translateX(4px)',
        boxShadow: '0 4px 20px rgba(59,130,246,0.03)'
      }
    }}>
      <Typography variant="h6" sx={{ fontWeight: 600, minWidth: '240px' }}>{title}</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>{desc}</Typography>
    </Box>

  </StaggerChild>
);

export default function Landing() {
  const navigate = useNavigate();
  const { loading: profileLoading } = useProfile();
  const [checking, setChecking] = React.useState(true);

  React.useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate('/dashboard');
      }
      setChecking(false);
    };
    checkUser();
  }, [navigate]);

  if (checking || profileLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#000' }}>
        <CircularProgress size={24} sx={{ color: '#3b82f6' }} />
      </Box>
    );
  }

  return (
    <PageTransition>
      <Box sx={{ background: '#000', color: '#fff', minHeight: '100vh', pt: 12, pb: 16 }}>
        <Container maxWidth="lg">
          <SectionHeader />

          <Box mb={15} sx={{ textAlign: 'center' }}>
            <TerminalReveal speed={0.03}>
              {"High-precision Vedic astrology engine for modern observers."}
            </TerminalReveal>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={6} justifyContent="center" alignItems="center">

              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  height: 54,
                  px: 6,
                  background: '#fff',
                  color: '#000',
                  fontWeight: 600,
                  '&:hover': { background: '#ededed' }
                }}
              >
                Enter the Sky
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/about')}
                sx={{ height: 54, px: 6, borderColor: '#262626', color: '#ededed' }}
              >
                Architect Info
              </Button>
            </Stack>
          </Box>

          <StaggerParent stagger={0.1}>
            <Grid container spacing={1.5}>
              <Grid item xs={12}>
                <FeatureCard
                  title="High-Fidelity Ephemeris"
                  desc="Calculated with sub-degree precision using the same algorithms as astronomical observatories. Zero approximation."
                  delay={0.1}
                />
              </Grid>
              <Grid item xs={12}>
                <FeatureCard
                  title="Vedic Algorithms"
                  desc="Pure Parashari logic applied through a technical-first lens. MahaDashas, TARA, and Muhurtas with absolute accuracy."
                  delay={0.2}
                />
              </Grid>
              <Grid item xs={12}>
                <FeatureCard
                  title="Dark Matter HUD"
                  desc="A precision-instrument interface. Minimalist, high-contrast, and focused on clarity. No mystical distractions."
                  delay={0.3}
                />
              </Grid>
            </Grid>

          </StaggerParent>
        </Container>
      </Box>
    </PageTransition>
  );
}

function SectionHeader() {
  return (
    <Box mb={6} sx={{ position: 'relative', textAlign: 'center' }}>
      <Typography variant="overline" sx={{ letterSpacing: '0.3em', color: '#3b82f6', fontWeight: 700 }}>
        VYOMA PRECISION v1.0
      </Typography>

      <Typography variant="h1" sx={{
        fontSize: { xs: '3.5rem', md: '6.5rem' },
        fontWeight: 800,
        letterSpacing: '-0.05em',
        lineHeight: 0.9,
        mt: 3,
        mb: 4,
        background: 'linear-gradient(180deg, #FFFFFF 0%, #666666 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        The Sky is a Precision Instrument.
      </Typography>
    </Box>
  );
}

