# Smart Student Hub

A comprehensive web application for students to record, track, and showcase their achievements with faculty verification capabilities.

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React.js)                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │   Student   │ │   Faculty   │ │        Admin            ││
│  │  Dashboard  │ │   Panel     │ │       Panel             ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              │
┌─────────────────────────────────────────────────────────────┐
│                 Backend (Node.js/Express)                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │    Auth     │ │     API     │ │      File Upload        ││
│  │  Service    │ │   Routes    │ │       Service           ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              │
┌─────────────────────────────────────────────────────────────┐
│                Database (MongoDB/PostgreSQL)                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │    Users    │ │ Activities  │ │      Reports            ││
│  │ Collection  │ │ Collection  │ │     Collection          ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

- **Frontend**: React.js with Material-UI/Tailwind CSS
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Multer + Cloud Storage (AWS S3/Cloudinary)
- **PDF Generation**: Puppeteer
- **Charts**: Chart.js/Recharts
- **Deployment**: Docker, Vercel/Netlify (Frontend), Render/Railway (Backend)

## 🚀 Features

- **Student Dashboard**: Real-time academic performance tracking
- **Activity Tracker**: Upload and manage achievements
- **Faculty Approval**: Verify student activities
- **Digital Portfolio**: Auto-generated PDF portfolios
- **Analytics**: NAAC/NIRF/AICTE compliant reporting
- **Role-Based Access**: Student, Faculty, Admin permissions

## 📋 Prerequisites

- Node.js (v16+)
- MongoDB (local or Atlas)
- npm or yarn

## 🏃‍♂️ Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd smart-student-hub

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configurations

# Start development servers
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

## 📁 Project Structure

```
smart-student-hub/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   └── public/
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## 🔧 Environment Variables

Create `.env` files in both backend and frontend directories:

### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student-hub
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

## 📊 Database Schema

See `backend/models/` for detailed schema definitions.

## 🔗 API Endpoints

See API documentation in `backend/routes/` for complete endpoint listings.

## 🚀 Deployment

See deployment instructions in the respective backend and frontend directories.

## 🔮 Future Enhancements

- AI-based activity validation
- LMS integration
- LinkedIn portfolio export
- Mobile application
- Advanced analytics with ML insights
- Blockchain-based certificate verification
