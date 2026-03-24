import { ArtifactBody, ArtifactBodyPatch, ThinkingBlock } from '../types';

const LIST_SECTION_KEYS = ['keyPoints', 'openQuestions', 'nextMoves'] as const;

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function normalizeText(value: string): string {
  return value.replace(/\r\n/g, '\n').trim();
}

function dedupeStrings(values: string[]): string[] {
  return values.filter(
    (value, index, source) => source.findIndex((candidate) => candidate.toLowerCase() === value.toLowerCase()) === index,
  );
}

function normalizeListString(value: string): string[] {
  return dedupeStrings(
    value
      .replace(/\r\n/g, '\n')
      .split(/\n+/)
      .map((line) => line.replace(/^\s*(?:[-*•]+|\d+[.)])\s*/, '').trim())
      .filter(Boolean),
  );
}

function normalizeStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return dedupeStrings(
      value
        .map((item) => normalizeText(asString(item)))
        .filter(Boolean),
    );
  }

  if (typeof value === 'string') {
    return normalizeListString(value);
  }

  return [];
}

export function createEmptyArtifactBody(): ArtifactBody {
  return {
    summary: '',
    keyPoints: [],
    openQuestions: [],
    nextMoves: [],
  };
}

export function normalizeArtifactBody(value: unknown, fallbackSummary = ''): ArtifactBody {
  const emptyArtifact = createEmptyArtifactBody();
  const normalizedFallbackSummary = normalizeText(fallbackSummary);

  if (typeof value === 'string') {
    return {
      ...emptyArtifact,
      summary: normalizeText(value) || normalizedFallbackSummary,
    };
  }

  if (!isRecord(value)) {
    return {
      ...emptyArtifact,
      summary: normalizedFallbackSummary,
    };
  }

  return {
    summary: normalizeText(asString(value.summary)) || normalizedFallbackSummary,
    keyPoints: normalizeStringList(value.keyPoints),
    openQuestions: normalizeStringList(value.openQuestions),
    nextMoves: normalizeStringList(value.nextMoves),
  };
}

export function normalizeArtifactBodyPatch(value: unknown): ArtifactBodyPatch {
  if (typeof value === 'string') {
    return { summary: normalizeText(value) };
  }

  if (!isRecord(value)) {
    return {};
  }

  const patch: ArtifactBodyPatch = {};

  if ('summary' in value) {
    patch.summary = normalizeText(asString(value.summary));
  }

  for (const key of LIST_SECTION_KEYS) {
    if (key in value) {
      patch[key] = normalizeStringList(value[key]);
    }
  }

  return patch;
}

export function mergeArtifactBody(existing: unknown, patch: unknown): ArtifactBody {
  const normalizedExisting = normalizeArtifactBody(existing);

  if (typeof patch === 'string') {
    return {
      ...normalizedExisting,
      summary: normalizeText(patch),
    };
  }

  if (!isRecord(patch)) {
    return normalizedExisting;
  }

  const normalizedPatch = normalizeArtifactBodyPatch(patch);

  return {
    summary: Object.prototype.hasOwnProperty.call(normalizedPatch, 'summary')
      ? normalizedPatch.summary ?? ''
      : normalizedExisting.summary,
    keyPoints: Object.prototype.hasOwnProperty.call(normalizedPatch, 'keyPoints')
      ? normalizedPatch.keyPoints ?? []
      : normalizedExisting.keyPoints,
    openQuestions: Object.prototype.hasOwnProperty.call(normalizedPatch, 'openQuestions')
      ? normalizedPatch.openQuestions ?? []
      : normalizedExisting.openQuestions,
    nextMoves: Object.prototype.hasOwnProperty.call(normalizedPatch, 'nextMoves')
      ? normalizedPatch.nextMoves ?? []
      : normalizedExisting.nextMoves,
  };
}

export function artifactBodyHasContent(value: unknown): boolean {
  const artifactBody = normalizeArtifactBody(value);
  return Boolean(
    artifactBody.summary ||
      artifactBody.keyPoints.length ||
      artifactBody.openQuestions.length ||
      artifactBody.nextMoves.length,
  );
}

export function artifactBodyToLegacyText(value: unknown): string {
  const artifactBody = normalizeArtifactBody(value);
  const sections: string[] = [];

  if (artifactBody.summary) {
    sections.push(artifactBody.summary);
  }

  if (artifactBody.keyPoints.length) {
    sections.push(`Key Points:\n${artifactBody.keyPoints.map((item) => `- ${item}`).join('\n')}`);
  }

  if (artifactBody.openQuestions.length) {
    sections.push(`Open Questions:\n${artifactBody.openQuestions.map((item) => `- ${item}`).join('\n')}`);
  }

  if (artifactBody.nextMoves.length) {
    sections.push(`Next Moves:\n${artifactBody.nextMoves.map((item) => `- ${item}`).join('\n')}`);
  }

  return sections.join('\n\n').trim();
}

export function artifactBodyToPreviewText(value: unknown): string {
  return artifactBodyToLegacyText(value).replace(/\s+/g, ' ').trim();
}

export function normalizeThinkingBlock(block: ThinkingBlock): ThinkingBlock {
  return {
    ...block,
    artifactBody: normalizeArtifactBody(block.artifactBody),
    tags: dedupeStrings(
      block.tags
        .map((tag) => normalizeText(asString(tag)))
        .filter(Boolean),
    ),
  };
}