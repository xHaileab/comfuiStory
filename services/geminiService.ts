
import { GoogleGenAI } from "@google/genai";
import type { WorkflowNode } from '../types';

let ai: GoogleGenAI | null = null;

const getGenAI = (): GoogleGenAI => {
    // @google/genai FIX: Removed manual API key check to comply with guidelines.
    // The SDK will handle API key errors.
    if (!ai) {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
};

export const explainNodeWithGemini = async (node: WorkflowNode): Promise<string> => {
  try {
    const genAI = getGenAI();
    const model = 'gemini-2.5-flash';
    
    const prompt = `
      You are an expert on ComfyUI, a node-based interface for Stable Diffusion.
      Explain the following ComfyUI node in a clear and concise way for a user who is familiar with AI image generation concepts but might not know this specific node.

      Explain what the node does, what its inputs and outputs are, and how its settings (widgets) affect the result. 
      Format your response using simple markdown. Use headings for sections.

      Node Data:
      \`\`\`json
      ${JSON.stringify({ type: node.type, title: node.title, properties: node.properties, inputs: node.inputs, outputs: node.outputs, widgets_values: node.widgets_values }, null, 2)}
      \`\`\`
    `;
    
    const response = await genAI.models.generateContent({
        model: model,
        contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API request failed: ${error.message}`);
    }
    throw new Error('An unknown error occurred while contacting the Gemini API.');
  }
};