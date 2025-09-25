const express = require('express');
const Report = require('../models/Report');
const User = require('../models/User');
const Activity = require('../models/Activity');
const portfolioGenerator = require('../utils/portfolioGenerator');
const { protect, authorize } = require('../middleware/auth');
const { validateReportCreation, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// @desc    Generate student portfolio
// @route   POST /api/reports/portfolio/:studentId
// @access  Private
router.post('/portfolio/:studentId', validateObjectId('studentId'), async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { includeAll = false, template = 'standard' } = req.body;

    // Check permissions
    const canGenerate = 
      req.user.role === 'admin' ||
      req.user._id.toString() === studentId ||
      (req.user.role === 'faculty');

    if (!canGenerate) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to generate portfolio for this student'
      });
    }

    // Check if student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Faculty can only generate portfolios for students in their department
    if (req.user.role === 'faculty' && student.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Faculty can only generate portfolios for students in their department'
      });
    }

    // Generate portfolio
    const portfolioData = await portfolioGenerator.generateStudentPortfolio(studentId, {
      includeAll,
      template
    });

    // Create report record
    const report = await Report.create({
      title: `Student Portfolio - ${student.fullName}`,
      type: 'student_portfolio',
      purpose: 'internal',
      scope: {
        students: [studentId],
        departments: [student.department],
        academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        dateRange: {
          startDate: new Date(new Date().getFullYear(), 0, 1), // Start of current year
          endDate: new Date()
        }
      },
      generatedBy: req.user._id,
      file: {
        filename: portfolioData.filename,
        originalName: `${student.fullName}_Portfolio.pdf`,
        url: portfolioData.url,
        fileType: 'pdf',
        size: portfolioData.size
      },
      status: 'completed',
      template,
      statistics: {
        totalStudents: 1,
        totalActivities: portfolioData.activitiesCount
      }
    });

    res.status(200).json({
      success: true,
      message: 'Portfolio generated successfully',
      data: {
        report,
        downloadUrl: portfolioData.url,
        filename: portfolioData.filename
      }
    });

  } catch (error) {
    console.error('Portfolio generation error:', error);
    next(error);
  }
});

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      purpose, 
      status = 'completed',
      sort = '-createdAt' 
    } = req.query;

    let filter = {};

    // Role-based filtering
    if (req.user.role === 'student') {
      filter.$or = [
        { generatedBy: req.user._id },
        { 'scope.students': req.user._id },
        { isPublic: true }
      ];
    } else if (req.user.role === 'faculty') {
      filter.$or = [
        { generatedBy: req.user._id },
        { 'scope.departments': req.user.department },
        { accessLevel: { $in: ['faculty', 'public'] } }
      ];
    }
    // Admin can see all reports (no additional filter)

    // Apply query filters
    if (type) filter.type = type;
    if (purpose) filter.purpose = purpose;
    if (status) filter.status = status;

    const reports = await Report.find(filter)
      .populate('generatedBy', 'firstName lastName role')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Report.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: reports.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: reports
    });

  } catch (error) {
    console.error('Get reports error:', error);
    next(error);
  }
});

// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Private
router.get('/:id', validateObjectId('id'), async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('generatedBy', 'firstName lastName role')
      .populate('scope.students', 'firstName lastName studentId department')
      .populate('sharedWith.user', 'firstName lastName role');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check access permissions
    if (!report.hasAccess(req.user._id, 'view')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this report'
      });
    }

    res.status(200).json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Get report error:', error);
    next(error);
  }
});

// @desc    Download report file
// @route   GET /api/reports/:id/download
// @access  Private
router.get('/:id/download', validateObjectId('id'), async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check access permissions
    if (!report.hasAccess(req.user._id, 'download')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to download this report'
      });
    }

    if (!report.file || !report.file.url) {
      return res.status(404).json({
        success: false,
        message: 'Report file not found'
      });
    }

    // Redirect to file URL
    res.redirect(report.file.url);

  } catch (error) {
    console.error('Download report error:', error);
    next(error);
  }
});

// @desc    Create custom report
// @route   POST /api/reports
// @access  Private (Faculty/Admin)
router.post('/', authorize('faculty', 'admin'), validateReportCreation, async (req, res, next) => {
  try {
    const reportData = {
      ...req.body,
      generatedBy: req.user._id,
      status: 'generating'
    };

    const report = await Report.create(reportData);

    // Start report generation in background
    generateCustomReport(report._id).catch(error => {
      console.error('Background report generation error:', error);
      Report.findByIdAndUpdate(report._id, { 
        status: 'failed',
        'metadata.error': error.message 
      }).exec();
    });

    res.status(202).json({
      success: true,
      message: 'Report generation started',
      data: report
    });

  } catch (error) {
    console.error('Create report error:', error);
    next(error);
  }
});

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private
router.delete('/:id', validateObjectId('id'), async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check permissions
    const canDelete = 
      req.user.role === 'admin' ||
      report.generatedBy.toString() === req.user._id.toString();

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this report'
      });
    }

    await Report.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
    });

  } catch (error) {
    console.error('Delete report error:', error);
    next(error);
  }
});

// @desc    Share report
// @route   POST /api/reports/:id/share
// @access  Private
router.post('/:id/share', validateObjectId('id'), async (req, res, next) => {
  try {
    const { userId, permissions = 'view' } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check permissions
    if (!report.hasAccess(req.user._id, 'edit')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to share this report'
      });
    }

    // Check if target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Target user not found'
      });
    }

    await report.shareWith(userId, permissions);

    res.status(200).json({
      success: true,
      message: 'Report shared successfully'
    });

  } catch (error) {
    console.error('Share report error:', error);
    next(error);
  }
});

// @desc    Get department analytics
// @route   GET /api/reports/analytics/department
// @access  Private (Faculty/Admin)
router.get('/analytics/department', authorize('faculty', 'admin'), async (req, res, next) => {
  try {
    const { department = req.user.department, academicYear } = req.query;

    // Faculty can only view their department analytics
    if (req.user.role === 'faculty' && department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Faculty can only view analytics for their department'
      });
    }

    // Get department students
    const students = await User.find({
      role: 'student',
      department,
      isActive: true
    });

    const studentIds = students.map(s => s._id);

    // Build date filter for academic year
    let dateFilter = {};
    if (academicYear) {
      const [startYear, endYear] = academicYear.split('-');
      dateFilter = {
        startDate: {
          $gte: new Date(`${startYear}-01-01`),
          $lt: new Date(`${endYear}-12-31`)
        }
      };
    }

    // Get activities analytics
    const activitiesAnalytics = await Activity.aggregate([
      {
        $match: {
          student: { $in: studentIds },
          ...dateFilter
        }
      },
      {
        $group: {
          _id: '$category',
          totalActivities: { $sum: 1 },
          approvedActivities: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          totalCredits: { $sum: '$credits' },
          averageScore: { $avg: '$score' }
        }
      }
    ]);

    // Get student performance
    const studentPerformance = await Activity.aggregate([
      {
        $match: {
          student: { $in: studentIds },
          status: 'approved',
          ...dateFilter
        }
      },
      {
        $group: {
          _id: '$student',
          totalActivities: { $sum: 1 },
          totalCredits: { $sum: '$credits' },
          averageScore: { $avg: '$score' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'student'
        }
      },
      {
        $unwind: '$student'
      },
      {
        $project: {
          studentId: '$student.studentId',
          name: { $concat: ['$student.firstName', ' ', '$student.lastName'] },
          year: '$student.year',
          totalActivities: 1,
          totalCredits: 1,
          averageScore: { $round: ['$averageScore', 2] }
        }
      },
      {
        $sort: { totalCredits: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        department,
        academicYear: academicYear || 'All Years',
        totalStudents: students.length,
        activitiesAnalytics,
        studentPerformance,
        generatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Department analytics error:', error);
    next(error);
  }
});

// Background function to generate custom reports
async function generateCustomReport(reportId) {
  try {
    const report = await Report.findById(reportId)
      .populate('scope.students')
      .populate('generatedBy');

    if (!report) {
      throw new Error('Report not found');
    }

    // Generate report based on type
    let reportData;
    switch (report.type) {
      case 'department_summary':
        reportData = await generateDepartmentSummary(report);
        break;
      case 'accreditation_report':
        reportData = await generateAccreditationReport(report);
        break;
      case 'activity_analysis':
        reportData = await generateActivityAnalysis(report);
        break;
      default:
        throw new Error('Unsupported report type');
    }

    // Mark report as completed
    await report.markCompleted(reportData.file, reportData.statistics);

  } catch (error) {
    console.error('Custom report generation error:', error);
    throw error;
  }
}

// Helper functions for different report types
async function generateDepartmentSummary(report) {
  // Implementation for department summary report
  return {
    file: { filename: 'dept_summary.pdf', size: 1024 },
    statistics: { totalActivities: 100, totalStudents: 50 }
  };
}

async function generateAccreditationReport(report) {
  // Implementation for accreditation report
  return {
    file: { filename: 'accreditation.pdf', size: 2048 },
    statistics: { totalActivities: 200, totalStudents: 100 }
  };
}

async function generateActivityAnalysis(report) {
  // Implementation for activity analysis report
  return {
    file: { filename: 'activity_analysis.pdf', size: 1536 },
    statistics: { totalActivities: 150, totalStudents: 75 }
  };
}

module.exports = router;
