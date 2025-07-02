import { Server } from 'socket.io';
import { logger } from '../utils/logger';
import { authenticate } from '../middleware/auth';

export const initializeSocketHandlers = (io: Server) => {
  // Authentication middleware for WebSocket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        throw new Error('No token provided');
      }

      // You would verify the token here
      // For now, we'll just log the connection
      logger.info(`WebSocket connection authenticated: ${socket.id}`);
      next();
    } catch (error) {
      logger.error('WebSocket authentication failed:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Join user-specific room
    socket.on('join-user-room', (userId: string) => {
      socket.join(`user-${userId}`);
      logger.info(`Socket ${socket.id} joined room: user-${userId}`);
    });

    // Join agent-specific room
    socket.on('join-agent-room', (agentId: string) => {
      socket.join(`agent-${agentId}`);
      logger.info(`Socket ${socket.id} joined room: agent-${agentId}`);
    });

    // Handle agent execution updates
    socket.on('subscribe-agent-executions', (agentId: string) => {
      socket.join(`agent-executions-${agentId}`);
      logger.info(`Socket ${socket.id} subscribed to agent executions: ${agentId}`);
    });

    // Handle task updates
    socket.on('subscribe-task-updates', (userId: string) => {
      socket.join(`task-updates-${userId}`);
      logger.info(`Socket ${socket.id} subscribed to task updates for user: ${userId}`);
    });

    // Handle system monitoring
    socket.on('subscribe-system-metrics', () => {
      socket.join('system-metrics');
      logger.info(`Socket ${socket.id} subscribed to system metrics`);
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`Client disconnected: ${socket.id}, reason: ${reason}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
    });
  });

  return io;
};

// Helper functions to emit events
export const emitAgentStatusUpdate = (io: Server, agentId: string, status: any) => {
  io.to(`agent-${agentId}`).emit('agent-status-update', {
    agentId,
    status,
    timestamp: new Date().toISOString()
  });
};

export const emitExecutionUpdate = (io: Server, agentId: string, execution: any) => {
  io.to(`agent-executions-${agentId}`).emit('execution-update', {
    agentId,
    execution,
    timestamp: new Date().toISOString()
  });
};

export const emitTaskUpdate = (io: Server, userId: string, task: any) => {
  io.to(`task-updates-${userId}`).emit('task-update', {
    task,
    timestamp: new Date().toISOString()
  });
};

export const emitSystemMetrics = (io: Server, metrics: any) => {
  io.to('system-metrics').emit('system-metrics-update', {
    metrics,
    timestamp: new Date().toISOString()
  });
};
