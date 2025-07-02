# GitHub Copilot Instructions

This is a comprehensive agentic AI platform built with Node.js/TypeScript backend and React/TypeScript frontend.

## Project Structure
- `backend/`: Node.js API with Express, Prisma ORM, PostgreSQL, Redis, WebSockets
- `frontend/`: React app with TypeScript, Material-UI, Vite
- Multi-agent support: Generative AI, Automation, Hypervisor, Workflow, Data Processing, Monitoring

## Architecture Patterns
- RESTful API design with comprehensive error handling
- WebSocket integration for real-time updates
- Job queue system with Bull/BullMQ for agent processing
- Role-based access control (User, Admin, Super Admin)
- Docker containerization for all services

## Key Technologies
- Backend: Node.js, TypeScript, Express, Prisma, PostgreSQL, Redis, Socket.io, Bull
- Frontend: React, TypeScript, Material-UI, Vite, React Query, Zustand
- DevOps: Docker, Docker Compose, Nginx

## Code Conventions
- Use TypeScript strict mode
- Follow RESTful API patterns
- Implement proper error handling and logging
- Use Prisma for database operations
- Material-UI for consistent UI components
- Real-time updates via WebSocket events

## Agent System
The platform supports multiple agent types with a pluggable architecture:
- Each agent type has specific processing logic
- Agent orchestration handles execution and state management
- Task scheduling and execution tracking
- Real-time status updates and monitoring
