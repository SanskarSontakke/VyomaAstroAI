import { Box, Typography, Button } from '@mui/material';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';

export function EmptyState({ title, subtitle, actionLabel, onAction }) {
  return (
    <Box sx={{
      display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', gap:1.5, py:6, px:3,
      border: '1px dashed #1a1a1a',
      background: 'transparent',
      borderRadius: '8px',
    }}>
      <Icon sx={{ fontSize: 36, color: '#2e2e2e' }} />
      <Typography sx={{
        fontFamily: '"Geist", sans-serif',
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#6b6b6b',
      }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{
          fontFamily: '"Geist", sans-serif',
          fontSize: '0.875rem',
          color: '#4b4b4b',
          textAlign: 'center',
          maxWidth: 340,
          lineHeight: 1.65,
        }}>
          {subtitle}
        </Typography>
      )}
      {actionLabel && (
        <Button 
          variant="outlined" 
          size="small"
          onClick={onAction}
          sx={{ 
            mt: 0.5, 
            fontFamily: '"Geist", sans-serif',
            fontSize: '0.75rem',
            color: '#3b82f6',
            borderColor: '#1a2a3a',
            textTransform: 'none',
            '&:hover': { borderColor: '#3b82f6', background: 'rgba(59,130,246,0.04)' }
          }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
