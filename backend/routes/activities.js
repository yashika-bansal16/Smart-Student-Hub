const express = require('express');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { protect, authorize, checkOwnership, canApprove } = require('../middleware/auth');
const {
  validateActivityCreation,
  validateActivityUpdate,
  validateActivityApproval,
  validateObjectId,
  validatePagination,
  validateActivityFilters
} = require('../middleware/validation');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// @desc    Get all activities with filtering and pagination
// @route   GET /api/activities
// @access  Private
router.get('/', validatePagination, validateActivityFilters, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      category,
      status,
      student,
      department,
      startDate,
      endDate,
      search
    } = req.query;

    // Build filter object
    const filter = {};

    // Role-based filtering
    if (req.user.role === 'student') {
      filter.student = req.user._id;
    } else if (req.user.role === 'faculty') {
      // Faculty can see activities from their department or activities they need to approve
      const departmentStudents = await User.find({ 
        department: req.user.department, 
        role: 'student' 
      }).select('_id');
      
      filter.$or = [
        { student: { $in: departmentStudents.map(s => s._id) } },
        { approvedBy: req.user._id }
      ];
    }
    // Admin can see all activities (no additional filter)

    // Apply query filters
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (student) filter.student = student;
    
    // Date range filter
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
    }

    // Text search
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { organizer: { $regex: search, $options: 'i' } }
      ];
    }

    // Department filter for admin/faculty
    if (department && ['admin', 'faculty'].includes(req.user.role)) {
      const departmentStudents = await User.find({ 
        department, 
        role: 'student' 
      }).select('_id');
      filter.student = { $in: departmentStudents.map(s => s._id) };
    }

    // Execute query with pagination
    const activities = await Activity.find(filter)
      .populate('student', 'firstName lastName studentId department year')
      .populate('approvedBy', 'firstName lastName role')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const total = await Activity.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: activities.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: activities
    });

  } catch (error) {
    console.error('Get activities error:', error);
    next(error);
  }
});

// @desc    Get single activity
// @route   GET /api/activities/:id
// @access  Private
router.get('/:id', validateObjectId('id'), async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('student', 'firstName lastName studentId department year email phone')
      .populate('approvedBy', 'firstName lastName role designation')
      .populate('comments.user', 'firstName lastName role');

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Check access permissions
    const canAccess = 
      req.user.role === 'admin' ||
      (req.user.role === 'faculty' && activity.student.department === req.user.department) ||
      (req.user.role === 'student' && activity.student._id.toString() === req.user._id.toString());

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this activity'
      });
    }

    res.status(200).json({
      success: true,
      data: activity
    });

  } catch (error) {
    console.error('Get activity error:', error);
    next(error);
  }
});

// @desc    Create new activity
// @route   POST /api/activities
// @access  Private (Students only)
router.post('/', authorize('student'), validateActivityCreation, async (req, res, next) => {
  try {
    // Add student ID to the activity
    req.body.student = req.user._id;

    const activity = await Activity.create(req.body);

    // Populate the created activity
    const populatedActivity = await Activity.findById(activity._id)
      .populate('student', 'firstName lastName studentId department year');

    res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      data: populatedActivity
    });

  } catch (error) {
    console.error('Create activity error:', error);
    next(error);
  }
});

// @desc    Update activity
// @route   PUT /api/activities/:id
// @access  Private (Student owner only, unless approved)
router.put('/:id', validateObjectId('id'), validateActivityUpdate, async (req, res, next) => {
  try {
    let activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Check permissions
    const isOwner = activity.student.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this activity'
      });
    }

    // Students cannot edit approved activities
    if (isOwner && activity.status === 'approved' && req.user.role === 'student') {
      return res.status(403).json({
        success: false,
        message: 'Cannot edit approved activities'
      });
    }

    // Reset approval status if content is modified by student
    if (isOwner && ['approved', 'rejected'].includes(activity.status)) {
      req.body.status = 'pending';
      req.body.approvedBy = undefined;
      req.body.approvalDate = undefined;
      req.body.rejectionReason = undefined;
    }

    activity = await Activity.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('student', 'firstName lastName studentId department year');

    res.status(200).json({
      success: true,
      message: 'Activity updated successfully',
      data: activity
    });

  } catch (error) {
    console.error('Update activity error:', error);
    next(error);
  }
});

// @desc    Delete activity
// @route   DELETE /api/activities/:id
// @access  Private (Student owner or Admin only)
router.delete('/:id', validateObjectId('id'), async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Check permissions
    const isOwner = activity.student.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this activity'
      });
    }

    // Students cannot delete approved activities
    if (isOwner && activity.status === 'approved' && req.user.role === 'student') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete approved activities'
      });
    }

    await Activity.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Activity deleted successfully'
    });

  } catch (error) {
    console.error('Delete activity error:', error);
    next(error);
  }
});

// @desc    Approve or reject activity
// @route   PATCH /api/activities/:id/approve
// @access  Private (Faculty and Admin only)
router.patch('/:id/approve', validateObjectId('id'), canApprove, validateActivityApproval, async (req, res, next) => {
  try {
    const { status, comments, rejectionReason } = req.body;

    const activity = await Activity.findById(req.params.id)
      .populate('student', 'firstName lastName studentId department year email');

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    if (activity.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Activity is already ${activity.status}`
      });
    }

    // Faculty can only approve activities from their department
    if (req.user.role === 'faculty' && activity.student.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Faculty can only approve activities from their department'
      });
    }

    if (status === 'approved') {
      await activity.approve(req.user._id, comments);
    } else if (status === 'rejected') {
      await activity.reject(req.user._id, rejectionReason);
    }

    const updatedActivity = await Activity.findById(req.params.id)
      .populate('student', 'firstName lastName studentId department year')
      .populate('approvedBy', 'firstName lastName role designation');

    res.status(200).json({
      success: true,
      message: `Activity ${status} successfully`,
      data: updatedActivity
    });

  } catch (error) {
    console.error('Approve activity error:', error);
    next(error);
  }
});

// @desc    Add comment to activity
// @route   POST /api/activities/:id/comments
// @access  Private
router.post('/:id/comments', validateObjectId('id'), async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment message is required'
      });
    }

    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Check access permissions
    const canAccess = 
      req.user.role === 'admin' ||
      activity.student.toString() === req.user._id.toString() ||
      (req.user.role === 'faculty' && activity.student.department === req.user.department);

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to comment on this activity'
      });
    }

    activity.comments.push({
      user: req.user._id,
      message: message.trim()
    });

    await activity.save();

    const updatedActivity = await Activity.findById(req.params.id)
      .populate('comments.user', 'firstName lastName role');

    res.status(200).json({
      success: true,
      message: 'Comment added successfully',
      data: updatedActivity.comments
    });

  } catch (error) {
    console.error('Add comment error:', error);
    next(error);
  }
});

// @desc    Get activities pending approval
// @route   GET /api/activities/pending/approval
// @access  Private (Faculty and Admin only)
router.get('/pending/approval', authorize('faculty', 'admin'), async (req, res, next) => {
  try {
    let filter = { status: 'pending' };

    // Faculty can only see activities from their department
    if (req.user.role === 'faculty') {
      const departmentStudents = await User.find({ 
        department: req.user.department, 
        role: 'student' 
      }).select('_id');
      
      filter.student = { $in: departmentStudents.map(s => s._id) };
    }

    const activities = await Activity.find(filter)
      .populate('student', 'firstName lastName studentId department year email')
      .sort({ createdAt: 1 }); // Oldest first for FIFO approval

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities
    });

  } catch (error) {
    console.error('Get pending activities error:', error);
    next(error);
  }
});

// @desc    Get activity statistics
// @route   GET /api/activities/stats
// @access  Private
router.get('/stats/summary', async (req, res, next) => {
  try {
    let matchFilter = {};

    // Role-based filtering for stats
    if (req.user.role === 'student') {
      matchFilter.student = req.user._id;
    } else if (req.user.role === 'faculty') {
      const departmentStudents = await User.find({ 
        department: req.user.department, 
        role: 'student' 
      }).select('_id');
      
      matchFilter.student = { $in: departmentStudents.map(s => s._id) };
    }

    const stats = await Activity.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalActivities: { $sum: 1 },
          approvedActivities: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          pendingActivities: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          rejectedActivities: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          },
          totalCredits: { $sum: '$credits' },
          averageScore: { $avg: '$score' }
        }
      }
    ]);

    const categoryStats = await Activity.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: stats[0] || {
          totalActivities: 0,
          approvedActivities: 0,
          pendingActivities: 0,
          rejectedActivities: 0,
          totalCredits: 0,
          averageScore: 0
        },
        categoryBreakdown: categoryStats
      }
    });

  } catch (error) {
    console.error('Get activity stats error:', error);
    next(error);
  }
});

module.exports = router;
