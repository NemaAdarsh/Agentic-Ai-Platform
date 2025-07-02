export type AgentType = 'GENERATIVE_AI' | 'AUTOMATION' | 'HYPERVISOR' | 'WORKFLOW' | 'DATA_PROCESSING' | 'MONITORING' | 'CUSTOM';
export type AgentStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'ERROR' | 'STOPPED';
export type ExecutionStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type TaskStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface Agent {
  id: string;
  name: string;
  description?: string;
  type: AgentType;
  status: AgentStatus;
  config: Record<string, any>;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  userId: string;
  executions?: AgentExecution[];
  tasks?: Task[];
  _count?: {
    executions: number;
    tasks: number;
  };
}

export interface AgentExecution {
  id: string;
  status: ExecutionStatus;
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
  agentId: string;
  agent?: Agent;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  status: TaskStatus;
  priority: number;
  input: Record<string, any>;
  output?: Record<string, any>;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  agentId?: string;
  agent?: Agent;
}

export interface CreateAgentRequest {
  name: string;
  description?: string;
  type: AgentType;
  config?: Record<string, any>;
}

export interface UpdateAgentRequest {
  name?: string;
  description?: string;
  config?: Record<string, any>;
}

export interface CreateTaskRequest {
  name: string;
  description?: string;
  input: Record<string, any>;
  priority?: number;
  scheduledAt?: string;
  agentId?: string;
}

export interface UpdateTaskRequest {
  name?: string;
  description?: string;
  priority?: number;
  scheduledAt?: string;
  agentId?: string;
}

export interface DashboardStats {
  agents: {
    total: number;
    active: number;
    idle: number;
  };
  tasks: {
    total: number;
    completed: number;
    failed: number;
    pending: number;
  };
  recentExecutions: AgentExecution[];
}
