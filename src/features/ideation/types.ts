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

export type QuestionCardType = 'textarea' | 'single' | 'multi';

export interface ClarifyQuestionCard {
  id: string;
  title: string;
  prompt: string;
  type: QuestionCardType;
  options: string[];
  answer: string | string[];
  note: string;
  source: 'ai' | 'custom';
}

export interface ClarifyQuestionDraft {
  title: string;
  prompt: string;
  type: QuestionCardType;
  options?: string[];
}

export interface ClarifyBoard {
  blockId: string;
  cards: ClarifyQuestionCard[];
}

export type AiOutput =
  | { type: 'expand'; content: { summary: string; content: string } }
  | { type: 'suggest'; content: Suggestion[] };
