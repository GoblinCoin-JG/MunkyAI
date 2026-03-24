import { ArtifactBody, ThinkingBlock } from '../types';

const KNOWN_SECTION_KEYS = [
  'summary',
  'overview',
  'keyPoints',
  'keyIdeas',
  'openQuestions',
  'nextMoves',
  'constraints',
  'risks',
  'decisions',
  'examples',
  'notes',
] as const;

const SECTION_LABELS: Record<string, string> = {
  summary: 'Summary',
  overview: 'Overview',
  keyPoints: 'Key Points',
  keyIdeas: 'Key Ideas',
  openQuestions: 'Open Questions',
  nextMoves: 'Next Steps',
  constraints: 'Constraints',
  risks: 'Risks',
  decisions: 'Decisions',
  examples: 'Examples',
  notes: 'Notes',
};

interface MarkdownSection {
  heading: string;
  content: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function normalizeText(value: string): string {
  return value.replace(/\r\n/g, '\n').trim();
}

function dedupeStrings(values: string[]): string[] {
  return values.filter(
    (value, index, source) => source.findIndex((candidate) => candidate.toLowerCase() === value.toLowerCase()) === index,
  );
}

function toStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return dedupeStrings(value.map((item) => normalizeText(asString(item))).filter(Boolean));
  }

  if (typeof value === 'string') {
    return dedupeStrings(
      value
        .replace(/\r\n/g, '\n')
        .split(/\n+/)
        .map((line) => line.replace(/^\s*(?:[-*+]|\d+[.)])\s*/, '').trim())
        .filter(Boolean),
    );
  }

  return [];
}

function keyToHeading(key: string): string {
  if (SECTION_LABELS[key]) {
    return SECTION_LABELS[key];
  }

  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function valueToSectionBody(value: unknown): string {
  if (typeof value === 'string') {
    return normalizeText(value);
  }

  const items = toStringList(value);
  if (items.length > 0) {
    return items.map((item) => `- ${item}`).join('\n');
  }

  return '';
}

function sectionsToMarkdown(sections: MarkdownSection[]): string {
  return sections
    .map((section) => `## ${section.heading}\n${section.content}`)
    .join('\n\n')
    .trim();
}

export function artifactObjectToMarkdown(value: unknown): string {
  if (!isRecord(value)) {
    return '';
  }

  const sections: MarkdownSection[] = [];
  const consumedKeys = new Set<string>();

  for (const key of KNOWN_SECTION_KEYS) {
    if (!(key in value)) {
      continue;
    }

    const body = valueToSectionBody(value[key]);
    if (!body) {
      continue;
    }

    sections.push({ heading: keyToHeading(key), content: body });
    consumedKeys.add(key);
  }

  for (const [key, raw] of Object.entries(value)) {
    if (consumedKeys.has(key)) {
      continue;
    }

    const body = valueToSectionBody(raw);
    if (!body) {
      continue;
    }

    sections.push({ heading: keyToHeading(key), content: body });
  }

  return sectionsToMarkdown(sections);
}

export function normalizeArtifactBodyToMarkdown(value: unknown, fallback = ''): ArtifactBody {
  const normalizedFallback = normalizeText(fallback);

  if (typeof value === 'string') {
    const normalized = normalizeText(value);
    return normalized || normalizedFallback;
  }

  const fromObject = artifactObjectToMarkdown(value);
  if (fromObject) {
    return fromObject;
  }

  return normalizedFallback;
}

export function normalizeArtifactBody(value: unknown, fallback = ''): ArtifactBody {
  return normalizeArtifactBodyToMarkdown(value, fallback);
}

export function createEmptyArtifactBody(): ArtifactBody {
  return '';
}

export function artifactBodyHasContent(value: unknown): boolean {
  return normalizeArtifactBodyToMarkdown(value).length > 0;
}

export function flattenArtifactMarkdown(markdown: string): string {
  return normalizeText(markdown)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}(?:[-*+] |\d+[.)] )/gm, '')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/[>*_~]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function artifactBodyToLegacyText(value: unknown): string {
  return flattenArtifactMarkdown(normalizeArtifactBodyToMarkdown(value));
}

export function artifactBodyToPreviewText(value: unknown): string {
  const flattened = flattenArtifactMarkdown(normalizeArtifactBodyToMarkdown(value));
  if (flattened.length <= 180) {
    return flattened;
  }

  return `${flattened.slice(0, 177).trim()}...`;
}

export function extractMarkdownSections(markdown: string): MarkdownSection[] {
  const normalized = normalizeText(markdown);
  if (!normalized) {
    return [];
  }

  const lines = normalized.split('\n');
  const sections: MarkdownSection[] = [];
  let currentHeading = 'Overview';
  let currentLines: string[] = [];

  const commitSection = () => {
    const content = currentLines.join('\n').trim();
    if (content) {
      sections.push({ heading: currentHeading, content });
    }
  };

  for (const line of lines) {
    const headingMatch = line.match(/^\s{0,3}#{1,6}\s+(.+?)\s*$/);
    if (headingMatch) {
      commitSection();
      currentHeading = headingMatch[1].trim();
      currentLines = [];
      continue;
    }

    currentLines.push(line);
  }

  commitSection();

  return sections;
}

export function summarizeMarkdownSections(markdown: string): string[] {
  return extractMarkdownSections(markdown).map((section) => {
    const snippet = flattenArtifactMarkdown(section.content);
    const excerpt = snippet.length > 140 ? `${snippet.slice(0, 137).trim()}...` : snippet;
    return `${section.heading}: ${excerpt}`;
  });
}

export function extractChallengeUnitsFromMarkdown(markdown: string): string[] {
  const normalized = normalizeArtifactBodyToMarkdown(markdown);
  const sections = extractMarkdownSections(normalized);
  const units: string[] = [];

  for (const section of sections) {
    const lines = section.content.split('\n').map((line) => line.trim()).filter(Boolean);
    const bulletLines = lines
      .filter((line) => /^[-*+]\s+/.test(line) || /^\d+[.)]\s+/.test(line))
      .map((line) => line.replace(/^[-*+]\s+|^\d+[.)]\s+/, '').trim())
      .filter(Boolean);

    for (const bullet of bulletLines) {
      units.push(bullet);
    }

    const plainParagraphs = section.content
      .split(/\n\s*\n/g)
      .map((paragraph) => flattenArtifactMarkdown(paragraph))
      .filter(Boolean);

    if (plainParagraphs.length > 0) {
      units.push(`${section.heading}: ${plainParagraphs[0]}`);
    }
  }

  const flattenedUnits = dedupeStrings(units.map((unit) => unit.trim()).filter((unit) => unit.length > 0));

  return flattenedUnits
    .filter((unit) => unit.length >= 12)
    .map((unit) => (unit.length > 220 ? `${unit.slice(0, 217).trim()}...` : unit))
    .slice(0, 12);
}

function headingsEqual(left: string, right: string): boolean {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

export function mergeArtifactMarkdown(existingMarkdown: string, patchMarkdown: string): string {
  const existing = normalizeArtifactBodyToMarkdown(existingMarkdown);
  const patch = normalizeArtifactBodyToMarkdown(patchMarkdown);

  if (!patch) {
    return existing;
  }

  if (!existing) {
    return patch;
  }

  const existingSections = extractMarkdownSections(existing);
  const patchSections = extractMarkdownSections(patch);

  if (existingSections.length === 0 || patchSections.length === 0) {
    return patch;
  }

  const merged: MarkdownSection[] = existingSections.map((section) => ({ ...section }));

  for (const patchSection of patchSections) {
    const existingIndex = merged.findIndex((section) => headingsEqual(section.heading, patchSection.heading));
    if (existingIndex >= 0) {
      merged[existingIndex] = patchSection;
    } else {
      merged.push(patchSection);
    }
  }

  return sectionsToMarkdown(merged);
}

export function normalizeThinkingBlock(block: ThinkingBlock): ThinkingBlock {
  return {
    ...block,
    artifactBody: normalizeArtifactBodyToMarkdown(block.artifactBody),
    tags: dedupeStrings(
      block.tags
        .map((tag) => normalizeText(asString(tag)))
        .filter(Boolean),
    ),
  };
}
