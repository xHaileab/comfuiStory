
import React, { useState, useEffect, useCallback } from 'react';
import type { WorkflowNode } from '../types';
import { explainNodeWithGemini } from '../services/geminiService';
import { SparklesIcon, CloseIcon } from './icons';

interface SidebarProps {
  node: WorkflowNode | null;
  onNodeUpdate: (node: WorkflowNode) => void;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ node, onNodeUpdate, onClose }) => {
  const [editableNode, setEditableNode] = useState<WorkflowNode | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string>('');

  useEffect(() => {
    setEditableNode(node);
    setAiExplanation('');
    setAiError('');
  }, [node]);

  const handleWidgetChange = (index: number, value: any) => {
    if (!editableNode) return;
    const newWidgets = [...(editableNode.widgets_values || [])];
    newWidgets[index] = value;
    const updatedNode = { ...editableNode, widgets_values: newWidgets };
    setEditableNode(updatedNode);
    onNodeUpdate(updatedNode);
  };
  
  const handleGetExplanation = useCallback(async () => {
    if (!node) return;
    setIsAiLoading(true);
    setAiError('');
    setAiExplanation('');
    try {
      const explanation = await explainNodeWithGemini(node);
      setAiExplanation(explanation);
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      // @google/genai FIX: Removed specific API key error handling to comply with guidelines.
      setAiError(`An error occurred: ${errorMessage}`);
    } finally {
      setIsAiLoading(false);
    }
  }, [node]);

  if (!node) {
    return (
        <div className="w-96 bg-gray-800 p-6 flex flex-col items-center justify-center text-center transition-all duration-300">
            <h2 className="text-xl font-bold text-gray-400">No Node Selected</h2>
            <p className="text-gray-500 mt-2">Click on a node in the graph to see its details and get AI-powered insights.</p>
        </div>
    );
  }

  return (
    <div className="w-96 bg-gray-800 shadow-2xl overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-bold text-purple-300">{node.title || node.type}</h2>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700 transition-colors">
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-4 flex-1">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-400 mb-2">Type: <span className="font-normal text-gray-300 bg-gray-700 px-2 py-1 rounded text-xs">{node.type}</span></h3>
          </div>

          <div>
            <button
                onClick={handleGetExplanation}
                disabled={isAiLoading}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors"
            >
                <SparklesIcon className="w-5 h-5 mr-2" />
                {isAiLoading ? 'Analyzing...' : 'Explain with Gemini'}
            </button>
            {aiExplanation && (
                 <div className="mt-4 p-3 bg-gray-900/50 rounded-lg prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: aiExplanation.replace(/\n/g, '<br />') }} />
            )}
            {aiError && <p className="mt-4 text-red-400 text-sm">{aiError}</p>}
          </div>
          
          {editableNode?.widgets_values && editableNode.widgets_values.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-400 mb-2 border-t border-gray-700 pt-4">Widgets</h3>
              <div className="space-y-3">
                {editableNode.widgets_values.map((val, index) => {
                  const widgetInfo = node.inputs.find(i => i.widget?.name);
                  const label = widgetInfo?.name || `widget_${index}`;
                  
                  if (typeof val === 'string' && val.length > 100) {
                     return (
                      <div key={index}>
                        <label className="block text-xs font-medium text-gray-400 capitalize mb-1">{label}</label>
                        <textarea
                          value={val}
                          onChange={(e) => handleWidgetChange(index, e.target.value)}
                          className="w-full bg-gray-700 text-white p-2 rounded-md text-xs border border-gray-600 focus:ring-purple-500 focus:border-purple-500"
                          rows={4}
                        />
                      </div>
                    );
                  }
                  
                  return (
                    <div key={index}>
                      <label className="block text-xs font-medium text-gray-400 capitalize mb-1">{label}</label>
                      <input
                        type={typeof val === 'number' ? 'number' : 'text'}
                        value={val}
                        onChange={(e) => handleWidgetChange(index, typeof val === 'number' ? parseFloat(e.target.value) : e.target.value)}
                        className="w-full bg-gray-700 text-white p-2 rounded-md text-xs border border-gray-600 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

           <div>
              <h3 className="font-semibold text-gray-400 mb-2 border-t border-gray-700 pt-4">Node Properties</h3>
              <pre className="text-xs bg-gray-900/50 p-3 rounded-md overflow-x-auto">
                {JSON.stringify(node.properties, null, 2)}
              </pre>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;