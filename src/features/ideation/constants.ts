import { ArtifactBody, MaturityState, Project, ThinkingBlock } from './types';

function createSeedArtifactBody(
  overview: string,
  keyIdeas: string[] = [],
  openQuestions: string[] = [],
  nextSteps: string[] = [],
): ArtifactBody {
  const sections: string[] = [];

  if (overview.trim()) {
    sections.push(`## Overview\n${overview.trim()}`);
  }

  if (keyIdeas.length > 0) {
    sections.push(`## Key Ideas\n${keyIdeas.map((item) => `- ${item}`).join('\n')}`);
  }

  if (openQuestions.length > 0) {
    sections.push(`## Open Questions\n${openQuestions.map((item) => `- ${item}`).join('\n')}`);
  }

  if (nextSteps.length > 0) {
    sections.push(`## Next Steps\n${nextSteps.map((item) => `- ${item}`).join('\n')}`);
  }

  return sections.join('\n\n');
}

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
    artifactBody: createSeedArtifactBody(
      'A revolutionary new way to explore ideas.',
      ['Bridge the gap between raw thought and structured output.'],
      ['Which user workflow should the first version optimize for?'],
      ['Define the first end-to-end ideation journey.'],
    ),
    tags: ['vision', 'startup'],
    maturityState: 'Exploratory',
  },
  {
    id: '2',
    projectId: INITIAL_PROJECT_ID,
    parentId: '1',
    title: 'Core Concept',
    artifactBody: createSeedArtifactBody(
      'The fundamental mechanism of the app.',
      ['Thinking blocks can be nested and expanded by AI.'],
      ['How much structure should be enforced at block creation time?'],
      ['Prototype block-level AI edit flows.'],
    ),
    tags: ['product', 'core'],
    maturityState: 'Developing',
  },
  {
    id: '3',
    projectId: INITIAL_PROJECT_ID,
    parentId: '1',
    title: 'Audience',
    artifactBody: createSeedArtifactBody(
      'This concept targets people who need structure while developing ideas.',
      ['Likely users include writers, researchers, and creative thinkers.'],
      ['Which audience segment feels the pain most intensely?'],
      ['Interview a few target users about their current process.'],
    ),
    tags: ['market'],
    maturityState: 'Exploratory',
  },
  {
    id: '4',
    projectId: INITIAL_PROJECT_ID,
    parentId: '1',
    title: 'Main Workflow',
    artifactBody: createSeedArtifactBody(
      'The core workflow should turn rough ideas into clearer, actionable thinking artifacts.',
      ['Create block -> Expand with AI -> Refine.'],
      ['Where should manual editing sit relative to AI actions?'],
      ['Storyboard the ideal user loop from blank state to refined artifact.'],
    ),
    tags: ['ux'],
    maturityState: 'Exploratory',
  },
  {
    id: '5',
    projectId: INITIAL_PROJECT_ID,
    parentId: '1',
    title: 'Risks',
    artifactBody: createSeedArtifactBody(
      'Several risks could weaken trust in the system if left unaddressed.',
      [
        'AI hallucinations could distort the artifact.',
        'Over-reliance on automation could reduce user ownership.',
        'Data privacy needs explicit handling.',
      ],
      ['Which risks should be addressed in the first release versus later?'],
      ['Define guardrails for AI output review and data handling.'],
    ),
    tags: ['strategy'],
    maturityState: 'Exploratory',
  },
];
