import {
  ChallengeItemDraft,
  ClarifyQuestionDraft,
  ExpandAspectDraft,
  QuestionCardType,
  ScaffoldingBlock,
  Suggestion,
} from '../../types';
import { normalizeArtifactBodyToMarkdown } from '../../utils/artifactBody.ts';

function normalizeLine(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function dedupeByTitle<T extends { title: string }>(items: T[]): T[] {
  return items.filter(
    (item, index) => items.findIndex((candidate) => normalizeLine(candidate.title) === normalizeLine(item.title)) === index,
  );
}

function isLowValuePrompt(prompt: string): boolean {
  const normalized = normalizeLine(prompt);
  const lowValuePhrases = [
    'tell me more',
    'add more detail',
    'what do you think',
    'anything else',
    'do you agree',
    'would this work',
    'is this good',
  ];

  return lowValuePhrases.some((phrase) => normalized.includes(phrase));
}

function sanitizeQuestionType(value: string): QuestionCardType {
  if (value === 'single' || value === 'multi') {
    return value;
  }

  return 'textarea';
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3).trim()}...`;
}

export function refineScaffoldingBlocks(blocks: ScaffoldingBlock[]): ScaffoldingBlock[] {
  return dedupeByTitle(blocks)
    .map((block) => ({
      ...block,
      title: truncate(block.title.trim() || 'Untitled block', 72),
      artifactBody: normalizeArtifactBodyToMarkdown(block.artifactBody),
      tags: block.tags.map((tag) => tag.trim()).filter(Boolean).slice(0, 4),
    }))
    .filter((block) => block.title.length > 0)
    .slice(0, 6);
}

export function refineExpandAspects(aspects: ExpandAspectDraft[]): ExpandAspectDraft[] {
  return dedupeByTitle(aspects)
    .map((aspect) => ({
      title: truncate(aspect.title?.trim() || 'Untitled aspect', 72),
      detail: (aspect.detail || '').trim(),
    }))
    .filter((aspect) => aspect.detail.length >= 20)
    .slice(0, 6);
}

export function refineClarifyQuestions(questions: ClarifyQuestionDraft[]): ClarifyQuestionDraft[] {
  const deduped = dedupeByTitle(
    questions.map((question) => ({
      ...question,
      title: truncate(question.title?.trim() || 'Untitled question', 96),
      prompt: (question.prompt || '').trim(),
      type: sanitizeQuestionType(question.type),
      options: Array.isArray(question.options)
        ? question.options.map((option) => option.trim()).filter(Boolean).slice(0, 6)
        : [],
    })),
  );

  return deduped
    .filter((question) => question.prompt.length >= 16)
    .filter((question) => !isLowValuePrompt(question.prompt))
    .map((question) => ({
      ...question,
      options: question.type === 'textarea' ? [] : question.options,
    }))
    .slice(0, 6);
}

export function refineSuggestions(suggestions: Suggestion[]): Suggestion[] {
  return dedupeByTitle(suggestions)
    .map((suggestion) => ({
      title: truncate(suggestion.title?.trim() || 'Untitled child', 80),
      artifactBody: normalizeArtifactBodyToMarkdown(suggestion.artifactBody),
    }))
    .filter((suggestion) => suggestion.artifactBody.length > 0)
    .slice(0, 4);
}

export function refineChallengeItems(items: ChallengeItemDraft[]): ChallengeItemDraft[] {
  const dedupeKey = (item: ChallengeItemDraft) => normalizeLine(`${item.focusText} ${item.challengePrompt}`);

  return items
    .filter(
      (item, index) => items.findIndex((candidate) => dedupeKey(candidate) === dedupeKey(item)) === index,
    )
    .map((item) => ({
      focusText: truncate((item.focusText || '').trim() || 'Selected artifact area', 160),
      challengePrompt: truncate((item.challengePrompt || '').trim(), 220),
      whyItMatters: truncate((item.whyItMatters || '').trim(), 220),
    }))
    .filter((item) => item.challengePrompt.length >= 20 && item.whyItMatters.length >= 20)
    .slice(0, 7);
}

export function refineArtifactMarkdown(artifactBody: string): string {
  const normalized = normalizeArtifactBodyToMarkdown(artifactBody);
  if (!normalized) {
    return normalized;
  }

  const lines = normalized.split('\n');
  const dedupedLines: string[] = [];
  let previousHeading = '';

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const headingMatch = line.match(/^\s{0,3}#{1,6}\s+(.+?)\s*$/);

    if (headingMatch) {
      const heading = normalizeLine(headingMatch[1]);
      if (heading === previousHeading) {
        continue;
      }
      previousHeading = heading;
    }

    dedupedLines.push(line);
  }

  return dedupedLines.join('\n').trim();
}
