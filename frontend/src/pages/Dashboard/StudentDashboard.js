import React from 'react';
import { useQuery } from 'react-query';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Paper
} from '@mui/material';
import {
  Assignment,
  CheckCircle,
  Pending,
  Cancel,
  TrendingUp,
  Download,
  Add,
  School,
  EmojiEvents,
  AccessTime,
  Visibility
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { format, subMonths } from 'date-fns';

import { useAuth } from '../../contexts/AuthContext';
import { usersAPI, activitiesAPI, reportsAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const { user } = useAuth();

  // Fetch dashboard data
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery(
    ['studentDashboard', user?.id],
    () => usersAPI.getDashboardData(),
    {
      refetchOnWindowFocus: true,
      staleTime: 0, // Force fresh data
      cacheTime: 0, // Don't cache
      onError: (error) => {
        console.error('Dashboard API Error:', error);
        toast.error('Failed to load dashboard data');
      }
    }
  );

  // Fetch activity stats
  const { data: activityStats, isLoading: statsLoading, error: statsError } = useQuery(
    ['studentActivityStats', user?.id],
    () => activitiesAPI.getActivityStats(),
    {
      refetchOnWindowFocus: true,
      staleTime: 0, // Force fresh data
      cacheTime: 0, // Don't cache
      onError: (error) => {
        console.error('Stats API Error:', error);
        toast.error('Failed to load activity statistics');
      }
    }
  );

  const isLoading = dashboardLoading || statsLoading;

  const handleGeneratePortfolio = async () => {
    try {
      const response = await reportsAPI.generatePortfolio(user.id, {
        includeAll: false,
        template: 'standard'
      });

      toast.success('Portfolio generated successfully!');
      
      // Download the portfolio
      const link = document.createElement('a');
      link.href = response.data.downloadUrl;
      link.download = response.data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Portfolio generation error:', error);
      toast.error('Failed to generate portfolio');
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading dashboard..." />;
  }

  const stats = dashboardData?.data?.stats || {};
  const recentActivities = dashboardData?.data?.recentActivities || [];
  const categoryStats = activityStats?.data?.categoryBreakdown || [];

  // Debug logging
  console.log('Dashboard Debug:', {
    dashboardData: dashboardData?.data,
    recentActivities: recentActivities,
    recentActivitiesLength: recentActivities.length,
    stats: stats
  });

  // Prepare chart data
  const pieData = categoryStats.map(item => ({
    name: item._id,
    value: item.count,
    approved: item.approved
  }));

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];

  // Mock progress data for demonstration
  const progressData = [
    { month: 'Jan', activities: 2 },
    { month: 'Feb', activities: 4 },
    { month: 'Mar', activities: 3 },
    { month: 'Apr', activities: 6 },
    { month: 'May', activities: 5 },
    { month: 'Jun', activities: 8 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle />;
      case 'pending':
        return <Pending />;
      case 'rejected':
        return <Cancel />;
      default:
        return <Assignment />;
    }
  };

  const formatCategoryName = (category) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Welcome back, {user?.firstName}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's your activity overview and progress summary.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.totalActivities || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Activities
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <Assignment sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.approvedActivities || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Approved
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <CheckCircle sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.pendingActivities || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Pending
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <AccessTime sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #e91e63 0%, #f06292 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.totalCredits || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Credits
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <EmojiEvents sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Charts Section */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Activity Progress Over Time
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="activities" 
                      stroke="#667eea" 
                      strokeWidth={3}
                      dot={{ fill: '#667eea', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Activities by Category
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${formatCategoryName(name)} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  fullWidth
                  onClick={() => window.location.href = '/activities/new'}
                  sx={{ py: 1.5 }}
                >
                  Add New Activity
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  fullWidth
                  onClick={handleGeneratePortfolio}
                  sx={{ py: 1.5 }}
                >
                  Generate Portfolio
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<TrendingUp />}
                  fullWidth
                  onClick={() => window.location.href = '/reports'}
                  sx={{ py: 1.5 }}
                >
                  View Reports
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Activities
                </Typography>
                <Button
                  variant="text"
                  onClick={() => window.location.href = '/activities'}
                  sx={{ textTransform: 'none' }}
                >
                  View All
                </Button>
              </Box>
              
              {/* Debug Info - Temporary */}
              <Box sx={{ p: 2, bgcolor: 'warning.light', mb: 2, borderRadius: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Debug Info:
                </Typography>
                <Typography variant="caption" sx={{ display: 'block' }}>
                  Dashboard Loading: {dashboardLoading ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block' }}>
                  Dashboard Error: {dashboardError ? dashboardError.message : 'None'}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block' }}>
                  Recent Activities Count: {recentActivities.length}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block' }}>
                  Stats: {JSON.stringify(stats)}
                </Typography>
              </Box>

              {recentActivities.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <School sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No activities yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Start by adding your first activity!
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => window.location.href = '/activities/new'}
                  >
                    Add Activity
                  </Button>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {recentActivities.slice(0, 5).map((activity) => (
                    <ListItem
                      key={activity._id}
                      sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 2,
                        mb: 1,
                        '&:last-child': { mb: 0 }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: getStatusColor(activity.status) + '.main' }}>
                          {getStatusIcon(activity.status)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {activity.title}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              {activity.organizer}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                              {new Date(activity.startDate).toLocaleDateString()} - {new Date(activity.endDate).toLocaleDateString()}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Chip
                                label={activity.status.toUpperCase()}
                                size="small"
                                color={getStatusColor(activity.status)}
                                variant={activity.status === 'approved' ? 'filled' : 'outlined'}
                              />
                              {activity.credits && (
                                <Chip
                                  label={`${activity.credits} credits`}
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                />
                              )}
                              {activity.score && (
                                <Chip
                                  label={`${activity.score}%`}
                                  size="small"
                                  variant="outlined"
                                  color="success"
                                />
                              )}
                            </Box>
                            {activity.status === 'approved' && activity.approvedBy && (
                              <Typography variant="caption" color="success.main" sx={{ fontWeight: 500 }}>
                                ✓ Verified by {activity.approvedBy.firstName} {activity.approvedBy.lastName}
                              </Typography>
                            )}
                            {activity.status === 'rejected' && activity.rejectionReason && (
                              <Typography variant="caption" color="error.main">
                                ✗ {activity.rejectionReason}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <IconButton
                        onClick={() => window.location.href = `/activities/${activity._id}`}
                        sx={{ ml: 1 }}
                      >
                        <Visibility />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;
