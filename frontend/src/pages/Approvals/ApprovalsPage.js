import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { CheckCircle, Construction } from '@mui/icons-material';

const ApprovalsPage = () => {
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <CheckCircle sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h5" sx={{ mb: 2 }}>
        Approvals Page - Coming Soon
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Faculty approval interface is currently under development.
      </Typography>
    </Box>
  );
};

export default ApprovalsPage;
