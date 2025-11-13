
export interface WorkflowNodeInput {
  name: string;
  type: string;
  link: number | null;
  label?: string;
  widget?: {
    name: string;
  };
}

export interface WorkflowNodeOutput {
  name: string;
  type: string;
  links: number[] | null;
  label?: string;
  slot_index?: number;
}

export interface WorkflowNode {
  id: number;
  type: string;
  pos: [number, number];
  size: [number, number];
  flags: object;
  order: number;
  mode: number;
  inputs: WorkflowNodeInput[];
  outputs: WorkflowNodeOutput[];
  properties: Record<string, any>;
  widgets_values?: any[];
  title?: string;
  color?: string;
  bgcolor?: string;
}

export type WorkflowLink = [
  link_id: number,
  origin_node_id: number,
  origin_slot: number,
  target_node_id: number,
  target_slot: number,
  type: string
];

export interface Workflow {
  // @google/genai FIX: Added missing properties 'id' and 'revision' to match the data structure in constants.ts.
  id: string;
  revision: number;
  last_node_id: number;
  last_link_id: number;
  nodes: WorkflowNode[];
  links: WorkflowLink[];
  groups: any[];
  config: object;
  extra: object;
  version: number;
}
