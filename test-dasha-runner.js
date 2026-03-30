import { testDasha } from './src/lib/astro/dasha.js';

try {
  testDasha();
} catch (error) {
  console.error('Dasha test failed:', error);
}
