# GEMINI.md — VyomaAstroAI Project Context

> Place this file at the **root of your project**. Gemini CLI reads it automatically
> on every session, giving the model full context without re-explaining things.

---

## Project Identity

| Field | Value |
|---|---|
| **Name** | VyomaAstroAI (internal codename: Naksha) |
| **Type** | Vedic Astrology Web App |
| **Version** | v1.0 |
| **Stage** | Core complete — retention & depth features in progress |

---

## Tech Stack

```
Frontend    : React 19 + Vite 8
UI System   : Material UI v6 + Framer Motion 12
State       : TanStack Query v5 (server cache), React Context (profile/settings)
Auth + DB   : Supabase (auth, profiles table)
Astro Engine: astronomia npm package — ALL calculations run client-side (browser)
Ayanamsa    : Lahiri (Nirayana)
Geocoding   : Nominatim (OpenStreetMap, no API key needed)
Fonts       : Geist + Geist Mono (@fontsource)
Deployment  : Vercel
Router      : React Router v7
```

---

## Design System

The UI follows a **Vercel/bolt.new-inspired dark aesthetic**:

```
Background  : #000000 (pure black)
Surface     : #0a0a0a (cards, elevated)
Borders     : #1a1a1a (default) / #262626 (hover)
Text        : #ededed (primary) / #bcbcbc (secondary) / #8a8a8a (disabled)
Accent      : #3b82f6 (bolt-blue — CTAs, focus, active states)
Accent2     : #60a5fa (hover variant)
Error       : #ef4444
Success     : #22c55e
Warning     : #f59e0b
```

**Never** use Tailwind classes — this project uses MUI `sx` prop and `theme.js` tokens exclusively.

---

## Project Structure

```
src/
├── components/
│   ├── Chart/
│   │   ├── NorthChart.jsx      # SVG North-Indian Kundli chart
│   │   └── PlanetTable.jsx     # Animated planet positions table
│   ├── ConfirmDialog.jsx        # Promise-based confirm modal
│   ├── CosmicLoader.jsx         # Orbital dot spinner
│   ├── EmptyState.jsx           # Empty vault/list state
│   ├── ErrorBoundary.jsx        # React class error boundary
│   ├── FieldError.jsx           # Animated inline field error
│   ├── ProfileCard.jsx          # Profile display card
│   ├── ProfileForm.jsx          # Birth data form w/ Nominatim geocoding
│   ├── SectionError.jsx         # Per-section retry error state
│   └── SkeletonLoaders.jsx      # Dashboard/Chart/Vault skeletons
├── hooks/
│   └── useAstro.js              # TanStack Query hooks: useProfiles, useAstroData, useChartData
├── lib/
│   ├── animations.jsx           # Framer Motion primitives (FadeUp, StaggerParent, TiltCard, TerminalReveal…)
│   ├── astro/
│   │   ├── dasha.js             # Vimshottari Maha/Antar Dasha calculator
│   │   ├── ephemeris.js         # Core planetary engine (VSOP87, Lahiri ayanamsa)
│   │   ├── insights.js          # Daily insights aggregator
│   │   └── rahu.js              # Rahu Kaal, Yamaghanda, Guli Kaal, Abhijit Muhurta
│   ├── logger.js                # Structured console logger (log.info/warn/error/debug)
│   ├── ProfileContext.jsx       # Active profile + app settings context
│   ├── supabase.js              # Supabase client
│   ├── theme.js                 # MUI theme factory (getTheme(settings))
│   └── ToastContext.jsx         # Toast notification system
├── locales/en/
│   ├── gochar_moon.json         # Moon transit interpretations (12 houses)
│   ├── lucky.json               # Lucky colors, numbers, planet friendships
│   ├── monthly_theme.json       # Sun transit monthly themes (12 houses)
│   └── tara_bala.json           # Tara Bala 9 positions
└── pages/
    ├── About.jsx
    ├── Dashboard.jsx            # Main insights page
    ├── DeepChart.jsx            # Kundli + Dasha timeline
    ├── Landing.jsx              # Marketing landing
    ├── Onboarding.jsx           # Auth (signin/signup) + first profile setup
    ├── Privacy.jsx
    ├── Settings.jsx             # Profiles CRUD + UI preferences
    ├── Terms.jsx
    └── Vault.jsx                # All profiles view
```

---

## Supabase Schema

```sql
-- profiles table
CREATE TABLE profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users NOT NULL,
  name            TEXT NOT NULL,
  dob_date        DATE NOT NULL,
  dob_time        TIME NOT NULL,
  latitude        FLOAT NOT NULL,
  longitude       FLOAT NOT NULL,
  timezone_offset FLOAT NOT NULL DEFAULT 5.5,
  is_primary      BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- RLS: users can only access their own profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their profiles" ON profiles
  FOR ALL USING (auth.uid() = user_id);
```

---

## Key Architectural Rules

1. **All astro math runs client-side.** Never suggest a backend/serverless function for calculations. The `astronomia` npm package handles everything in the browser.

2. **VSOP87 B-type data** is used for heliocentric ecliptic coordinates. Planet instances are singletons imported at module level.

3. **Lahiri Ayanamsa** formula: `23.853056 + (1.396042 + 0.000308 * T) * T` where T = Julian centuries from J2000.

4. **Geocoding** uses Nominatim (`https://nominatim.openstreetmap.org/search`). No API key. Triggered on `onBlur` of the city field.

5. **TanStack Query** is the single source of truth for async data. Cache keys: `['profiles', userId]`, `['astroData', profileId, dateStr]`, `['chartData', profileId]`. `staleTime: Infinity` for chart data (birth data never changes).

6. **Theme is dynamic** — `getTheme(settings)` is called in `AppContent` which reads from `ProfileContext`. Font family and scale can be toggled in Settings.

7. **Logger convention:** always use `log.info('ComponentName', 'message', optionalData)` — never raw `console.log`.

8. **No Tailwind anywhere.** Style exclusively with MUI `sx` prop, `theme` tokens, or the CSS variables in `index.css`.

---

## Animation Primitives (from `lib/animations.jsx`)

| Component | Purpose |
|---|---|
| `<PageTransition>` | Wraps entire page, fade+blur in/out |
| `<FadeUp delay={0.1}>` | Scroll-triggered fade + rise |
| `<StaggerParent stagger={0.08}>` | Stagger container |
| `<StaggerChild y={20}>` | Staggered child item |
| `<TiltCard maxTilt={4}>` | 3D mouse-tilt card |
| `<TerminalReveal text="..." delay={0.4}>` | Typewriter with blinking cursor |
| `<GlowPulse color="#3b82f6" size={8}>` | Pulsing live indicator dot |
| `<SlideIn from="left/right">` | Entrance from side |
| `<WordReveal text="...">` | Word-by-word blur reveal |

---

## Routing Map

```
/              → Landing
/login         → Onboarding (Sign In tab)
/register      → Onboarding (Sign Up tab)
/auth          → redirects to /login
/dashboard     → Dashboard (main app)
/vault         → Vault (all profiles)
/chart         → DeepChart (Kundli + Dasha)
/settings      → Settings
/about         → About
/privacy       → Privacy Policy
/terms         → Terms of Service
```

Bottom nav is present on `/dashboard`, `/vault`, `/chart` with tab index 0, 1, 2 respectively.

---

## Error Handling Layers

```
1. ErrorBoundary (class)     → catches uncaught render errors, shows recovery screen
2. SectionError component    → per-section retry UI for failed queries
3. FieldError component      → animated inline field validation
4. ToastContext              → success/error/warning/info toasts with countdown bars
5. ConfirmDialog             → promise-based destructive action confirms
6. log.error()               → structured console logging with stack traces
```

---

## Feature Roadmap (do not implement without explicit instruction)

```
Tier 1 — Retention:    Compatibility matching, push notifications, Muhurta finder, live transit map
Tier 2 — Depth:        Divisional charts (D9/D10), Yoga detection, Shadbala, Ashtakavarga
Tier 3 — Social:       PDF export, comparative chart, shareable links
Tier 4 — Monetize:     Pro tier, astrologer mode, paid reports
Tier 5 — Platform:     Capacitor mobile, multi-language, PWA offline, API access
```

---

## Environment Variables

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Both are required. App gracefully degrades with placeholder values if missing (logs a warning).

---

## Common Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

---

## Code Style Preferences

- **Components**: functional, no class components except `ErrorBoundary`
- **Imports**: named exports preferred; default export for page components
- **Async**: `async/await` everywhere, no `.then()` chains
- **Error handling**: always `try/catch` with `toast.error()` + `log.error()`
- **File naming**: PascalCase for components, camelCase for lib/hooks
- **No TypeScript** (intentional — keep iteration fast)
- **ESLint rule**: `no-unused-vars` with `varsIgnorePattern: '^[A-Z_]'`

---

*Last updated: April 2026 — VyomaAstroAI v1.0*