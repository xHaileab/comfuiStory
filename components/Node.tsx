
import React from 'react';
import type { WorkflowNode } from '../types';

interface NodeProps {
  node: WorkflowNode;
  onSelect: () => void;
  isSelected: boolean;
}

const TYPE_COLORS: Record<string, string> = {
    'MODEL': 'bg-red-500',
    'CLIP': 'bg-yellow-500',
    'VAE': 'bg-green-500',
    'LATENT': 'bg-purple-500',
    'CONDITIONING': 'bg-blue-500',
    'IMAGE': 'bg-pink-500',
    'STRING': 'bg-gray-400',
    'INT': 'bg-teal-400',
    'FLOAT': 'bg-cyan-400',
    'COMBO': 'bg-indigo-400'
};

const Node: React.FC<NodeProps> = ({ node, onSelect, isSelected }) => {
  const borderClass = isSelected ? 'border-purple-400 border-2 shadow-2xl shadow-purple-500/30' : 'border-gray-600 border';

  return (
    <div
      className={`node-component absolute bg-gray-800 rounded-lg cursor-pointer transition-all duration-200 ${borderClass}`}
      style={{
        left: node.pos[0],
        top: node.pos[1],
        width: node.size[0],
        minHeight: node.size[1],
        backgroundColor: node.bgcolor ? node.bgcolor : undefined
      }}
      onClick={onSelect}
    >
      <div 
        className="p-2 text-white font-bold rounded-t-lg"
        style={{ backgroundColor: node.color ? node.color : 'rgba(0,0,0,0.2)' }}
      >
        {node.title || node.type}
      </div>
      
      <div className="flex justify-between p-2 text-sm">
        {/* Inputs */}
        <div className="space-y-1">
          {node.inputs && node.inputs.map((input, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${TYPE_COLORS[input.type] || 'bg-gray-500'}`}></div>
              <span className="text-gray-300">{input.name}</span>
            </div>
          ))}
        </div>
        
        {/* Outputs */}
        <div className="space-y-1">
          {node.outputs && node.outputs.map((output, index) => (
            <div key={index} className="flex items-center space-x-2 justify-end">
              <span className="text-gray-300">{output.name}</span>
              <div className={`w-3 h-3 rounded-full ${TYPE_COLORS[output.type] || 'bg-gray-500'}`}></div>
            </div>
          ))}
        </div>
      </div>
      
      {node.widgets_values && node.widgets_values.length > 0 && (
        <div className="p-2 border-t border-gray-700/50 text-xs">
          {node.widgets_values.map((val, index) => {
            let displayVal = String(val);
            if(typeof val === 'string' && val.length > 30) {
              displayVal = val.substring(0, 30) + '...';
            }
            return (
              <div key={index} className="text-gray-400 truncate">
                {node.inputs.find(i => i.widget?.name)?.name || `widget_${index}`}: {displayVal}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default React.memo(Node);
