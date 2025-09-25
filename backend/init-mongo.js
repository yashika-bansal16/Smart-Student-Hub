// MongoDB initialization script for Docker
db = db.getSiblingDB('student-hub');

// Create collections
db.createCollection('users');
db.createCollection('activities');
db.createCollection('reports');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ studentId: 1 }, { unique: true, sparse: true });
db.users.createIndex({ employeeId: 1 }, { unique: true, sparse: true });
db.users.createIndex({ role: 1, department: 1 });

db.activities.createIndex({ student: 1, status: 1 });
db.activities.createIndex({ category: 1, status: 1 });
db.activities.createIndex({ startDate: -1 });
db.activities.createIndex({ approvedBy: 1 });
db.activities.createIndex({ tags: 1 });

db.reports.createIndex({ generatedBy: 1, createdAt: -1 });
db.reports.createIndex({ type: 1, purpose: 1 });
db.reports.createIndex({ 'scope.academicYear': 1, 'scope.departments': 1 });
db.reports.createIndex({ status: 1 });

// Create demo users
const bcrypt = require('bcryptjs');

// Note: In a real deployment, you would hash these passwords properly
const demoUsers = [
  {
    firstName: 'John',
    lastName: 'Student',
    email: 'student@demo.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj5gYjFy3Oqm', // password123
    role: 'student',
    department: 'Computer Science',
    year: 3,
    semester: 6,
    studentId: 'CS2021001',
    isActive: true,
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    firstName: 'Dr. Sarah',
    lastName: 'Faculty',
    email: 'faculty@demo.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj5gYjFy3Oqm', // password123
    role: 'faculty',
    department: 'Computer Science',
    designation: 'Associate Professor',
    employeeId: 'EMP2020001',
    isActive: true,
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@demo.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj5gYjFy3Oqm', // password123
    role: 'admin',
    department: 'Administration',
    employeeId: 'ADMIN001',
    isActive: true,
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Insert demo users
try {
  db.users.insertMany(demoUsers);
  print('Demo users created successfully');
} catch (error) {
  print('Error creating demo users:', error);
}

// Create demo activities for the student
const studentUser = db.users.findOne({ email: 'student@demo.com' });

if (studentUser) {
  const demoActivities = [
    {
      title: 'International Conference on AI',
      description: 'Presented research paper on Machine Learning applications in healthcare',
      category: 'conference',
      student: studentUser._id,
      organizer: 'IEEE Computer Society',
      location: 'New York, USA',
      mode: 'offline',
      startDate: new Date('2023-09-15'),
      endDate: new Date('2023-09-17'),
      credits: 3,
      score: 85,
      status: 'approved',
      isPublic: true,
      skillsGained: ['Machine Learning', 'Research', 'Public Speaking'],
      learningOutcomes: 'Gained insights into latest AI trends and networking with industry experts',
      verificationCode: 'ACT1694764800001',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Summer Internship at TechCorp',
      description: 'Worked as a software development intern focusing on web applications',
      category: 'internship',
      student: studentUser._id,
      organizer: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      mode: 'offline',
      startDate: new Date('2023-06-01'),
      endDate: new Date('2023-08-31'),
      credits: 4,
      score: 92,
      status: 'approved',
      isPublic: true,
      skillsGained: ['React.js', 'Node.js', 'MongoDB', 'Agile Development'],
      learningOutcomes: 'Developed full-stack web development skills and gained industry experience',
      verificationCode: 'ACT1685577600002',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Blockchain Workshop',
      description: 'Attended 3-day intensive workshop on blockchain technology and smart contracts',
      category: 'workshop',
      student: studentUser._id,
      organizer: 'Blockchain Academy',
      location: 'Online',
      mode: 'online',
      startDate: new Date('2023-10-10'),
      endDate: new Date('2023-10-12'),
      credits: 2,
      status: 'pending',
      isPublic: false,
      skillsGained: ['Blockchain', 'Smart Contracts', 'Solidity'],
      learningOutcomes: 'Understanding of blockchain fundamentals and practical implementation',
      verificationCode: 'ACT1697068800003',
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  try {
    db.activities.insertMany(demoActivities);
    print('Demo activities created successfully');
  } catch (error) {
    print('Error creating demo activities:', error);
  }
}

print('Database initialization completed');
