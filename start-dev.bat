@echo off
echo Starting Smart Student Hub Development Servers...
echo.

echo [1/4] Checking if backend is already running...
netstat -an | findstr :5000 > nul
if %errorlevel% equ 0 (
    echo Backend is already running on port 5000
) else (
    echo [2/4] Starting backend server...
    cd backend
    start "Backend Server" cmd /k "npm run dev"
    cd ..
    echo Waiting for backend to start...
    timeout /t 3 /nobreak > nul
)

echo [3/4] Starting frontend development server...
cd frontend
start "Frontend Server" cmd /k "npm start"
cd ..

echo.
echo ========================================
echo Smart Student Hub Development Started!
echo ========================================
echo.
echo Backend API: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Demo Login Credentials:
echo Student: student@demo.com / password123
echo Faculty: faculty@demo.com / password123
echo Admin: admin@demo.com / password123
echo.
echo Features Available:
echo ✓ Enhanced activity rendering with approval status
echo ✓ File upload for certificate validation
echo ✓ Document verification indicators
echo ✓ Improved student dashboard
echo.
echo Press any key to exit...
pause > nul
