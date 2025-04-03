
import React from 'react';
import { Workflow } from '../types/workflow';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Play, Pause, Trash, Save } from 'lucide-react';
import WorkflowCanvas from './WorkflowCanvas';

interface WorkflowModalProps {
  workflow: Workflow | null;
  isOpen: boolean;
  onClose: () => void;
  onExecute: (workflowId: string) => void;
  onToggleStatus: (workflow: Workflow) => void;
  onDelete: (workflowId: string) => void;
}

const WorkflowModal: React.FC<WorkflowModalProps> = ({
  workflow,
  isOpen,
  onClose,
  onExecute,
  onToggleStatus,
  onDelete,
}) => {
  if (!workflow) return null;

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

  const getToggleStatusButton = () => {
    if (workflow.status === 'active') {
      return (
        <Button 
          variant="outline" 
          onClick={() => onToggleStatus(workflow)}
          className="flex items-center gap-2"
        >
          <Pause className="h-4 w-4" />
          비활성화
        </Button>
      );
    }
    
    return (
      <Button 
        variant="outline" 
        onClick={() => onToggleStatus(workflow)}
        className="flex items-center gap-2"
      >
        <Play className="h-4 w-4" />
        활성화
      </Button>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{workflow.name}</DialogTitle>
            {getStatusBadge()}
          </div>
          <div className="text-sm text-muted-foreground">
            {workflow.description}
          </div>
          <div className="flex gap-3 text-xs text-muted-foreground">
            <span>최근 실행: {workflow.lastRun ? formatDistanceToNow(new Date(workflow.lastRun), { addSuffix: true }) : '없음'}</span>
            <span>•</span>
            <span>생성: {formatDistanceToNow(new Date(workflow.createdAt), { addSuffix: true })}</span>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto my-4">
          <WorkflowCanvas workflow={workflow} />
        </div>
        
        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {getToggleStatusButton()}
            <Button 
              variant="destructive" 
              onClick={() => {
                onDelete(workflow.id);
                onClose();
              }}
              className="flex items-center gap-2"
            >
              <Trash className="h-4 w-4" />
              삭제
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={onClose} variant="outline">닫기</Button>
            <Button 
              onClick={() => onExecute(workflow.id)}
              disabled={workflow.status !== 'active'}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              지금 실행
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WorkflowModal;
