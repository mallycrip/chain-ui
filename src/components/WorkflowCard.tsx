
import React from 'react';
import { Workflow } from '../types/workflow';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Play, Settings, Calendar, Clock, LayoutGrid } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface WorkflowCardProps {
  workflow: Workflow;
  onManage: (workflow: Workflow) => void;
  onExecute: (workflowId: string) => void;
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({ workflow, onManage, onExecute }) => {
  const getStatusBadge = () => {
    switch (workflow.status) {
      case 'active':
        return <Badge className="bg-workflow-success">활성</Badge>;
      case 'inactive':
        return <Badge variant="outline">비활성</Badge>;
      case 'error':
        return <Badge className="bg-workflow-error">오류</Badge>;
      default:
        return null;
    }
  };

  const getLastRunText = () => {
    if (!workflow.lastRun) return '실행 기록 없음';
    return `${formatDistanceToNow(new Date(workflow.lastRun), { addSuffix: true })} 실행됨`;
  };

  // Function to get node type icon or emoji
  const getNodeTypeIcon = (type: string) => {
    switch (type) {
      case 'trigger':
        return '⚡';
      case 'action':
        return '▶️';
      case 'condition':
        return '❓';
      default:
        return '📝';
    }
  };

  // Count nodes by type
  const nodesByType = workflow.nodes.reduce((acc, node) => {
    acc[node.type] = (acc[node.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">{workflow.name}</CardTitle>
        {getStatusBadge()}
      </CardHeader>
      <CardContent className="pb-0">
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2 h-10">{workflow.description}</p>
        
        <div className="flex items-center text-xs text-muted-foreground mb-3">
          <Clock className="h-3 w-3 mr-1" />
          <span>{getLastRunText()}</span>
        </div>
        
        <div className="flex items-center text-xs text-muted-foreground">
          <LayoutGrid className="h-3 w-3 mr-1" />
          <span>{workflow.nodes.length}개 노드</span>
        </div>
        
        <div className="mt-3 pt-3 border-t flex flex-wrap gap-1">
          {Object.entries(nodesByType).map(([type, count]) => (
            <div key={type} className="text-xs bg-muted rounded-full px-2 py-0.5 flex items-center">
              <span className="mr-1">{getNodeTypeIcon(type)}</span>
              <span className="capitalize">{type}</span>
              <span className="ml-1 font-medium">{count}</span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-4 mt-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onManage(workflow)}
          className="flex items-center gap-1"
        >
          <Settings className="h-4 w-4" />
          관리
        </Button>
        <Button 
          size="sm" 
          onClick={() => onExecute(workflow.id)}
          className="flex items-center gap-1"
          disabled={workflow.status !== 'active'}
        >
          <Play className="h-4 w-4" />
          실행
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WorkflowCard;
