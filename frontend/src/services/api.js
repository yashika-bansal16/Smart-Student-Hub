import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      Cookies.remove('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      // Forbidden
      toast.error('You do not have permission to perform this action');
    } else if (error.response?.status === 404) {
      // Not found
      console.error('Resource not found:', error.config.url);
    } else if (error.response?.status >= 500) {
      // Server error
      toast.error('Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  forgotPassword: (email) => api.post('/auth/forgot-password', email),
  resetPassword: (token, passwordData) => api.put(`/auth/reset-password/${token}`, passwordData),
};

// Users API
export const usersAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getStudentsByDepartment: (department) => api.get(`/users/students/${department}`),
  getFaculty: () => api.get('/users/faculty/all'),
  updateUserStatus: (id, status) => api.patch(`/users/${id}/status`, status),
  getDashboardData: () => api.get('/users/dashboard/data'),
};

// Activities API
export const activitiesAPI = {
  getActivities: (params) => api.get('/activities', { params }),
  getActivityById: (id) => api.get(`/activities/${id}`),
  createActivity: (activityData) => api.post('/activities', activityData),
  updateActivity: (id, activityData) => api.put(`/activities/${id}`, activityData),
  deleteActivity: (id) => api.delete(`/activities/${id}`),
  approveActivity: (id, approvalData) => api.patch(`/activities/${id}/approve`, approvalData),
  addComment: (id, comment) => api.post(`/activities/${id}/comments`, comment),
  getPendingApprovals: () => api.get('/activities/pending/approval'),
  getActivityStats: () => api.get('/activities/stats/summary'),
};

// Reports API
export const reportsAPI = {
  getReports: (params) => api.get('/reports', { params }),
  getReportById: (id) => api.get(`/reports/${id}`),
  generatePortfolio: (studentId, options) => api.post(`/reports/portfolio/${studentId}`, options),
  createReport: (reportData) => api.post('/reports', reportData),
  deleteReport: (id) => api.delete(`/reports/${id}`),
  downloadReport: (id) => api.get(`/reports/${id}/download`, { responseType: 'blob' }),
  shareReport: (id, shareData) => api.post(`/reports/${id}/share`, shareData),
  getDepartmentAnalytics: (params) => api.get('/reports/analytics/department', { params }),
};

// Upload API
export const uploadAPI = {
  uploadSingle: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    });
  },
  
  uploadMultiple: (files, onProgress) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    return api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    });
  },
  
  uploadProfileImage: (file, onProgress) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    
    return api.post('/upload/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    });
  },
  
  deleteFile: (filename) => api.delete(`/upload/files/${filename}`),
  getFileInfo: (filename) => api.get(`/upload/info/${filename}`),
};

// Utility functions
export const apiUtils = {
  // Handle file download
  downloadFile: async (url, filename) => {
    try {
      const response = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      return { success: true };
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
      return { success: false, error };
    }
  },

  // Format API error message
  getErrorMessage: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      if (Array.isArray(errors)) {
        return errors.map(err => err.message).join(', ');
      }
      return 'Validation errors occurred';
    }
    
    return error.message || 'An unexpected error occurred';
  },

  // Check if error is network related
  isNetworkError: (error) => {
    return !error.response && error.code !== 'ECONNABORTED';
  },

  // Retry API call
  retry: async (apiCall, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await apiCall();
      } catch (error) {
        if (i === maxRetries - 1 || !apiUtils.isNetworkError(error)) {
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  },

  // Build query string from object
  buildQueryString: (params) => {
    const query = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => query.append(key, item));
        } else {
          query.append(key, value);
        }
      }
    });
    
    return query.toString();
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Validate file type
  isValidFileType: (file, allowedTypes) => {
    return allowedTypes.includes(file.type);
  },

  // Validate file size
  isValidFileSize: (file, maxSize) => {
    return file.size <= maxSize;
  }
};

export default api;
