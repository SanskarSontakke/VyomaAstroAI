import { describe, it, expect, vi } from 'vitest';
import { generateSlug, getShareUrl } from '../shareUtils';

describe('Sharing Utilities', () => {
  it('generates a slug from a name', () => {
    const name = 'Sanskar Sontakke';
    const slug = generateSlug(name);
    
    expect(slug).toMatch(/^sanskar-sontakke-[a-z0-9]{5}$/);
  });

  it('handles special characters in slug generation', () => {
    const name = 'S@nskar! 2024';
    const slug = generateSlug(name);
    
    expect(slug).toMatch(/^s-nskar-2024-[a-z0-9]{5}$/);
  });

  it('constructs a public share URL', () => {
    const slug = 'sanskar-12345';
    // Mock window.location.origin if necessary, but in JSDOM it's usually http://localhost:3000
    const url = getShareUrl(slug);
    expect(url).toContain('/chart/sanskar-12345');
  });
});
