import React, { useState, useMemo } from 'react';

const SIGN_LABELS = ['Ar', 'Ta', 'Ge', 'Ca', 'Le', 'Vi', 'Li', 'Sc', 'Sa', 'Cp', 'Aq', 'Pi'];
const PLANET_COLORS = {
  Sun: '#F59E0B', Moon: '#E2E8F0', Mars: '#EF4444',
  Mercury: '#22C55E', Jupiter: '#F97316', Venus: '#EC4899',
  Saturn: '#8B5CF6', Rahu: '#6B7280', Ketu: '#78716C'
};

const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

const TransitWheel = React.memo(({ currentPositions, natalPositions, ascendant }) => {
  const [hoveredPlanet, setHoveredPlanet] = useState(null);
  
  const center = 250;
  const outerR = 200;
  const transitR = 145;
  const separationR = 115;
  const natalR = 85;
  const labelR = 180;

  const renderedZodiac = useMemo(() => {
    return SIGN_LABELS.map((label, i) => {
      const angle = i * 30;
      const mid = polarToCartesian(center, center, labelR, angle + 15);
      
      return (
        <g key={label}>
          {/* Section background */}
          <path
            d={`M ${center} ${center} L ${polarToCartesian(center, center, outerR, angle).x} ${polarToCartesian(center, center, outerR, angle).y} A ${outerR} ${outerR} 0 0 1 ${polarToCartesian(center, center, outerR, angle + 30).x} ${polarToCartesian(center, center, outerR, angle + 30).y} Z`}
            className={`${i % 2 === 0 ? 'fill-gray-900/10' : 'fill-transparent'} stroke-gray-900 stroke-[0.5]`}
          />
          {/* Label */}
          <text
            x={mid.x}
            y={mid.y}
            textAnchor="middle"
            alignmentBaseline="middle"
            className="fill-gray-600 text-[10px] font-black font-mono tracking-tighter"
          >
            {label}
          </text>
        </g>
      );
    });
  }, []);

  const renderPlanet = (name, lon, radius, size, color, isNatal = false) => {
    const pos = polarToCartesian(center, center, radius, lon);
    const label = name.substring(0, 2);
    const isHovered = hoveredPlanet?.name === name && hoveredPlanet?.isNatal === isNatal;
    
    return (
      <g 
        key={`${isNatal ? 'n-' : 't-'}${name}`}
        onMouseEnter={() => setHoveredPlanet({ name, lon, isNatal })}
        onMouseLeave={() => setHoveredPlanet(null)}
        className="cursor-pointer transition-all duration-300"
      >
        <circle 
          cx={pos.x} cy={pos.y} r={isHovered ? size + 2 : size} 
          className={`
            transition-all duration-300
            ${isNatal ? 'fill-gray-800' : ''}
          `}
          fill={isNatal ? undefined : color}
          stroke={isNatal ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)'}
          strokeWidth="1"
        />
        <text
          x={pos.x}
          y={pos.y}
          textAnchor="middle"
          alignmentBaseline="middle"
          className={`
            select-none font-black font-mono tracking-tighter
            ${isNatal ? 'fill-gray-400 text-[8px]' : 'fill-black text-[10px]'}
          `}
        >
          {label}
        </text>
      </g>
    );
  };

  return (
    <div className="w-full max-w-[500px] mx-auto relative group">
      {/* Dynamic Tooltip Overlay */}
      {hoveredPlanet && (
        <div className="absolute top-4 left-4 p-3 rounded-xl bg-black/90 border border-gray-800 backdrop-blur-xl z-20 pointer-events-none shadow-2xl animate-in fade-in zoom-in-95 duration-200">
           <div className="flex flex-col gap-1">
              <span className={`text-[10px] font-black uppercase tracking-widest ${hoveredPlanet.isNatal ? 'text-gray-500' : 'text-blue-500'}`}>
                {hoveredPlanet.isNatal ? 'Natal Presence' : 'Current Transit'}
              </span>
              <h4 className="text-sm font-bold text-white uppercase">{hoveredPlanet.name}</h4>
              <div className="flex items-center gap-2 text-[11px] font-mono text-gray-400">
                 <span className="text-white font-bold">{Math.floor(hoveredPlanet.lon % 30)}°</span>
                 <span className="uppercase">{SIGN_LABELS[Math.floor(hoveredPlanet.lon / 30)]}</span>
              </div>
           </div>
        </div>
      )}

      <svg viewBox="0 0 500 500" className="w-full h-auto drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        {/* Background zodiac wheel */}
        {renderedZodiac}

        {/* Separator circles */}
        <circle cx={center} cy={center} r={outerR} fill="none" className="stroke-gray-900 stroke-[1]" />
        <circle cx={center} cy={center} r={separationR} fill="none" className="stroke-gray-800 stroke-[1] stroke-dash-2" strokeDasharray="4 4" />

        {/* Natal ring planets */}
        {natalPositions && Object.entries(natalPositions).map(([name, data]) => 
          renderPlanet(name, data.longitude, natalR, 10, '#2e2e2e', true)
        )}

        {/* Transit ring planets */}
        {currentPositions && Object.entries(currentPositions).map(([name, lon]) => 
          renderPlanet(name, lon, transitR, 15, PLANET_COLORS[name] || '#3b82f6')
        )}

        {/* Ascendant Line */}
        {ascendant && (
          <g>
            <line
              x1={center} y1={center}
              x2={polarToCartesian(center, center, outerR, ascendant.longitude).x}
              y2={polarToCartesian(center, center, outerR, ascendant.longitude).y}
              className="stroke-blue-600 stroke-[2] opacity-40"
            />
            <text
              x={polarToCartesian(center, center, outerR + 20, ascendant.longitude).x}
              y={polarToCartesian(center, center, outerR + 20, ascendant.longitude).y}
              className="fill-blue-500 text-[10px] font-black font-mono tracking-widest uppercase"
              textAnchor="middle"
            >
              ASC
            </text>
          </g>
        )}

        {/* Center HUD */}
        <circle cx={center} cy={center} r={24} className="fill-black stroke-gray-900 stroke-[1]" />
        <text
          x={center}
          y={center}
          textAnchor="middle"
          alignmentBaseline="middle"
          className="fill-gray-600 text-[9px] font-black font-mono tracking-[0.2em] uppercase"
        >
          SYNC
        </text>
      </svg>
    </div>
  );
});

export default TransitWheel;

