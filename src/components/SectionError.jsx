import { Box, Typography, Button } from '@mui/material';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';

export function SectionError({ title = 'Could not load this section', detail, onRetry }) {
  return (
    <Box sx={{
      display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', gap:1.5, py:4, px:3,
      border: '1px dashed #262626',
      background: 'transparent',
      borderRadius: '8px',
    }}>
      <SyncProblemIcon sx={{ fontSize:30, color: '#6b6b6b' }} />
      <Typography sx={{
        fontFamily: '"Geist Mono", sans-serif',
        fontSize: '0.75rem',
        letterSpacing: '0.08em',
        color: '#6b6b6b',
        textTransform: 'uppercase',
      }}>
        {title}
      </Typography>
      {detail && (
        <Typography sx={{
          fontFamily: '"Geist", sans-serif',
          fontSize: '0.875rem',
          color: '#4b4b4b',
          textAlign: 'center',
          maxWidth: 320,
        }}>
          {detail}
        </Typography>
      )}
      {onRetry && (
        <Button size="small" variant="outlined"
          onClick={onRetry}
          sx={{
            mt: 1,
            fontFamily: '"Geist Mono", sans-serif',
            fontSize: '0.6875rem',
            letterSpacing: '0.05em',
            color: '#3b82f6',
            borderColor: 'rgba(59,130,246,0.2)',
            '&:hover': { borderColor: '#3b82f6', background: 'rgba(59,130,246,0.04)' },
          }}>
          Retry Sync
        </Button>
      )}
    </Box>
  );
}
