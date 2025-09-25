import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { Person, Construction } from '@mui/icons-material';

const ProfilePage = () => {
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Person sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h5" sx={{ mb: 2 }}>
        Profile Page - Coming Soon
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        User profile management is currently under development.
      </Typography>
    </Box>
  );
};

export default ProfilePage;
