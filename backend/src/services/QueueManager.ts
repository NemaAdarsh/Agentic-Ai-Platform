import Bull from 'bull';
import Redis from 'ioredis';
import { logger } from '../utils/logger';
import { AgentOrchestrator } from './AgentOrchestrator';

export class QueueManager {
  private redis: Redis;
  private queues: Map<string, Bull.Queue> = new Map();
  private defaultQueue: Bull.Queue;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    
    // Create default queue for general tasks
    this.defaultQueue = new Bull('default', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379')
      }
    });

    this.setupDefaultQueueProcessors();
  }

  async createAgentQueue(agentId: string): Promise<Bull.Queue> {
    if (this.queues.has(agentId)) {
      return this.queues.get(agentId)!;
    }

    const queue = new Bull(`agent-${agentId}`, {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379')
      }
    });

    // Set up queue processors
    queue.process('execute', async (job) => {
      const { executionId, input } = job.data;
      const orchestrator = new AgentOrchestrator();
      return await orchestrator.processExecution(executionId, agentId, input);
    });

    // Queue event handlers
    queue.on('completed', (job, result) => {
      logger.info(`Job ${job.id} completed for agent ${agentId}`, { result });
    });

    queue.on('failed', (job, err) => {
      logger.error(`Job ${job.id} failed for agent ${agentId}`, { error: err });
    });

    queue.on('stalled', (job) => {
      logger.warn(`Job ${job.id} stalled for agent ${agentId}`);
    });

    this.queues.set(agentId, queue);
    return queue;
  }

  async addAgentJob(agentId: string, data: any, options?: Bull.JobOptions): Promise<Bull.Job> {
    let queue = this.queues.get(agentId);
    
    if (!queue) {
      queue = await this.createAgentQueue(agentId);
    }

    const job = await queue.add('execute', data, {
      removeOnComplete: 50, // Keep last 50 completed jobs
      removeOnFail: 20,     // Keep last 20 failed jobs
      attempts: 3,          // Retry up to 3 times
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      ...options
    });

    logger.info(`Job ${job.id} added to agent ${agentId} queue`);
    return job;
  }

  async addTask(queueName: string, taskType: string, data: any, options?: Bull.JobOptions): Promise<Bull.Job> {
    const job = await this.defaultQueue.add(taskType, data, {
      removeOnComplete: 100,
      removeOnFail: 50,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      },
      ...options
    });

    logger.info(`Task ${job.id} added to ${queueName} queue`);
    return job;
  }

  private setupDefaultQueueProcessors(): void {
    // System maintenance tasks
    this.defaultQueue.process('system-cleanup', async (job) => {
      logger.info('Running system cleanup task');
      // Implement cleanup logic
      return { status: 'completed', timestamp: new Date().toISOString() };
    });

    // Health check tasks
    this.defaultQueue.process('health-check', async (job) => {
      logger.info('Running health check task');
      // Implement health check logic
      return { 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        activeQueues: this.queues.size
      };
    });

    // Default queue event handlers
    this.defaultQueue.on('completed', (job, result) => {
      logger.info(`Default queue job ${job.id} completed`, { result });
    });

    this.defaultQueue.on('failed', (job, err) => {
      logger.error(`Default queue job ${job.id} failed`, { error: err });
    });
  }

  async getQueueStats(queueName?: string): Promise<any> {
    const queue = queueName ? this.queues.get(queueName) : this.defaultQueue;
    
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const waiting = await queue.getWaiting();
    const active = await queue.getActive();
    const completed = await queue.getCompleted();
    const failed = await queue.getFailed();

    return {
      queueName: queueName || 'default',
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      total: waiting.length + active.length + completed.length + failed.length
    };
  }

  async pauseQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (queue) {
      await queue.pause();
      logger.info(`Queue ${queueName} paused`);
    }
  }

  async resumeQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (queue) {
      await queue.resume();
      logger.info(`Queue ${queueName} resumed`);
    }
  }

  async clearQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    if (queue) {
      await queue.empty();
      logger.info(`Queue ${queueName} cleared`);
    }
  }

  async shutdown(): Promise<void> {
    logger.info('Shutting down queue manager');
    
    // Close all agent queues
    for (const [queueName, queue] of this.queues) {
      await queue.close();
      logger.info(`Queue ${queueName} closed`);
    }
    
    // Close default queue
    await this.defaultQueue.close();
    
    // Disconnect Redis
    await this.redis.disconnect();
    
    logger.info('Queue manager shutdown complete');
  }
}
