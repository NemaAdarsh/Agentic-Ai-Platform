import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient, TaskStatus } from '@prisma/client';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

const createTaskSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  input: z.object({}).passthrough(),
  priority: z.number().min(1).max(10).optional(),
  scheduledAt: z.string().datetime().optional(),
  agentId: z.string().uuid().optional()
});

const updateTaskSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  priority: z.number().min(1).max(10).optional(),
  scheduledAt: z.string().datetime().optional(),
  agentId: z.string().uuid().optional()
});

// Get all tasks for authenticated user
router.get('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { status, agentId, limit = 50, offset = 0 } = req.query as any;
    
    const where: any = {};
    
    // Filter by agent ownership through agent relation
    if (agentId) {
      where.agentId = agentId;
      // Verify agent belongs to user
      const agent = await prisma.agent.findFirst({
        where: { id: agentId, userId: req.user!.id }
      });
      if (!agent) {
        throw createError('Agent not found', 404);
      }
    } else {
      // Only show tasks for user's agents
      where.agent = {
        userId: req.user!.id
      };
    }
    
    if (status) {
      where.status = status;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const total = await prisma.task.count({ where });

    res.json({
      tasks,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get task by ID
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        agent: {
          userId: req.user!.id
        }
      },
      include: {
        agent: true
      }
    });

    if (!task) {
      throw createError('Task not found', 404);
    }

    res.json({ task });
  } catch (error) {
    next(error);
  }
});

// Create new task
router.post('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { name, description, input, priority, scheduledAt, agentId } = createTaskSchema.parse(req.body);

    // Verify agent belongs to user if agentId provided
    if (agentId) {
      const agent = await prisma.agent.findFirst({
        where: { id: agentId, userId: req.user!.id }
      });
      if (!agent) {
        throw createError('Agent not found', 404);
      }
    }

    const task = await prisma.task.create({
      data: {
        name,
        description,
        input,
        priority: priority || 1,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        agentId
      },
      include: {
        agent: true
      }
    });

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    next(error);
  }
});

// Update task
router.put('/:id', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { name, description, priority, scheduledAt, agentId } = updateTaskSchema.parse(req.body);

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        agent: {
          userId: req.user!.id
        }
      }
    });

    if (!existingTask) {
      throw createError('Task not found', 404);
    }

    // Verify new agent belongs to user if agentId provided
    if (agentId) {
      const agent = await prisma.agent.findFirst({
        where: { id: agentId, userId: req.user!.id }
      });
      if (!agent) {
        throw createError('Agent not found', 404);
      }
    }

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        priority,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        agentId
      },
      include: {
        agent: true
      }
    });

    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    next(error);
  }
});

// Execute task
router.post('/:id/execute', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        agent: {
          userId: req.user!.id
        }
      },
      include: {
        agent: true
      }
    });

    if (!task) {
      throw createError('Task not found', 404);
    }

    if (!task.agent) {
      throw createError('Task has no assigned agent', 400);
    }

    // Update task status to running
    await prisma.task.update({
      where: { id: task.id },
      data: {
        status: TaskStatus.RUNNING,
        startedAt: new Date()
      }
    });

    // Here you would integrate with the AgentOrchestrator to execute the task
    // For now, we'll simulate execution
    setTimeout(async () => {
      try {
        await prisma.task.update({
          where: { id: task.id },
          data: {
            status: TaskStatus.COMPLETED,
            completedAt: new Date(),
            output: {
              result: 'Task completed successfully',
              timestamp: new Date().toISOString()
            }
          }
        });
      } catch (error) {
        await prisma.task.update({
          where: { id: task.id },
          data: {
            status: TaskStatus.FAILED,
            completedAt: new Date(),
            output: {
              error: 'Task execution failed',
              timestamp: new Date().toISOString()
            }
          }
        });
      }
    }, 2000);

    res.json({
      message: 'Task execution started',
      taskId: task.id
    });
  } catch (error) {
    next(error);
  }
});

// Cancel task
router.post('/:id/cancel', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        agent: {
          userId: req.user!.id
        }
      }
    });

    if (!task) {
      throw createError('Task not found', 404);
    }

    if (task.status === TaskStatus.COMPLETED) {
      throw createError('Cannot cancel completed task', 400);
    }

    const updatedTask = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        status: TaskStatus.CANCELLED,
        completedAt: new Date()
      }
    });

    res.json({
      message: 'Task cancelled successfully',
      task: updatedTask
    });
  } catch (error) {
    next(error);
  }
});

// Delete task
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        agent: {
          userId: req.user!.id
        }
      }
    });

    if (!task) {
      throw createError('Task not found', 404);
    }

    await prisma.task.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export { router as taskRouter };
