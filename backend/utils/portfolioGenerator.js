const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Activity = require('../models/Activity');

class PortfolioGenerator {
  constructor() {
    this.browser = null;
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async generateStudentPortfolio(studentId, options = {}) {
    try {
      const browser = await this.initBrowser();
      
      // Fetch student data
      const student = await User.findById(studentId).select('-password');
      if (!student) {
        throw new Error('Student not found');
      }

      // Fetch student's approved activities
      const activities = await Activity.find({
        student: studentId,
        status: options.includeAll ? { $ne: null } : 'approved'
      })
      .populate('approvedBy', 'firstName lastName')
      .sort({ startDate: -1 });

      // Generate HTML content
      const htmlContent = this.generatePortfolioHTML(student, activities, options);

      // Create PDF
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      });

      await page.close();

      // Save PDF file
      const filename = `portfolio_${student.studentId || student._id}_${Date.now()}.pdf`;
      const filepath = path.join(__dirname, '../uploads', filename);
      
      // Ensure uploads directory exists
      const uploadsDir = path.dirname(filepath);
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      fs.writeFileSync(filepath, pdfBuffer);

      return {
        filename,
        filepath,
        url: `/api/upload/files/${filename}`,
        size: pdfBuffer.length,
        student: {
          id: student._id,
          name: student.fullName,
          studentId: student.studentId,
          department: student.department
        },
        activitiesCount: activities.length,
        generatedAt: new Date()
      };

    } catch (error) {
      console.error('Portfolio generation error:', error);
      throw error;
    }
  }

  generatePortfolioHTML(student, activities, options = {}) {
    const activityStats = this.calculateActivityStats(activities);
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Student Portfolio - ${student.fullName}</title>
        <style>
            ${this.getPortfolioCSS()}
        </style>
    </head>
    <body>
        <div class="portfolio-container">
            <!-- Header -->
            <header class="portfolio-header">
                <div class="header-content">
                    <div class="student-info">
                        <h1>${student.fullName}</h1>
                        <p class="student-details">
                            <strong>Student ID:</strong> ${student.studentId || 'N/A'}<br>
                            <strong>Department:</strong> ${student.department || 'N/A'}<br>
                            <strong>Year:</strong> ${student.year || 'N/A'} | 
                            <strong>Semester:</strong> ${student.semester || 'N/A'}<br>
                            <strong>CGPA:</strong> ${student.cgpa || 'N/A'}
                        </p>
                    </div>
                    <div class="generation-info">
                        <p>Generated on: ${new Date().toLocaleDateString()}</p>
                        <p>Total Activities: ${activities.length}</p>
                    </div>
                </div>
            </header>

            <!-- Summary Section -->
            <section class="summary-section">
                <h2>Portfolio Summary</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>${activityStats.totalActivities}</h3>
                        <p>Total Activities</p>
                    </div>
                    <div class="stat-card">
                        <h3>${activityStats.totalCredits}</h3>
                        <p>Total Credits</p>
                    </div>
                    <div class="stat-card">
                        <h3>${activityStats.categoriesCount}</h3>
                        <p>Categories</p>
                    </div>
                    <div class="stat-card">
                        <h3>${activityStats.averageScore}%</h3>
                        <p>Average Score</p>
                    </div>
                </div>
            </section>

            <!-- Category Breakdown -->
            <section class="category-section">
                <h2>Activities by Category</h2>
                <div class="category-grid">
                    ${Object.entries(activityStats.categoryBreakdown)
                      .map(([category, data]) => `
                        <div class="category-card">
                            <h4>${this.formatCategoryName(category)}</h4>
                            <p>${data.count} activities</p>
                            <p>${data.credits} credits</p>
                        </div>
                      `).join('')}
                </div>
            </section>

            <!-- Activities List -->
            <section class="activities-section">
                <h2>Activities Details</h2>
                ${this.generateActivitiesByCategory(activities)}
            </section>

            <!-- Skills Section -->
            <section class="skills-section">
                <h2>Skills Gained</h2>
                <div class="skills-list">
                    ${this.extractSkills(activities).map(skill => 
                      `<span class="skill-tag">${skill}</span>`
                    ).join('')}
                </div>
            </section>

            <!-- Footer -->
            <footer class="portfolio-footer">
                <p>This portfolio is generated from the Smart Student Hub system.</p>
                <p>All activities listed have been verified by faculty members.</p>
                <p>Generated on: ${new Date().toLocaleString()}</p>
            </footer>
        </div>
    </body>
    </html>
    `;
  }

  generateActivitiesByCategory(activities) {
    const groupedActivities = activities.reduce((groups, activity) => {
      const category = activity.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(activity);
      return groups;
    }, {});

    return Object.entries(groupedActivities)
      .map(([category, categoryActivities]) => `
        <div class="category-activities">
          <h3>${this.formatCategoryName(category)}</h3>
          <div class="activities-list">
            ${categoryActivities.map(activity => `
              <div class="activity-card">
                <div class="activity-header">
                  <h4>${activity.title}</h4>
                  <span class="activity-status status-${activity.status}">${activity.status.toUpperCase()}</span>
                </div>
                <div class="activity-details">
                  <p><strong>Organizer:</strong> ${activity.organizer}</p>
                  <p><strong>Duration:</strong> ${new Date(activity.startDate).toLocaleDateString()} - ${new Date(activity.endDate).toLocaleDateString()}</p>
                  ${activity.location ? `<p><strong>Location:</strong> ${activity.location}</p>` : ''}
                  ${activity.credits ? `<p><strong>Credits:</strong> ${activity.credits}</p>` : ''}
                  ${activity.score ? `<p><strong>Score:</strong> ${activity.score}%</p>` : ''}
                  ${activity.grade ? `<p><strong>Grade:</strong> ${activity.grade}</p>` : ''}
                </div>
                <div class="activity-description">
                  <p>${activity.description}</p>
                </div>
                ${activity.learningOutcomes ? `
                  <div class="learning-outcomes">
                    <strong>Learning Outcomes:</strong>
                    <p>${activity.learningOutcomes}</p>
                  </div>
                ` : ''}
                ${activity.approvedBy ? `
                  <div class="approval-info">
                    <small>Approved by: ${activity.approvedBy.firstName} ${activity.approvedBy.lastName}</small>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `).join('');
  }

  calculateActivityStats(activities) {
    const totalActivities = activities.length;
    const totalCredits = activities.reduce((sum, activity) => sum + (activity.credits || 0), 0);
    const totalScore = activities.reduce((sum, activity) => sum + (activity.score || 0), 0);
    const activitiesWithScore = activities.filter(a => a.score && a.score > 0).length;
    const averageScore = activitiesWithScore > 0 ? Math.round(totalScore / activitiesWithScore) : 0;

    const categoryBreakdown = activities.reduce((breakdown, activity) => {
      const category = activity.category;
      if (!breakdown[category]) {
        breakdown[category] = { count: 0, credits: 0 };
      }
      breakdown[category].count++;
      breakdown[category].credits += activity.credits || 0;
      return breakdown;
    }, {});

    return {
      totalActivities,
      totalCredits,
      averageScore,
      categoriesCount: Object.keys(categoryBreakdown).length,
      categoryBreakdown
    };
  }

  extractSkills(activities) {
    const skillsSet = new Set();
    activities.forEach(activity => {
      if (activity.skillsGained && Array.isArray(activity.skillsGained)) {
        activity.skillsGained.forEach(skill => skillsSet.add(skill));
      }
    });
    return Array.from(skillsSet).slice(0, 20); // Limit to 20 skills
  }

  formatCategoryName(category) {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getPortfolioCSS() {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Arial', sans-serif;
        line-height: 1.6;
        color: #333;
        background: #fff;
      }

      .portfolio-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }

      .portfolio-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px;
        border-radius: 10px;
        margin-bottom: 30px;
      }

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }

      .student-info h1 {
        font-size: 2.5em;
        margin-bottom: 10px;
      }

      .student-details {
        font-size: 1.1em;
        line-height: 1.8;
      }

      .generation-info {
        text-align: right;
        font-size: 0.9em;
      }

      .summary-section, .category-section, .activities-section, .skills-section {
        margin-bottom: 40px;
      }

      h2 {
        color: #2c3e50;
        border-bottom: 3px solid #667eea;
        padding-bottom: 10px;
        margin-bottom: 20px;
        font-size: 1.8em;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
      }

      .stat-card {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        border-left: 4px solid #667eea;
      }

      .stat-card h3 {
        font-size: 2em;
        color: #667eea;
        margin-bottom: 5px;
      }

      .category-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-bottom: 30px;
      }

      .category-card {
        background: #fff;
        border: 1px solid #e0e0e0;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      .category-card h4 {
        color: #2c3e50;
        margin-bottom: 8px;
      }

      .category-activities {
        margin-bottom: 30px;
      }

      .category-activities h3 {
        color: #667eea;
        margin-bottom: 15px;
        font-size: 1.4em;
      }

      .activity-card {
        background: #fff;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 15px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      }

      .activity-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 15px;
      }

      .activity-header h4 {
        color: #2c3e50;
        font-size: 1.2em;
        flex: 1;
      }

      .activity-status {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.8em;
        font-weight: bold;
        text-transform: uppercase;
      }

      .status-approved {
        background: #d4edda;
        color: #155724;
      }

      .status-pending {
        background: #fff3cd;
        color: #856404;
      }

      .status-rejected {
        background: #f8d7da;
        color: #721c24;
      }

      .activity-details {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 10px;
        margin-bottom: 15px;
        font-size: 0.9em;
      }

      .activity-description {
        margin-bottom: 10px;
        color: #555;
      }

      .learning-outcomes {
        background: #f8f9fa;
        padding: 10px;
        border-radius: 5px;
        margin-bottom: 10px;
      }

      .approval-info {
        color: #6c757d;
        font-style: italic;
      }

      .skills-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .skill-tag {
        background: #667eea;
        color: white;
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 0.9em;
      }

      .portfolio-footer {
        background: #f8f9fa;
        padding: 20px;
        text-align: center;
        border-radius: 8px;
        margin-top: 40px;
        color: #6c757d;
        font-size: 0.9em;
      }

      @media print {
        .portfolio-container {
          max-width: none;
          padding: 0;
        }
        
        .activity-card {
          page-break-inside: avoid;
        }
        
        .category-activities {
          page-break-inside: avoid;
        }
      }
    `;
  }
}

module.exports = new PortfolioGenerator();
