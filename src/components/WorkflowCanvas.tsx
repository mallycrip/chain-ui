
import React, { useState, useRef, useEffect } from 'react';
import { Workflow, WorkflowNode } from '../types/workflow';
import { Button } from './ui/button';
import { Plus, ZoomIn, ZoomOut, RotateCcw, Link, ArrowRight, Circle } from 'lucide-react';

interface WorkflowCanvasProps {
  workflow: Workflow;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ workflow }) => {
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  
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

  // Handle canvas panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setDragging('canvas');
      setStartPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging === 'canvas' && canvasRef.current) {
      const dx = (e.clientX - startPos.x) / zoom;
      const dy = (e.clientY - startPos.y) / zoom;
      setCanvasOffset({
        x: canvasOffset.x + dx,
        y: canvasOffset.y + dy
      });
      setStartPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
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
            icon: '⚡',
            shadowColor: 'shadow-blue-200 dark:shadow-blue-900/20'
          };
        case 'action':
          return {
            borderColor: 'border-green-500',
            bgColor: 'bg-green-50 dark:bg-green-950/30',
            iconColor: 'text-green-500',
            icon: '▶️',
            shadowColor: 'shadow-green-200 dark:shadow-green-900/20'
          };
        case 'condition':
          return {
            borderColor: 'border-amber-500',
            bgColor: 'bg-amber-50 dark:bg-amber-950/30',
            iconColor: 'text-amber-500',
            icon: '❓',
            shadowColor: 'shadow-amber-200 dark:shadow-amber-900/20'
          };
        default:
          return {
            borderColor: 'border-gray-500',
            bgColor: 'bg-gray-50 dark:bg-gray-950/30',
            iconColor: 'text-gray-500',
            icon: '📝',
            shadowColor: 'shadow-gray-200 dark:shadow-gray-900/20'
          };
      }
    };

    const styles = getNodeTypeStyles();
    
    return (
      <div 
        key={node.id}
        className={`absolute flex flex-col p-3 rounded-lg shadow-lg border-2 transition-all duration-200 
                    hover:shadow-xl hover:translate-y-[-2px] ${styles.borderColor} ${styles.bgColor} ${styles.shadowColor}`}
        style={{
          width: `${nodeWidth}px`,
          height: `${nodeHeight}px`,
          left: `${node.position.x}px`,
          top: `${node.position.y}px`,
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          zIndex: 10
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
        <div className="text-xs font-medium pt-2 border-t mt-2 text-muted-foreground flex justify-between items-center">
          <span className="capitalize">{node.type}</span>
          {node.connections.length > 0 && (
            <div className="flex items-center gap-1">
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <span>{node.connections.length}</span>
            </div>
          )}
        </div>

        {/* Connection handle */}
        <div 
          className="absolute w-4 h-4 bg-primary rounded-full border-2 border-white right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 shadow-md z-20"
          style={{ marginTop: -10 }}
        />
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
      
      // Calculate control points for a curved path
      const distance = Math.abs(endX - startX);
      const curvature = Math.min(distance * 0.4, 150);
      
      // Add some randomness to make it look natural when lines overlap
      const offset = (index % 3 - 1) * 15;
      
      // Get color based on node type
      const getPathColor = () => {
        switch (fromNode.type) {
          case 'trigger':
            return 'stroke-blue-500';
          case 'action':
            return 'stroke-green-500';
          case 'condition':
            return 'stroke-amber-500';
          default:
            return 'stroke-gray-500';
        }
      };

      const pathColor = getPathColor();
      
      return (
        <svg
          key={`connection-${index}`}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ zIndex: 5, transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        >
          <defs>
            <marker
              id={`arrowhead-${index}`}
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon 
                points="0 0, 10 3.5, 0 7" 
                className={pathColor.replace('stroke-', 'fill-')} 
              />
            </marker>
          </defs>
          
          <path
            d={`M ${startX} ${startY} 
                C ${startX + curvature + offset} ${startY}, 
                  ${endX - curvature + offset} ${endY}, 
                  ${endX} ${endY}`}
            className={`${pathColor} fill-transparent`}
            style={{ 
              strokeWidth: 2, 
              strokeDasharray: fromNode.type === 'condition' ? '5,5' : '0',
              markerEnd: `url(#arrowhead-${index})`
            }}
          />
          
          {/* Animated dot for active workflows */}
          {workflow.status === 'active' && (
            <g>
              <circle 
                cx="0" cy="0" r="4" 
                className={`${pathColor.replace('stroke-', 'fill-')}`}
              >
                <animate
                  attributeName="cx"
                  from={startX}
                  to={endX}
                  dur={`${2 + Math.random() * 2}s`}
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines="0.4 0 0.6 1"
                />
                <animate
                  attributeName="cy"
                  from={startY}
                  to={endY}
                  dur={`${2 + Math.random() * 2}s`}
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines="0.4 0 0.6 1"
                />
                <animate
                  attributeName="opacity"
                  from="0"
                  to="1"
                  dur="0.5s"
                  begin="0s"
                  fill="freeze"
                />
              </circle>
              
              {/* Pulse effect */}
              <circle 
                cx="0" cy="0" r="8" 
                className={`${pathColor} opacity-60`}
                style={{ strokeWidth: 1, fill: 'none' }}
              >
                <animate
                  attributeName="cx"
                  from={startX}
                  to={endX}
                  dur={`${2 + Math.random() * 2}s`}
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines="0.4 0 0.6 1"
                />
                <animate
                  attributeName="cy"
                  from={startY}
                  to={endY}
                  dur={`${2 + Math.random() * 2}s`}
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines="0.4 0 0.6 1"
                />
                <animate
                  attributeName="r"
                  from="4"
                  to="10"
                  dur="1s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from="0.6"
                  to="0"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
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
    setCanvasOffset({ x: 0, y: 0 });
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border rounded-lg mb-2 p-1 flex items-center gap-1 self-start shadow-sm">
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
        ref={canvasRef}
        className="workflow-canvas relative overflow-auto flex-grow rounded-lg bg-gradient-to-b from-white to-gray-50 border"
        style={{ height: '500px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          className="absolute min-w-full min-h-full"
          style={{ 
            width: '2000px', 
            height: '1000px',
            backgroundSize: '20px 20px',
            backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
            transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`
          }}
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
