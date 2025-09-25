const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Activity title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Activity description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Activity Classification
  category: {
    type: String,
    required: [true, 'Activity category is required'],
    enum: [
      'academic',
      'research',
      'conference',
      'workshop',
      'certification',
      'internship',
      'project',
      'competition',
      'volunteering',
      'extracurricular',
      'leadership',
      'publication',
      'patent',
      'award',
      'other'
    ]
  },
  subCategory: {
    type: String,
    maxlength: [100, 'Sub-category cannot exceed 100 characters']
  },
  
  // Student and Approval
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student reference is required']
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Activity Details
  organizer: {
    type: String,
    required: [true, 'Organizer/Institution name is required'],
    maxlength: [200, 'Organizer name cannot exceed 200 characters']
  },
  location: {
    type: String,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  mode: {
    type: String,
    enum: ['online', 'offline', 'hybrid'],
    default: 'offline'
  },
  
  // Dates
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value >= this.startDate;
      },
      message: 'End date must be after or equal to start date'
    }
  },
  
  // Academic Value
  credits: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  grade: {
    type: String,
    maxlength: [10, 'Grade cannot exceed 10 characters']
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  
  // Documentation
  documents: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    public_id: String,
    uploadDate: {
      type: Date,
      default: Date.now
    },
    fileType: {
      type: String,
      enum: ['pdf', 'image', 'document'],
      required: true
    }
  }],
  
  // Skills and Learning Outcomes
  skillsGained: [{
    type: String,
    trim: true
  }],
  learningOutcomes: {
    type: String,
    maxlength: [500, 'Learning outcomes cannot exceed 500 characters']
  },
  
  // Approval Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'under_review'],
    default: 'pending'
  },
  approvalDate: Date,
  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },
  
  // Additional Information
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Metrics for Analytics
  duration: {
    type: Number, // in days
    default: function() {
      return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24)) + 1;
    }
  },
  impact: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  
  // Verification Details
  verificationCode: {
    type: String,
    unique: true,
    sparse: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Comments/Feedback
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
activitySchema.index({ student: 1, status: 1 });
activitySchema.index({ category: 1, status: 1 });
activitySchema.index({ startDate: -1 });
activitySchema.index({ approvedBy: 1 });
activitySchema.index({ tags: 1 });

// Virtual for activity duration in readable format
activitySchema.virtual('durationText').get(function() {
  if (this.duration === 1) return '1 day';
  return `${this.duration} days`;
});

// Pre-save middleware to generate verification code
activitySchema.pre('save', function(next) {
  if (!this.verificationCode) {
    this.verificationCode = `ACT${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }
  this.updatedAt = Date.now();
  next();
});

// Static method to get activities by status
activitySchema.statics.getByStatus = function(status) {
  return this.find({ status }).populate('student', 'firstName lastName studentId department');
};

// Static method to get activities for approval
activitySchema.statics.getPendingApprovals = function(facultyDepartment) {
  return this.find({ 
    status: 'pending' 
  }).populate({
    path: 'student',
    match: facultyDepartment ? { department: facultyDepartment } : {},
    select: 'firstName lastName studentId department year'
  });
};

// Static method to get student's activities summary
activitySchema.statics.getStudentSummary = function(studentId) {
  return this.aggregate([
    { $match: { student: mongoose.Types.ObjectId(studentId) } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        approved: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
        },
        totalCredits: { $sum: '$credits' }
      }
    }
  ]);
};

// Instance method to approve activity
activitySchema.methods.approve = function(approvedByUserId, comments) {
  this.status = 'approved';
  this.approvedBy = approvedByUserId;
  this.approvalDate = new Date();
  this.isVerified = true;
  
  if (comments) {
    this.comments.push({
      user: approvedByUserId,
      message: comments
    });
  }
  
  return this.save();
};

// Instance method to reject activity
activitySchema.methods.reject = function(rejectedByUserId, reason) {
  this.status = 'rejected';
  this.rejectionReason = reason;
  this.approvedBy = rejectedByUserId;
  this.approvalDate = new Date();
  
  this.comments.push({
    user: rejectedByUserId,
    message: `Activity rejected: ${reason}`
  });
  
  return this.save();
};

module.exports = mongoose.model('Activity', activitySchema);
