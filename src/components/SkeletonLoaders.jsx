import React from 'react';
import { Box, Skeleton, Stack, Divider } from '@mui/material';
import Grid from '@mui/material/Grid';


const SURFACE = '#0a0a0a';
const BORDER = '#1a1a1a';

const CardSkeleton = ({ height = 200 }) => (
  <Box sx={{ 
    height, 
    background: SURFACE, 
    border: `1px solid ${BORDER}`, 
    borderRadius: '12px', 
    p: 3,
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  }}>
    <Skeleton variant="text" width="40%" height={20} sx={{ bgcolor: '#1a1a1a' }} />
    <Skeleton variant="rectangular" width="100%" height="60%" sx={{ borderRadius: '8px', bgcolor: '#1a1a1a' }} />
    <Skeleton variant="text" width="80%" height={16} sx={{ bgcolor: '#1a1a1a' }} />
  </Box>
);

export const DashboardSkeleton = () => (
  <Stack spacing={4}>
    {/* Profile Selector Skeleton */}
    <Box>
      <Skeleton variant="text" width={80} height={20} sx={{ mb: 2, bgcolor: '#1a1a1a' }} />
      <Stack direction="row" spacing={1}>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} variant="rectangular" width={100} height={32} sx={{ borderRadius: '4px', bgcolor: '#1a1a1a' }} />
        ))}
      </Stack>
    </Box>

    {/* Score Card Skeleton */}
    <Box sx={{ 
      display: 'flex', alignItems: 'center', gap: 4, py: 4, px: 3,
      background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px'
    }}>
      <Skeleton variant="rectangular" width={80} height={80} sx={{ borderRadius: '8px', bgcolor: '#1a1a1a' }} />
      <Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />
      <Box flex={1}>
        <Skeleton variant="text" width="30%" height={32} sx={{ mb: 1, bgcolor: '#1a1a1a' }} />
        <Skeleton variant="text" width="70%" height={20} sx={{ bgcolor: '#1a1a1a' }} />
      </Box>
    </Box>

    {/* Timings Grid Skeleton */}
    <Box>
      <Skeleton variant="text" width={120} height={20} sx={{ mb: 2, bgcolor: '#1a1a1a' }} />
      <Grid container spacing={2}>
        {[1, 2, 3, 4].map(i => (
          <Grid key={i} size={{ xs: 6, md: 3 }}>
            <Box sx={{ height: 80, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', p: 2 }}>
              <Skeleton variant="text" width="60%" sx={{ mx: 'auto', bgcolor: '#1a1a1a' }} />
              <Skeleton variant="text" width="80%" sx={{ mx: 'auto', mt: 1, bgcolor: '#1a1a1a' }} />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  </Stack>
);

export const DeepChartSkeleton = () => (
  <Stack spacing={8}>
    {/* Header Skeleton */}
    <Box>
      <Skeleton variant="text" width={100} height={20} sx={{ bgcolor: '#1a1a1a' }} />
      <Skeleton variant="text" width="40%" height={60} sx={{ mt: 1, bgcolor: '#1a1a1a' }} />
      <Skeleton variant="text" width="60%" height={24} sx={{ mt: 1, bgcolor: '#1a1a1a' }} />
    </Box>

    <Grid container spacing={8}>
      {/* Chart Skeleton */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <Skeleton variant="text" width={100} height={20} sx={{ mb: 3, bgcolor: '#1a1a1a' }} />
        <Box sx={{ aspectRatio: '1/1', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <Skeleton variant="circular" width="80%" height="80%" sx={{ bgcolor: '#1a1a1a' }} />
        </Box>
      </Grid>

      {/* Dasha Skeleton */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <Skeleton variant="text" width={150} height={20} sx={{ mb: 3, bgcolor: '#1a1a1a' }} />
        <Stack spacing={2} sx={{ pl: 3, borderLeft: `1px solid ${BORDER}` }}>
          {[1, 2, 3, 4].map(i => (
             <Box key={i} sx={{ p: 3, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px' }}>
                <Skeleton variant="text" width="40%" height={24} sx={{ bgcolor: '#1a1a1a' }} />
                <Skeleton variant="text" width="20%" height={16} sx={{ mt: 1, bgcolor: '#1a1a1a' }} />
             </Box>
          ))}
        </Stack>
      </Grid>
    </Grid>
  </Stack>
);

export const VaultSkeleton = () => (
  <Grid container spacing={3}>
    {[1, 2, 3, 4].map(i => (
      <Grid key={i} size={{ xs: 12, sm: 6 }}>
        <Box sx={{ p: 3, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '12px', display: 'flex', gap: 2 }}>
          <Skeleton variant="rectangular" width={44} height={44} sx={{ borderRadius: '4px', bgcolor: '#1a1a1a' }} />
          <Box flex={1}>
             <Skeleton variant="text" width="50%" height={24} sx={{ bgcolor: '#1a1a1a' }} />
             <Skeleton variant="text" width="30%" height={16} sx={{ mt: 0.5, bgcolor: '#1a1a1a' }} />
          </Box>
        </Box>
      </Grid>
    ))}
  </Grid>
);
