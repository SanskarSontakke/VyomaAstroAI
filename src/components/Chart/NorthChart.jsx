import React, { useMemo } from 'react';

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

const NorthChart = React.memo(({ positions, ascendantSign }) => {
  const houses = useMemo(() => {
    if (!positions || ascendantSign === undefined) return [];
    const houseSigns = Array.from({ length: 12 }, (_, i) => (ascendantSign + i) % 12);
    const computedHouses = houseSigns.map((signIdx, i) => ({
      houseNum: i + 1,
      signIdx: signIdx,
      planets: []
    }));

    Object.entries(positions).forEach(([name, data]) => {
      if (!PLANET_ABBR[name]) return;
      const houseIdx = houseSigns.indexOf(data.signIndex !== undefined ? data.signIndex : data.sign);
      if (houseIdx !== -1) {
        computedHouses[houseIdx].planets.push({
          abbr: PLANET_ABBR[name],
          retro: data.isRetrograde || data.retro
        });
      }
    });

    return computedHouses;
  }, [positions, ascendantSign]);

  const polygons = useMemo(() => [
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
  ], []);

  if (!positions || ascendantSign === undefined) return null;

  const size = 400;

  return (
    <div className="flex justify-center w-full">
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`} 
        className="max-w-full h-auto bg-[#000] border border-gray-900 rounded-lg shadow-2xl"
      >
        {polygons.map((p, idx) => {
          const isLagna = p.id === 1;
          return (
            <g key={p.id}>
              <polygon 
                points={p.pts} 
                className={`
                  transition-colors duration-300
                  ${isLagna ? 'fill-blue-600/5 stroke-blue-600/40 stroke-[1.5]' : 'fill-[#050505] stroke-gray-900 stroke-[1]'}
                `}
              />
              <g transform={`translate(${p.textPos.x}, ${p.textPos.y})`}>
                <text 
                  textAnchor="middle" 
                  dy="-5" 
                  className="fill-white text-[10px] font-black tracking-tighter font-mono"
                >
                  {SIGN_ABBR[houses[idx].signIdx]}
                </text>
                <text 
                  textAnchor="middle" 
                  dy="8" 
                  className="fill-gray-700 text-[8px] font-black font-mono tracking-widest uppercase"
                >
                  {p.id}
                </text>
                <g transform="translate(0, 24)">
                  {houses[idx].planets.map((pl, pIdx) => (
                    <text 
                      key={pIdx} 
                      textAnchor="middle" 
                      dy={pIdx * 12} 
                      className={`text-[10px] font-bold font-mono ${isLagna ? 'fill-blue-500' : 'fill-gray-300'}`}
                    >
                      {pl.abbr}{pl.retro ? ' (R)' : ''}
                    </text>
                  ))}
                </g>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
});

export default NorthChart;
