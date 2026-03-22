export type MaturityState = 'Exploratory' | 'Developing' | 'Validated' | 'Locked';

export interface Project {
  id: string;
  name: string;
  createdAt: number;
}

export interface ThinkingBlock {
  id: string;
  projectId: string;
  parentId: string | null;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  maturityState: MaturityState;
}

export interface Suggestion {
  title: string;
  description: string;
}

export interface ScaffoldingBlock {
  title: string;
  summary: string;
  content: string;
  tags: string[];
}

export type AiOutput =
  | { type: 'expand'; content: { summary: string; content: string } }
  | { type: 'clarify'; content: string[] }
  | { type: 'suggest'; content: Suggestion[] };
