import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Get current user profile
router.get('/profile', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            agents: true,
            sessions: true,
            apiKeys: true
          }
        }
      }
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// Get all users (admin only)
router.get('/', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query as any;

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            agents: true,
            sessions: true,
            apiKeys: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const total = await prisma.user.count();

    res.json({
      users,
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

// Get user by ID (admin only)
router.get('/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        agents: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            agents: true,
            sessions: true,
            apiKeys: true
          }
        }
      }
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// Update user role (super admin only)
router.put('/:id/role', authenticate, authorize(['SUPER_ADMIN']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { role } = req.body;

    if (!['USER', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
      throw createError('Invalid role', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.params.id }
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'User role updated successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
});

// Delete user (super admin only)
router.delete('/:id', authenticate, authorize(['SUPER_ADMIN']), async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id }
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    // Prevent deleting self
    if (user.id === req.user!.id) {
      throw createError('Cannot delete your own account', 400);
    }

    await prisma.user.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get user dashboard stats
router.get('/dashboard/stats', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const [
      totalAgents,
      activeAgents,
      totalTasks,
      completedTasks,
      failedTasks,
      recentExecutions
    ] = await Promise.all([
      prisma.agent.count({ where: { userId } }),
      prisma.agent.count({ where: { userId, status: 'RUNNING' } }),
      prisma.task.count({
        where: { agent: { userId } }
      }),
      prisma.task.count({
        where: { agent: { userId }, status: 'COMPLETED' }
      }),
      prisma.task.count({
        where: { agent: { userId }, status: 'FAILED' }
      }),
      prisma.agentExecution.findMany({
        where: { agent: { userId } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          agent: {
            select: { name: true, type: true }
          }
        }
      })
    ]);

    const stats = {
      agents: {
        total: totalAgents,
        active: activeAgents,
        idle: totalAgents - activeAgents
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        failed: failedTasks,
        pending: totalTasks - completedTasks - failedTasks
      },
      recentExecutions
    };

    res.json({ stats });
  } catch (error) {
    next(error);
  }
});

export { router as userRouter };
