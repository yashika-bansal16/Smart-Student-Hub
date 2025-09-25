# Smart Student Hub - API Documentation

## 📋 Overview

The Smart Student Hub API is a RESTful service built with Node.js and Express.js that provides endpoints for managing student activities, faculty approvals, and administrative functions.

**Base URL:** `http://localhost:5000/api`

**Authentication:** JWT Bearer Token

## 🔐 Authentication

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "role": "student",
  "department": "Computer Science",
  "year": 3,
  "semester": 6
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f8b2c1e5d4a3b2c1d0e9f8",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "student",
    "department": "Computer Science",
    "studentId": "23CS001"
  }
}
```

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

### Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

## 👥 Users Management

### Get All Users (Admin/Faculty)
```http
GET /users
Authorization: Bearer <token>
```

**Query Parameters:**
- `role` - Filter by role (student, faculty, admin)
- `department` - Filter by department
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search term

### Get User by ID
```http
GET /users/:id
Authorization: Bearer <token>
```

### Update User
```http
PUT /users/:id
Authorization: Bearer <token>
```

### Get Dashboard Data
```http
GET /users/dashboard/data
Authorization: Bearer <token>
```

## 📝 Activities Management

### Get Activities
```http
GET /activities
Authorization: Bearer <token>
```

**Query Parameters:**
- `category` - Filter by category
- `status` - Filter by status (pending, approved, rejected)
- `page` - Page number
- `limit` - Items per page
- `sort` - Sort field
- `search` - Search term
- `startDate` - Filter by start date
- `endDate` - Filter by end date

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 25,
  "pages": 3,
  "currentPage": 1,
  "data": [
    {
      "_id": "64f8b2c1e5d4a3b2c1d0e9f8",
      "title": "International AI Conference",
      "description": "Presented research on ML applications",
      "category": "conference",
      "organizer": "IEEE",
      "startDate": "2023-09-15T00:00:00.000Z",
      "endDate": "2023-09-17T00:00:00.000Z",
      "status": "approved",
      "credits": 3,
      "student": {
        "firstName": "John",
        "lastName": "Doe",
        "studentId": "23CS001"
      }
    }
  ]
}
```

### Create Activity (Students)
```http
POST /activities
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Machine Learning Workshop",
  "description": "Intensive 3-day workshop on ML fundamentals",
  "category": "workshop",
  "organizer": "Tech Academy",
  "location": "San Francisco, CA",
  "mode": "offline",
  "startDate": "2023-10-15T00:00:00.000Z",
  "endDate": "2023-10-17T00:00:00.000Z",
  "credits": 2,
  "skillsGained": ["Machine Learning", "Python", "Data Analysis"],
  "learningOutcomes": "Gained practical ML implementation skills"
}
```

### Get Activity by ID
```http
GET /activities/:id
Authorization: Bearer <token>
```

### Update Activity
```http
PUT /activities/:id
Authorization: Bearer <token>
```

### Delete Activity
```http
DELETE /activities/:id
Authorization: Bearer <token>
```

### Approve/Reject Activity (Faculty/Admin)
```http
PATCH /activities/:id/approve
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "approved",
  "comments": "Well documented activity with proper evidence"
}
```

### Add Comment to Activity
```http
POST /activities/:id/comments
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "message": "Please provide additional documentation"
}
```

### Get Pending Approvals (Faculty/Admin)
```http
GET /activities/pending/approval
Authorization: Bearer <token>
```

### Get Activity Statistics
```http
GET /activities/stats/summary
Authorization: Bearer <token>
```

## 📊 Reports Management

### Generate Student Portfolio
```http
POST /reports/portfolio/:studentId
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "includeAll": false,
  "template": "standard"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Portfolio generated successfully",
  "data": {
    "downloadUrl": "/api/upload/files/portfolio_23CS001_1694764800.pdf",
    "filename": "portfolio_23CS001_1694764800.pdf"
  }
}
```

### Get Reports
```http
GET /reports
Authorization: Bearer <token>
```

### Create Custom Report (Faculty/Admin)
```http
POST /reports
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Department Activity Report",
  "type": "department_summary",
  "purpose": "NAAC",
  "scope": {
    "departments": ["Computer Science"],
    "academicYear": "2023-2024",
    "dateRange": {
      "startDate": "2023-01-01T00:00:00.000Z",
      "endDate": "2023-12-31T23:59:59.999Z"
    }
  }
}
```

### Download Report
```http
GET /reports/:id/download
Authorization: Bearer <token>
```

### Get Department Analytics (Faculty/Admin)
```http
GET /reports/analytics/department
Authorization: Bearer <token>
```

**Query Parameters:**
- `department` - Department name
- `academicYear` - Academic year (e.g., "2023-2024")

## 📁 File Upload

### Upload Single File
```http
POST /upload/single
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `file` - File to upload (max 10MB)

### Upload Multiple Files
```http
POST /upload/multiple
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `files` - Multiple files (max 5 files, 10MB each)

### Upload Profile Image
```http
POST /upload/profile
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

### Get File
```http
GET /upload/files/:filename
```

### Delete File
```http
DELETE /upload/files/:filename
Authorization: Bearer <token>
```

## 📋 Activity Categories

The system supports the following activity categories:

- `academic` - Academic achievements, coursework
- `research` - Research projects, publications
- `conference` - Conference presentations, attendance
- `workshop` - Workshops, training sessions
- `certification` - Professional certifications
- `internship` - Internships, industrial training
- `project` - Personal/academic projects
- `competition` - Competitions, hackathons
- `volunteering` - Community service, volunteering
- `extracurricular` - Sports, cultural activities
- `leadership` - Leadership roles, positions
- `publication` - Research papers, articles
- `patent` - Patent applications, grants
- `award` - Awards, recognitions
- `other` - Other activities

## 🔍 Status Codes

### Activity Status
- `pending` - Awaiting faculty approval
- `approved` - Approved by faculty
- `rejected` - Rejected by faculty
- `under_review` - Under review by faculty

### User Roles
- `student` - Student user
- `faculty` - Faculty member
- `admin` - System administrator

## ⚠️ Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required",
      "value": ""
    }
  ]
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## 🔒 Role-Based Access Control

### Student Permissions
- Create, read, update, delete own activities
- Generate own portfolio
- View own reports
- Update own profile

### Faculty Permissions
- View activities from their department
- Approve/reject activities
- Generate department reports
- View student profiles in their department
- Create custom reports

### Admin Permissions
- Full access to all resources
- User management
- System-wide reports
- Global settings

## 📝 Request/Response Examples

### Create Activity with File Upload
```bash
curl -X POST \
  http://localhost:5000/api/activities \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "React.js Certification",
    "description": "Completed advanced React.js certification course",
    "category": "certification",
    "organizer": "Meta",
    "startDate": "2023-09-01T00:00:00.000Z",
    "endDate": "2023-09-30T00:00:00.000Z",
    "credits": 3,
    "skillsGained": ["React.js", "JavaScript", "Frontend Development"]
  }'
```

### Filter Activities by Date Range
```bash
curl -X GET \
  'http://localhost:5000/api/activities?startDate=2023-01-01&endDate=2023-12-31&status=approved&category=conference' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### Generate Portfolio with Custom Options
```bash
curl -X POST \
  http://localhost:5000/api/reports/portfolio/64f8b2c1e5d4a3b2c1d0e9f8 \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json' \
  -d '{
    "includeAll": true,
    "template": "detailed"
  }'
```

## 🧪 Testing the API

### Using Postman
1. Import the Postman collection (if available)
2. Set up environment variables:
   - `baseUrl`: http://localhost:5000/api
   - `token`: Your JWT token
3. Run authentication request first
4. Use the token for subsequent requests

### Using cURL
```bash
# Login to get token
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"student@demo.com","password":"password123"}' \
  | jq -r '.token')

# Use token for authenticated requests
curl -X GET http://localhost:5000/api/activities \
  -H "Authorization: Bearer $TOKEN"
```

## 📚 SDKs and Libraries

### JavaScript/Node.js
```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Get activities
const activities = await api.get('/activities');

// Create activity
const newActivity = await api.post('/activities', {
  title: 'New Activity',
  category: 'workshop',
  // ... other fields
});
```

### Python
```python
import requests

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

# Get activities
response = requests.get('http://localhost:5000/api/activities', headers=headers)
activities = response.json()

# Create activity
activity_data = {
    'title': 'New Activity',
    'category': 'workshop',
    # ... other fields
}
response = requests.post('http://localhost:5000/api/activities', 
                        json=activity_data, headers=headers)
```

## 🔄 Webhooks (Future Enhancement)

The API will support webhooks for real-time notifications:

```json
{
  "event": "activity.approved",
  "data": {
    "activityId": "64f8b2c1e5d4a3b2c1d0e9f8",
    "studentId": "64f8b2c1e5d4a3b2c1d0e9f7",
    "approvedBy": "64f8b2c1e5d4a3b2c1d0e9f6"
  },
  "timestamp": "2023-09-15T10:30:00.000Z"
}
```

## 📈 Rate Limiting

The API implements rate limiting to prevent abuse:
- **General endpoints:** 100 requests per 15 minutes per IP
- **Authentication endpoints:** 5 requests per 15 minutes per IP
- **File upload endpoints:** 10 requests per 15 minutes per IP

## 🔧 API Versioning

Current API version: `v1`

Future versions will be accessible via:
- Header: `Accept: application/vnd.api+json;version=2`
- URL: `/api/v2/activities`

## 📞 Support

For API support and questions:
- Documentation: This file
- GitHub Issues: Create an issue for bugs or feature requests
- Email: support@studenthub.com

## 📄 Changelog

### v1.0.0 (Current)
- Initial API release
- Authentication system
- Activity management
- Report generation
- File upload support
- Role-based access control

### Planned Features
- Real-time notifications
- Advanced analytics
- Bulk operations
- API rate limiting dashboard
- Webhook support
