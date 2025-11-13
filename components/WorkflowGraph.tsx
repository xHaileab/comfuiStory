
import React, { useState, useCallback, useRef, MouseEvent, WheelEvent } from 'react';
import type { Workflow, WorkflowNode } from '../types';
import Node from './Node';

interface WorkflowGraphProps {
  workflow: Workflow;
  onNodeSelect: (nodeId: number) => void;
  selectedNodeId: number | null;
}

const SLOT_Y_OFFSET = 30;
const SLOT_SPACING = 20;

const WorkflowGraph: React.FC<WorkflowGraphProps> = ({ workflow, onNodeSelect, selectedNodeId }) => {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 0.7 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const graphRef = useRef<HTMLDivElement>(null);

  const nodesById = React.useMemo(() => {
    const map = new Map<number, WorkflowNode>();
    workflow.nodes.forEach(node => map.set(node.id, node));
    return map;
  }, [workflow.nodes]);

  const handleMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.node-component')) {
      return;
    }
    e.preventDefault();
    setIsPanning(true);
    setStartPan({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  }, [transform.x, transform.y]);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    e.preventDefault();
    setTransform(prev => ({
      ...prev,
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y,
    }));
  }, [isPanning, startPan]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleWheel = useCallback((e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const scaleAmount = -e.deltaY * 0.001;
    const newScale = Math.min(Math.max(0.2, transform.scale + scaleAmount), 2);
    
    if (graphRef.current) {
      const rect = graphRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const newX = mouseX - (mouseX - transform.x) * (newScale / transform.scale);
      const newY = mouseY - (mouseY - transform.y) * (newScale / transform.scale);

      setTransform({ x: newX, y: newY, scale: newScale });
    }
  }, [transform]);
  
  const getSlotPosition = (node: WorkflowNode, type: 'input' | 'output', slotIndex: number): { x: number, y: number } => {
    const x = type === 'input' ? node.pos[0] : node.pos[0] + node.size[0];
    const y = node.pos[1] + SLOT_Y_OFFSET + (slotIndex * SLOT_SPACING) + 10;
    return { x, y };
  };

  return (
    <div
      ref={graphRef}
      className="flex-1 h-full bg-gray-800/50 relative overflow-hidden cursor-grab"
      style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)',
        backgroundSize: '20px 20px',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <div
        className="absolute top-0 left-0"
        style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: '0 0' }}
      >
        <svg className="absolute top-0 left-0 w-full h-full overflow-visible pointer-events-none">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#9ca3af" />
            </marker>
          </defs>
          {workflow.links.map(([linkId, originId, originSlot, targetId, targetSlot, type]) => {
            const originNode = nodesById.get(originId);
            const targetNode = nodesById.get(targetId);

            if (!originNode || !targetNode) return null;

            const startPos = getSlotPosition(originNode, 'output', originSlot);
            const endPos = getSlotPosition(targetNode, 'input', targetSlot);
            
            const dx = endPos.x - startPos.x;
            const path = `M ${startPos.x} ${startPos.y} C ${startPos.x + dx * 0.5} ${startPos.y}, ${endPos.x - dx * 0.5} ${endPos.y}, ${endPos.x} ${endPos.y}`;

            return <path key={linkId} d={path} stroke="#9ca3af" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />;
          })}
        </svg>

        {workflow.nodes.map(node => (
          <Node
            key={node.id}
            node={node}
            onSelect={() => onNodeSelect(node.id)}
            isSelected={selectedNodeId === node.id}
          />
        ))}
      </div>
    </div>
  );
};

export default WorkflowGraph;
