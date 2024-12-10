import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <Container maxWidth="xs">
      <Paper 
        elevation={6} 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: 4,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)'
        }}
      >
        <ErrorOutlineIcon 
          sx={{ 
            fontSize: 100, 
            color: 'error.main', 
            marginBottom: 2 
          }} 
        />
        
        <Typography 
          variant="h4" 
          color="error" 
          gutterBottom
          sx={{ fontWeight: 'bold' }}
        >
          Something Went Wrong
        </Typography>
        
        <Typography 
          variant="subtitle1" 
          color="textSecondary" 
          paragraph
        >
          {error.message || 'An unexpected error occurred'}
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={resetErrorBoundary}
          sx={{ 
            marginTop: 2,
            textTransform: 'none',
            borderRadius: 4,
            padding: '10px 20px'
          }}
        >
          Retry
        </Button>
      </Paper>
    </Container>
  );
}

export default ErrorFallback;