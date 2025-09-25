const express = require('express');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { protect, authorize } = require('../middleware/auth');
const { validateUserUpdate, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// @desc    Get all users (Admin and Faculty only)
// @route   GET /api/users
// @access  Private (Admin/Faculty)
router.get('/', authorize('admin', 'faculty'), async (req, res, next) => {
  try {
    const { role, department, page = 1, limit = 10, search } = req.query;

    let filter = {};

    // Role filter
    if (role) {
      filter.role = role;
    }

    // Department filter
    if (department) {
      filter.department = department;
    }

    // Faculty can only see users from their department
    if (req.user.role === 'faculty') {
      filter.department = req.user.department;
    }

    // Search filter
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: users
    });

  } catch (error) {
    console.error('Get users error:', error);
    next(error);
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', validateObjectId('id'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check permissions
    const canView = 
      req.user.role === 'admin' ||
      req.user._id.toString() === req.params.id ||
      (req.user.role === 'faculty' && user.department === req.user.department);

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this user'
      });
    }

    // Get user's activity summary if viewing a student
    let activitySummary = null;
    if (user.role === 'student') {
      activitySummary = await Activity.aggregate([
        { $match: { student: user._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalCredits: { $sum: '$credits' }
          }
        }
      ]);
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        activitySummary
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    next(error);
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
router.put('/:id', validateObjectId('id'), validateUserUpdate, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check permissions
    const canUpdate = 
      req.user.role === 'admin' ||
      req.user._id.toString() === req.params.id;

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }

    // Prevent role changes unless admin
    if (req.body.role && req.user.role !== 'admin') {
      delete req.body.role;
    }

    // Prevent status changes unless admin
    if (req.body.isActive !== undefined && req.user.role !== 'admin') {
      delete req.body.isActive;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('Update user error:', error);
    next(error);
  }
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
router.delete('/:id', authorize('admin'), validateObjectId('id'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Cannot delete self
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Soft delete by deactivating instead of hard delete
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    next(error);
  }
});

// @desc    Get students by department
// @route   GET /api/users/students/:department
// @access  Private (Faculty/Admin)
router.get('/students/:department', authorize('faculty', 'admin'), async (req, res, next) => {
  try {
    const { department } = req.params;

    // Faculty can only view their own department
    if (req.user.role === 'faculty' && req.user.department !== department) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view students from other departments'
      });
    }

    const students = await User.find({
      role: 'student',
      department,
      isActive: true
    })
    .select('-password')
    .sort({ year: 1, semester: 1, lastName: 1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });

  } catch (error) {
    console.error('Get students by department error:', error);
    next(error);
  }
});

// @desc    Get faculty members
// @route   GET /api/users/faculty
// @access  Private (Admin only)
router.get('/faculty/all', authorize('admin'), async (req, res, next) => {
  try {
    const faculty = await User.find({
      role: 'faculty',
      isActive: true
    })
    .select('-password')
    .sort({ department: 1, lastName: 1 });

    res.status(200).json({
      success: true,
      count: faculty.length,
      data: faculty
    });

  } catch (error) {
    console.error('Get faculty error:', error);
    next(error);
  }
});

// @desc    Update user status (Admin only)
// @route   PATCH /api/users/:id/status
// @access  Private (Admin)
router.patch('/:id/status', authorize('admin'), validateObjectId('id'), async (req, res, next) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean value'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Cannot deactivate self
    if (req.user._id.toString() === req.params.id && !isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: user._id,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    next(error);
  }
});

// @desc    Get user dashboard data
// @route   GET /api/users/dashboard/data
// @access  Private
router.get('/dashboard/data', async (req, res, next) => {
  try {
    let dashboardData = {};

    if (req.user.role === 'student') {
      // Student dashboard data
      const activities = await Activity.find({ student: req.user._id });
      
      const stats = {
        totalActivities: activities.length,
        approvedActivities: activities.filter(a => a.status === 'approved').length,
        pendingActivities: activities.filter(a => a.status === 'pending').length,
        rejectedActivities: activities.filter(a => a.status === 'rejected').length,
        totalCredits: activities.reduce((sum, a) => sum + (a.credits || 0), 0)
      };

      const recentActivities = await Activity.find({ student: req.user._id })
        .populate('approvedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(5);

      dashboardData = {
        stats,
        recentActivities,
        user: req.user
      };

    } else if (req.user.role === 'faculty') {
      // Faculty dashboard data
      const departmentStudents = await User.find({ 
        department: req.user.department, 
        role: 'student',
        isActive: true 
      });

      const pendingApprovals = await Activity.find({
        student: { $in: departmentStudents.map(s => s._id) },
        status: 'pending'
      }).populate('student', 'firstName lastName studentId');

      const recentlyApproved = await Activity.find({
        approvedBy: req.user._id,
        status: { $in: ['approved', 'rejected'] }
      })
      .populate('student', 'firstName lastName studentId')
      .sort({ approvalDate: -1 })
      .limit(5);

      dashboardData = {
        stats: {
          totalStudents: departmentStudents.length,
          pendingApprovals: pendingApprovals.length,
          recentlyApproved: recentlyApproved.length
        },
        pendingApprovals: pendingApprovals.slice(0, 10),
        recentlyApproved,
        user: req.user
      };

    } else if (req.user.role === 'admin') {
      // Admin dashboard data
      const totalUsers = await User.countDocuments({ isActive: true });
      const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
      const totalFaculty = await User.countDocuments({ role: 'faculty', isActive: true });
      const totalActivities = await Activity.countDocuments();
      const pendingActivities = await Activity.countDocuments({ status: 'pending' });

      dashboardData = {
        stats: {
          totalUsers,
          totalStudents,
          totalFaculty,
          totalActivities,
          pendingActivities
        },
        user: req.user
      };
    }

    res.status(200).json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Get dashboard data error:', error);
    next(error);
  }
});

module.exports = router;
