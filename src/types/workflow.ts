
export interface WorkflowNode {
  id: string;
  type: string;
  name: string;
  description: string;
  position: {
    x: number;
    y: number;
  };
  data: Record<string, any>;
  connections: string[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  lastRun: string | null;
  nodes: WorkflowNode[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed';
  startTime: string;
  endTime: string | null;
  results: Record<string, any>;
}
