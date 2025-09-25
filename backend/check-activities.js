const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Activity = require('./models/Activity');

async function checkAndSeedActivities() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find demo student
    const demoStudent = await User.findOne({ email: 'student@demo.com' });
    if (!demoStudent) {
      console.log('❌ Demo student not found. Please run seed-demo-users.js first');
      return;
    }
    console.log('✅ Found demo student:', demoStudent.firstName, demoStudent.lastName);

    // Check existing activities
    const existingActivities = await Activity.find({ student: demoStudent._id });
    console.log('📊 Existing activities for demo student:', existingActivities.length);

    if (existingActivities.length > 0) {
      console.log('📋 Activities:');
      existingActivities.forEach((activity, index) => {
        console.log(`  ${index + 1}. ${activity.title} - Status: ${activity.status}`);
      });
    }

    // Find demo faculty for approval
    const demoFaculty = await User.findOne({ email: 'faculty@demo.com' });
    
    // Create some demo activities if less than 5 exist
    if (existingActivities.length < 5) {
      console.log('🌱 Creating demo activities...');
      
      const demoActivities = [
        {
          title: 'React.js Workshop',
          description: 'Attended a comprehensive React.js workshop covering hooks, state management, and best practices.',
          category: 'workshop',
          mode: 'online',
          organizer: 'Tech Academy',
          location: 'Online',
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-01-17'),
          credits: 2,
          skillsGained: ['React.js', 'JavaScript', 'Web Development'],
          student: demoStudent._id,
          status: 'approved',
          approvedBy: demoFaculty?._id,
          approvalDate: new Date('2024-01-20'),
          score: 85,
          documents: []
        },
        {
          title: 'Machine Learning Certification',
          description: 'Completed online certification course in Machine Learning fundamentals including supervised and unsupervised learning.',
          category: 'certification',
          mode: 'online',
          organizer: 'Coursera',
          location: 'Online',
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-02-28'),
          credits: 3,
          skillsGained: ['Machine Learning', 'Python', 'Data Science'],
          student: demoStudent._id,
          status: 'approved',
          approvedBy: demoFaculty?._id,
          approvalDate: new Date('2024-03-05'),
          score: 92,
          documents: []
        },
        {
          title: 'Hackathon Participation',
          description: 'Participated in 48-hour hackathon and developed a web application for student management.',
          category: 'competition',
          mode: 'offline',
          organizer: 'University Tech Club',
          location: 'Campus Auditorium',
          startDate: new Date('2024-03-10'),
          endDate: new Date('2024-03-12'),
          credits: 2,
          skillsGained: ['Problem Solving', 'Teamwork', 'Full Stack Development'],
          student: demoStudent._id,
          status: 'pending',
          documents: []
        },
        {
          title: 'Python Programming Conference',
          description: 'Attended Python programming conference with sessions on advanced Python concepts and frameworks.',
          category: 'conference',
          mode: 'offline',
          organizer: 'Python Community',
          location: 'Convention Center',
          startDate: new Date('2024-04-05'),
          endDate: new Date('2024-04-07'),
          credits: 3,
          skillsGained: ['Python', 'Django', 'Flask', 'API Development'],
          student: demoStudent._id,
          status: 'approved',
          approvedBy: demoFaculty?._id,
          approvalDate: new Date('2024-04-10'),
          score: 88,
          documents: []
        },
        {
          title: 'Internship at Tech Solutions',
          description: 'Summer internship focused on web development and database management.',
          category: 'internship',
          mode: 'offline',
          organizer: 'Tech Solutions Pvt Ltd',
          location: 'Tech Park, City',
          startDate: new Date('2024-05-01'),
          endDate: new Date('2024-07-31'),
          credits: 6,
          skillsGained: ['Web Development', 'Database Design', 'Project Management'],
          student: demoStudent._id,
          status: 'approved',
          approvedBy: demoFaculty?._id,
          approvalDate: new Date('2024-08-05'),
          score: 95,
          documents: []
        }
      ];

      await Activity.insertMany(demoActivities);
      console.log('✅ Created 5 demo activities');
    }

    // Final count
    const finalCount = await Activity.countDocuments({ student: demoStudent._id });
    console.log(`🎉 Total activities for demo student: ${finalCount}`);

    // Show activities by status
    const approved = await Activity.countDocuments({ student: demoStudent._id, status: 'approved' });
    const pending = await Activity.countDocuments({ student: demoStudent._id, status: 'pending' });
    const rejected = await Activity.countDocuments({ student: demoStudent._id, status: 'rejected' });

    console.log(`📊 Status breakdown:`);
    console.log(`   Approved: ${approved}`);
    console.log(`   Pending: ${pending}`);
    console.log(`   Rejected: ${rejected}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

checkAndSeedActivities();
