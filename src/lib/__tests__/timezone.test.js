import { describe, it, expect } from 'vitest';
import { parseBirthDateUTC, suggestTimezone } from '../timezones';

describe('Timezone Utilities', () => {
  it('correctly parses IST birth date to UTC', () => {
    // 2024-04-01 12:00:00 IST (UTC+5:30) should be 2024-04-01 06:30:00 UTC
    const dateStr = '2024-04-01';
    const timeStr = '12:00';
    const tz = 'Asia/Kolkata';
    
    const result = parseBirthDateUTC(dateStr, timeStr, tz);
    expect(result.getUTCHours()).toBe(6);
    expect(result.getUTCMinutes()).toBe(30);
  });

  it('correctly handles New York DST (EDT vs EST)', () => {
    // July 1 (Summer) -> EDT (UTC-4)
    const summer = parseBirthDateUTC('2024-07-01', '12:00', 'America/New_York');
    expect(summer.getUTCHours()).toBe(16); // 12 + 4

    // Jan 1 (Winter) -> EST (UTC-5)
    const winter = parseBirthDateUTC('2024-01-01', '12:00', 'America/New_York');
    expect(winter.getUTCHours()).toBe(17); // 12 + 5
  });

  it('suggests correct timezone for major cities', () => {
    expect(suggestTimezone('Mumbai, India')).toBe('Asia/Kolkata');
    expect(suggestTimezone('London, UK')).toBe('Europe/London');
    expect(suggestTimezone('New York')).toBe('America/New_York');
    expect(suggestTimezone('Unknown City')).toBe('Asia/Kolkata'); // Default
  });
});
