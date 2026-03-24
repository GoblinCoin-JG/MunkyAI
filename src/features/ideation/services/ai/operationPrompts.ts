import { ChallengeItemDraft, ClarifyQuestionDraft, ExpandAspectDraft, Suggestion } from '../../types';
import {
  formatIdeationContext,
  IdeationContextPacket,
} from './buildIdeationContext';
import { ARTIFACT_REVISION_PROCESS, MARKDOWN_ARTIFACT_GUIDELINES } from './artifactGuidelines';
import {
  IDEATION_CONTEXT_USAGE_RULES,
  IDEATION_SYSTEM_CONTRACT,
  OPERATION_OUTPUT_DISCIPLINE,
} from './promptContracts';

function formatExistingExpandAspects(aspects: Array<{ title: string; detail: string; context: string }>): string {
  if (aspects.length === 0) {
    return 'None';
  }

  return aspects
    .map(
      (aspect, index) =>
        `${index + 1}. ${aspect.title}\nDetail: ${aspect.detail}\nUser context: ${aspect.context || 'None'}`,
    )
    .join('\n\n');
}

function formatExistingQuestions(questions: Array<{ title: string; prompt: string }>): string {
  if (questions.length === 0) {
    return 'None';
  }

  return questions.map((question, index) => `${index + 1}. ${question.title} - ${question.prompt}`).join('\n');
}

function formatExpandCards(cards: Array<{ title: string; detail: string; context: string }>): string {
  if (cards.length === 0) {
    return 'None';
  }

  return cards
    .map((card, index) => {
      const contextLine = card.context ? `\nUser context: ${card.context}` : '';
      return `${index + 1}. ${card.title}\nDetail: ${card.detail}${contextLine}`;
    })
    .join('\n\n');
}

function formatClarifyAnswers(answers: Array<{ title: string; prompt: string; answer: string; note: string }>): string {
  if (answers.length === 0) {
    return 'None';
  }

  return answers
    .map((item, index) => {
      const noteLine = item.note ? `\nNote: ${item.note}` : '';
      return `${index + 1}. ${item.title}\nPrompt: ${item.prompt}\nAnswer: ${item.answer}${noteLine}`;
    })
    .join('\n\n');
}

function formatChallengeItems(
  items: Array<{ focusText: string; challengePrompt: string; whyItMatters: string; userResponse: string }>,
): string {
  if (items.length === 0) {
    return 'None';
  }

  return items
    .map(
      (item, index) =>
        `${index + 1}. Focus: ${item.focusText}\nChallenge: ${item.challengePrompt}\nWhy it matters: ${item.whyItMatters}\nResponse: ${item.userResponse}`,
    )
    .join('\n\n');
}

export function buildGenerateProjectStructurePrompt(idea: string): string {
  return [
    IDEATION_SYSTEM_CONTRACT,
    '',
    'Operation: Generate initial project structure from a raw idea.',
    'Task:',
    '- Produce one project name and 4-6 strong starter blocks.',
    '- Starter blocks must represent distinct exploration lanes with low overlap.',
    '- Favor the most relevant dimensions for this specific idea, such as user value, architecture, constraints, execution workflow, risk, and open design decisions.',
    '- Avoid forcing a generic template decomposition.',
    '',
    'Quality rubric:',
    '- Blocks feel like useful map anchors for a real project, not generic categories.',
    '- Each block title is distinct and non-overlapping.',
    '- Each block artifact explains why the block matters and what should be explored next.',
    '- Artifacts are concise, specific, and decision-oriented.',
    '',
    'Artifact guidance:',
    `- ${MARKDOWN_ARTIFACT_GUIDELINES}`,
    '',
    'Anti-patterns:',
    '- generic brainstorming labels that could apply to any project',
    '- redundant block titles with minor wording differences',
    '- artifacts that are only motivational or abstract',
    '',
    'Output schema:',
    '- Return JSON object: { projectName: string, blocks: Array<{ title: string, artifactBody: string, tags: string[] }> }',
    '- Each block tags array should contain 2-3 concrete tags.',
    '- Do not return additional keys.',
    '',
    OPERATION_OUTPUT_DISCIPLINE,
    '',
    `Idea:\n${idea}`,
  ].join('\n');
}

export function buildExpandBlockPrompt(packet: IdeationContextPacket): string {
  return [
    IDEATION_SYSTEM_CONTRACT,
    '',
    'Operation: Expand block into high-leverage depth lanes.',
    formatIdeationContext(packet),
    '',
    'Task:',
    '- Generate 4-6 expansion aspect cards.',
    '- Identify what is weak, unclear, risky, or underdeveloped in the selected block.',
    '- Output non-overlapping depth lanes with concrete leverage.',
    '',
    'Quality rubric:',
    '- Each aspect captures a distinct dimension worth deepening.',
    '- Details are specific enough for direct user editing.',
    '- Includes meaningful implications where relevant: constraints, tradeoffs, risks, examples, sequencing, implementation impact.',
    '',
    'Anti-patterns:',
    '- adjacent topics that do not deepen the selected block',
    '- vague prompts such as "add more detail"',
    '- repeated aspects in different words',
    '',
    'Output schema:',
    '- Return JSON object: { aspects: Array<{ title: string, detail: string }> }',
    '- Keep titles concise and actionable.',
    '',
    IDEATION_CONTEXT_USAGE_RULES,
    OPERATION_OUTPUT_DISCIPLINE,
  ].join('\n');
}

export function buildGenerateExpandAspectPrompt(
  packet: IdeationContextPacket,
  existingAspects: Array<{ title: string; detail: string; context: string }>,
): string {
  return [
    IDEATION_SYSTEM_CONTRACT,
    '',
    'Operation: Generate one additional expansion card.',
    formatIdeationContext(packet),
    '',
    'Existing expansion cards:',
    formatExistingExpandAspects(existingAspects),
    '',
    'Task:',
    '- Return exactly one new non-overlapping expansion aspect.',
    '- Choose a lane that adds meaningful new leverage.',
    '',
    'Quality rubric:',
    '- Title is specific and distinct from existing cards.',
    '- Detail names a concrete depth direction and decision focus.',
    '',
    'Output schema:',
    '- Return JSON object: { title: string, detail: string }',
    '',
    IDEATION_CONTEXT_USAGE_RULES,
    OPERATION_OUTPUT_DISCIPLINE,
  ].join('\n');
}

export function buildSynthesizeExpandBoardPrompt(
  packet: IdeationContextPacket,
  cards: Array<{ title: string; detail: string; context: string }>,
): string {
  return [
    IDEATION_SYSTEM_CONTRACT,
    '',
    'Operation: Synthesize expansion board into a stronger artifact.',
    formatIdeationContext(packet),
    '',
    'Expansion cards:',
    formatExpandCards(cards),
    '',
    'Revision process:',
    `- ${ARTIFACT_REVISION_PROCESS}`,
    '',
    'Task:',
    '- Integrate card insights into the existing markdown artifact.',
    '- Preserve strong existing sections and update weak ones.',
    '- Reorganize only if it improves clarity and scanability.',
    '',
    'Anti-patterns:',
    '- appending a long dump section with all cards copied',
    '- duplicating headings or repeating old content',
    '- rewriting strong sections without new reason',
    '',
    'Artifact guidance:',
    `- ${MARKDOWN_ARTIFACT_GUIDELINES}`,
    '',
    'Output schema:',
    '- Return JSON object: { artifactBody: string }',
    '- artifactBody must contain the full revised markdown document.',
    '',
    IDEATION_CONTEXT_USAGE_RULES,
    OPERATION_OUTPUT_DISCIPLINE,
  ].join('\n');
}

export function buildClarifyBlockPrompt(packet: IdeationContextPacket): string {
  return [
    IDEATION_SYSTEM_CONTRACT,
    '',
    'Operation: Generate clarification questions.',
    formatIdeationContext(packet),
    '',
    'Task:',
    '- Generate 4-6 high-leverage clarification questions.',
    '- Ask only questions that materially improve artifact quality.',
    '- Prefer fewer strong questions over broad questionnaire noise.',
    '',
    'Question design rubric:',
    '- Prioritize uncertainty around scope, audience, constraints, tradeoffs, sequencing, assumptions, success criteria, and decision points.',
    '- Do not ask for information that is already explicit unless there is conflict or ambiguity.',
    '- Use textarea for nuanced responses and single or multi only when options reduce friction.',
    '',
    'Anti-patterns:',
    '- obvious or low-value questions',
    '- asking for basic restatement of artifact content',
    '- too many options that do not drive decisions',
    '',
    'Output schema:',
    '- Return JSON object: { questions: Array<{ title: string, prompt: string, type: "textarea" | "single" | "multi", options: string[] }> }',
    '- For textarea questions options must be [].',
    '- For single or multi questions provide 3-6 options only when useful.',
    '',
    IDEATION_CONTEXT_USAGE_RULES,
    OPERATION_OUTPUT_DISCIPLINE,
  ].join('\n');
}

export function buildGenerateClarifyQuestionPrompt(
  packet: IdeationContextPacket,
  existingQuestions: Array<{ title: string; prompt: string }>,
): string {
  return [
    IDEATION_SYSTEM_CONTRACT,
    '',
    'Operation: Generate one additional clarification question.',
    formatIdeationContext(packet),
    '',
    'Existing clarification questions:',
    formatExistingQuestions(existingQuestions),
    '',
    'Task:',
    '- Return one non-duplicate high-leverage question.',
    '- Focus on a missing decision or ambiguity not covered by existing cards.',
    '',
    'Output schema:',
    '- Return JSON object: { title: string, prompt: string, type: "textarea" | "single" | "multi", options: string[] }',
    '',
    IDEATION_CONTEXT_USAGE_RULES,
    OPERATION_OUTPUT_DISCIPLINE,
  ].join('\n');
}

export function buildSynthesizeClarifyAnswersPrompt(
  packet: IdeationContextPacket,
  answers: Array<{ title: string; prompt: string; answer: string; note: string }>,
): string {
  return [
    IDEATION_SYSTEM_CONTRACT,
    '',
    'Operation: Synthesize clarification answers into artifact markdown.',
    formatIdeationContext(packet),
    '',
    'Answered clarification cards:',
    formatClarifyAnswers(answers),
    '',
    'Revision process:',
    `- ${ARTIFACT_REVISION_PROCESS}`,
    '',
    'Task:',
    '- Integrate resolved details into relevant existing sections.',
    '- Remove or reduce uncertainty that was resolved by answers.',
    '- Keep unresolved uncertainty only where answer evidence is still partial.',
    '',
    'Artifact guidance:',
    `- ${MARKDOWN_ARTIFACT_GUIDELINES}`,
    '',
    'Output schema:',
    '- Return JSON object: { artifactBody: string }',
    '',
    IDEATION_CONTEXT_USAGE_RULES,
    OPERATION_OUTPUT_DISCIPLINE,
  ].join('\n');
}

export function buildSuggestChildrenPrompt(packet: IdeationContextPacket): string {
  return [
    IDEATION_SYSTEM_CONTRACT,
    '',
    'Operation: Suggest child blocks for structural decomposition.',
    formatIdeationContext(packet),
    '',
    'Task:',
    '- Suggest 3 child blocks that meaningfully decompose the selected block.',
    '- Children should increase structural coverage and downstream usefulness.',
    '- Each child must earn existence through clear separation of concerns.',
    '',
    'Quality rubric:',
    '- Low overlap among suggested children.',
    '- Each child has a strong purpose statement in artifactBody.',
    '- Suggestions avoid trivial related topics and avoid duplicating existing children.',
    '',
    'Artifact guidance:',
    `- ${MARKDOWN_ARTIFACT_GUIDELINES}`,
    '',
    'Output schema:',
    '- Return JSON array of { title: string, artifactBody: string }.',
    '- In artifactBody include why this child exists and what it should resolve.',
    '',
    IDEATION_CONTEXT_USAGE_RULES,
    OPERATION_OUTPUT_DISCIPLINE,
  ].join('\n');
}

export function buildChallengeBlockPrompt(
  packet: IdeationContextPacket,
  challengeUnits: string[],
  sectionSummaries: string[],
): string {
  const unitLines = challengeUnits.length > 0 ? challengeUnits.map((unit, index) => `${index + 1}. ${unit}`).join('\n') : 'None';
  const sectionLines = sectionSummaries.length > 0 ? sectionSummaries.map((line) => `- ${line}`).join('\n') : '- None';

  return [
    IDEATION_SYSTEM_CONTRACT,
    '',
    'Operation: Generate challenge prompts to pressure-test artifact quality.',
    formatIdeationContext(packet),
    '',
    'Derived challenge units:',
    unitLines,
    '',
    'Section summaries:',
    sectionLines,
    '',
    'Task:',
    '- Generate 3-7 focused challenge items prioritized by leverage.',
    '- Target weak assumptions, ambiguity, missing decisions, contradictions, scope gaps, dependency and sequencing concerns.',
    '- Challenge type can be internal and does not need to appear in output.',
    '',
    'Quality rubric:',
    '- focusText points to a concrete artifact claim or unit.',
    '- challengePrompt can be answered directly by a user and moves the artifact forward.',
    '- whyItMatters explains impact if unresolved.',
    '- Avoid nitpicks and low-value criticism.',
    '',
    'Output schema:',
    '- Return JSON object: { items: Array<{ focusText: string, challengePrompt: string, whyItMatters: string }> }',
    '',
    IDEATION_CONTEXT_USAGE_RULES,
    OPERATION_OUTPUT_DISCIPLINE,
  ].join('\n');
}

export function buildSynthesizeChallengeResponsesPrompt(
  packet: IdeationContextPacket,
  items: Array<{ focusText: string; challengePrompt: string; whyItMatters: string; userResponse: string }>,
): string {
  return [
    IDEATION_SYSTEM_CONTRACT,
    '',
    'Operation: Integrate challenge responses into artifact markdown.',
    formatIdeationContext(packet),
    '',
    'Answered challenge items:',
    formatChallengeItems(items),
    '',
    'Revision process:',
    `- ${ARTIFACT_REVISION_PROCESS}`,
    '',
    'Task:',
    '- Apply user responses where they resolve assumptions, scope, sequencing, and decision gaps.',
    '- Keep the document coherent, removing stale claims that are no longer accurate.',
    '- Avoid challenge-dump append behavior.',
    '',
    'Artifact guidance:',
    `- ${MARKDOWN_ARTIFACT_GUIDELINES}`,
    '',
    'Output schema:',
    '- Return JSON object: { artifactBody: string }',
    '',
    IDEATION_CONTEXT_USAGE_RULES,
    OPERATION_OUTPUT_DISCIPLINE,
  ].join('\n');
}

export function buildRefinementPrompt(
  operation: 'project-structure' | 'expand' | 'clarify' | 'suggest-children' | 'challenge' | 'artifact-synthesis',
  candidateOutput: string,
  packet?: IdeationContextPacket,
): string {
  return [
    IDEATION_SYSTEM_CONTRACT,
    '',
    `Operation: Lightweight refinement pass for ${operation}.`,
    packet ? formatIdeationContext(packet) : 'Context packet: unavailable',
    '',
    'Task:',
    '- Review candidate output and fix obvious weaknesses such as overlap, vagueness, duplication, low leverage, and context contradiction.',
    '- Keep output shape identical to candidate output schema.',
    '- If candidate output is already strong, return it with minimal edits.',
    '',
    'Candidate output JSON:',
    candidateOutput,
    '',
    OPERATION_OUTPUT_DISCIPLINE,
  ].join('\n');
}

export type IdeationOperationPromptFactories = {
  buildGenerateProjectStructurePrompt: typeof buildGenerateProjectStructurePrompt;
  buildExpandBlockPrompt: typeof buildExpandBlockPrompt;
  buildGenerateExpandAspectPrompt: typeof buildGenerateExpandAspectPrompt;
  buildSynthesizeExpandBoardPrompt: typeof buildSynthesizeExpandBoardPrompt;
  buildClarifyBlockPrompt: typeof buildClarifyBlockPrompt;
  buildGenerateClarifyQuestionPrompt: typeof buildGenerateClarifyQuestionPrompt;
  buildSynthesizeClarifyAnswersPrompt: typeof buildSynthesizeClarifyAnswersPrompt;
  buildSuggestChildrenPrompt: typeof buildSuggestChildrenPrompt;
  buildChallengeBlockPrompt: typeof buildChallengeBlockPrompt;
  buildSynthesizeChallengeResponsesPrompt: typeof buildSynthesizeChallengeResponsesPrompt;
  buildRefinementPrompt: typeof buildRefinementPrompt;
};

export type IdeationOperationOutputShapes = {
  expand: { aspects: ExpandAspectDraft[] };
  clarify: { questions: ClarifyQuestionDraft[] };
  suggestChildren: Suggestion[];
  challenge: { items: ChallengeItemDraft[] };
};
