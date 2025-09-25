const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map(err => ({
      field: err.param,
      message: err.msg,
      value: err.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: extractedErrors
    });
  }
  
  next();
};

// User validation rules
const validateUserRegistration = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
    
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
    
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
    
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
    
  body('role')
    .optional()
    .isIn(['student', 'faculty', 'admin'])
    .withMessage('Role must be student, faculty, or admin'),
    
  body('department')
    .if(body('role').isIn(['student', 'faculty']))
    .notEmpty()
    .withMessage('Department is required for students and faculty'),
    
  body('year')
    .if(body('role').equals('student'))
    .isInt({ min: 1, max: 4 })
    .withMessage('Year must be between 1 and 4'),
    
  body('semester')
    .if(body('role').equals('student'))
    .isInt({ min: 1, max: 8 })
    .withMessage('Semester must be between 1 and 8'),
    
  body('designation')
    .if(body('role').equals('faculty'))
    .notEmpty()
    .withMessage('Designation is required for faculty'),
    
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
    
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
    
  handleValidationErrors
];

const validateUserUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
    
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
    
  body('phone')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
    
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
    
  body('cgpa')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('CGPA must be between 0 and 10'),
    
  handleValidationErrors
];

// Activity validation rules
const validateActivityCreation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Activity title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
    
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Activity description is required')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
    
  body('category')
    .notEmpty()
    .withMessage('Activity category is required')
    .isIn([
      'academic', 'research', 'conference', 'workshop', 'certification',
      'internship', 'project', 'competition', 'volunteering',
      'extracurricular', 'leadership', 'publication', 'patent', 'award', 'other'
    ])
    .withMessage('Invalid activity category'),
    
  body('organizer')
    .trim()
    .notEmpty()
    .withMessage('Organizer/Institution name is required')
    .isLength({ max: 200 })
    .withMessage('Organizer name cannot exceed 200 characters'),
    
  body('startDate')
    .isISO8601()
    .withMessage('Please provide a valid start date'),
    
  body('endDate')
    .isISO8601()
    .withMessage('Please provide a valid end date')
    .custom((endDate, { req }) => {
      if (new Date(endDate) < new Date(req.body.startDate)) {
        throw new Error('End date must be after or equal to start date');
      }
      return true;
    }),
    
  body('mode')
    .optional()
    .isIn(['online', 'offline', 'hybrid'])
    .withMessage('Mode must be online, offline, or hybrid'),
    
  body('credits')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('Credits must be between 0 and 10'),
    
  body('score')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Score must be between 0 and 100'),
    
  handleValidationErrors
];

const validateActivityUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
    
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
    
  body('category')
    .optional()
    .isIn([
      'academic', 'research', 'conference', 'workshop', 'certification',
      'internship', 'project', 'competition', 'volunteering',
      'extracurricular', 'leadership', 'publication', 'patent', 'award', 'other'
    ])
    .withMessage('Invalid activity category'),
    
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid start date'),
    
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid end date'),
    
  body('credits')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('Credits must be between 0 and 10'),
    
  handleValidationErrors
];

const validateActivityApproval = [
  body('status')
    .notEmpty()
    .isIn(['approved', 'rejected'])
    .withMessage('Status must be either approved or rejected'),
    
  body('comments')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comments cannot exceed 500 characters'),
    
  body('rejectionReason')
    .if(body('status').equals('rejected'))
    .notEmpty()
    .withMessage('Rejection reason is required when rejecting an activity')
    .isLength({ max: 500 })
    .withMessage('Rejection reason cannot exceed 500 characters'),
    
  handleValidationErrors
];

// Report validation rules
const validateReportCreation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Report title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
    
  body('type')
    .notEmpty()
    .isIn([
      'student_portfolio', 'department_summary', 'accreditation_report',
      'activity_analysis', 'performance_report', 'compliance_report', 'custom_report'
    ])
    .withMessage('Invalid report type'),
    
  body('purpose')
    .notEmpty()
    .isIn(['NAAC', 'NIRF', 'AICTE', 'internal', 'external', 'research'])
    .withMessage('Invalid report purpose'),
    
  body('scope.academicYear')
    .notEmpty()
    .withMessage('Academic year is required')
    .matches(/^\d{4}-\d{4}$/)
    .withMessage('Academic year must be in format YYYY-YYYY'),
    
  body('scope.dateRange.startDate')
    .isISO8601()
    .withMessage('Please provide a valid start date'),
    
  body('scope.dateRange.endDate')
    .isISO8601()
    .withMessage('Please provide a valid end date')
    .custom((endDate, { req }) => {
      if (new Date(endDate) < new Date(req.body.scope.dateRange.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
    
  handleValidationErrors
];

// Parameter validation
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} ID format`),
  handleValidationErrors
];

// Query validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
    
  query('sort')
    .optional()
    .isIn(['createdAt', '-createdAt', 'title', '-title', 'status', '-status'])
    .withMessage('Invalid sort parameter'),
    
  handleValidationErrors
];

const validateActivityFilters = [
  query('category')
    .optional()
    .custom((value) => {
      if (!value || value === '') return true; // Allow empty strings
      return [
        'academic', 'research', 'conference', 'workshop', 'certification',
        'internship', 'project', 'competition', 'volunteering',
        'extracurricular', 'leadership', 'publication', 'patent', 'award', 'other'
      ].includes(value);
    })
    .withMessage('Invalid category filter'),
    
  query('status')
    .optional()
    .custom((value) => {
      if (!value || value === '') return true; // Allow empty strings
      return ['pending', 'approved', 'rejected', 'under_review'].includes(value);
    })
    .withMessage('Invalid status filter'),
    
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
    
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),
    
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateActivityCreation,
  validateActivityUpdate,
  validateActivityApproval,
  validateReportCreation,
  validateObjectId,
  validatePagination,
  validateActivityFilters
};
