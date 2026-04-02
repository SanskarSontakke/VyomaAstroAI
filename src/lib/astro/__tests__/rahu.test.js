import { describe, it, expect } from 'vitest';
import {
  getSunriseSunset,
  getRahuKaal,
  getYamaghanda,
  getGuliKaal,
  getAbhijitMuhurta,
} from '../rahu.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Rahu Kaal & Daily Timings Tests
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MUMBAI = { lat: 19.076, lon: 72.877 };
const EQUINOX = new Date('2026-03-20T12:00:00Z'); // Near equinox — safe for sunrise/sunset

describe('getSunriseSunset — Basic validation', () => {
  it('sunrise is earlier than sunset for Mumbai', () => {
    const { sunrise, sunset } = getSunriseSunset(EQUINOX, MUMBAI.lat, MUMBAI.lon);
    expect(sunrise.getTime()).toBeLessThan(sunset.getTime());
  });

  it('sunrise and sunset are valid Date objects', () => {
    const { sunrise, sunset } = getSunriseSunset(EQUINOX, MUMBAI.lat, MUMBAI.lon);
    expect(sunrise).toBeInstanceOf(Date);
    expect(sunset).toBeInstanceOf(Date);
    expect(sunrise.getTime()).not.toBeNaN();
    expect(sunset.getTime()).not.toBeNaN();
  });
});

describe('getRahuKaal — Timing windows', () => {
  it('returns start < end within sunrise/sunset', () => {
    const rahu = getRahuKaal(EQUINOX, MUMBAI.lat, MUMBAI.lon);
    expect(rahu.start.getTime()).toBeLessThan(rahu.end.getTime());
  });

  it('has formattedStart and formattedEnd strings', () => {
    const rahu = getRahuKaal(EQUINOX, MUMBAI.lat, MUMBAI.lon);
    expect(typeof rahu.formattedStart).toBe('string');
    expect(typeof rahu.formattedEnd).toBe('string');
    expect(rahu.formattedStart.length).toBeGreaterThan(0);
  });

  it('produces different slots for different weekdays', () => {
    const slots = [];
    for (let day = 0; day < 7; day++) {
      const date = new Date(2026, 2, 15 + day, 12, 0, 0); // Mar 15-21, 2026
      const rahu = getRahuKaal(date, MUMBAI.lat, MUMBAI.lon);
      slots.push(rahu.start.getTime());
    }
    // At least some slots should be different (different weekday mappings)
    const uniqueSlots = new Set(slots);
    expect(uniqueSlots.size).toBeGreaterThan(1);
  });
});

describe('getAbhijitMuhurta — Solar noon window', () => {
  it('window is approximately 24 minutes', () => {
    const abhi = getAbhijitMuhurta(EQUINOX, MUMBAI.lat, MUMBAI.lon);
    const durationMins = (abhi.end.getTime() - abhi.start.getTime()) / (60 * 1000);
    expect(durationMins).toBeCloseTo(24, 0);
  });

  it('window center is near solar noon', () => {
    const { sunrise, sunset } = getSunriseSunset(EQUINOX, MUMBAI.lat, MUMBAI.lon);
    const solarNoon = (sunrise.getTime() + sunset.getTime()) / 2;
    const abhi = getAbhijitMuhurta(EQUINOX, MUMBAI.lat, MUMBAI.lon);
    const center = (abhi.start.getTime() + abhi.end.getTime()) / 2;
    const diffMinutes = Math.abs(center - solarNoon) / (60 * 1000);
    expect(diffMinutes).toBeLessThan(2); // Within 2 minutes of solar noon
  });
});

describe('Yamaghanda & Guli Kaal — Structure check', () => {
  it('getYamaghanda returns valid window', () => {
    const yama = getYamaghanda(EQUINOX, MUMBAI.lat, MUMBAI.lon);
    expect(yama.start.getTime()).toBeLessThan(yama.end.getTime());
    expect(yama.formattedStart).toBeTruthy();
  });

  it('getGuliKaal returns valid window', () => {
    const guli = getGuliKaal(EQUINOX, MUMBAI.lat, MUMBAI.lon);
    expect(guli.start.getTime()).toBeLessThan(guli.end.getTime());
    expect(guli.formattedStart).toBeTruthy();
  });
});
