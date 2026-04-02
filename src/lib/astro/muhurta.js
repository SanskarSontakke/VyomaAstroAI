import { getDailyInsights } from './insights';
import { getRahuKaal, getAbhijitMuhurta, getSunriseSunset } from './rahu';
import { getPlanetaryPositions, getZodiacSign } from './ephemeris';
import { log } from '../logger';

/**
 * Muhurta Finder Engine
 * Finds auspicious timing windows based on 4 Vedic rules.
 */

const GOAL_RULES = {
  travel: {
    label: 'Travel',
    favorableMoonHouses: [3, 6, 10, 11],
    avoidTithis: [4, 8, 9, 12, 14],
    avoidWeekdays: [2],       // Tuesday (Mars/Conflict)
    preferWeekdays: [3, 4, 5],  // Wed, Thu, Fri
  },
  surgery: {
    label: 'Medical / Surgery',
    favorableMoonHouses: [3, 6, 10, 11],
    avoidTithis: [1, 6, 8, 9, 14],
    avoidWeekdays: [],
    preferWeekdays: [1, 4, 6],  // Mon, Thu, Sat
    avoidMoonSigns: [1, 4, 7, 10], // Avoid fixed signs (Taurus, Leo, Scorpio, Aquarius)
  },
  finance: {
    label: 'Financial / Signing',
    favorableMoonHouses: [2, 3, 6, 10, 11],
    avoidTithis: [4, 9, 14],
    avoidWeekdays: [2, 6],     // Tue, Sat
    preferWeekdays: [3, 4, 5],
  },
  marriage: {
    label: 'Marriage / Engagement',
    favorableMoonHouses: [1, 2, 3, 4, 5, 7, 10, 11],
    avoidTithis: [4, 9, 14],
    avoidWeekdays: [2],
    preferWeekdays: [1, 3, 4, 5],
    requireGoodTara: true,
  },
  education: {
    label: 'Education / Exam',
    favorableMoonHouses: [1, 2, 3, 4, 5, 9, 10, 11],
    avoidTithis: [4, 9, 14],
    preferWeekdays: [3, 4],    // Wed (Mercury/Speech), Thu (Jupiter/Wisdom)
    avoidWeekdays: [2, 6],
  },
  business: {
    label: 'Business Launch',
    favorableMoonHouses: [2, 3, 6, 10, 11],
    avoidTithis: [4, 9, 14],
    preferWeekdays: [3, 4, 5],
    avoidWeekdays: [2, 6],
  },
};

export function findMuhurtas(profile, goalType, startDate, endDate, ayanamsaSystem = 'lahiri') {
  if (!profile || !goalType || !startDate || !endDate) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const rules = GOAL_RULES[goalType];
  
  if (!rules) throw new Error(`Unknown goal type: ${goalType}`);

  const results = [];
  const oneDay = 24 * 60 * 60 * 1000;
  
  // Limit search to 90 days
  const diffDays = Math.min(Math.ceil((end - start) / oneDay), 90);

  for (let i = 0; i < diffDays; i++) {
    const currentDay = new Date(start.getTime() + (i * oneDay));
    const dayStr = currentDay.toISOString().split('T')[0];
    
    try {
      const insights = getDailyInsights(profile, currentDay, ayanamsaSystem);
      let score = 0;
      const reasons = [];

      // 1. Moon House Scoring
      if (rules.favorableMoonHouses.includes(insights.dailyOutlook.houseFromMoon)) {
        score += 30;
        reasons.push(`Moon in ${insights.dailyOutlook.houseFromMoon}th house — growth potential`);
      }

      // 2. Tithi Scoring
      const tithiNum = insights.tithi.number;
      if (rules.avoidTithis.includes(tithiNum % 15 || 15)) {
        score -= 10; // Extra penalty for Rikta/Avoided Tithis
        reasons.push(`Avoid: ${insights.tithi.name} (Challenging Tithi)`);
      } else {
        score += 20;
        reasons.push(`${insights.tithi.name} — favorable Lunar phase`);
      }

      // 3. Weekday Scoring
      const weekday = currentDay.getDay();
      if (rules.preferWeekdays.includes(weekday)) {
        score += 15;
        reasons.push('Favorable Day of the Week');
      } else if (rules.avoidWeekdays.includes(weekday)) {
        score -= 25;
        reasons.push('Avoid this Weekday for this activity');
      }

      // 4. Tara Bala
      if (insights.taraBala.favorable) {
        score += 15;
        reasons.push(`Favorable Tara (${insights.taraBala.name})`);
      }

      // 5. Daily Outlook
      if (insights.dailyOutlook.score >= 4) {
        score += 10;
        reasons.push('High General Cosmic Score');
      }

      // 6. Moon Sign (Specific for Surgery)
      if (rules.avoidMoonSigns) {
        const moonPos = getPlanetaryPositions(currentDay, profile.latitude, profile.longitude, ayanamsaSystem).Moon.longitude;
        const moonSign = getZodiacSign(moonPos);
        if (rules.avoidMoonSigns.includes(moonSign)) {
          score -= 15;
          reasons.push('Avoid: Moon in fixed sign (obstruction)');
        }
      }

      // 7. Rahu Kaal Check (General penalty if long or present)
      // Standard Rahu Kaal window
      score -= 5; // Small constant penalty for Rahu presence in day
      const rahu = insights.timings.rahuKaal;
      const rahuDurationHrs = (rahu.end.getTime() - rahu.start.getTime()) / (1000 * 60 * 60);
      if (rahuDurationHrs > 4) { // Flag if unusually long
        score -= 20;
        reasons.push('Extreme Rahu Kaal duration warning');
      }

      // Final Window Calculation
      let bestWindow;
      const abhijit = insights.timings.abhijitMuhurta;
      
      if (score >= 50 && abhijit) {
        bestWindow = abhijit;
      } else {
        const { sunrise } = getSunriseSunset(currentDay, profile.latitude, profile.longitude);
        const windowEnd = new Date(sunrise.getTime() + (2 * 60 * 60 * 1000));
        bestWindow = {
          start: sunrise,
          end: windowEnd,
          formattedStart: sunrise.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
          formattedEnd: windowEnd.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
        };
      }

      // Grade
      let grade = 'Average';
      if (score >= 70) grade = 'Excellent';
      else if (score >= 50) grade = 'Good';
      else if (score < 40) grade = 'Poor';

      results.push({
        date: dayStr,
        dayName: currentDay.toLocaleDateString('en-US', { weekday: 'long' }),
        formattedDate: currentDay.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
        score: Math.max(0, Math.min(100, score)),
        grade,
        moonHouse: insights.dailyOutlook.houseFromMoon,
        tithi: insights.tithi.name,
        tara: insights.taraBala.name,
        bestWindow,
        rahuKaal: rahu,
        reasons
      });
    } catch (err) {
      log.error('Muhurta', `Error processing day ${dayStr}: ${err.message}`);
    }
  }

  // Sort descending
  results.sort((a, b) => b.score - a.score);

  const top10 = results.slice(0, 10);
  const bestDay = top10[0] || null;

  log.info('Muhurta', `Scan complete for ${goalType}. Best day: ${bestDay?.date} (${bestDay?.score}/100)`);

  return {
    bestDay,
    recommendations: top10,
    goalLabel: rules.label,
    searchedDays: diffDays
  };
}
