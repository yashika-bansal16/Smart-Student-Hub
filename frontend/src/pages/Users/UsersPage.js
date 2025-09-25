import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { People, Construction } from '@mui/icons-material';

const UsersPage = () => {
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <People sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h5" sx={{ mb: 2 }}>
        User Management - Coming Soon
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        User management interface is currently under development.
      </Typography>
    </Box>
  );
};

export default UsersPage;
