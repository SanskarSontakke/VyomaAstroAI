# Vyoma Astro AI

> A Vedic astrology platform built with React that visualizes birth charts, planetary transits, and auspicious timing calculations.

## What it does

Vyoma provides a set of interactive tools for Vedic astrology analysis. Users can store multiple birth charts, view natal and divisional charts (D1, D9, D10, etc.), track planetary transits over time, search for auspicious timing windows (muhurta), compare charts side-by-side, and export analysis as PDFs. The core calculations are powered by a custom ephemeris engine based on Astronomia.

## Why I built it

To learn React component patterns, real-time state management with TanStack Query, and how to implement a complex calculation engine in the browser. Also wanted to build a usable tool for learning Vedic astrology concepts hands-on.

## Tech stack

- React 19 + Vite
- Tailwind CSS (v4)
- Framer Motion (animations)
- Supabase (auth, database, real-time sync)
- TanStack Query (data management)
- Web Workers (background calculations)
- jsPDF + html2canvas (PDF export)
- Astronomia (ephemeris calculations)

## Getting started

```bash
git clone https://github.com/SanskarSontakke/VyomaAstroAI.git
cd VyomaAstroAI
npm install
npm run dev
```

For testing:
```bash
npm test           # run once
npm run test:watch # watch mode
```

## How it works

The app uses Web Workers to run ephemeris calculations (finding planetary positions at a given time) in the background without blocking the UI. Birth chart data is stored in Supabase and synced locally via TanStack Query. The UI renders SVG charts using canvas-like positioning to show planet positions around a circular zodiac wheel. Divisional charts (Vargas) are computed by mathematically transforming the base chart positions. Muhurta (timing) calculations brute-force check blocks of time to find windows meeting specific planetary criteria.

Data is persisted to localStorage with Supabase keeping the authoritative copy for multi-device sync.

## Results / status

Working demo. Core features (birth chart visualization, natal analysis, transit tracking, muhurta search, PDF export) are functional. Component tests cover main UI pieces. Known limitation: muhurta calculations can be slow for long date ranges on lower-end devices.

## License

MIT © 2026 Sanskar Sontakke
