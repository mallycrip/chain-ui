
import React from 'react';
import { Workflow, WorkflowNode } from '../types/workflow';

interface WorkflowCanvasProps {
  workflow: Workflow;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ workflow }) => {
  const canvasWidth = 1200;
  const canvasHeight = 600;
  
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
    const nodeWidth = 200;
    const nodeHeight = 100;
    
    // Get node type color
    const getNodeBorderColor = () => {
      switch (node.type) {
        case 'trigger':
          return 'border-blue-500';
        case 'action':
          return 'border-green-500';
        case 'condition':
          return 'border-amber-500';
        default:
          return 'border-gray-500';
      }
    };
    
    return (
      <div 
        key={node.id}
        className={`absolute workflow-node ${getNodeBorderColor()}`}
        style={{
          width: `${nodeWidth}px`,
          height: `${nodeHeight}px`,
          left: `${node.position.x}px`,
          top: `${node.position.y}px`,
        }}
      >
        <div className="font-medium text-sm">{node.name}</div>
        <div className="text-xs text-muted-foreground mt-1">{node.description}</div>
      </div>
    );
  };
  
  const renderConnections = () => {
    const connections = getNodeConnections();
    
    return connections.map((connection, index) => {
      const fromNode = connection.from;
      const toNode = connection.to;
      
      // Calculate starting and ending points for the connection line
      const startX = fromNode.position.x + 200; // nodeWidth
      const startY = fromNode.position.y + 50;  // nodeHeight / 2
      const endX = toNode.position.x;
      const endY = toNode.position.y + 50;      // nodeHeight / 2
      
      // Create a curved path
      const controlPointX = (startX + endX) / 2;
      
      return (
        <svg
          key={`connection-${index}`}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ zIndex: -1 }}
        >
          <path
            d={`M ${startX} ${startY} C ${controlPointX} ${startY}, ${controlPointX} ${endY}, ${endX} ${endY}`}
            className="workflow-line fill-transparent"
          />
          <circle cx={endX} cy={endY} r="3" className="fill-workflow-line" />
        </svg>
      );
    });
  };
  
  return (
    <div 
      className="workflow-canvas relative overflow-auto"
      style={{ width: '100%', height: `${canvasHeight}px` }}
    >
      <div 
        className="absolute" 
        style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
      >
        {renderConnections()}
        {workflow.nodes.map(renderNode)}
      </div>
    </div>
  );
};

export default WorkflowCanvas;
