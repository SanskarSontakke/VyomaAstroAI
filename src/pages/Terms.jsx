import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { PageTransition, FadeUp } from '../lib/animations';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

export default function Terms() {
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
              <Typography variant="h2" sx={{ mt: 1, mb: 1.5, fontWeight: 700 }}>Terms of Service</Typography>
              <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>Effective Date: March 30, 2026</Typography>
            </Box>
          </FadeUp>

          <FadeUp delay={0.2}>
            <Box sx={{ p: 4, background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '12px' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>1. Nature of Service</Typography>
              <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.8 }}>
                VyomaAstroAI is an interpretive tool for Vedic astrology. It provides celestial coordinate calculations and traditional astrological insights based on established texts. It is intended for informational and personal purposes only.
              </Typography>

              <Typography variant="h6" sx={{ mb: 2 }}>2. Precision & Algorithms</Typography>
              <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.8 }}>
                While we strive for high mathematical precision using modern ephemeris algorithms, astrological interpretations are inherently subjective and should not be used as the sole basis for critical decisions. Any actions taken or not taken as a result of using this app are your sole responsibility.
              </Typography>

              <Typography variant="h6" sx={{ mb: 2 }}>3. Account Security</Typography>
              <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.8 }}>
                If you choose to create an account through our Supabase integration, you are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.
              </Typography>

              <Typography variant="h6" sx={{ mb: 2 }}>4. Modifications</Typography>
              <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.8 }}>
                The VyomaAstroAI project is subject to updates and refinements. We reserve the right to modify or discontinue any part of the service at any time without prior notice.
              </Typography>
            </Box>
          </FadeUp>
        </Container>
      </Box>
    </PageTransition>
  );
}
