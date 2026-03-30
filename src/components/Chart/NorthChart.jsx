import React from 'react';
import { Box } from '@mui/material';

const SIGN_ABBR = ['Ar', 'Ta', 'Ge', 'Ca', 'Le', 'Vi', 'Li', 'Sc', 'Sa', 'Cp', 'Aq', 'Pi'];
const PLANET_ABBR = {
  Sun: 'Su',
  Moon: 'Mo',
  Mars: 'Ma',
  Mercury: 'Me',
  Jupiter: 'Ju',
  Venus: 'Ve',
  Saturn: 'Sa',
  Rahu: 'Ra',
  Ketu: 'Ke'
};

const NorthChart = ({ positions, ascendantSign }) => {
  const houseSigns = Array.from({ length: 12 }, (_, i) => (ascendantSign + i) % 12);
  const houses = houseSigns.map((signIdx, i) => ({
    houseNum: i + 1,
    signIdx: signIdx,
    planets: []
  }));

  Object.entries(positions).forEach(([name, data]) => {
    const houseIdx = houseSigns.indexOf(data.sign);
    if (houseIdx !== -1) {
      houses[houseIdx].planets.push({
        abbr: PLANET_ABBR[name],
        retro: data.retrograde
      });
    }
  });

  const size = 400;
  
  // Custom layout for North Indian style
  const polygons = [
    { id: 1, pts: `200,0 100,100 200,200 300,100`, textPos: { x: 200, y: 70 } },
    { id: 2, pts: `200,0 300,100 400,0`, textPos: { x: 300, y: 35 } },
    { id: 3, pts: `400,0 300,100 400,200`, textPos: { x: 365, y: 100 } },
    { id: 4, pts: `400,200 300,100 200,200 300,300`, textPos: { x: 330, y: 200 } },
    { id: 5, pts: `400,200 300,300 400,400`, textPos: { x: 365, y: 300 } },
    { id: 6, pts: `400,400 300,300 200,400`, textPos: { x: 300, y: 365 } },
    { id: 7, pts: `200,400 300,300 200,200 100,300`, textPos: { x: 200, y: 330 } },
    { id: 8, pts: `200,400 100,300 0,400`, textPos: { x: 100, y: 365 } },
    { id: 9, pts: `0,400 100,300 0,200`, textPos: { x: 35, y: 300 } },
    { id: 10, pts: `0,200 100,300 200,200 100,100`, textPos: { x: 70, y: 200 } },
    { id: 11, pts: `0,200 100,100 0,0`, textPos: { x: 35, y: 100 } },
    { id: 12, pts: `0,0 100,100 200,0`, textPos: { x: 100, y: 35 } }
  ];

  return (
    <Box display="flex" justifyContent="center">
      <svg 
        width={size} height={size} viewBox={`0 0 ${size} ${size}`} 
        style={{
          background: '#030303',
          border: '1px solid #1a1a1a',
          borderRadius: 4,
          overflow: 'hidden'
        }}
      >
        {polygons.map((p, idx) => {
          const isLagna = p.id === 1;
          return (
            <g key={p.id}>
              <polygon 
                points={p.pts} 
                fill={isLagna ? 'rgba(59,130,246,0.03)' : '#0a0a0a'}
                stroke={isLagna ? '#3b82f6' : '#1a1a1a'}
                strokeWidth={isLagna ? 1.5 : 1}
              />
              <g transform={`translate(${p.textPos.x}, ${p.textPos.y})`}>
                <text textAnchor="middle" dy="-5" fill="#ededed" fontSize="11px" fontWeight="600" fontFamily='"Geist Mono", monospace'>
                  {SIGN_ABBR[houses[idx].signIdx]}
                </text>
                <text textAnchor="middle" dy="8" fill="#4b4b4b" fontSize="8px" fontFamily='"Geist Mono", monospace'>
                  H{p.id}
                </text>
                <g transform="translate(0, 24)">
                  {houses[idx].planets.map((pl, pIdx) => (
                    <text 
                      key={pIdx} 
                      textAnchor="middle" 
                      dy={pIdx * 14} 
                      fill="#ededed"
                      fontSize="10px"
                      fontFamily='"Geist Mono", monospace'
                    >
                      {pl.abbr}{pl.retro ? '(R)' : ''}
                    </text>
                  ))}
                </g>
              </g>
            </g>
          );
        })}
        {/* Main diagonals and diamonds already formed by polygons, but adding extra lines for clarity if needed */}
      </svg>
    </Box>
  );
};

export default NorthChart;
