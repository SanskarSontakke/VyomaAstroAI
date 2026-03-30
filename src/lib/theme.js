import { createTheme, alpha } from '@mui/material/styles';

const BLACK   = '#000000';
const SURFACE = '#0a0a0a';    // cards, elevated surfaces
const BORDER  = '#1a1a1a';    // subtle dividers
const BORDER2 = '#262626';    // hover borders
const WHITE   = '#ffffff';
const GRAY1   = '#ededed';    // primary text
const GRAY2   = '#bcbcbc';    // secondary text (brightened)
const GRAY3   = '#8a8a8a';    // disabled / hints (brightened)
const GRAY4   = '#2e2e2e';    // chips, tags backgrounds
const ACCENT  = '#3b82f6';    // bolt-blue — for actions, links, focus
const ACCENT2 = '#60a5fa';    // lighter blue for hover states

export const getTheme = (settings = { fontFamily: 'Geist', fontSizeScale: 1.0 }) => {
  const fontPrimary = settings.fontFamily === 'Geist Mono' ? '"Geist Mono", monospace' : '"Geist", sans-serif';
  const baseFontSize = 14 * (settings.fontSizeScale || 1.0);

  return createTheme({
    palette: {
      mode: 'dark',
      primary:   { main: ACCENT,  light: ACCENT2, dark: '#1d4ed8', contrastText: WHITE },
      secondary: { main: '#888888' },
      error:     { main: '#ef4444' },
      warning:   { main: '#f59e0b' },
      success:   { main: '#22c55e' },
      info:      { main: ACCENT },
      background: { default: BLACK, paper: SURFACE },
      text:       { primary: GRAY1, secondary: GRAY2, disabled: GRAY3 },
      divider:    BORDER,
    },

    typography: {
      fontFamily: `${fontPrimary}, -apple-system, BlinkMacSystemFont, sans-serif`,
      fontSize: baseFontSize,
      fontWeightLight:   300,
      fontWeightRegular: 400,
      fontWeightMedium:  500,
      fontWeightBold:    600,
      h1: { fontFamily: fontPrimary, fontSize:'3.0rem',  fontWeight:600, letterSpacing:'-0.04em', lineHeight:1.1, color: WHITE },
      h2: { fontFamily: fontPrimary, fontSize:'2.25rem', fontWeight:600, letterSpacing:'-0.02em', lineHeight:1.15, color: WHITE },
      h3: { fontFamily: fontPrimary, fontSize:'1.75rem', fontWeight:600, letterSpacing:'-0.02em', lineHeight:1.2, color: WHITE },
      h4: { fontFamily: fontPrimary, fontSize:'1.35rem', fontWeight:500, letterSpacing:'-0.02em', lineHeight:1.3, color: WHITE },
      h5: { fontFamily: fontPrimary, fontSize:'1.10rem', fontWeight:500, letterSpacing:'-0.015em', color: WHITE },
      h6: { fontFamily: fontPrimary, fontSize:'0.95rem', fontWeight:500, letterSpacing:'-0.01em',  color: WHITE },
      body1:    { fontSize:'0.9375rem', lineHeight:1.7,  color: GRAY1, letterSpacing:'-0.01em' },
      body2:    { fontSize:'0.875rem',  lineHeight:1.65, color: GRAY2, letterSpacing:'-0.005em' },
      subtitle1:{ fontSize:'0.9375rem', lineHeight:1.6,  color: GRAY2, fontWeight:400 },
      subtitle2:{ fontSize:'0.8125rem', lineHeight:1.5,  color: GRAY3, fontWeight:400 },
      caption:  { fontFamily:'"Geist Mono",monospace', fontSize:'0.75rem', letterSpacing:'0.02em', color: GRAY2, textTransform:'uppercase' },
      overline: { fontFamily:'"Geist Mono",monospace', fontSize:'0.6875rem', letterSpacing:'0.10em', color: GRAY2, textTransform:'uppercase' },
      mono: { fontFamily:'"Geist Mono",monospace', fontSize:'0.875rem', color: GRAY1, letterSpacing:'0.01em' },
    },

    shape: { borderRadius: 8 },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background: BLACK,
            color: GRAY1,
            backgroundImage: `radial-gradient(ellipse 70% 40% at 50% -10%, rgba(59,130,246,0.10) 0%, transparent 65%)`,
            backgroundAttachment: 'fixed',
            minHeight: '100vh',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            scrollbarWidth: 'thin',
            scrollbarColor: `${BORDER2} transparent`,
          },
          '::selection': { background: 'rgba(59,130,246,0.25)', color: WHITE },
          '::-webkit-scrollbar':       { width: '4px' },
          '::-webkit-scrollbar-track': { background: 'transparent' },
          '::-webkit-scrollbar-thumb': { background: BORDER2, borderRadius: '2px' },
          '::-webkit-scrollbar-thumb:hover': { background: '#404040' },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: 12,
            boxShadow: 'none',
            backgroundImage: 'none',
            transition: 'border-color 0.2s ease',
            '&:hover': { borderColor: BORDER2 },
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            fontFamily: fontPrimary,
            fontWeight: 500,
            fontSize: '0.875rem',
            letterSpacing: '-0.01em',
            textTransform: 'none',
            borderRadius: 8,
            transition: 'all 0.15s ease',
          },
          containedPrimary: {
            background: ACCENT,
            color: WHITE,
            boxShadow: 'none',
            '&:hover': {
              background: ACCENT2,
              boxShadow: `0 0 0 1px ${ACCENT2}`,
            },
          },
          outlinedPrimary: {
            borderColor: BORDER2,
            color: GRAY1,
            '&:hover': { borderColor: '#555', background: 'rgba(255,255,255,0.04)' },
          },
          outlinedSecondary: {
            borderColor: BORDER,
            color: GRAY3,
            '&:hover': { borderColor: BORDER2, color: GRAY2, background: 'transparent' },
          },
          text: {
            color: GRAY2,
            '&:hover': { color: GRAY1, background: 'rgba(255,255,255,0.04)' },
          },
        },
      },

      MuiTextField: {
        defaultProps: { variant: 'outlined' },
        styleOverrides: {
          root: {
            '& .MuiInputBase-root': {
              fontFamily: fontPrimary,
              fontSize: '0.9375rem',
              color: GRAY1,
              background: '#0f0f0f',
              borderRadius: 8,
            },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: BORDER },
            '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: BORDER2 },
            '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: ACCENT, borderWidth: '1px',
            },
            '& .MuiInputLabel-root': {
              fontFamily: fontPrimary,
              fontSize: '0.875rem',
              color: GRAY3,
              '&.Mui-focused': { color: ACCENT },
            },
            '& .MuiInputBase-input::placeholder': { color: GRAY3, opacity: 1 },
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: {
            fontFamily: fontPrimary,
            fontSize: '0.75rem',
            fontWeight: 500,
            letterSpacing: '0.01em',
            background: GRAY4,
            color: GRAY2,
            border: `1px solid ${BORDER}`,
            borderRadius: 4,
            height: 26,

            '&:hover': { background: '#333', borderColor: BORDER2 },
          },
          colorPrimary: {
            background: 'rgba(59,130,246,0.10)',
            color: ACCENT2,
            borderColor: 'rgba(59,130,246,0.25)',
          },
          colorSuccess: {
            background: 'rgba(34,197,94,0.10)',
            color: '#4ade80',
            borderColor: 'rgba(34,197,94,0.25)',
          },
          colorError: {
            background: 'rgba(239,68,68,0.10)',
            color: '#f87171',
            borderColor: 'rgba(239,68,68,0.25)',
          },
          colorWarning: {
            background: 'rgba(245,158,11,0.10)',
            color: '#fbbf24',
            borderColor: 'rgba(245,158,11,0.25)',
          },
        },
      },

      MuiDivider: {
        styleOverrides: { root: { borderColor: BORDER } },
      },

      MuiAppBar: {
        styleOverrides: {
          root: {
            background: 'rgba(0,0,0,0.80)',
            backdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${BORDER}`,
            boxShadow: 'none',
            backgroundImage: 'none',
          },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: {
            background: '#111',
            border: `1px solid ${BORDER2}`,
            borderRadius: 12,
            boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
            backgroundImage: 'none',
          },
        },
      },

      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontFamily: fontPrimary,
            fontSize: '0.75rem',
            background: '#1a1a1a',
            border: `1px solid ${BORDER2}`,
            borderRadius: 6,
            color: GRAY1,
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          },
          arrow: { color: '#1a1a1a' },
        },
      },

      MuiLinearProgress: {
        styleOverrides: {
          root: { background: BORDER, borderRadius: 2 },
          bar:  { background: ACCENT, borderRadius: 2 },
        },
      },

      MuiTable: {
        styleOverrides: {
          root: { borderCollapse: 'separate', borderSpacing: 0 },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: { '& th': { background: '#0d0d0d', borderBottom: `1px solid ${BORDER}` } },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            fontFamily: fontPrimary,
            fontSize: '0.875rem',
            borderBottom: `1px solid ${BORDER}`,
            color: GRAY2,
            padding: '10px 16px',
          },
          head: {
            fontFamily: '"Geist Mono", monospace',
            fontSize: '0.6875rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: GRAY3,
            fontWeight: 500,
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover td': { background: 'rgba(255,255,255,0.02)', color: GRAY1 },
            transition: 'background 0.1s ease',
          },
        },
      },

      MuiTab: {
        styleOverrides: {
          root: {
            fontFamily: fontPrimary,
            fontSize: '0.875rem',
            fontWeight: 400,
            letterSpacing: '-0.01em',
            textTransform: 'none',
            color: GRAY3,
            minHeight: 40,
            padding: '8px 16px',
            '&.Mui-selected': { color: WHITE, fontWeight: 500 },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: { background: WHITE, height: 1 },
          root: { borderBottom: `1px solid ${BORDER}` },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            color: GRAY3,
            borderRadius: 8,
            '&:hover': { color: GRAY1, background: 'rgba(255,255,255,0.06)' },
          },
        },
      },

      MuiAvatar: {
        styleOverrides: {
          root: {
            fontFamily: fontPrimary,
            fontWeight: 600,
            background: GRAY4,
            color: GRAY1,
            borderRadius: 4,
            fontSize: '0.875rem',
          },
        },
      },

      MuiSelect: {
        styleOverrides: {
          root: { fontFamily: fontPrimary, fontSize: '0.9375rem', color: GRAY1 },
          icon: { color: GRAY3 },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontFamily: fontPrimary,
            fontSize: '0.875rem',
            color: GRAY2,
            '&:hover': { background: 'rgba(255,255,255,0.05)', color: GRAY1 },
            '&.Mui-selected': { background: 'rgba(59,130,246,0.10)', color: WHITE },
          },
        },
      },
    },
  });
};


export default getTheme();
