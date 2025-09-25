const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: {
      auth: '/api/auth',
      users: '/api/users',
      activities: '/api/activities',
      reports: '/api/reports',
      upload: '/api/upload'
    }
  });
};

module.exports = { notFound };
