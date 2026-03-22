import { MaturityState, Project, ThinkingBlock } from './types';

export const STORAGE_KEYS = {
  projects: 'idea-ide-projects',
  activeProject: 'idea-ide-active-project',
  blocks: 'idea-ide-blocks',
  leftWidth: 'idea-ide-left-width',
  rightWidth: 'idea-ide-right-width',
} as const;

export const INITIAL_PROJECT_ID = 'p1';

export const INITIAL_PROJECTS: Project[] = [
  { id: INITIAL_PROJECT_ID, name: 'Main Project', createdAt: Date.now() },
];

export const MATURITY_COLORS: Record<MaturityState, string> = {
  Exploratory: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  Developing: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
  Validated: 'text-green-400 border-green-400/30 bg-green-400/10',
  Locked: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
};

export const INITIAL_BLOCKS: ThinkingBlock[] = [
  {
    id: '1',
    projectId: INITIAL_PROJECT_ID,
    parentId: null,
    title: 'My Idea',
    summary: 'A revolutionary new way to explore ideas.',
    content: 'This project aims to bridge the gap between raw thought and structured output.',
    tags: ['vision', 'startup'],
    maturityState: 'Exploratory',
  },
  {
    id: '2',
    projectId: INITIAL_PROJECT_ID,
    parentId: '1',
    title: 'Core Concept',
    summary: 'The fundamental mechanism of the app.',
    content: 'Thinking blocks that can be nested and expanded by AI.',
    tags: ['product', 'core'],
    maturityState: 'Developing',
  },
  {
    id: '3',
    projectId: INITIAL_PROJECT_ID,
    parentId: '1',
    title: 'Audience',
    summary: 'Who is this for?',
    content: 'Writers, researchers, and creative thinkers who need structure.',
    tags: ['market'],
    maturityState: 'Exploratory',
  },
  {
    id: '4',
    projectId: INITIAL_PROJECT_ID,
    parentId: '1',
    title: 'Main Workflow',
    summary: 'How the user interacts with the system.',
    content: 'Create block -> Expand with AI -> Refine -> Generate Artifact.',
    tags: ['ux'],
    maturityState: 'Exploratory',
  },
  {
    id: '5',
    projectId: INITIAL_PROJECT_ID,
    parentId: '1',
    title: 'Risks',
    summary: 'Potential pitfalls.',
    content: 'AI hallucinations, over-reliance on automation, data privacy.',
    tags: ['strategy'],
    maturityState: 'Exploratory',
  },
];
