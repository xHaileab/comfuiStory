
import React, { useState, useCallback } from 'react';
import type { Workflow, WorkflowNode } from './types';
import { WORKFLOW_DATA } from './constants';
import WorkflowGraph from './components/WorkflowGraph';
import Sidebar from './components/Sidebar';
import { SparklesIcon } from './components/icons';

const App: React.FC = () => {
  const [workflowData, setWorkflowData] = useState<Workflow>(WORKFLOW_DATA);
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);

  const handleNodeSelect = useCallback((nodeId: number | null) => {
    setSelectedNodeId(nodeId);
  }, []);

  const handleNodeUpdate = useCallback((updatedNode: WorkflowNode) => {
    setWorkflowData(prevData => ({
      ...prevData,
      nodes: prevData.nodes.map(n => n.id === updatedNode.id ? updatedNode : n)
    }));
  }, []);

  const selectedNode = workflowData.nodes.find(node => node.id === selectedNodeId) || null;

  return (
    <div className="flex h-screen w-screen font-sans bg-gray-900 text-gray-200 overflow-hidden">
      <header className="absolute top-0 left-0 w-full p-4 z-10 bg-gray-900/50 backdrop-blur-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
            <SparklesIcon className="w-8 h-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">ComfyUI Workflow Visualizer</h1>
        </div>
        <p className="text-gray-400">Interact with your workflow and get AI-powered insights</p>
      </header>

      <main className="flex flex-1 pt-20">
        <WorkflowGraph 
          workflow={workflowData} 
          onNodeSelect={handleNodeSelect} 
          selectedNodeId={selectedNodeId}
        />
        <Sidebar 
          node={selectedNode}
          onNodeUpdate={handleNodeUpdate}
          onClose={() => handleNodeSelect(null)}
        />
      </main>
    </div>
  );
};

export default App;
