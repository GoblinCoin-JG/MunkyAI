import { ThinkingBlock } from '../types';

interface LegacyBlockRecord {
  id?: unknown;
  projectId?: unknown;
  parentId?: unknown;
  title?: unknown;
  tags?: unknown;
  maturityState?: unknown;
  artifactBody?: unknown;
  notesContent?: unknown;
  content?: unknown;
  summary?: unknown;
}

const VALID_MATURITY_STATES = new Set(['Exploratory', 'Developing', 'Validated', 'Locked']);

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function sanitizeText(value: string): string {
  return value.trim().replace(/\r\n/g, '\n');
}

function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags
    .map((tag) => asString(tag).trim())
    .filter(Boolean)
    .filter((tag, index, source) => source.findIndex((candidate) => candidate.toLowerCase() === tag.toLowerCase()) === index);
}

function buildArtifactBodyFromLegacy(record: LegacyBlockRecord): string {
  const artifactBody = sanitizeText(asString(record.artifactBody));
  if (artifactBody) {
    return artifactBody;
  }

  const notesContent = sanitizeText(asString(record.notesContent));
  const content = sanitizeText(asString(record.content));
  const summary = sanitizeText(asString(record.summary));

  const primaryNotes = notesContent || content;

  if (primaryNotes && summary) {
    const normalizedNotes = primaryNotes.toLowerCase();
    const normalizedSummary = summary.toLowerCase();
    if (normalizedNotes.includes(normalizedSummary)) {
      return primaryNotes;
    }

    return `${summary}\n\n${primaryNotes}`;
  }

  return primaryNotes || summary;
}

function isLegacyBlockRecord(value: unknown): value is LegacyBlockRecord {
  return Boolean(value && typeof value === 'object');
}

export function migrateStoredBlocks(savedBlocks: string | null, fallbackBlocks: ThinkingBlock[]): ThinkingBlock[] {
  if (!savedBlocks) {
    return fallbackBlocks;
  }

  try {
    const parsed = JSON.parse(savedBlocks) as unknown;
    if (!Array.isArray(parsed)) {
      return fallbackBlocks;
    }

    return parsed
      .filter(isLegacyBlockRecord)
      .map((record): ThinkingBlock | null => {
        const id = asString(record.id).trim();
        const projectId = asString(record.projectId).trim();
        const title = asString(record.title).trim();

        if (!id || !projectId || !title) {
          return null;
        }

        const maturityState = asString(record.maturityState);
        const normalizedMaturityState = VALID_MATURITY_STATES.has(maturityState)
          ? (maturityState as ThinkingBlock['maturityState'])
          : 'Exploratory';

        const parentIdRaw = record.parentId;
        const parentId = typeof parentIdRaw === 'string' && parentIdRaw.trim().length > 0 ? parentIdRaw : null;

        return {
          id,
          projectId,
          parentId,
          title,
          artifactBody: buildArtifactBodyFromLegacy(record),
          tags: normalizeTags(record.tags),
          maturityState: normalizedMaturityState,
        };
      })
      .filter((block): block is ThinkingBlock => block !== null);
  } catch {
    return fallbackBlocks;
  }
}
