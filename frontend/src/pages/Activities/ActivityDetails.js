import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Grid,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  CheckCircle,
  Pending,
  Cancel,
  Assignment,
  Download,
  LocationOn,
  CalendarToday,
  Person
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';
import { activitiesAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const ActivityDetails = () => {
  const { id } = useParams();
  const { user, hasRole } = useAuth();

  const { data: activityData, isLoading } = useQuery(
    ['activity', id],
    () => activitiesAPI.getActivityById(id),
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    }
  );

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading activity details..." />;
  }

  const activity = activityData?.data?.data;

  if (!activity) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6">Activity not found</Typography>
        <Button onClick={() => window.history.back()} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle color="success" />;
      case 'pending': return <Pending color="warning" />;
      case 'rejected': return <Cancel color="error" />;
      default: return <Assignment />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const formatCategoryName = (category) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => window.history.back()}
          sx={{ textTransform: 'none' }}
        >
          Back
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 600, flexGrow: 1 }}>
          Activity Details
        </Typography>
        {hasRole('student') && activity.student?._id === user.id && activity.status !== 'approved' && (
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => window.location.href = `/activities/${id}/edit`}
          >
            Edit Activity
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              {/* Title and Status */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  {getStatusIcon(activity.status)}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {activity.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      label={activity.status.toUpperCase()}
                      color={getStatusColor(activity.status)}
                      variant="filled"
                    />
                    <Chip
                      label={formatCategoryName(activity.category)}
                      variant="outlined"
                      color="primary"
                    />
                  </Box>
                  <Typography variant="h6" color="text.secondary">
                    {activity.organizer}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Description */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Description
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                  {activity.description}
                </Typography>
              </Box>

              {/* Learning Outcomes */}
              {activity.learningOutcomes && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Learning Outcomes
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    {activity.learningOutcomes}
                  </Typography>
                </Box>
              )}

              {/* Skills Gained */}
              {activity.skillsGained && activity.skillsGained.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Skills Gained
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {activity.skillsGained.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Documents */}
              {activity.documents && activity.documents.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Supporting Documents
                  </Typography>
                  <List>
                    {activity.documents.map((doc, index) => (
                      <ListItem 
                        key={index} 
                        sx={{ 
                          px: 0,
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1,
                          mb: 1,
                          '&:last-child': { mb: 0 }
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {doc.name}
                              </Typography>
                              {doc.fileType === 'pdf' && (
                                <Chip label="PDF" size="small" color="error" variant="outlined" />
                              )}
                              {doc.fileType === 'image' && (
                                <Chip label="Image" size="small" color="primary" variant="outlined" />
                              )}
                              {doc.fileType === 'document' && (
                                <Chip label="Document" size="small" color="secondary" variant="outlined" />
                              )}
                            </Box>
                          }
                          secondary={`Uploaded on ${new Date(doc.uploadDate || activity.createdAt).toLocaleDateString()}`}
                        />
                        <Button
                          startIcon={<Download />}
                          onClick={() => window.open(doc.url, '_blank')}
                          size="small"
                          variant="outlined"
                        >
                          View
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                  
                  {activity.status === 'approved' && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                      <Typography variant="body2" color="success.dark" sx={{ fontWeight: 500 }}>
                        ✓ Documents verified by faculty
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Activity Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Activity Information
              </Typography>
              
              <List sx={{ p: 0 }}>
                <ListItem sx={{ px: 0 }}>
                  <CalendarToday sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText
                    primary="Duration"
                    secondary={`${new Date(activity.startDate).toLocaleDateString()} - ${new Date(activity.endDate).toLocaleDateString()}`}
                  />
                </ListItem>

                {activity.location && (
                  <ListItem sx={{ px: 0 }}>
                    <LocationOn sx={{ mr: 2, color: 'text.secondary' }} />
                    <ListItemText
                      primary="Location"
                      secondary={activity.location}
                    />
                  </ListItem>
                )}

                <ListItem sx={{ px: 0 }}>
                  <Assignment sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText
                    primary="Mode"
                    secondary={activity.mode?.charAt(0).toUpperCase() + activity.mode?.slice(1)}
                  />
                </ListItem>

                {activity.credits > 0 && (
                  <ListItem sx={{ px: 0 }}>
                    <CheckCircle sx={{ mr: 2, color: 'text.secondary' }} />
                    <ListItemText
                      primary="Credits"
                      secondary={`${activity.credits} credits`}
                    />
                  </ListItem>
                )}

                {activity.score && (
                  <ListItem sx={{ px: 0 }}>
                    <CheckCircle sx={{ mr: 2, color: 'text.secondary' }} />
                    <ListItemText
                      primary="Score"
                      secondary={`${activity.score}%`}
                    />
                  </ListItem>
                )}

                {activity.grade && (
                  <ListItem sx={{ px: 0 }}>
                    <CheckCircle sx={{ mr: 2, color: 'text.secondary' }} />
                    <ListItemText
                      primary="Grade"
                      secondary={activity.grade}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>

          {/* Student Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Student Information
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {activity.student?.firstName} {activity.student?.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activity.student?.studentId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activity.student?.department} - Year {activity.student?.year}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Approval Info */}
          {activity.approvedBy && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Approval Information
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <CheckCircle />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {activity.approvedBy?.firstName} {activity.approvedBy?.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activity.approvedBy?.designation || activity.approvedBy?.role}
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  Approved on {new Date(activity.approvalDate).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Rejection Info */}
          {activity.status === 'rejected' && activity.rejectionReason && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'error.main' }}>
                  Rejection Reason
                </Typography>
                <Typography variant="body2">
                  {activity.rejectionReason}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ActivityDetails;
