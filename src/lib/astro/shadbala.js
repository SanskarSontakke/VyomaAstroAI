
/**
 * Shadbala (6-fold strength) Calculation
 * Simplified version provided per user instructions.
 */

const PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

const EXALTATION = { Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6 };
const DEBILITATION = { Sun: 6, Moon: 7, Mars: 3, Mercury: 11, Jupiter: 9, Venus: 5, Saturn: 0 };
const OWN_SIGNS = {
  Sun: [4], Moon: [3], Mars: [0, 7], Mercury: [2, 5],
  Jupiter: [8, 11], Venus: [1, 6], Saturn: [9, 10]
};
const FRIENDLY_SIGNS = {
  Sun: [0, 8, 11], Moon: [1, 2], Mars: [4, 8], Mercury: [1, 6, 9, 10],
  Jupiter: [0, 3, 4], Venus: [2, 3, 9, 10], Saturn: [2, 5, 11]
};

const NAISARGIKA_BALA = {
  Saturn: 10, Mars: 17, Mercury: 25, Jupiter: 34, Venus: 42, Moon: 51, Sun: 60
};

export function calculateShadbala(positions, ascendantSign, birthDate) {
  if (!positions || ascendantSign === undefined || !birthDate) return [];

  return PLANETS.map(p => {
    const lon = positions[p].longitude;
    const sign = positions[p].sign;
    const retrograde = positions[p].retrograde || false;

    // 1. STHANA BALA (max 60)
    let sthana = 15; // Neutral default
    if (sign === EXALTATION[p]) sthana = 60;
    else if (OWN_SIGNS[p].includes(sign)) sthana = 45;
    else if (FRIENDLY_SIGNS[p].includes(sign)) sthana = 30;
    else if (sign === DEBILITATION[p]) sthana = 0;
    
    // Exact exaltation degree interpolation (approximate)
    const deg = lon % 30;
    if (sign === EXALTATION[p] && Math.abs(deg - 15) < 5) sthana += 5;

    // 2. DISHA BALA (max 60)
    // House 1 (0° from Asc), House 4 (90°), House 7 (180°), House 10 (270°)
    const house = ((sign - ascendantSign + 12) % 12) + 1;
    let disha = 0;
    if (['Jupiter', 'Mercury'].includes(p)) {
      disha = Math.max(0, 60 - (Math.abs(house - 1) * 10)); // Best in 1
    } else if (['Sun', 'Mars'].includes(p)) {
      disha = Math.max(0, 60 - (Math.abs(house - 10) * 10)); // Best in 10
    } else if (['Moon', 'Venus'].includes(p)) {
      disha = Math.max(0, 60 - (Math.abs(house - 4) * 10)); // Best in 4
    } else if (p === 'Saturn') {
      disha = Math.max(0, 60 - (Math.abs(house - 7) * 10)); // Best in 7
    }

    // 3. KALA BALA (temporal, max 60)
    const hour = birthDate.getHours();
    const isDay = hour >= 6 && hour < 18;
    let kala = 30;
    if (['Sun', 'Jupiter', 'Venus'].includes(p)) {
      kala = isDay ? 60 : 30;
    } else if (['Moon', 'Mars', 'Saturn'].includes(p)) {
      kala = !isDay ? 60 : 30;
    }

    // 4. CHESTA BALA (max 60)
    let chesta = retrograde ? 60 : 30;
    if (['Sun', 'Moon'].includes(p)) chesta = 30;

    // 5. NAISARGIKA BALA (Fixed rank)
    const naisargika = NAISARGIKA_BALA[p] || 10;

    // 6. DRIK BALA (aspectual)
    // Benefics: Jupiter, Venus, Merc, Moon (simplified)
    // Malefics: Sun, Mars, Sat (simplified)
    let drik = 0;
    const benefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
    const malefics = ['Sun', 'Mars', 'Saturn'];
    
    benefics.forEach(b => {
      if (b === p) return;
      const diff = Math.abs(positions[b].sign - sign);
      if ([0, 4, 6, 8].includes(diff)) drik += 10; // Simple house aspects
    });
    malefics.forEach(m => {
      if (m === p) return;
      const diff = Math.abs(positions[m].sign - sign);
      if ([0, 6].includes(diff)) drik -= 5;
    });
    drik = Math.max(0, drik);

    const total = sthana + disha + kala + chesta + naisargika + drik;
    const percentage = Math.min(100, (total / 300) * 100);
    
    let grade = 'Weak';
    if (percentage >= 70) grade = 'Strong';
    else if (percentage >= 45) grade = 'Moderate';

    return {
      planet: p,
      sthana,
      disha,
      kala,
      chesta,
      naisargika,
      drik,
      total,
      percentage,
      grade
    };
  });
}
