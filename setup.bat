@echo off
echo Starting Agentic AI Platform setup...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Create environment files from examples
if not exist backend\.env (
    echo Creating backend .env file...
    copy backend\.env.example backend\.env
)

if not exist frontend\.env (
    echo Creating frontend .env file...
    copy frontend\.env.example frontend\.env
)

REM Install dependencies
echo Installing dependencies...
npm install

REM Setup backend
echo Setting up backend...
cd backend
npm install

REM Generate Prisma client
echo Generating Prisma client...
npx prisma generate

cd ..

REM Setup frontend
echo Setting up frontend...
cd frontend
npm install
cd ..

echo Setup complete!
echo.
echo To start the platform:
echo 1. With Docker: npm run docker:up
echo 2. Development mode: npm run dev
echo.
echo Access points:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:3001
echo - Health Check: http://localhost:3001/health
