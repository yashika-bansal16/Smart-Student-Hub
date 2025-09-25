# Smart Student Hub - Deployment Guide

This guide provides step-by-step instructions for deploying the Smart Student Hub application in various environments.

## 🐳 Docker Deployment (Recommended)

### Prerequisites
- Docker (v20.10 or higher)
- Docker Compose (v2.0 or higher)
- At least 4GB RAM and 10GB disk space

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd smart-student-hub
   ```

2. **Configure environment variables:**
   ```bash
   # Backend environment
   cp backend/env.example backend/.env
   # Edit backend/.env with your configurations
   
   # Frontend environment (optional)
   cp frontend/.env.example frontend/.env
   # Edit frontend/.env if needed
   ```

3. **Start the application:**
   ```bash
   docker-compose up -d
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

5. **Login with demo credentials:**
   - **Student:** student@demo.com / password123
   - **Faculty:** faculty@demo.com / password123
   - **Admin:** admin@demo.com / password123

### Docker Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# View running containers
docker-compose ps

# Execute commands in containers
docker-compose exec backend npm run seed
docker-compose exec mongodb mongo student-hub
```

## 🌐 Cloud Deployment

### Vercel (Frontend) + Railway (Backend) + MongoDB Atlas

#### 1. MongoDB Atlas Setup
```bash
1. Create account at https://cloud.mongodb.com
2. Create a new cluster
3. Create database user and get connection string
4. Update MONGODB_URI in backend environment
```

#### 2. Backend Deployment on Railway
```bash
1. Fork the repository
2. Connect Railway to your GitHub account
3. Create new project from GitHub repo
4. Set environment variables:
   - NODE_ENV=production
   - MONGODB_URI=<your-atlas-connection-string>
   - JWT_SECRET=<your-secret-key>
   - CLOUDINARY_* variables for file uploads
5. Deploy from /backend directory
```

#### 3. Frontend Deployment on Vercel
```bash
1. Connect Vercel to your GitHub account
2. Import project and set build settings:
   - Framework: Create React App
   - Build Command: npm run build
   - Output Directory: build
   - Install Command: npm install
3. Set environment variables:
   - REACT_APP_API_URL=<your-railway-backend-url>/api
4. Deploy
```

### AWS Deployment

#### Using AWS ECS with Fargate
```bash
# 1. Build and push images to ECR
aws ecr create-repository --repository-name student-hub-backend
aws ecr create-repository --repository-name student-hub-frontend

# 2. Build and tag images
docker build -t student-hub-backend ./backend
docker build -t student-hub-frontend ./frontend

# 3. Push to ECR
docker tag student-hub-backend:latest <account-id>.dkr.ecr.<region>.amazonaws.com/student-hub-backend:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/student-hub-backend:latest

# 4. Create ECS cluster and services
# Use the provided ecs-task-definition.json and ecs-service.json
```

#### Using AWS Elastic Beanstalk
```bash
# 1. Install EB CLI
pip install awsebcli

# 2. Initialize Elastic Beanstalk
eb init

# 3. Create environment
eb create production

# 4. Deploy
eb deploy
```

### DigitalOcean Deployment

#### Using DigitalOcean App Platform
```yaml
# app.yaml
name: student-hub
services:
- name: backend
  source_dir: /backend
  github:
    repo: your-username/smart-student-hub
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: MONGODB_URI
    value: ${DATABASE_URL}
  - key: JWT_SECRET
    value: ${JWT_SECRET}

- name: frontend
  source_dir: /frontend
  github:
    repo: your-username/smart-student-hub
    branch: main
  build_command: npm run build
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  routes:
  - path: /
  envs:
  - key: REACT_APP_API_URL
    value: ${backend.PUBLIC_URL}/api

databases:
- name: mongodb
  engine: MONGODB
  version: "5"
```

## 🔧 Manual Deployment

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5.0 or higher)
- PM2 (for process management)
- Nginx (for reverse proxy)

### Backend Setup
```bash
# 1. Clone and install dependencies
git clone <repository-url>
cd smart-student-hub/backend
npm install

# 2. Configure environment
cp env.example .env
# Edit .env file with your configurations

# 3. Start with PM2
npm install -g pm2
pm2 start server.js --name "student-hub-api"
pm2 startup
pm2 save
```

### Frontend Setup
```bash
# 1. Install and build
cd ../frontend
npm install
npm run build

# 2. Serve with Nginx
sudo cp -r build/* /var/www/html/
```

### Nginx Configuration
```nginx
# /etc/nginx/sites-available/student-hub
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 Security Considerations

### Environment Variables
```bash
# Required environment variables
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
MONGODB_URI=<secure-connection-string>
FRONTEND_URL=<your-frontend-domain>

# Optional but recommended
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
SESSION_SECRET=<another-random-secret>
```

### SSL/TLS Configuration
```bash
# Using Let's Encrypt with Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Database Security
```bash
# MongoDB security checklist
1. Enable authentication
2. Use strong passwords
3. Enable SSL/TLS
4. Configure firewall rules
5. Regular backups
6. Monitor access logs
```

## 📊 Monitoring and Logging

### Application Monitoring
```bash
# Using PM2 for backend monitoring
pm2 monit

# View logs
pm2 logs student-hub-api

# Restart if needed
pm2 restart student-hub-api
```

### Database Monitoring
```bash
# MongoDB monitoring
db.runCommand({serverStatus: 1})
db.stats()

# Enable profiling
db.setProfilingLevel(2)
```

### Health Checks
```bash
# Backend health check
curl http://localhost:5000/health

# Frontend health check
curl http://localhost:3000/health
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        cd backend && npm ci
        cd ../frontend && npm ci
        
    - name: Run tests
      run: |
        cd backend && npm test
        cd ../frontend && npm test
        
    - name: Build and deploy
      run: |
        # Add your deployment commands here
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Issues:**
   ```bash
   # Check MongoDB status
   sudo systemctl status mongod
   
   # Check connection string format
   mongodb://username:password@host:port/database
   ```

2. **Port Already in Use:**
   ```bash
   # Find process using port
   sudo lsof -i :5000
   
   # Kill process
   sudo kill -9 <PID>
   ```

3. **Docker Issues:**
   ```bash
   # Clean up Docker
   docker system prune -a
   
   # Rebuild containers
   docker-compose up --build --force-recreate
   ```

4. **Permission Issues:**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   chmod +x deploy.sh
   ```

### Performance Optimization

1. **Enable Gzip Compression:**
   ```nginx
   gzip on;
   gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
   ```

2. **Database Indexing:**
   ```javascript
   // Ensure proper indexes are created
   db.users.createIndex({ email: 1 });
   db.activities.createIndex({ student: 1, status: 1 });
   ```

3. **Caching:**
   ```javascript
   // Implement Redis caching for frequently accessed data
   const redis = require('redis');
   const client = redis.createClient();
   ```

## 📞 Support

For deployment issues or questions:
- Check the troubleshooting section above
- Review application logs
- Open an issue on the GitHub repository
- Contact the development team

## 🔄 Updates and Maintenance

### Regular Maintenance Tasks
```bash
# Update dependencies
npm update

# Database backup
mongodump --uri="mongodb://localhost:27017/student-hub"

# Log rotation
sudo logrotate -f /etc/logrotate.conf

# Security updates
sudo apt update && sudo apt upgrade
```

### Monitoring Checklist
- [ ] Application health checks
- [ ] Database performance
- [ ] Disk space usage
- [ ] Memory usage
- [ ] SSL certificate expiry
- [ ] Backup verification
- [ ] Security patches
