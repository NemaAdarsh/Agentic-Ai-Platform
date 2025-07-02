import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient, AgentType, AgentStatus } from '@prisma/client';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { AgentOrchestrator } from '../services/AgentOrchestrator';

const router = Router();
const prisma = new PrismaClient();
const orchestrator = new AgentOrchestrator();

const createAgentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  type: z.nativeEnum(AgentType),
  config: z.object({}).optional()
});

const updateAgentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  config: z.object({}).optional()
});

// Get all agents for authenticated user
router.get('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const agents = await prisma.agent.findMany({
      where: { userId: req.user!.id },
      include: {
        executions: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { executions: true, tasks: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ agents });
  } catch (error) {
    next(error);
  }
});

// Get agent by ID
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const agent = await prisma.agent.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      },
      include: {
        executions: {
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        tasks: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!agent) {
      throw createError('Agent not found', 404);
    }

    res.json({ agent });
  } catch (error) {
    next(error);
  }
});

// Create new agent
router.post('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { name, description, type, config } = createAgentSchema.parse(req.body);

    const agent = await prisma.agent.create({
      data: {
        name,
        description,
        type,
        config: config || {},
        userId: req.user!.id
      }
    });

    // Initialize agent in orchestrator
    await orchestrator.initializeAgent(agent);

    res.status(201).json({
      message: 'Agent created successfully',
      agent
    });
  } catch (error) {
    next(error);
  }
});

// Update agent
router.put('/:id', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { name, description, config } = updateAgentSchema.parse(req.body);

    const agent = await prisma.agent.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!agent) {
      throw createError('Agent not found', 404);
    }

    const updatedAgent = await prisma.agent.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        config: config || agent.config
      }
    });

    res.json({
      message: 'Agent updated successfully',
      agent: updatedAgent
    });
  } catch (error) {
    next(error);
  }
});

// Execute agent
router.post('/:id/execute', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const agent = await prisma.agent.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!agent) {
      throw createError('Agent not found', 404);
    }

    const execution = await orchestrator.executeAgent(agent.id, req.body);

    res.json({
      message: 'Agent execution started',
      execution
    });
  } catch (error) {
    next(error);
  }
});

// Start/Stop agent
router.post('/:id/:action', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { action } = req.params;
    
    if (!['start', 'stop', 'pause'].includes(action)) {
      throw createError('Invalid action', 400);
    }

    const agent = await prisma.agent.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!agent) {
      throw createError('Agent not found', 404);
    }

    let newStatus: AgentStatus;
    switch (action) {
      case 'start':
        newStatus = AgentStatus.RUNNING;
        break;
      case 'stop':
        newStatus = AgentStatus.STOPPED;
        break;
      case 'pause':
        newStatus = AgentStatus.PAUSED;
        break;
      default:
        throw createError('Invalid action', 400);
    }

    const updatedAgent = await prisma.agent.update({
      where: { id: req.params.id },
      data: { status: newStatus }
    });

    res.json({
      message: `Agent ${action}ed successfully`,
      agent: updatedAgent
    });
  } catch (error) {
    next(error);
  }
});

// Delete agent
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const agent = await prisma.agent.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!agent) {
      throw createError('Agent not found', 404);
    }

    await prisma.agent.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export { router as agentRouter };
