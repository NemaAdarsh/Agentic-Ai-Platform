# Development Guide

## Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Quick Setup

1. **Clone and setup:**
   ```bash
   git clone <your-repo>
   cd Agentic-Ai
   
   # Windows
   setup.bat
   
   # Mac/Linux
   chmod +x setup.sh
   ./setup.sh
   ```

2. **Start development environment:**
   ```bash
   # Option 1: Docker (recommended)
   npm run docker:up
   
   # Option 2: Local development
   npm run dev
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001
   - API Health: http://localhost:3001/health

## Development Workflow

### Backend Development
- Location: `backend/`
- Framework: Express.js with TypeScript
- Database: PostgreSQL with Prisma ORM
- Real-time: Socket.io for WebSockets

```bash
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio
```

### Frontend Development
- Location: `frontend/`
- Framework: React with TypeScript
- UI Library: Material-UI
- Build Tool: Vite

```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Database Management

The platform uses PostgreSQL with Prisma ORM:

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Push schema changes to database
npx prisma db push

# Create and run migrations
npx prisma migrate dev

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Adding New Agent Types

1. **Update the schema** (`backend/prisma/schema.prisma`):
   ```prisma
   enum AgentType {
     // ... existing types
     YOUR_NEW_TYPE
   }
   ```

2. **Add processing logic** (`backend/src/services/AgentOrchestrator.ts`):
   ```typescript
   case 'YOUR_NEW_TYPE':
     output = await this.processYourNewType(agent, input);
     break;
   ```

3. **Update frontend types** (`frontend/src/types/agent.ts`):
   ```typescript
   export type AgentType = 'GENERATIVE_AI' | ... | 'YOUR_NEW_TYPE';
   ```

### API Development

All API routes are in `backend/src/routes/`:
- `auth.ts` - Authentication endpoints
- `agents.ts` - Agent management
- `tasks.ts` - Task management
- `users.ts` - User management

Example new endpoint:
```typescript
router.get('/new-endpoint', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    // Your logic here
    res.json({ data: 'response' });
  } catch (error) {
    next(error);
  }
});
```

### WebSocket Events

Add new WebSocket events in `backend/src/websocket/handlers.ts`:

```typescript
// Server-side handler
socket.on('your-event', (data) => {
  // Handle event
  io.to('room').emit('your-response', response);
});

// Frontend usage
const { socket } = useWebSocket();
socket?.emit('your-event', data);
socket?.on('your-response', handleResponse);
```

## Testing

### Backend Testing
```bash
cd backend
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # With coverage
```

### Frontend Testing
```bash
cd frontend
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # With coverage
```

## Environment Configuration

### Backend Environment Variables
Create `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/agentic_ai"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"
PORT=3001
NODE_ENV=development
```

### Frontend Environment Variables
Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
```

## Debugging

### Backend Debugging
1. Use VS Code with the Node.js debugger
2. Set breakpoints in TypeScript files
3. Run debug configuration

### Frontend Debugging
1. Use browser developer tools
2. React Developer Tools extension
3. VS Code debugger for Chrome

### Database Debugging
1. Use Prisma Studio: `npx prisma studio`
2. Check logs: `docker-compose logs postgres`
3. Connect with database client using connection string

## Performance Monitoring

### Backend Monitoring
- Winston logging with different levels
- Health check endpoint at `/health`
- Monitor Redis connections and job queues

### Frontend Monitoring
- React Query for API caching
- WebSocket connection status in UI
- Performance metrics in browser dev tools

## Code Style and Quality

### TypeScript Configuration
- Strict mode enabled
- No unused locals/parameters
- Consistent import styles

### ESLint Rules
- Standard TypeScript rules
- React hooks rules
- Import order enforcement

### Prettier Configuration
- 2-space indentation
- Single quotes
- Trailing commas

## Common Issues and Solutions

### Database Connection Issues
```bash
# Reset database
docker-compose down -v
docker-compose up -d postgres redis
cd backend && npx prisma db push
```

### Module Not Found Errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### WebSocket Connection Issues
- Check CORS configuration
- Verify WebSocket URL in frontend
- Check authentication token

### Build Issues
```bash
# Clean and rebuild
npm run build:backend
npm run build:frontend
```

## Deployment

### Docker Deployment
```bash
# Build and deploy
docker-compose build
docker-compose up -d

# Check logs
docker-compose logs -f

# Scale services
docker-compose up -d --scale backend=3
```

### Production Checklist
- [ ] Change JWT secret
- [ ] Set strong database passwords
- [ ] Configure HTTPS
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Review CORS settings
- [ ] Enable rate limiting
- [ ] Set up error tracking

## Contributing

1. Create feature branch from `main`
2. Make changes following code style
3. Add tests for new functionality
4. Update documentation
5. Submit pull request

### Commit Message Format
```
type(scope): description

feat(agents): add new agent type support
fix(auth): resolve token expiration issue
docs(readme): update installation instructions
```

## Useful Commands

```bash
# Docker management
docker-compose up -d              # Start services
docker-compose down               # Stop services
docker-compose logs -f service    # View logs
docker-compose exec backend bash # Access container

# Database operations
npx prisma studio                 # Database GUI
npx prisma generate              # Update client
npx prisma db push               # Push schema changes
npx prisma migrate dev           # Create migration

# Development
npm run dev                      # Start dev environment
npm run build                    # Build all services
npm run test                     # Run all tests
npm run lint                     # Lint all code
```
