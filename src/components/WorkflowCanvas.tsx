
import React, { useState } from 'react';
import { Workflow, WorkflowNode } from '../types/workflow';
import { Button } from './ui/button';
import { Plus, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface WorkflowCanvasProps {
  workflow: Workflow;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ workflow }) => {
  const [zoom, setZoom] = useState(1);
  
  // Calculate line coordinates between nodes
  const getNodeConnections = () => {
    const connections: { from: WorkflowNode; to: WorkflowNode }[] = [];
    
    workflow.nodes.forEach(node => {
      node.connections.forEach(targetId => {
        const targetNode = workflow.nodes.find(n => n.id === targetId);
        if (targetNode) {
          connections.push({ from: node, to: targetNode });
        }
      });
    });
    
    return connections;
  };
  
  const renderNode = (node: WorkflowNode) => {
    const nodeWidth = 220;
    const nodeHeight = 120;
    
    // Get node type color and icon
    const getNodeTypeStyles = () => {
      switch (node.type) {
        case 'trigger':
          return {
            borderColor: 'border-blue-500',
            bgColor: 'bg-blue-50 dark:bg-blue-950/30',
            iconColor: 'text-blue-500',
            icon: '⚡'
          };
        case 'action':
          return {
            borderColor: 'border-green-500',
            bgColor: 'bg-green-50 dark:bg-green-950/30',
            iconColor: 'text-green-500',
            icon: '▶️'
          };
        case 'condition':
          return {
            borderColor: 'border-amber-500',
            bgColor: 'bg-amber-50 dark:bg-amber-950/30',
            iconColor: 'text-amber-500',
            icon: '❓'
          };
        default:
          return {
            borderColor: 'border-gray-500',
            bgColor: 'bg-gray-50 dark:bg-gray-950/30',
            iconColor: 'text-gray-500',
            icon: '📝'
          };
      }
    };

    const styles = getNodeTypeStyles();
    
    return (
      <div 
        key={node.id}
        className={`absolute flex flex-col p-3 rounded-lg shadow-md border-2 transition-all duration-200 
                    hover:shadow-lg hover:translate-y-[-2px] ${styles.borderColor} ${styles.bgColor}`}
        style={{
          width: `${nodeWidth}px`,
          height: `${nodeHeight}px`,
          left: `${node.position.x}px`,
          top: `${node.position.y}px`,
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className={`flex items-center justify-center w-7 h-7 rounded-full ${styles.bgColor} ${styles.iconColor} text-lg font-bold`}>
            {styles.icon}
          </div>
          <div className="font-medium text-sm truncate">{node.name}</div>
        </div>
        <div className="text-xs text-muted-foreground overflow-hidden flex-grow">
          {node.description}
        </div>
        <div className="text-xs font-medium pt-2 border-t mt-2 text-muted-foreground">
          {node.type.charAt(0).toUpperCase() + node.type.slice(1)}
        </div>
      </div>
    );
  };
  
  const renderConnections = () => {
    const connections = getNodeConnections();
    
    return connections.map((connection, index) => {
      const fromNode = connection.from;
      const toNode = connection.to;
      
      // Calculate starting and ending points for the connection line
      const startX = fromNode.position.x + 220; // nodeWidth
      const startY = fromNode.position.y + 60;  // nodeHeight / 2
      const endX = toNode.position.x;
      const endY = toNode.position.y + 60;      // nodeHeight / 2
      
      // Create a curved path
      const controlPointX = (startX + endX) / 2;
      const difference = Math.abs(startY - endY);
      const curvature = Math.min(difference * 0.5, 100);
      
      // Add some randomness to make it look natural when lines overlap
      const offset = index % 2 === 0 ? 15 : -15;
      
      return (
        <svg
          key={`connection-${index}`}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ zIndex: -1, transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        >
          <path
            d={`M ${startX} ${startY} 
                C ${controlPointX + offset} ${startY}, 
                  ${controlPointX + offset} ${endY}, 
                  ${endX} ${endY}`}
            className="stroke-workflow-line fill-transparent"
            style={{ strokeWidth: 2, strokeDasharray: '0' }}
          />
          
          {/* Arrow head */}
          <circle cx={endX} cy={endY} r="4" className="fill-workflow-line" />
          
          {/* Animated dot for active workflows */}
          {workflow.status === 'active' && (
            <circle 
              cx="0" cy="0" r="3" 
              className="fill-white stroke-workflow-line"
              style={{ strokeWidth: 1 }}
            >
              <animate
                attributeName="cx"
                from={startX}
                to={endX}
                dur={`${2 + Math.random()}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                from={startY}
                to={endY}
                dur={`${2 + Math.random()}s`}
                repeatCount="indefinite"
              />
            </circle>
          )}
        </svg>
      );
    });
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border rounded-lg mb-2 p-1 flex items-center gap-1 self-start">
        <Button 
          onClick={handleZoomIn} 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          title="확대"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <div className="text-xs px-2">
          {Math.round(zoom * 100)}%
        </div>
        <Button 
          onClick={handleZoomOut} 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          title="축소"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button 
          onClick={handleResetZoom} 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          title="초기화"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
      
      <div 
        className="workflow-canvas relative overflow-auto flex-grow rounded-lg bg-white border"
        style={{ height: '500px' }}
      >
        <div 
          className="absolute min-w-full min-h-full"
          style={{ width: '2000px', height: '1000px' }}
        >
          {renderConnections()}
          {workflow.nodes.map(renderNode)}
          
          {workflow.nodes.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <div className="mb-4">이 워크플로우에는 노드가 없습니다</div>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                첫 노드 추가하기
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowCanvas;
