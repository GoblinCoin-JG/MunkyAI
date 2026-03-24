import { ThinkingBlock } from '../../types';
import { artifactBodyToPreviewText, normalizeArtifactBodyToMarkdown } from '../../utils/artifactBody.ts';

export interface IdeationRecentInput {
  title: string;
  content: string;
}

export interface IdeationContextPacketInput {
  projectName?: string;
  selectedBlock: ThinkingBlock;
  parentBlock?: ThinkingBlock | null;
  childBlocks?: ThinkingBlock[];
  pathFromRoot?: ThinkingBlock[];
  recentInputs?: IdeationRecentInput[];
}

export interface IdeationContextPacket {
  projectName: string;
  selectedBlockId: string;
  selectedBlockTitle: string;
  selectedBlockArtifact: string;
  selectedBlockTags: string[];
  selectedBlockMaturity: string;
  parentBlockTitle?: string;
  parentArtifactSnippet?: string;
  childSummaries: Array<{ title: string; artifactSnippet: string }>;
  pathFromRootTitles: string[];
  recentInputs: IdeationRecentInput[];
}

function safeTrim(value: string, fallback = ''): string {
  const normalized = value.trim();
  return normalized || fallback;
}

function dedupeLines(lines: string[]): string[] {
  return lines.filter((line, index) => lines.findIndex((candidate) => candidate.toLowerCase() === line.toLowerCase()) === index);
}

function snippetFromArtifact(markdown: string, maxChars = 220): string {
  const preview = artifactBodyToPreviewText(markdown);
  if (!preview) {
    return 'No artifact yet.';
  }

  if (preview.length <= maxChars) {
    return preview;
  }

  return `${preview.slice(0, maxChars - 3).trim()}...`;
}

export function buildIdeationContext(input: IdeationContextPacketInput): IdeationContextPacket {
  const selectedArtifact = normalizeArtifactBodyToMarkdown(input.selectedBlock.artifactBody);
  const childSummaries = (input.childBlocks ?? []).map((child) => ({
    title: safeTrim(child.title, 'Untitled child block'),
    artifactSnippet: snippetFromArtifact(child.artifactBody),
  }));

  const normalizedPath = input.pathFromRoot ?? [];
  const pathFromRootTitles = dedupeLines(
    normalizedPath
      .map((block) => safeTrim(block.title))
      .filter(Boolean),
  );

  const recentInputs = (input.recentInputs ?? [])
    .map((entry) => ({
      title: safeTrim(entry.title, 'Context'),
      content: safeTrim(entry.content),
    }))
    .filter((entry) => entry.content.length > 0)
    .slice(0, 8);

  const packet: IdeationContextPacket = {
    projectName: safeTrim(input.projectName ?? '', 'Untitled Project'),
    selectedBlockId: input.selectedBlock.id,
    selectedBlockTitle: safeTrim(input.selectedBlock.title, 'Untitled block'),
    selectedBlockArtifact: selectedArtifact || 'No artifact yet.',
    selectedBlockTags: input.selectedBlock.tags.map((tag) => tag.trim()).filter(Boolean),
    selectedBlockMaturity: input.selectedBlock.maturityState,
    childSummaries,
    pathFromRootTitles,
    recentInputs,
  };

  if (input.parentBlock) {
    packet.parentBlockTitle = safeTrim(input.parentBlock.title, 'Untitled parent block');
    packet.parentArtifactSnippet = snippetFromArtifact(input.parentBlock.artifactBody);
  }

  return packet;
}

export function formatIdeationContext(packet: IdeationContextPacket): string {
  const childLines =
    packet.childSummaries.length > 0
      ? packet.childSummaries.map((child, index) => `${index + 1}. ${child.title} - ${child.artifactSnippet}`).join('\n')
      : 'None';

  const pathLine = packet.pathFromRootTitles.length > 0 ? packet.pathFromRootTitles.join(' > ') : 'Unknown';

  const recentInputLines =
    packet.recentInputs.length > 0
      ? packet.recentInputs
          .map((entry, index) => `${index + 1}. ${entry.title}: ${entry.content}`)
          .join('\n')
      : 'None';

  return [
    'Context packet:',
    `- Project: ${packet.projectName}`,
    `- Selected block: ${packet.selectedBlockTitle}`,
    `- Selected block maturity: ${packet.selectedBlockMaturity}`,
    `- Selected block tags: ${packet.selectedBlockTags.join(', ') || 'none'}`,
    '- Selected block artifact markdown:',
    packet.selectedBlockArtifact,
    `- Parent block: ${packet.parentBlockTitle || 'None'}`,
    `- Parent snippet: ${packet.parentArtifactSnippet || 'None'}`,
    `- Path from root: ${pathLine}`,
    '- Immediate children:',
    childLines,
    '- Recent inputs:',
    recentInputLines,
  ].join('\n');
}
