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
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Paper,
  IconButton,
  Divider
} from '@mui/material';
import {
  People,
  Assignment,
  CheckCircle,
  Pending,
  School,
  TrendingUp,
  Visibility,
  Done,
  Close
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import { useAuth } from '../../contexts/AuthContext';
import { usersAPI, activitiesAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const FacultyDashboard = () => {
  const { user } = useAuth();

  // Fetch dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery(
    'facultyDashboard',
    () => usersAPI.getDashboardData(),
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    }
  );

  // Fetch pending approvals
  const { data: pendingApprovals, isLoading: approvalsLoading } = useQuery(
    'pendingApprovals',
    () => activitiesAPI.getPendingApprovals(),
    {
      refetchOnWindowFocus: false,
      staleTime: 2 * 60 * 1000,
    }
  );

  const isLoading = dashboardLoading || approvalsLoading;

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading faculty dashboard..." />;
  }

  const stats = dashboardData?.data?.stats || {};
  const recentlyApproved = dashboardData?.data?.recentlyApproved || [];
  const pendingActivities = pendingApprovals?.data?.data || [];

  // Mock data for charts
  const monthlyData = [
    { month: 'Jan', approved: 12, rejected: 2 },
    { month: 'Feb', approved: 15, rejected: 1 },
    { month: 'Mar', approved: 18, rejected: 3 },
    { month: 'Apr', approved: 22, rejected: 2 },
    { month: 'May', approved: 19, rejected: 1 },
    { month: 'Jun', approved: 25, rejected: 4 }
  ];

  const categoryData = [
    { name: 'Conference', value: 35, color: '#667eea' },
    { name: 'Workshop', value: 25, color: '#764ba2' },
    { name: 'Internship', value: 20, color: '#f093fb' },
    { name: 'Certification', value: 15, color: '#4facfe' },
    { name: 'Other', value: 5, color: '#43e97b' }
  ];

  const handleQuickApproval = async (activityId, status) => {
    try {
      await activitiesAPI.approveActivity(activityId, { status });
      // Refetch data
      window.location.reload();
    } catch (error) {
      console.error('Approval error:', error);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Welcome back, {user?.firstName}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage student activities and approvals for {user?.department} department.
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
                    {stats.totalStudents || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Students
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <People sx={{ fontSize: 28 }} />
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
                    {stats.pendingApprovals || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Pending Approvals
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <Pending sx={{ fontSize: 28 }} />
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
                    {stats.recentlyApproved || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    This Month
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
          <Card sx={{ background: 'linear-gradient(135deg, #e91e63 0%, #f06292 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {user?.department?.substring(0, 2) || 'CS'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Department
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <School sx={{ fontSize: 28 }} />
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
                Monthly Approval Trends
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="approved" fill="#4caf50" name="Approved" />
                    <Bar dataKey="rejected" fill="#f44336" name="Rejected" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Activity Categories
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Approvals */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Pending Approvals
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => window.location.href = '/approvals'}
                  sx={{ textTransform: 'none' }}
                >
                  View All
                </Button>
              </Box>
              
              {pendingActivities.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckCircle sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No pending approvals
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    All activities are up to date!
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {pendingActivities.slice(0, 5).map((activity) => (
                    <React.Fragment key={activity._id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'warning.main' }}>
                            <Assignment />
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
                              <Typography variant="body2" color="text.secondary">
                                {activity.student?.firstName} {activity.student?.lastName} - {activity.student?.studentId}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {activity.organizer} • {new Date(activity.startDate).toLocaleDateString()}
                              </Typography>
                            </Box>
                          }
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleQuickApproval(activity._id, 'approved')}
                          >
                            <Done />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleQuickApproval(activity._id, 'rejected')}
                          >
                            <Close />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => window.location.href = `/activities/${activity._id}`}
                          >
                            <Visibility />
                          </IconButton>
                        </Box>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              )}
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
                  startIcon={<Assignment />}
                  fullWidth
                  onClick={() => window.location.href = '/approvals'}
                  sx={{ py: 1.5 }}
                >
                  Review Activities
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<People />}
                  fullWidth
                  onClick={() => window.location.href = '/users'}
                  sx={{ py: 1.5 }}
                >
                  View Students
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<TrendingUp />}
                  fullWidth
                  onClick={() => window.location.href = '/reports'}
                  sx={{ py: 1.5 }}
                >
                  Generate Reports
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recently Approved */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Recently Approved Activities
              </Typography>
              
              {recentlyApproved.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Assignment sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No recent approvals
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {recentlyApproved.map((activity, index) => (
                    <React.Fragment key={activity._id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'success.main' }}>
                            <CheckCircle />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={activity.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {activity.student?.firstName} {activity.student?.lastName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Approved on {new Date(activity.approvalDate).toLocaleDateString()}
                              </Typography>
                            </Box>
                          }
                        />
                        <Chip
                          label="APPROVED"
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      </ListItem>
                      {index < recentlyApproved.length - 1 && <Divider />}
                    </React.Fragment>
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

export default FacultyDashboard;
