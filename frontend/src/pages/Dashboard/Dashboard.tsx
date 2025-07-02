import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  SmartToy as AgentsIcon,
  Assignment as TasksIcon,
  PlayArrow as RunningIcon,
  CheckCircle as CompletedIcon,
  Error as ErrorIcon,
  Pause as PausedIcon,
} from '@mui/icons-material';

const Dashboard: React.FC = () => {
  // Mock data - in real app this would come from API
  const stats = {
    agents: {
      total: 12,
      active: 8,
      idle: 4,
    },
    tasks: {
      total: 156,
      completed: 142,
      failed: 3,
      pending: 11,
    },
    recentExecutions: [
      {
        id: '1',
        agentName: 'Data Processor',
        agentType: 'DATA_PROCESSING',
        status: 'COMPLETED',
        createdAt: '2024-12-19T10:30:00Z',
      },
      {
        id: '2',
        agentName: 'Content Generator',
        agentType: 'GENERATIVE_AI',
        status: 'RUNNING',
        createdAt: '2024-12-19T10:25:00Z',
      },
      {
        id: '3',
        agentName: 'System Monitor',
        agentType: 'MONITORING',
        status: 'COMPLETED',
        createdAt: '2024-12-19T10:20:00Z',
      },
    ],
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'FAILED':
        return 'error';
      case 'PAUSED':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return <RunningIcon />;
      case 'COMPLETED':
        return <CompletedIcon />;
      case 'FAILED':
        return <ErrorIcon />;
      case 'PAUSED':
        return <PausedIcon />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Agent Stats */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AgentsIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Agents</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="h3" color="primary">
                    {stats.agents.total}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h3" color="success.main">
                    {stats.agents.active}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Active
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h3" color="text.secondary">
                    {stats.agents.idle}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Idle
                  </Typography>
                </Grid>
              </Grid>
              <Box mt={2}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Activity Rate
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(stats.agents.active / stats.agents.total) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Task Stats */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TasksIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Tasks</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="h3" color="primary">
                    {stats.tasks.total}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h3" color="success.main">
                    {stats.tasks.completed}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Completed
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h3" color="warning.main">
                    {stats.tasks.pending}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Pending
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h3" color="error.main">
                    {stats.tasks.failed}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Failed
                  </Typography>
                </Grid>
              </Grid>
              <Box mt={2}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Success Rate
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(stats.tasks.completed / stats.tasks.total) * 100}
                  color="success"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Executions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Executions
            </Typography>
            <List>
              {stats.recentExecutions.map((execution) => (
                <ListItem key={execution.id} divider>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1">
                          {execution.agentName}
                        </Typography>
                        <Chip
                          size="small"
                          label={execution.agentType.replace('_', ' ')}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={new Date(execution.createdAt).toLocaleString()}
                  />
                  <Chip
                    icon={getStatusIcon(execution.status) || undefined}
                    label={execution.status}
                    color={getStatusColor(execution.status) as any}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
