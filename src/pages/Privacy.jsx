import React from 'react';
import { Box, Container, Typography, Divider, Button } from '@mui/material';
import { PageTransition, FadeUp } from '../lib/animations';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <Box sx={{ minHeight: '100vh', py: 8, bgcolor: '#000', color: '#fff' }}>
        <Container maxWidth="md">
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate(-1)}
            sx={{ mb: 6, color: 'text.secondary', textTransform: 'none' }}
          >
            Go Back
          </Button>

          <FadeUp delay={0.1}>
            <Box sx={{ mb: 8 }}>
              <Typography variant="overline" sx={{ color: '#3b82f6', fontWeight: 600 }}>CRAFTED BY HAND</Typography>
              <Typography variant="h2" sx={{ mt: 1, mb: 1.5, fontWeight: 700 }}>Privacy Policy</Typography>
              <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>Last updated: March 30, 2026</Typography>
            </Box>
          </FadeUp>

          <FadeUp delay={0.2}>
            <Box sx={{ p: 4, background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '12px' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>1. Data Storage</Typography>
              <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.8 }}>
                VyomaAstroAI is built with a local-first philosophy. Your birth data, chart coordinates, and profile settings are stored exclusively in your browser's local storage or your private session. No data is transmitted to an external server for processing.
              </Typography>

              <Typography variant="h6" sx={{ mb: 2 }}>2. Supabase Integration</Typography>
              <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.8 }}>
                We use Supabase for authentication and profile synchronization if you choose to create an account. This data is handled according to Supabase's high security standards and is only used to restore your experience across devices.
              </Typography>

              <Typography variant="h6" sx={{ mb: 2 }}>3. Third-Party Libraries</Typography>
              <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.8 }}>
                All astrological calculations are performed on the client-side. We do not use third-party tracking or analytics scripts that could compromise your privacy.
              </Typography>

              <Typography variant="h6" sx={{ mb: 2 }}>4. Your Rights</Typography>
              <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.8 }}>
                You have full control over your data. You can delete individual profiles or clear your entire history at any time through the Settings page.
              </Typography>
            </Box>
          </FadeUp>
        </Container>
      </Box>
    </PageTransition>
  );
}
