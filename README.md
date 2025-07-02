# Agentic AI Platform

A comprehensive platform for managing multiple types of agentic AI systems including generative AI agents, automation agents, hypervisor agents, workflow agents, data processing agents, and monitoring agents.

## Architecture

The platform is built with a modern, scalable architecture:

- **Backend**: Node.js with TypeScript, Express.js, PostgreSQL, Redis
- **Frontend**: React with TypeScript, Material-UI, Vite
- **Real-time Communication**: WebSockets (Socket.io)
- **Agent Orchestration**: Custom orchestration layer with job queuing
- **Containerization**: Docker and Docker Compose
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis for performance optimization

## Features

### Core Features
- **Multi-Agent Support**: Support for various agent types (Generative AI, Automation, Hypervisor, Workflow, Data Processing, Monitoring, Custom)
- **Real-time Dashboard**: Live monitoring of agent status and task execution
- **Task Management**: Create, schedule, and monitor tasks across agents
- **User Management**: Role-based access control (User, Admin, Super Admin)
- **WebSocket Integration**: Real-time updates for agent status and task progress
- **API-First Design**: Comprehensive REST API with OpenAPI documentation

### Agent Types Supported
1. **Generative AI Agents**: For content generation and AI interactions
2. **Automation Agents**: For automated workflows and processes
3. **Hypervisor Agents**: For managing other agents and system resources
4. **Workflow Agents**: For complex multi-step processes
5. **Data Processing Agents**: For data transformation and analysis
6. **Monitoring Agents**: For system and application monitoring
7. **Custom Agents**: For specialized use cases

## Project Structure

```
Agentic-Ai/
├── backend/                    # Node.js backend API
│   ├── src/
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic services
│   │   ├── middleware/        # Express middleware
│   │   ├── utils/             # Utility functions
│   │   └── websocket/         # WebSocket handlers
│   ├── prisma/                # Database schema and migrations
│   └── Dockerfile             # Backend container config
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── contexts/          # React contexts
│   │   ├── api/               # API client
│   │   └── types/             # TypeScript types
│   ├── nginx.conf             # Nginx configuration
│   └── Dockerfile             # Frontend container config
├── docker-compose.yml         # Multi-service orchestration
└── README.md                  # This file
```

## Quick Start

### Prerequisites
- Node.js 18+ 
- Docker and Docker Compose
- PostgreSQL (if running locally)
- Redis (if running locally)

### Development Setup

1. **Clone and setup the project:**
   ```bash
   git clone <repository-url>
   cd Agentic-Ai
   npm run setup
   ```

2. **Start with Docker (Recommended):**
   ```bash
   npm run docker:up
   ```

3. **Or start services individually:**
   ```bash
   # Start backend
   npm run dev:backend
   
   # Start frontend (in another terminal)
   npm run dev:frontend
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/health

### Environment Variables

Create `.env` files in the backend directory:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/agentic_ai"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-jwt-secret-key-change-in-production"

# Server
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3000"
```

## API Documentation

The API follows RESTful conventions with the following main endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Agents
- `GET /api/agents` - List user's agents
- `POST /api/agents` - Create new agent
- `GET /api/agents/:id` - Get agent details
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent
- `POST /api/agents/:id/execute` - Execute agent
- `POST /api/agents/:id/:action` - Control agent (start/stop/pause)

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/execute` - Execute task
- `POST /api/tasks/:id/cancel` - Cancel task

### Users
- `GET /api/users/profile` - Get user profile
- `GET /api/users/dashboard/stats` - Get dashboard statistics
- `GET /api/users` - List all users (Admin only)
- `PUT /api/users/:id/role` - Update user role (Super Admin only)

## WebSocket Events

The platform supports real-time updates via WebSocket:

### Client Events
- `join-user-room` - Join user-specific room
- `join-agent-room` - Join agent-specific room
- `subscribe-agent-executions` - Subscribe to agent execution updates
- `subscribe-task-updates` - Subscribe to task updates
- `subscribe-system-metrics` - Subscribe to system metrics

### Server Events
- `agent-status-update` - Agent status changed
- `execution-update` - Agent execution progress
- `task-update` - Task status changed
- `system-metrics-update` - System metrics update

## Database Schema

The platform uses PostgreSQL with the following main entities:

- **Users**: User accounts and authentication
- **Agents**: AI agents with configuration and metadata
- **AgentExecutions**: Individual agent execution records
- **Tasks**: Scheduled and manual tasks
- **Sessions**: User authentication sessions
- **ApiKeys**: API access keys

## Deployment

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Considerations

1. **Security**:
   - Change default JWT secret
   - Use environment variables for sensitive data
   - Enable HTTPS
   - Configure proper CORS settings

2. **Performance**:
   - Configure Redis for caching
   - Set up database connection pooling
   - Enable Nginx gzip compression
   - Monitor and scale based on load

3. **Monitoring**:
   - Set up application logging
   - Monitor database performance
   - Track WebSocket connections
   - Set up health checks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Performance Optimization

The platform is designed for high performance:

- **Database**: Connection pooling and optimized queries
- **Caching**: Redis for session and data caching
- **Real-time**: Efficient WebSocket connections with room-based messaging
- **Frontend**: Code splitting and lazy loading
- **API**: Request/response compression and efficient serialization
- **Queue System**: Background job processing for agent executions

## Scalability

The architecture supports horizontal scaling:

- **Stateless Backend**: Multiple API server instances
- **Database**: PostgreSQL with read replicas
- **Caching**: Redis cluster for high availability
- **Load Balancing**: Nginx or cloud load balancers
- **Container Orchestration**: Kubernetes support ready

## License

MIT License - see LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the WebSocket event documentation
