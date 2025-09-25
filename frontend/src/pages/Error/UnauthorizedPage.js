import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { Home, Block } from '@mui/icons-material';

const UnauthorizedPage = () => {
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
      <Block sx={{ fontSize: 120, color: 'error.main', mb: 2 }} />
      <Typography variant="h2" sx={{ fontWeight: 700, mb: 1 }}>
        403
      </Typography>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Access Denied
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
        You don't have permission to access this page. Please contact your administrator if you believe this is an error.
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

export default UnauthorizedPage;
