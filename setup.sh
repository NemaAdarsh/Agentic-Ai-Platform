#!/bin/bash

echo "Starting Agentic AI Platform setup..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Create environment files from examples
if [ ! -f backend/.env ]; then
    echo "Creating backend .env file..."
    cp backend/.env.example backend/.env
fi

if [ ! -f frontend/.env ]; then
    echo "Creating frontend .env file..."
    cp frontend/.env.example frontend/.env
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Setup backend
echo "Setting up backend..."
cd backend
npm install

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

cd ..

# Setup frontend
echo "Setting up frontend..."
cd frontend
npm install
cd ..

echo "Setup complete!"
echo ""
echo "To start the platform:"
echo "1. With Docker: npm run docker:up"
echo "2. Development mode: npm run dev"
echo ""
echo "Access points:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:3001"
echo "- Health Check: http://localhost:3001/health"
