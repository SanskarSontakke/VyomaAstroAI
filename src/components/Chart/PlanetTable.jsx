import React from 'react';
import { getZodiacSign, getNakshatra } from '../../lib/astro/ephemeris';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const SIGN_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

function formatDegrees(longitude) {
  const deg = longitude % 30;
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  return `${d}° ${m.toString().padStart(2, '0')}'`;
}

const MotionTableBody = motion.create(TableBody);
const MotionTableRow = motion.create(TableRow);

const parentVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } }
};

const childVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const PlanetTable = ({ positions, ascendant, activeMahaPlanet }) => {
  const rows = [
    { name: 'Ascendant', lon: ascendant.longitude, retro: false },
    ...Object.entries(positions).map(([name, data]) => ({
      name,
      lon: data.longitude,
      retro: data.retrograde
    }))
  ];

  return (
    <TableContainer sx={{ background: 'transparent' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Planet</TableCell>
            <TableCell>Sign</TableCell>
            <TableCell>Degrees</TableCell>
            <TableCell>Nakshatra</TableCell>
            <TableCell align="center">Pada</TableCell>
            <TableCell align="center">Status</TableCell>
          </TableRow>
        </TableHead>
        <MotionTableBody initial="hidden" animate="visible" variants={parentVariants}>
          {rows.map((row) => {
            const signIdx = getZodiacSign(row.lon);
            const nak = getNakshatra(row.lon);
            const isActive = row.name === activeMahaPlanet;
            
            return (
              <MotionTableRow 
                key={row.name} 
                variants={childVariants}
                sx={{ 
                  background: isActive ? 'rgba(59,130,246,0.06)' : 'transparent',
                  '&:hover': { background: 'rgba(255,255,255,0.02)' } 
                }}
              >
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    {isActive && <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#3b82f6' }} />}
                    <Typography variant="body2" sx={{ fontWeight: isActive ? 600 : 400, color: isActive ? '#fff' : '#ededed' }}>
                      {row.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                   <Typography variant="body2" sx={{ color: '#a1a1a1' }}>{SIGN_NAMES[signIdx]}</Typography>
                </TableCell>
                <TableCell>
                   <Typography className="mono" sx={{ fontSize: '0.75rem', color: '#6b6b6b' }}>{formatDegrees(row.lon)}</Typography>
                </TableCell>
                <TableCell>
                   <Typography variant="body2" sx={{ color: '#ededed' }}>{nak.name}</Typography>
                </TableCell>
                <TableCell align="center">
                   <Typography className="mono" sx={{ color: '#4b4b4b' }}>{nak.pada}</Typography>
                </TableCell>
                <TableCell align="center">
                  {row.retro ? (
                    <Typography variant="caption" sx={{ color: '#f87171', fontWeight: 600 }}>RETRO</Typography>
                  ) : (
                    <Typography variant="caption" sx={{ color: '#2e2e2e' }}>DIRECT</Typography>
                  )}
                </TableCell>
              </MotionTableRow>
            );
          })}
        </MotionTableBody>
      </Table>
    </TableContainer>
  );
};

export default PlanetTable;
