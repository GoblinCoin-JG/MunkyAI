import { GoogleGenAI, Type } from '@google/genai';
import {
  ArtifactBody,
  ArtifactBodyPatch,
  ChallengeItemDraft,
  ClarifyQuestionDraft,
  ExpandAspectDraft,
  ScaffoldingBlock,
  Suggestion,
  ThinkingBlock,
} from '../types';
import { normalizeArtifactBody, normalizeArtifactBodyPatch } from '../utils/artifactBody.ts';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

function buildArtifactBodySchema(required = true) {
  return {
    type: Type.OBJECT,
    properties: {
      summary: { type: Type.STRING },
      keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
      openQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
      nextMoves: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    ...(required ? { required: ['summary', 'keyPoints', 'openQuestions', 'nextMoves'] } : {}),
  };
}

function formatArtifactBodyForPrompt(artifactBody: ArtifactBody): string {
  return [
    `Summary:\n${artifactBody.summary || 'None yet.'}`,
    `Key Points:\n${artifactBody.keyPoints.length ? artifactBody.keyPoints.map((item) => `- ${item}`).join('\n') : '- None yet.'}`,
    `Open Questions:\n${artifactBody.openQuestions.length ? artifactBody.openQuestions.map((item) => `- ${item}`).join('\n') : '- None yet.'}`,
    `Next Moves:\n${artifactBody.nextMoves.length ? artifactBody.nextMoves.map((item) => `- ${item}`).join('\n') : '- None yet.'}`,
  ].join('\n\n');
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
        artifactBody: normalizeArtifactBody(record.artifactBody),
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
        artifactBody: normalizeArtifactBody(record.artifactBody),
      };
    })
    .filter((suggestion): suggestion is Suggestion => suggestion !== null);
}

function parseArtifactPatchEnvelope(value: unknown): ArtifactBodyPatch {
  if (!value || typeof value !== 'object') {
    return {};
  }

  const record = value as Record<string, unknown>;
  return normalizeArtifactBodyPatch(record.artifactBody ?? value);
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
      contents: `Analyze this idea and generate a structured project name and a set of 4-6 initial thinking blocks to explore it.
      Idea: ${idea}

      Each block must include:
      - a concise title
      - artifactBody with summary, keyPoints, openQuestions, nextMoves
      - 2-3 relevant tags

      Artifact writing rules:
      - Keep summary concise and specific to the idea.
      - Make keyPoints concrete and distinct.
      - Use openQuestions only for meaningful unresolved issues.
      - Make nextMoves actionable.
      - Avoid generic filler and repeated ideas across sections.

      Return as JSON.`,
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
                  artifactBody: buildArtifactBodySchema(),
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
  ): Promise<ArtifactBodyPatch> {
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
      contents: `Update this idea block artifact using the expansion board cards.
      Current block title: ${block.title}
      Current artifact:
      ${formatArtifactBodyForPrompt(block.artifactBody)}

      Expansion cards:
      ${cardsText}

      Return artifactBody as a structured JSON object containing only the sections that should change.
      Preserve existing sections by omitting them if they do not need changes.
      Keep summary concise, keyPoints concrete, openQuestions unresolved, and nextMoves actionable.
      Avoid fluff and do not flatten everything into one paragraph.
      Return as JSON.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            artifactBody: buildArtifactBodySchema(false),
          },
          required: ['artifactBody'],
        },
      },
    });

    return parseArtifactPatchEnvelope(JSON.parse(response.text));
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
  ): Promise<ArtifactBodyPatch> {
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
      contents: `Update this idea block artifact using answered clarification cards.
      Current block title: ${block.title}
      Current artifact:
      ${formatArtifactBodyForPrompt(block.artifactBody)}

      Clarification answers:
      ${answerText}

      Return artifactBody as a structured JSON object containing only the sections that should change.
      Preserve existing sections by omitting them if they do not need changes.
      Clarifications should improve the right section, including resolving or replacing openQuestions when justified.
      Keep it concrete and preserve the original intent.
      Return as JSON.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            artifactBody: buildArtifactBodySchema(false),
          },
          required: ['artifactBody'],
        },
      },
    });

    return parseArtifactPatchEnvelope(JSON.parse(response.text));
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
      - artifactBody with summary, keyPoints, openQuestions, nextMoves

      Writing rules:
      - Make the summary concise and specific.
      - Keep keyPoints concrete and distinct.
      - Use openQuestions only for meaningful unknowns.
      - Make nextMoves actionable.

      Return as JSON.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              artifactBody: buildArtifactBodySchema(),
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

    const response = await genAI.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a thoughtful collaborator. Analyze this artifact and create concise, answerable challenge items.

      Block title: ${block.title}
      Maturity: ${block.maturityState}
      Tags: ${block.tags.join(', ') || 'none'}
      Artifact:
      ${formatArtifactBodyForPrompt(block.artifactBody)}

      Use keyPoints as the primary source for challenge items.
      Use openQuestions when they expose unresolved decisions or assumptions.
      If keyPoints are sparse, fall back to the summary.

      Requirements:
      - Generate around 3-7 items based on content depth.
      - Focus on key assumptions, vagueness, missing decisions, scope risks, and unclear intent.
      - Avoid nitpicking wording.
      - Each item must include keyPoint, challengePrompt, whyItMatters.
      - challengePrompt must be concrete enough for a single user response.

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
                  keyPoint: { type: Type.STRING },
                  challengePrompt: { type: Type.STRING },
                  whyItMatters: { type: Type.STRING },
                },
                required: ['keyPoint', 'challengePrompt', 'whyItMatters'],
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
    items: Array<{ keyPoint: string; challengePrompt: string; whyItMatters: string; userResponse: string }>,
  ): Promise<ArtifactBodyPatch> {
    if (!genAI) {
      throw new Error('AI not configured');
    }

    const responseText = items
      .map(
        (item, index) =>
          `${index + 1}. Key point: ${item.keyPoint}\nChallenge: ${item.challengePrompt}\nWhy it matters: ${item.whyItMatters}\nResponse: ${item.userResponse}`,
      )
      .join('\n\n');

    const response = await genAI.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Update this idea block artifact using answered challenge items.
      Current block title: ${block.title}
      Current artifact:
      ${formatArtifactBodyForPrompt(block.artifactBody)}

      Answered challenge items:
      ${responseText}

      Return artifactBody as a structured JSON object containing only the sections that should change.
      Work primarily in keyPoints, openQuestions, and nextMoves.
      Resolve or replace openQuestions when the responses justify it.
      Preserve untouched sections by omitting them.
      Do not append an unstructured challenge section.
      Return as JSON.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            artifactBody: buildArtifactBodySchema(false),
          },
          required: ['artifactBody'],
        },
      },
    });

    return parseArtifactPatchEnvelope(JSON.parse(response.text));
  },
};
