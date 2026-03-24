import { GoogleGenAI, Type } from '@google/genai';
import {
  ArtifactBody,
  ChallengeItemDraft,
  ClarifyQuestionDraft,
  ExpandAspectDraft,
  ScaffoldingBlock,
  Suggestion,
  ThinkingBlock,
} from '../types';
import {
  extractChallengeUnitsFromMarkdown,
  normalizeArtifactBodyToMarkdown,
  summarizeMarkdownSections,
} from '../utils/artifactBody.ts';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

const ARTIFACT_MARKDOWN_RULES = [
  'Output markdown only inside artifactBody.',
  'Write a clear, scan-friendly working artifact for the block.',
  'Use headings only when they improve clarity.',
  'Use bullet lists for grouped ideas and short paragraphs for narrative.',
  'Avoid empty sections and generic filler headings.',
  'Be specific to the block context and preserve uncertainty honestly.',
  'When editing, preserve useful existing structure and revise relevant sections instead of rewriting everything.',
].join('\n- ');

function formatArtifactBodyForPrompt(artifactBody: ArtifactBody): string {
  const normalized = normalizeArtifactBodyToMarkdown(artifactBody);
  return normalized || 'No artifact yet.';
}

function parseScaffoldingBlocks(value: unknown): ScaffoldingBlock[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const record = item as Record<string, unknown>;
      const title = typeof record.title === 'string' ? record.title.trim() : '';
      if (!title) {
        return null;
      }

      return {
        title,
        artifactBody: normalizeArtifactBodyToMarkdown(record.artifactBody),
        tags: Array.isArray(record.tags)
          ? record.tags
              .filter((tag): tag is string => typeof tag === 'string')
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
      };
    })
    .filter((block): block is ScaffoldingBlock => block !== null);
}

function parseSuggestionList(value: unknown): Suggestion[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const record = item as Record<string, unknown>;
      const title = typeof record.title === 'string' ? record.title.trim() : '';
      if (!title) {
        return null;
      }

      return {
        title,
        artifactBody: normalizeArtifactBodyToMarkdown(record.artifactBody),
      };
    })
    .filter((suggestion): suggestion is Suggestion => suggestion !== null);
}

function parseArtifactEnvelope(value: unknown): ArtifactBody {
  if (typeof value === 'string') {
    return normalizeArtifactBodyToMarkdown(value);
  }

  if (!value || typeof value !== 'object') {
    return '';
  }

  const record = value as Record<string, unknown>;
  return normalizeArtifactBodyToMarkdown(record.artifactBody ?? value);
}

export const ideationAiService = {
  async generateProjectStructure(
    idea: string,
  ): Promise<{ projectName: string; blocks: ScaffoldingBlock[] }> {
    if (!genAI) {
      throw new Error('AI not configured');
    }

    const response = await genAI.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this idea and generate a project name plus 4-6 initial thinking blocks.
Idea: ${idea}

Each block must include:
- title
- artifactBody (markdown string)
- 2-3 relevant tags

Artifact rules:
- ${ARTIFACT_MARKDOWN_RULES}
- Keep each artifact concise but useful for an initial scaffold.

Return JSON.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            projectName: { type: Type.STRING },
            blocks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  artifactBody: { type: Type.STRING },
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['title', 'artifactBody', 'tags'],
              },
            },
          },
          required: ['projectName', 'blocks'],
        },
      },
    });

    const parsed = JSON.parse(response.text) as { projectName?: string; blocks?: unknown };

    return {
      projectName: typeof parsed.projectName === 'string' ? parsed.projectName.trim() : 'New Project',
      blocks: parseScaffoldingBlocks(parsed.blocks),
    };
  },

  async expandBlock(block: ThinkingBlock): Promise<ExpandAspectDraft[]> {
    if (!genAI) {
      throw new Error('AI not configured');
    }

    const response = await genAI.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate 4-6 expansion aspect cards for this idea block.
Title: ${block.title}
Artifact:
${formatArtifactBodyForPrompt(block.artifactBody)}
Maturity: ${block.maturityState}
Tags: ${block.tags.join(', ') || 'none'}

Requirements:
- Each card must include title and detail.
- title should be concise and specific to one aspect.
- detail should be concrete and editable by a user.
- Avoid duplicates and broad generic cards.

Return as JSON.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            aspects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  detail: { type: Type.STRING },
                },
                required: ['title', 'detail'],
              },
            },
          },
          required: ['aspects'],
        },
      },
    });

    const parsed = JSON.parse(response.text) as { aspects?: ExpandAspectDraft[] };
    return Array.isArray(parsed.aspects) ? parsed.aspects : [];
  },

  async generateExpandAspect(
    block: ThinkingBlock,
    existingAspects: { title: string; detail: string; context: string }[],
  ): Promise<ExpandAspectDraft> {
    if (!genAI) {
      throw new Error('AI not configured');
    }

    const existingText = existingAspects
      .map(
        (aspect, index) =>
          `${index + 1}. ${aspect.title}\nDetail: ${aspect.detail}\nContext: ${aspect.context || 'None'}`,
      )
      .join('\n\n');

    const response = await genAI.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create one additional expansion aspect card for this idea.
Title: ${block.title}
Artifact:
${formatArtifactBodyForPrompt(block.artifactBody)}
Maturity: ${block.maturityState}
Tags: ${block.tags.join(', ') || 'none'}

Existing expansion cards:
${existingText || 'None'}

Requirements:
- Return one non-duplicate card.
- Include: title, detail.
- Keep title concise and detail concrete.

Return as JSON.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            detail: { type: Type.STRING },
          },
          required: ['title', 'detail'],
        },
      },
    });

    return JSON.parse(response.text);
  },

  async synthesizeExpandBoard(
    block: ThinkingBlock,
    cards: Array<{ title: string; detail: string; context: string }>,
  ): Promise<ArtifactBody> {
    if (!genAI) {
      throw new Error('AI not configured');
    }

    const cardsText = cards
      .map((item, index) => {
        const contextLine = item.context ? `\nUser Context: ${item.context}` : '';
        return `${index + 1}. ${item.title}\nDetail: ${item.detail}${contextLine}`;
      })
      .join('\n\n');

    const response = await genAI.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Revise the artifact markdown using the expansion board cards.
Current block title: ${block.title}
Current artifact markdown:
${formatArtifactBodyForPrompt(block.artifactBody)}

Expansion cards:
${cardsText}

Rules:
- ${ARTIFACT_MARKDOWN_RULES}
- Return a full revised artifactBody markdown string, not a patch object.
- Integrate new information in relevant sections.
- Avoid duplicating headings or flattening everything into one paragraph.

Return JSON with shape: { "artifactBody": "...markdown..." }`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            artifactBody: { type: Type.STRING },
          },
          required: ['artifactBody'],
        },
      },
    });

    return parseArtifactEnvelope(JSON.parse(response.text));
  },

  async clarifyBlock(block: ThinkingBlock): Promise<ClarifyQuestionDraft[]> {
    if (!genAI) {
      throw new Error('AI not configured');
    }

    const response = await genAI.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate 4-6 structured clarification question cards for this idea:
Title: ${block.title}
Artifact:
${formatArtifactBodyForPrompt(block.artifactBody)}
Maturity: ${block.maturityState}
Tags: ${block.tags.join(', ') || 'none'}

Requirements:
- Each item must include: title, prompt, type, options.
- type must be one of: textarea, single, multi.
- Use textarea for open-ended context collection.
- Use single/multi when concrete options reduce friction.
- For textarea, options should be an empty array.
- For single/multi, provide 3-6 concise options.

Return as JSON.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  prompt: { type: Type.STRING },
                  type: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['title', 'prompt', 'type', 'options'],
              },
            },
          },
          required: ['questions'],
        },
      },
    });

    const parsed = JSON.parse(response.text) as { questions?: ClarifyQuestionDraft[] };
    return Array.isArray(parsed.questions) ? parsed.questions : [];
  },

  async generateClarifyQuestion(
    block: ThinkingBlock,
    existingQuestions: { title: string; prompt: string }[],
  ): Promise<ClarifyQuestionDraft> {
    if (!genAI) {
      throw new Error('AI not configured');
    }

    const existingText = existingQuestions
      .map((question, index) => `${index + 1}. ${question.title} - ${question.prompt}`)
      .join('\n');

    const response = await genAI.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create one additional clarification question card for this idea.
Title: ${block.title}
Artifact:
${formatArtifactBodyForPrompt(block.artifactBody)}
Maturity: ${block.maturityState}
Tags: ${block.tags.join(', ') || 'none'}

Existing question cards:
${existingText || 'None'}

Requirements:
- Return one non-duplicate card.
- Include: title, prompt, type, options.
- type must be one of: textarea, single, multi.
- If type is textarea, options must be an empty array.
- If type is single or multi, provide 3-6 options.

Return as JSON.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            type: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['title', 'prompt', 'type', 'options'],
        },
      },
    });

    return JSON.parse(response.text);
  },

  async synthesizeClarifyAnswers(
    block: ThinkingBlock,
    answers: Array<{ title: string; prompt: string; answer: string; note: string }>,
  ): Promise<ArtifactBody> {
    if (!genAI) {
      throw new Error('AI not configured');
    }

    const answerText = answers
      .map((item, index) => {
        const noteLine = item.note ? `\nNote/Context: ${item.note}` : '';
        return `${index + 1}. ${item.title}\nPrompt: ${item.prompt}\nAnswer: ${item.answer}${noteLine}`;
      })
      .join('\n\n');

    const response = await genAI.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Revise the artifact markdown using answered clarification cards.
Current block title: ${block.title}
Current artifact markdown:
${formatArtifactBodyForPrompt(block.artifactBody)}

Clarification answers:
${answerText}

Rules:
- ${ARTIFACT_MARKDOWN_RULES}
- Return a full revised artifactBody markdown string, not a patch object.
- Merge clarified details into relevant existing sections when possible.
- Remove or reduce uncertainty that the answers resolved.
- Preserve useful organization from the current artifact.

Return JSON with shape: { "artifactBody": "...markdown..." }`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            artifactBody: { type: Type.STRING },
          },
          required: ['artifactBody'],
        },
      },
    });

    return parseArtifactEnvelope(JSON.parse(response.text));
  },

  async suggestChildren(block: ThinkingBlock): Promise<Suggestion[]> {
    if (!genAI) {
      throw new Error('AI not configured');
    }

    const response = await genAI.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest 3 related child idea blocks for:
Title: ${block.title}
Artifact:
${formatArtifactBodyForPrompt(block.artifactBody)}
Tags: ${block.tags.join(', ') || 'none'}

For each suggestion, return:
- title
- artifactBody (markdown string)

Artifact rules:
- ${ARTIFACT_MARKDOWN_RULES}
- Keep each suggested artifact concise but useful.

Return as JSON.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              artifactBody: { type: Type.STRING },
            },
            required: ['title', 'artifactBody'],
          },
        },
      },
    });

    return parseSuggestionList(JSON.parse(response.text));
  },

  async challengeBlock(block: ThinkingBlock): Promise<ChallengeItemDraft[]> {
    if (!genAI) {
      throw new Error('AI not configured');
    }

    const challengeUnits = extractChallengeUnitsFromMarkdown(block.artifactBody);
    const sectionSummaries = summarizeMarkdownSections(block.artifactBody);

    const response = await genAI.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a thoughtful collaborator. Analyze this artifact and create concise, answerable challenge items.

Block title: ${block.title}
Maturity: ${block.maturityState}
Tags: ${block.tags.join(', ') || 'none'}
Artifact markdown:
${formatArtifactBodyForPrompt(block.artifactBody)}

Derived challenge units from markdown:
${challengeUnits.length > 0 ? challengeUnits.map((unit, index) => `${index + 1}. ${unit}`).join('\n') : 'None extracted'}

Section summaries:
${sectionSummaries.length > 0 ? sectionSummaries.map((line) => `- ${line}`).join('\n') : '- None'}

Requirements:
- Generate around 3-7 items based on content depth.
- Focus on assumptions, unclear claims, unresolved trade-offs, and decision gaps.
- Each item must include focusText, challengePrompt, whyItMatters.
- focusText should reference a concrete challenge unit from the markdown artifact.
- challengePrompt must be concrete enough for a single user response.
- Avoid nitpicking wording.

Return as JSON.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  focusText: { type: Type.STRING },
                  challengePrompt: { type: Type.STRING },
                  whyItMatters: { type: Type.STRING },
                },
                required: ['focusText', 'challengePrompt', 'whyItMatters'],
              },
            },
          },
          required: ['items'],
        },
      },
    });

    const parsed = JSON.parse(response.text) as { items?: ChallengeItemDraft[] };
    return Array.isArray(parsed.items) ? parsed.items : [];
  },

  async synthesizeChallengeResponses(
    block: ThinkingBlock,
    items: Array<{ focusText: string; challengePrompt: string; whyItMatters: string; userResponse: string }>,
  ): Promise<ArtifactBody> {
    if (!genAI) {
      throw new Error('AI not configured');
    }

    const responseText = items
      .map(
        (item, index) =>
          `${index + 1}. Focus: ${item.focusText}\nChallenge: ${item.challengePrompt}\nWhy it matters: ${item.whyItMatters}\nResponse: ${item.userResponse}`,
      )
      .join('\n\n');

    const response = await genAI.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Revise the artifact markdown using answered challenge items.
Current block title: ${block.title}
Current artifact markdown:
${formatArtifactBodyForPrompt(block.artifactBody)}

Answered challenge items:
${responseText}

Rules:
- ${ARTIFACT_MARKDOWN_RULES}
- Return a full revised artifactBody markdown string, not a patch object.
- Apply resolved insights in the relevant sections and avoid unrelated rewrites.
- Remove stale uncertainty when the user responses resolve it.
- Do not append a noisy "challenge dump" section.

Return JSON with shape: { "artifactBody": "...markdown..." }`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            artifactBody: { type: Type.STRING },
          },
          required: ['artifactBody'],
        },
      },
    });

    return parseArtifactEnvelope(JSON.parse(response.text));
  },
};
