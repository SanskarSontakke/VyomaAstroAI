import React from 'react';
import { Box, Container, Typography, Link, Stack, Avatar, Divider, Button } from '@mui/material';
import { PageTransition, FadeUp, GlowPulse } from '../lib/animations';
import GitHubIcon from '@mui/icons-material/GitHub';
import LaunchIcon from '@mui/icons-material/Launch';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function About() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <Box sx={{ minHeight: '100vh', py: 8, bgcolor: '#000', color: '#fff' }}>
        <Container maxWidth="sm">
          
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate(-1)}
            sx={{ mb: 6, color: 'text.secondary', textTransform: 'none' }}
          >
            Go Back
          </Button>

          <FadeUp delay={0.1}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Avatar 
                src="https://github.com/sanskarsontakke.png"
                sx={{ width: 120, height: 120, mx: 'auto', mb: 3, border: '2px solid #1a1a1a' }}
              />
              <Typography variant="h3" fontWeight={700}>Sanskar Sontakke</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>Full-Stack Developer | Ed-Tech Enthusiast</Typography>
            </Box>
          </FadeUp>

          <FadeUp delay={0.2}>
            <Box sx={{ p: 4, background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '12px', mb: 6 }}>
              <Typography variant="overline" sx={{ color: '#3b82f6', fontWeight: 600 }}>CRAFTED BY HAND</Typography>
              <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.8 }}>
                VyomaAstroAI is built with a focus on high-performance algorithms and cinematic user experiences. 
                My goal was to merge the ancient precision of Vedic astrology with modern system design.
              </Typography>
            </Box>
          </FadeUp>

          <FadeUp delay={0.3}>
            <Stack spacing={2}>
              <Box 
                component={Link} 
                href="https://sanskarsontakke.vercel.app" 
                target="_blank"
                sx={{ 
                  p: 3, background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  textDecoration: 'none', color: '#fff', '&:hover': { borderColor: '#3b82f6' }
                }}
              >
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>Portfolio</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>sanskarsontakke.vercel.app</Typography>
                </Box>
                <LaunchIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
              </Box>

              <Box 
                component={Link} 
                href="https://github.com/sanskarsontakke" 
                target="_blank"
                sx={{ 
                  p: 3, background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  textDecoration: 'none', color: '#fff', '&:hover': { borderColor: '#3b82f6' }
                }}
              >
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>GitHub</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>github.com/sanskarsontakke</Typography>
                </Box>
                <GitHubIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
              </Box>
            </Stack>
          </FadeUp>

          <Box sx={{ mt: 12, textAlign: 'center' }}>
             <Typography variant="caption" sx={{ color: 'text.disabled' }}>Developed in 2026. Built with Vite, MUI, and Framer Motion.</Typography>
          </Box>

        </Container>
      </Box>
    </PageTransition>
  );
}
