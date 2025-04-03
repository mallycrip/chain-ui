
import React, { useState } from 'react';
import { Workflow, WorkflowNode } from '../types/workflow';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Play, Pause, Trash, Save, Plus, Settings, Info, Clock, LayoutGrid } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import WorkflowCanvas from './WorkflowCanvas';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface WorkflowModalProps {
  workflow: Workflow | null;
  isOpen: boolean;
  onClose: () => void;
  onExecute: (workflowId: string) => void;
  onToggleStatus: (workflow: Workflow) => void;
  onDelete: (workflowId: string) => void;
  onUpdateWorkflow: (updatedWorkflow: Workflow) => void;
}

const WorkflowModal: React.FC<WorkflowModalProps> = ({
  workflow,
  isOpen,
  onClose,
  onExecute,
  onToggleStatus,
  onDelete,
  onUpdateWorkflow,
}) => {
  const [activeTab, setActiveTab] = useState('canvas');
  
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

  // Group nodes by type for statistics
  const nodesByType = workflow.nodes.reduce((acc, node) => {
    acc[node.type] = (acc[node.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-xl">{workflow.name}</DialogTitle>
              {getStatusBadge()}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="워크플로우 설정">
                <Settings className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="워크플로우 정보">
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {workflow.description}
          </div>
          <div className="flex gap-3 text-xs text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              최근 실행: {workflow.lastRun ? formatDistanceToNow(new Date(workflow.lastRun), { addSuffix: true }) : '없음'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <LayoutGrid className="h-3 w-3" />
              노드: {workflow.nodes.length}개
            </span>
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="canvas" className="flex-1 flex flex-col" value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b px-6">
            <TabsList className="h-10">
              <TabsTrigger value="canvas" className="data-[state=active]:bg-background">캔버스</TabsTrigger>
              <TabsTrigger value="nodes" className="data-[state=active]:bg-background">노드</TabsTrigger>
              <TabsTrigger value="executions" className="data-[state=active]:bg-background">실행 기록</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-auto">
            <TabsContent value="canvas" className="flex-1 mt-0 h-full">
              <div className="p-4 h-full bg-muted/30">
                <WorkflowCanvas 
                  workflow={workflow}
                  onUpdateWorkflow={onUpdateWorkflow}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="nodes" className="flex-1 mt-0 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-card rounded-lg p-4 border">
                  <div className="text-sm font-medium mb-2">노드 통계</div>
                  <div className="space-y-2">
                    {Object.entries(nodesByType).map(([type, count]) => (
                      <div key={type} className="flex justify-between text-sm">
                        <span className="text-muted-foreground capitalize">{type}</span>
                        <span className="font-medium">{count}개</span>
                      </div>
                    ))}
                    {Object.keys(nodesByType).length === 0 && (
                      <div className="text-sm text-muted-foreground">노드가 없습니다</div>
                    )}
                  </div>
                </div>
                
                <div className="bg-card rounded-lg p-4 border">
                  <div className="text-sm font-medium mb-2">총 노드</div>
                  <div className="text-2xl font-bold">{workflow.nodes.length}개</div>
                </div>
                
                <div className="bg-card rounded-lg p-4 border">
                  <div className="text-sm font-medium mb-2">마지막 수정</div>
                  <div className="text-sm">
                    {formatDistanceToNow(new Date(workflow.updatedAt), { addSuffix: true })}
                  </div>
                </div>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>이름</TableHead>
                      <TableHead>유형</TableHead>
                      <TableHead>설명</TableHead>
                      <TableHead>연결</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workflow.nodes.length > 0 ? (
                      workflow.nodes.map((node) => (
                        <TableRow key={node.id}>
                          <TableCell className="font-medium">{node.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {node.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{node.description}</TableCell>
                          <TableCell>{node.connections.length}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                          노드가 없습니다
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="executions" className="flex-1 mt-0 p-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>실행 시간</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>소요 시간</TableHead>
                      <TableHead>액션</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workflow.lastRun ? (
                      <TableRow>
                        <TableCell>
                          {formatDistanceToNow(new Date(workflow.lastRun), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-workflow-success">성공</Badge>
                        </TableCell>
                        <TableCell>2초</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Info className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                          실행 기록이 없습니다
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </div>
        </Tabs>
        
        <DialogFooter className="flex justify-between p-6 border-t bg-card">
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
