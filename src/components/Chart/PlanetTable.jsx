import React from 'react';
import { getZodiacSign, getNakshatra } from '../../lib/astro/ephemeris';
import { motion } from 'framer-motion';
import { StaggerParent, StaggerChild } from '../../lib/animations';

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

const PlanetTable = ({ positions, ascendant, activeMahaPlanet, mini = false }) => {
  if (!positions || !ascendant) return null;

  const rows = [
    { name: 'Ascendant', lon: ascendant.longitude, retro: false },
    ...Object.entries(positions).map(([name, data]) => ({
      name,
      lon: data.longitude,
      retro: data.retrograde || data.retro
    }))
  ];

  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-900">
            <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-gray-600">Entity</th>
            <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-gray-600">Sign</th>
            {!mini && <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-gray-600">Degrees</th>}
            <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-gray-600">Nakshatra</th>
            {!mini && <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-gray-600 text-center">Pada</th>}
            {!mini && <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-gray-600 text-center">Status</th>}
          </tr>
        </thead>
        <StaggerParent stagger={0.03} component="tbody">
          {rows.map((row) => {
            const signIdx = getZodiacSign(row.lon);
            const nak = getNakshatra(row.lon);
            const isActive = row.name === activeMahaPlanet;
            
            return (
              <StaggerChild 
                key={row.name} 
                component="tr"
                y={4}
                className={`
                  group border-b border-gray-900/50 transition-colors
                  ${isActive ? 'bg-blue-600/5' : 'hover:bg-white/[0.02]'}
                `}
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    {isActive && <div className="w-1 h-3 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
                    <span className={`text-sm font-bold uppercase tracking-tight ${isActive ? 'text-blue-500' : 'text-white'}`}>
                      {row.name}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4">
                   <div className="flex flex-col">
                      <span className="text-xs text-gray-400 font-medium">{SIGN_NAMES[signIdx]}</span>
                   </div>
                </td>
                {!mini && (
                  <td className="py-4 px-4">
                    <span className="font-mono text-[11px] text-gray-500 group-hover:text-gray-300 transition-colors">
                      {formatDegrees(row.lon)}
                    </span>
                  </td>
                )}
                <td className="py-4 px-4">
                   <span className="text-xs text-gray-200 font-bold">{nak.name}</span>
                </td>
                {!mini && (
                  <td className="py-4 px-4 text-center">
                    <span className="font-mono text-[11px] text-gray-600 font-black">{nak.pada}</span>
                  </td>
                )}
                {!mini && (
                  <td className="py-4 px-4 text-center">
                    {row.retro ? (
                      <span className="text-[9px] font-black uppercase bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded border border-red-500/20">Retro</span>
                    ) : (
                      <span className="text-[9px] font-black uppercase bg-gray-800 text-gray-600 px-1.5 py-0.5 rounded">Direct</span>
                    )}
                  </td>
                )}
              </StaggerChild>
            );
          })}
        </StaggerParent>
      </table>
    </div>
  );
};

export default PlanetTable;
