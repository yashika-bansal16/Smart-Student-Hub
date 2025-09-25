import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { ArrowBack, Construction } from '@mui/icons-material';

const EditActivity = () => {
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Construction sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h5" sx={{ mb: 2 }}>
        Edit Activity - Coming Soon
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        This feature is currently under development.
      </Typography>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => window.history.back()}
      >
        Go Back
      </Button>
    </Box>
  );
};

export default EditActivity;
