const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

// Demo users data
const demoUsers = [
  {
    firstName: 'John',
    lastName: 'Student',
    email: 'student@demo.com',
    password: 'password123',
    role: 'student',
    department: 'Computer Science',
    year: 3,
    semester: 6,
    isActive: true,
    isVerified: true
  },
  {
    firstName: 'Dr. Sarah',
    lastName: 'Faculty',
    email: 'faculty@demo.com',
    password: 'password123',
    role: 'faculty',
    department: 'Computer Science',
    designation: 'Associate Professor',
    isActive: true,
    isVerified: true
  },
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@demo.com',
    password: 'password123',
    role: 'admin',
    department: 'Administration',
    isActive: true,
    isVerified: true
  }
];

// Seed function
const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create demo users
    for (const userData of demoUsers) {
      const user = await User.create(userData);
      
      // Generate student/employee ID
      if (user.role === 'student') {
        user.studentId = user.generateStudentId();
        await user.save();
      } else if (user.role === 'faculty') {
        user.employeeId = `EMP${Date.now()}`;
        await user.save();
      } else if (user.role === 'admin') {
        user.employeeId = `ADMIN${Date.now()}`;
        await user.save();
      }
      
      console.log(`Created ${user.role}: ${user.email}`);
    }

    console.log('\n✅ Demo users created successfully!');
    console.log('\n🔑 Login Credentials:');
    console.log('Student: student@demo.com / password123');
    console.log('Faculty: faculty@demo.com / password123');
    console.log('Admin: admin@demo.com / password123');

  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seed
const run = async () => {
  await connectDB();
  await seedUsers();
};

run();
