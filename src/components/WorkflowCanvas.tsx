
import React, { useState, useRef, useEffect } from 'react';
import { Workflow, WorkflowNode } from '../types/workflow';
import { Button } from './ui/button';
import { Plus, Trash } from 'lucide-react';
import NodeForm from './NodeForm';

interface WorkflowCanvasProps {
  workflow: Workflow;
  onUpdateWorkflow: (updatedWorkflow: Workflow) => void;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ workflow, onUpdateWorkflow }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isNodeFormOpen, setIsNodeFormOpen] = useState(false);
  const [nodes, setNodes] = useState<WorkflowNode[]>(workflow.nodes);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number, y: number }>>({});
  const [connectingNode, setConnectingNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  
  // Update nodes when workflow changes
  useEffect(() => {
    setNodes(workflow.nodes);
    // Initialize node positions map
    const positions: Record<string, { x: number, y: number }> = {};
    workflow.nodes.forEach(node => {
      positions[node.id] = { ...node.position };
    });
    setNodePositions(positions);
  }, [workflow.nodes]);

  // Calculate node connections
  const getNodeConnections = () => {
    const connections: { from: WorkflowNode; to: WorkflowNode }[] = [];
    
    nodes.forEach(node => {
      node.connections.forEach(targetId => {
        const targetNode = nodes.find(n => n.id === targetId);
        if (targetNode) {
          connections.push({ from: node, to: targetNode });
        }
      });
    });
    
    return connections;
  };

  // Handle node dragging
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDragging(nodeId);
    setStartPos({ x: e.clientX, y: e.clientY });
    setSelectedNode(nodeId);
  };

  // Handle canvas panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setDragging('canvas');
      setStartPos({ x: e.clientX, y: e.clientY });
      setSelectedNode(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    
    if (dragging === 'canvas' && canvasRef.current) {
      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;
      setCanvasOffset({
        x: canvasOffset.x + dx,
        y: canvasOffset.y + dy
      });
      setStartPos({ x: e.clientX, y: e.clientY });
    } else if (dragging !== 'canvas') {
      // Move the node - update directly in nodePositions for immediate visual feedback
      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;
      
      setNodePositions(prev => {
        const nodePos = prev[dragging] || { x: 0, y: 0 };
        return {
          ...prev,
          [dragging]: {
            x: nodePos.x + dx,
            y: nodePos.y + dy
          }
        };
      });
      
      setStartPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    if (dragging && dragging !== 'canvas') {
      // Update the workflow with the new node positions
      const updatedNodes = nodes.map(node => {
        if (node.id === dragging) {
          // Use the latest position from nodePositions
          return {
            ...node,
            position: nodePositions[node.id] || node.position
          };
        }
        return node;
      });
      
      const updatedWorkflow = {
        ...workflow,
        nodes: updatedNodes,
        updatedAt: new Date().toISOString()
      };
      onUpdateWorkflow(updatedWorkflow);
    }
    setDragging(null);
  };

  const handleAddNode = (newNode: WorkflowNode) => {
    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    
    // Add to nodePositions
    setNodePositions(prev => ({
      ...prev,
      [newNode.id]: { ...newNode.position }
    }));
    
    const updatedWorkflow = {
      ...workflow,
      nodes: updatedNodes,
      updatedAt: new Date().toISOString()
    };
    onUpdateWorkflow(updatedWorkflow);
  };

  // Start connecting nodes
  const handleStartConnection = (e: React.MouseEvent, sourceId: string) => {
    e.stopPropagation();
    setConnectingNode(sourceId);
  };

  // Complete node connection
  const handleCompleteConnection = (e: React.MouseEvent, targetId: string) => {
    e.stopPropagation();
    if (connectingNode && connectingNode !== targetId) {
      // Check if connection already exists
      const sourceNode = nodes.find(n => n.id === connectingNode);
      if (sourceNode && sourceNode.connections.includes(targetId)) {
        // Connection exists, remove it
        handleDisconnectNodes(connectingNode, targetId);
      } else {
        // Connection doesn't exist, create it
        handleConnectNodes(connectingNode, targetId);
      }
    }
    setConnectingNode(null);
  };

  // Cancel connection if clicked outside
  const handleCancelConnection = (e: React.MouseEvent) => {
    if (connectingNode && e.target === canvasRef.current) {
      setConnectingNode(null);
    }
  };

  // Function to connect nodes
  const handleConnectNodes = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    
    const updatedNodes = nodes.map(node => {
      if (node.id === sourceId && !node.connections.includes(targetId)) {
        return {
          ...node,
          connections: [...node.connections, targetId]
        };
      }
      return node;
    });
    
    setNodes(updatedNodes);
    
    const updatedWorkflow = {
      ...workflow,
      nodes: updatedNodes,
      updatedAt: new Date().toISOString()
    };
    onUpdateWorkflow(updatedWorkflow);
  };

  // Function to disconnect nodes
  const handleDisconnectNodes = (sourceId: string, targetId: string) => {
    const updatedNodes = nodes.map(node => {
      if (node.id === sourceId) {
        return {
          ...node,
          connections: node.connections.filter(id => id !== targetId)
        };
      }
      return node;
    });
    
    setNodes(updatedNodes);
    
    const updatedWorkflow = {
      ...workflow,
      nodes: updatedNodes,
      updatedAt: new Date().toISOString()
    };
    onUpdateWorkflow(updatedWorkflow);
  };

  // Remove a node and all its connections
  const handleRemoveNode = (nodeId: string) => {
    // Remove the node
    const nodeToRemove = nodes.find(n => n.id === nodeId);
    if (!nodeToRemove) return;

    // Remove the node and all connections to it
    const updatedNodes = nodes
      .filter(n => n.id !== nodeId)
      .map(node => ({
        ...node,
        connections: node.connections.filter(id => id !== nodeId)
      }));
    
    setNodes(updatedNodes);
    setSelectedNode(null);
    
    // Remove from nodePositions
    const updatedPositions = { ...nodePositions };
    delete updatedPositions[nodeId];
    setNodePositions(updatedPositions);
    
    const updatedWorkflow = {
      ...workflow,
      nodes: updatedNodes,
      updatedAt: new Date().toISOString()
    };
    onUpdateWorkflow(updatedWorkflow);
  };
  
  const renderNode = (node: WorkflowNode) => {
    const nodeWidth = 220;
    const nodeHeight = 120;
    
    // Get current position from nodePositions if available
    const position = nodePositions[node.id] || node.position;
    
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
    const isSelected = selectedNode === node.id;
    
    return (
      <div 
        key={node.id}
        className={`absolute flex flex-col p-3 rounded-lg shadow-lg border-2 transition-transform duration-100 cursor-move
                    hover:shadow-xl ${styles.borderColor} ${styles.bgColor} ${styles.shadowColor}
                    ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
        style={{
          width: `${nodeWidth}px`,
          height: `${nodeHeight}px`,
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: dragging === node.id || isSelected ? 20 : 10
        }}
        onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full ${styles.bgColor} ${styles.iconColor} text-lg font-bold`}>
              {styles.icon}
            </div>
            <div className="font-medium text-sm truncate">{node.name}</div>
          </div>
          {isSelected && (
            <Button 
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveNode(node.id);
              }}
            >
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="text-xs text-muted-foreground overflow-hidden flex-grow">
          {node.description}
        </div>
        <div className="text-xs font-medium pt-2 border-t mt-2 text-muted-foreground flex justify-between items-center">
          <span className="capitalize">{node.type}</span>
          {node.connections.length > 0 && (
            <span className="bg-muted px-2 py-0.5 rounded-full text-[10px]">
              {node.connections.length} 연결
            </span>
          )}
        </div>

        {/* Source Connection handle */}
        <div 
          className={`absolute w-4 h-4 bg-primary rounded-full border-2 border-white right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 shadow-md z-20 cursor-crosshair 
                     ${connectingNode === node.id ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
          style={{ marginTop: -10 }}
          onMouseDown={(e) => {
            e.stopPropagation();
            handleStartConnection(e, node.id);
          }}
        />
        
        {/* Target Connection handle */}
        <div 
          className={`absolute w-4 h-4 bg-primary rounded-full border-2 border-white left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-md z-20 cursor-crosshair
                     ${connectingNode && connectingNode !== node.id ? 'ring-2 ring-offset-2 ring-primary animate-pulse' : ''}`}
          style={{ marginTop: -10 }}
          onMouseDown={(e) => {
            e.stopPropagation();
            if (connectingNode) {
              handleCompleteConnection(e, node.id);
            }
          }}
        />
      </div>
    );
  };
  
  const renderConnections = () => {
    const connections = getNodeConnections();
    
    return connections.map((connection, index) => {
      const fromNode = connection.from;
      const toNode = connection.to;
      
      // Use positions from nodePositions if available
      const fromPosition = nodePositions[fromNode.id] || fromNode.position;
      const toPosition = nodePositions[toNode.id] || toNode.position;
      
      // Calculate starting and ending points for the connection line
      const startX = fromPosition.x + 220; // nodeWidth
      const startY = fromPosition.y + 60;  // nodeHeight / 2
      const endX = toPosition.x;
      const endY = toPosition.y + 60;      // nodeHeight / 2
      
      // Get color based on node type
      const getPathColor = () => {
        switch (fromNode.type) {
          case 'trigger':
            return 'stroke-blue-400';
          case 'action':
            return 'stroke-green-400';
          case 'condition':
            return 'stroke-amber-400';
          default:
            return 'stroke-gray-400';
        }
      };

      const pathColor = getPathColor();
      
      return (
        <svg
          key={`connection-${index}`}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ 
            zIndex: 5, 
            transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
            width: '100%',
            height: '100%',
            overflow: 'visible'
          }}
        >
          <path
            d={`M ${startX} ${startY} 
                L ${endX} ${endY}`}
            className={`${pathColor} fill-transparent`}
            style={{ 
              strokeWidth: 2, 
              strokeDasharray: '5,5'
            }}
          />
        </svg>
      );
    });
  };

  // Render connecting line when making a connection
  const renderConnectingLine = () => {
    if (!connectingNode) return null;
    
    const sourceNode = nodes.find(node => node.id === connectingNode);
    if (!sourceNode) return null;
    
    const sourcePosition = nodePositions[sourceNode.id] || sourceNode.position;
    
    // Calculate starting point
    const startX = sourcePosition.x + 220; // nodeWidth
    const startY = sourcePosition.y + 60;  // nodeHeight / 2
    
    // Get path color based on node type
    const getPathColor = () => {
      switch (sourceNode.type) {
        case 'trigger':
          return 'stroke-blue-400';
        case 'action':
          return 'stroke-green-400';
        case 'condition':
          return 'stroke-amber-400';
        default:
          return 'stroke-gray-400';
      }
    };
    
    const pathColor = getPathColor();
    
    return (
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ 
          zIndex: 30, 
          transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
          width: '100%',
          height: '100%',
          overflow: 'visible'
        }}
      >
        <path
          id="connecting-line"
          className={`${pathColor} fill-transparent`}
          style={{ strokeWidth: 2, strokeDasharray: '5,5' }}
        />
      </svg>
    );
  };
  
  useEffect(() => {
    // Update connecting line on mouse move if we are connecting nodes
    if (!connectingNode) return;
    
    const updateConnectingLine = (e: MouseEvent) => {
      const sourceNode = nodes.find(node => node.id === connectingNode);
      if (!sourceNode) return;
      
      const sourcePosition = nodePositions[sourceNode.id] || sourceNode.position;
      
      // Calculate starting point
      const startX = sourcePosition.x + 220; // nodeWidth
      const startY = sourcePosition.y + 60;  // nodeHeight / 2
      
      // Calculate cursor position relative to canvas
      const canvasBounds = canvasRef.current?.getBoundingClientRect();
      if (!canvasBounds) return;
      
      // Adjust for canvas offset
      const endX = e.clientX - canvasBounds.left - canvasOffset.x;
      const endY = e.clientY - canvasBounds.top - canvasOffset.y;
      
      // Update path - use straight line
      const path = document.getElementById('connecting-line');
      if (path) {
        path.setAttribute('d', `M ${startX} ${startY} L ${endX} ${endY}`);
      }
    };
    
    document.addEventListener('mousemove', updateConnectingLine);
    
    return () => {
      document.removeEventListener('mousemove', updateConnectingLine);
    };
  }, [connectingNode, nodes, nodePositions, canvasOffset]);

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border rounded-lg mb-2 p-1 flex items-center gap-1 self-start shadow-sm">
        <Button 
          onClick={() => setIsNodeFormOpen(true)}
          variant="outline" 
          size="sm"
          className="text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          노드 추가
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
        onClick={handleCancelConnection}
      >
        <div 
          className="absolute min-w-full min-h-full"
          style={{ 
            width: '2000px', 
            height: '1000px',
            backgroundSize: '20px 20px',
            backgroundImage: 'radial-gradient(circle, #D0D0D0 1px, transparent 1px)',
            transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
            cursor: dragging ? (dragging === 'canvas' ? 'grabbing' : 'default') : (connectingNode ? 'crosshair' : 'grab')
          }}
        >
          {renderConnections()}
          {renderConnectingLine()}
          {nodes.map(renderNode)}
          
          {nodes.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <div className="mb-4">이 워크플로우에는 노드가 없습니다</div>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => setIsNodeFormOpen(true)}
              >
                <Plus className="h-4 w-4" />
                첫 노드 추가하기
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <NodeForm
        isOpen={isNodeFormOpen}
        onClose={() => setIsNodeFormOpen(false)}
        onSubmit={handleAddNode}
        workflowId={workflow.id}
      />
    </div>
  );
};

export default WorkflowCanvas;
