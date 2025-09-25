const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  
  // Role-based access
  role: {
    type: String,
    enum: ['student', 'faculty', 'admin'],
    default: 'student'
  },
  
  // Student-specific fields
  studentId: {
    type: String,
    sparse: true,
    unique: true
  },
  rollNumber: {
    type: String,
    sparse: true
  },
  department: {
    type: String,
    required: function() { return this.role === 'student' || this.role === 'faculty'; }
  },
  year: {
    type: Number,
    min: 1,
    max: 4,
    required: function() { return this.role === 'student'; }
  },
  semester: {
    type: Number,
    min: 1,
    max: 8,
    required: function() { return this.role === 'student'; }
  },
  
  // Faculty-specific fields
  employeeId: {
    type: String,
    sparse: true,
    unique: true
  },
  designation: {
    type: String,
    required: function() { return this.role === 'faculty'; }
  },
  
  // Contact Information
  phone: {
    type: String,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'India' }
  },
  
  // Profile
  profileImage: {
    public_id: String,
    url: String
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  
  // Academic Information (for students)
  cgpa: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  totalCredits: {
    type: Number,
    default: 0
  },
  
  // Status and Verification
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Timestamps
  lastLogin: Date,
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

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for activities (populated)
userSchema.virtual('activities', {
  ref: 'Activity',
  localField: '_id',
  foreignField: 'student',
  justOne: false
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ studentId: 1 });
userSchema.index({ role: 1, department: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Pre-save middleware to update timestamps
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate student ID
userSchema.methods.generateStudentId = function() {
  const year = new Date().getFullYear().toString().slice(-2);
  const dept = this.department.substring(0, 3).toUpperCase();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${year}${dept}${random}`;
};

// Static method to get students by department
userSchema.statics.getStudentsByDepartment = function(department) {
  return this.find({ role: 'student', department, isActive: true });
};

// Static method to get faculty members
userSchema.statics.getFaculty = function() {
  return this.find({ role: 'faculty', isActive: true });
};

module.exports = mongoose.model('User', userSchema);
