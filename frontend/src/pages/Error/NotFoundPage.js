import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { Home, Error } from '@mui/icons-material';

const NotFoundPage = () => {
  return (
    <Box 
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        textAlign: 'center',
        px: 2
      }}
    >
      <Error sx={{ fontSize: 120, color: 'error.main', mb: 2 }} />
      <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
        404
      </Typography>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
        The page you're looking for doesn't exist or has been moved to another location.
      </Typography>
      <Button
        variant="contained"
        startIcon={<Home />}
        onClick={() => window.location.href = '/'}
        size="large"
      >
        Go Home
      </Button>
    </Box>
  );
};

export default NotFoundPage;
