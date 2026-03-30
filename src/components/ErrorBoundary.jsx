import { Component } from 'react';
import { Box, Typography, Button } from '@mui/material';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import { log } from '../lib/logger';

export class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error:null, info:null }; }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    log.error('ErrorBoundary', 'Uncaught render error', error);
    console.error('Component stack:', info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <Box sx={{
        minHeight:'100vh', display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        background: '#000000', p: 4, textAlign: 'center',
      }}>
        <BugReportOutlinedIcon sx={{ fontSize: 40, color: '#262626', mb: 2 }} />
        <Typography variant="h4" sx={{ mb: 1.5, color: '#ededed', fontFamily: '"Geist", sans-serif' }}>
          Unexpected Cosmic Shift
        </Typography>
        <Typography sx={{
          fontFamily: '"Geist", sans-serif',
          fontSize: '0.875rem',
          color: '#6b6b6b',
          maxWidth: 460,
          mb: 1,
          lineHeight: 1.7,
        }}>
          {this.state.error?.message || 'A calculation error occurred in the celestial engine.'}
        </Typography>
        <Typography sx={{
          fontFamily: '"Geist Mono", monospace',
          fontSize: '0.75rem',
          color: '#4b4b4b',
          mb: 3,
          letterSpacing: '0.02em',
        }}>
          Technical details have been logged to the console (F12)
        </Typography>
        <Button 
          variant="outlined" 
          color="primary"
          sx={{ 
            fontFamily: '"Geist", sans-serif', 
            letterSpacing: '-0.01em',
            textTransform: 'none'
          }}
          onClick={() => { this.setState({ error:null }); window.location.href='/'; }}>
          Return to Dashboard
        </Button>
      </Box>
    );
  }
}
