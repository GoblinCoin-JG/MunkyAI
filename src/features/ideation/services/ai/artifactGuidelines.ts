export const MARKDOWN_ARTIFACT_GUIDELINES = [
  'Output markdown in artifactBody.',
  'Treat the artifact as a working document, not a rigid schema dump.',
  'Use headings only when they improve scanability or structure.',
  'Keep paragraphs short and focused.',
  'Use bullets for grouped ideas, comparisons, or option sets.',
  'Include tradeoffs, constraints, risks, examples, and open questions when relevant.',
  'Prefer concrete details over broad abstractions.',
  'Remove duplication and stale notes when integrating new information.',
  'Preserve useful existing organization and improve it incrementally.',
  'Avoid empty headings, filler sections, and generic motivational language.',
].join('\n- ');

export const ARTIFACT_REVISION_PROCESS = [
  'Read current markdown and identify what is already strong.',
  'Locate weak or missing decisions that should be updated.',
  'Integrate new information into the most relevant sections.',
  'Reorganize only when it materially improves clarity.',
  'Return one revised artifact markdown body.',
].join('\n- ');
