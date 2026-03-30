import React from 'react';
import { Card, CardContent, Typography, Box, Stack, Avatar, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import MapIcon from '@mui/icons-material/Map';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { motion } from 'framer-motion';

export default function ProfileCard({ profile, active = false, onSelect, onEdit }) {
  if (!profile) return null;

  return (
    <Card 
      onClick={onSelect}
      sx={{ 
        cursor: onSelect ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        background: active ? 'rgba(59,130,246,0.08)' : '#0a0a0a',
        borderColor: active ? '#3b82f6' : '#1a1a1a',
        borderWidth: active ? '2px' : '1px',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: active ? '#3b82f6' : '#333',
          transform: onSelect ? 'translateY(-2px)' : 'none',
          boxShadow: active ? '0 8px 24px rgba(59,130,246,0.12)' : '0 4px 12px rgba(0,0,0,0.4)',
        }
      }}
    >
      <CardContent sx={{ p: '20px !important' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar 
            sx={{ 
              width: 56, height: 56, 
              bgcolor: active ? '#3b82f6' : '#262626',
              fontSize: '1.25rem', fontWeight: 600,
              color: active ? '#fff' : '#888',
              borderRadius: '8px'
            }}
          >
            {profile.name.substring(0, 2).toUpperCase()}
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {profile.name}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ color: 'text.secondary' }}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <AccessTimeIcon sx={{ fontSize: 14 }} />
                <Typography variant="caption">{profile.dob_date}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={0.5}>
                <MapIcon sx={{ fontSize: 14 }} />
                <Typography variant="caption">
                   {profile.latitude.toFixed(2)}, {profile.longitude.toFixed(2)}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {onEdit && (
            <IconButton 
              size="small" 
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              sx={{ opacity: 0.6, '&:hover': { opacity: 1, bgcolor: 'rgba(255,255,255,0.05)' } }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      </CardContent>
      
      {active && (
        <Box sx={{ 
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, 
          bgcolor: '#3b82f6', boxShadow: '0 0 10px rgba(59,130,246,0.5)' 
        }} />
      )}
    </Card>
  );
}
