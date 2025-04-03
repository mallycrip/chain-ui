
import React, { useState } from 'react';
import { mockWorkflows } from '../data/mockWorkflows';
import { Workflow } from '../types/workflow';
import WorkflowCard from '../components/WorkflowCard';
import WorkflowModal from '../components/WorkflowModal';
import WorkflowForm from '../components/WorkflowForm';
import { Button } from '@/components/ui/button';
import { Play, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>(mockWorkflows);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWorkflowFormOpen, setIsWorkflowFormOpen] = useState(false);
  const { toast } = useToast();

  const handleExecuteWorkflow = (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    if (workflow.status !== 'active') {
      toast({
        title: "실행 불가",
        description: "비활성화된 워크플로우는 실행할 수 없습니다.",
        variant: "destructive"
      });
      return;
    }

    // Simulate workflow execution
    toast({
      title: "워크플로우 실행 중",
      description: `"${workflow.name}" 워크플로우가 실행되었습니다.`,
    });

    // Update last run time
    const updatedWorkflows = workflows.map(w => {
      if (w.id === workflowId) {
        return {
          ...w,
          lastRun: new Date().toISOString()
        };
      }
      return w;
    });

    setWorkflows(updatedWorkflows);
  };

  const handleExecuteAll = () => {
    const activeWorkflows = workflows.filter(w => w.status === 'active');
    
    if (activeWorkflows.length === 0) {
      toast({
        title: "실행 불가",
        description: "활성화된 워크플로우가 없습니다.",
        variant: "destructive"
      });
      return;
    }

    // Simulate executing all active workflows
    toast({
      title: "모든 워크플로우 실행",
      description: `${activeWorkflows.length}개의 워크플로우가 실행되었습니다.`,
    });

    // Update last run time for all active workflows
    const now = new Date().toISOString();
    const updatedWorkflows = workflows.map(w => {
      if (w.status === 'active') {
        return {
          ...w,
          lastRun: now
        };
      }
      return w;
    });

    setWorkflows(updatedWorkflows);
  };

  const handleToggleStatus = (workflow: Workflow) => {
    const updatedWorkflows = workflows.map(w => {
      if (w.id === workflow.id) {
        // Ensure we're using the correct type for status
        const newStatus: 'active' | 'inactive' | 'error' = w.status === 'active' ? 'inactive' : 'active';
        
        toast({
          title: "상태 변경",
          description: `"${w.name}" 워크플로우가 ${newStatus === 'active' ? '활성화' : '비활성화'}되었습니다.`,
        });
        
        return {
          ...w,
          status: newStatus
        };
      }
      return w;
    });

    setWorkflows(updatedWorkflows);
  };

  const handleDeleteWorkflow = (workflowId: string) => {
    const workflowToDelete = workflows.find(w => w.id === workflowId);
    if (!workflowToDelete) return;

    const updatedWorkflows = workflows.filter(w => w.id !== workflowId);
    setWorkflows(updatedWorkflows);

    toast({
      title: "워크플로우 삭제됨",
      description: `"${workflowToDelete.name}" 워크플로우가 삭제되었습니다.`,
    });
  };

  const handleUpdateWorkflow = (updatedWorkflow: Workflow) => {
    const updatedWorkflows = workflows.map(w => 
      w.id === updatedWorkflow.id ? updatedWorkflow : w
    );
    
    setWorkflows(updatedWorkflows);
    
    // If the workflow is currently selected, update the selected workflow
    if (selectedWorkflow && selectedWorkflow.id === updatedWorkflow.id) {
      setSelectedWorkflow(updatedWorkflow);
    }
  };

  const handleCreateWorkflow = (newWorkflow: Workflow) => {
    setWorkflows([...workflows, newWorkflow]);
    
    toast({
      title: "워크플로우 생성됨",
      description: `"${newWorkflow.name}" 워크플로우가 생성되었습니다.`,
    });
  };

  const openModal = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedWorkflow(null);
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">워크플로우 관리</h1>
          <p className="text-muted-foreground mt-2">
            총 {workflows.length}개 워크플로우, {workflows.filter(w => w.status === 'active').length}개 활성화됨
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsWorkflowFormOpen(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            워크플로우 생성
          </Button>
          <Button 
            onClick={handleExecuteAll}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            모든 워크플로우 실행
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {workflows.map(workflow => (
          <WorkflowCard
            key={workflow.id}
            workflow={workflow}
            onManage={openModal}
            onExecute={handleExecuteWorkflow}
          />
        ))}
        
        {workflows.length === 0 && (
          <div className="col-span-full text-center py-20 text-muted-foreground">
            <p className="mb-4">워크플로우가 없습니다</p>
            <Button 
              onClick={() => setIsWorkflowFormOpen(true)}
              variant="outline"
              className="flex items-center gap-2 mx-auto"
            >
              <Plus className="h-4 w-4" />
              첫 워크플로우 생성하기
            </Button>
          </div>
        )}
      </div>

      <WorkflowModal
        workflow={selectedWorkflow}
        isOpen={isModalOpen}
        onClose={closeModal}
        onExecute={handleExecuteWorkflow}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeleteWorkflow}
        onUpdateWorkflow={handleUpdateWorkflow}
      />
      
      <WorkflowForm
        isOpen={isWorkflowFormOpen}
        onClose={() => setIsWorkflowFormOpen(false)}
        onSubmit={handleCreateWorkflow}
      />
    </div>
  );
};

export default Index;
