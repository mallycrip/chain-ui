
import React from 'react';
import { Workflow } from '../types/workflow';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Play, Settings } from 'lucide-react';
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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">{workflow.name}</CardTitle>
        {getStatusBadge()}
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground mb-2">{workflow.description}</p>
        <p className="text-xs text-muted-foreground">{getLastRunText()}</p>
        <p className="text-xs text-muted-foreground">{workflow.nodes.length}개 노드</p>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
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
