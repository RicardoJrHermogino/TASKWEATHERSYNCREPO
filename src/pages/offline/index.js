import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Grid, Typography, Button, Container } from '@mui/material';
import SignalWifiOffIcon from '@mui/icons-material/SignalWifiOff';

// Offline Page Component
const OfflinePage = () => {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      router.push('/dashboard');
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [router]);

  return (
    <Container maxWidth="sm">
      <Grid 
        container 
        spacing={3} 
        direction="column" 
        alignItems="center" 
        justifyContent="center" 
        style={{ minHeight: '100vh', textAlign: 'center' }}
      >
        <Grid item>
          <SignalWifiOffIcon sx={{ fontSize: 100, color: '#e0e0e0' }} />
        </Grid>
        <Grid item>
          <Typography variant="h4" gutterBottom>
            No Internet Connection
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Please check your network connection and try again.
          </Typography>
        </Grid>
        <Grid item>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => {
              if (navigator.onLine) {
                router.push('/dashboard');
              }
            }}
            sx={{ 
              borderRadius: '24px',
              padding: '10px 20px'
            }}
          >
            Retry Connection
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OfflinePage;