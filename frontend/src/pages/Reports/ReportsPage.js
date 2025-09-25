import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { Assessment, Construction } from '@mui/icons-material';

const ReportsPage = () => {
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Assessment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h5" sx={{ mb: 2 }}>
        Reports Page - Coming Soon
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Reports and analytics interface is currently under development.
      </Typography>
    </Box>
  );
};

export default ReportsPage;
