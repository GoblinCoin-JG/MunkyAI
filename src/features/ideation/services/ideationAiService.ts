import { GoogleGenAI, Type } from '@google/genai';
import {
  ArtifactBody,
  ChallengeItemDraft,
  ClarifyQuestionDraft,
  ExpandAspectDraft,
  QuestionCardType,
  ScaffoldingBlock,
  Suggestion,
  ThinkingBlock,
} from '../types';
import {
  extractChallengeUnitsFromMarkdown,
  summarizeMarkdownSections,
} from '../utils/artifactBody.ts';
import {
  buildIdeationContext,
  IdeationContextPacket,
  IdeationContextPacketInput,
} from './ai/buildIdeationContext';
import {
  buildChallengeBlockPrompt,
  buildClarifyBlockPrompt,
  buildGenerateClarifyQuestionPrompt,
  buildGenerateExpandAspectPrompt,
  buildGenerateProjectStructurePrompt,
  buildRefinementPrompt,
  buildSuggestChildrenPrompt,
  buildSynthesizeChallengeResponsesPrompt,
  buildSynthesizeClarifyAnswersPrompt,
  buildSynthesizeExpandBoardPrompt,
  buildExpandBlockPrompt,
} from './ai/operationPrompts';
import {
  refineArtifactMarkdown,
  refineChallengeItems,
  refineClarifyQuestions,
  refineExpandAspects,
  refineScaffoldingBlocks,
  refineSuggestions,
} from './ai/refineIdeationOutputs';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;
const ENABLE_PROMPT_REFINEMENT = String(process.env.VITE_IDEATION_AI_REFINE ?? 'false') === 'true';

type JsonSchema = Record<string, unknown>;

function assertGenAi(): GoogleGenAI {
  if (!genAI) {
    throw new Error('AI not configured');
  }

  return genAI;
}

function toJsonObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function parseJsonText(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

async function generateJson(prompt: string, responseSchema: JsonSchema): Promise<unknown> {
  const ai = assertGenAi();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema,
    },
  });

  return parseJsonText(response.text);
}

async function generateJsonWithOptionalRefinement(
  operation:
    | 'project-structure'
    | 'expand'
    | 'clarify'
    | 'suggest-children'
    | 'challenge'
    | 'artifact-synthesis',
  prompt: string,
  responseSchema: JsonSchema,
  packet?: IdeationContextPacket,
): Promise<unknown> {
  const firstPass = await generateJson(prompt, responseSchema);

  if (!ENABLE_PROMPT_REFINEMENT) {
    return firstPass;
  }

  const refinementPrompt = buildRefinementPrompt(operation, JSON.stringify(firstPass), packet);
  return generateJson(refinementPrompt, responseSchema);
}

function resolveContextPacket(
  block: ThinkingBlock,
  context?: IdeationContextPacket | IdeationContextPacketInput,
): IdeationContextPacket {
  if (!context) {
    return buildIdeationContext({ selectedBlock: block });
  }

  if ('selectedBlockId' in context) {
    return context;
  }

  return buildIdeationContext(context);
}

function parseQuestionType(value: unknown): QuestionCardType {
  if (value === 'single' || value === 'multi') {
    return value;
  }

  return 'textarea';
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
        artifactBody: typeof record.artifactBody === 'string' ? record.artifactBody : '',
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
        artifactBody: typeof record.artifactBody === 'string' ? record.artifactBody : '',
      };
    })
    .filter((suggestion): suggestion is Suggestion => suggestion !== null);
}

function parseArtifactEnvelope(value: unknown): ArtifactBody {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return '';
  }

  const record = value as Record<string, unknown>;
  return typeof record.artifactBody === 'string' ? record.artifactBody : '';
}

export const ideationAiService = {
  async generateProjectStructure(
    idea: string,
  ): Promise<{ projectName: string; blocks: ScaffoldingBlock[] }> {
    const parsed = toJsonObject(
      await generateJsonWithOptionalRefinement(
        'project-structure',
        buildGenerateProjectStructurePrompt(idea),
        {
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
      ),
    );

    return {
      projectName: typeof parsed.projectName === 'string' ? parsed.projectName.trim() : 'New Project',
      blocks: refineScaffoldingBlocks(parseScaffoldingBlocks(parsed.blocks)),
    };
  },

  async expandBlock(
    block: ThinkingBlock,
    context?: IdeationContextPacket | IdeationContextPacketInput,
  ): Promise<ExpandAspectDraft[]> {
    const packet = resolveContextPacket(block, context);
    const parsed = toJsonObject(
      await generateJsonWithOptionalRefinement(
        'expand',
        buildExpandBlockPrompt(packet),
        {
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
        packet,
      ),
    );

    const aspects = Array.isArray(parsed.aspects) ? (parsed.aspects as ExpandAspectDraft[]) : [];
    return refineExpandAspects(aspects);
  },

  async generateExpandAspect(
    block: ThinkingBlock,
    existingAspects: { title: string; detail: string; context: string }[],
    context?: IdeationContextPacket | IdeationContextPacketInput,
  ): Promise<ExpandAspectDraft> {
    const packet = resolveContextPacket(block, context);
    const parsed = toJsonObject(
      await generateJsonWithOptionalRefinement(
        'expand',
        buildGenerateExpandAspectPrompt(packet, existingAspects),
        {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            detail: { type: Type.STRING },
          },
          required: ['title', 'detail'],
        },
        packet,
      ),
    );

    const refined = refineExpandAspects([
      {
        title: typeof parsed.title === 'string' ? parsed.title : '',
        detail: typeof parsed.detail === 'string' ? parsed.detail : '',
      },
    ]);

    return (
      refined[0] ?? {
        title: 'New expansion angle',
        detail: 'Define one concrete dimension where this block needs stronger detail or clearer decisions.',
      }
    );
  },

  async synthesizeExpandBoard(
    block: ThinkingBlock,
    cards: Array<{ title: string; detail: string; context: string }>,
    context?: IdeationContextPacket | IdeationContextPacketInput,
  ): Promise<ArtifactBody> {
    const packet = resolveContextPacket(block, context);
    const parsed = toJsonObject(
      await generateJsonWithOptionalRefinement(
        'artifact-synthesis',
        buildSynthesizeExpandBoardPrompt(packet, cards),
        {
          type: Type.OBJECT,
          properties: {
            artifactBody: { type: Type.STRING },
          },
          required: ['artifactBody'],
        },
        packet,
      ),
    );

    return refineArtifactMarkdown(parseArtifactEnvelope(parsed));
  },

  async clarifyBlock(
    block: ThinkingBlock,
    context?: IdeationContextPacket | IdeationContextPacketInput,
  ): Promise<ClarifyQuestionDraft[]> {
    const packet = resolveContextPacket(block, context);
    const parsed = toJsonObject(
      await generateJsonWithOptionalRefinement(
        'clarify',
        buildClarifyBlockPrompt(packet),
        {
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
        packet,
      ),
    );

    const questions = Array.isArray(parsed.questions) ? (parsed.questions as ClarifyQuestionDraft[]) : [];
    return refineClarifyQuestions(questions);
  },

  async generateClarifyQuestion(
    block: ThinkingBlock,
    existingQuestions: { title: string; prompt: string }[],
    context?: IdeationContextPacket | IdeationContextPacketInput,
  ): Promise<ClarifyQuestionDraft> {
    const packet = resolveContextPacket(block, context);
    const parsed = toJsonObject(
      await generateJsonWithOptionalRefinement(
        'clarify',
        buildGenerateClarifyQuestionPrompt(packet, existingQuestions),
        {
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
        packet,
      ),
    );

    const refined = refineClarifyQuestions([
      {
        title: typeof parsed.title === 'string' ? parsed.title : '',
        prompt: typeof parsed.prompt === 'string' ? parsed.prompt : '',
        type: parseQuestionType(parsed.type),
        options: Array.isArray(parsed.options)
          ? parsed.options.filter((option): option is string => typeof option === 'string')
          : [],
      },
    ]);

    return (
      refined[0] ?? {
        title: 'Resolve a key decision',
        prompt: 'Which unresolved decision in this block is currently blocking quality or execution most, and what is your proposed answer?',
        type: 'textarea',
        options: [],
      }
    );
  },

  async synthesizeClarifyAnswers(
    block: ThinkingBlock,
    answers: Array<{ title: string; prompt: string; answer: string; note: string }>,
    context?: IdeationContextPacket | IdeationContextPacketInput,
  ): Promise<ArtifactBody> {
    const packet = resolveContextPacket(block, context);
    const parsed = toJsonObject(
      await generateJsonWithOptionalRefinement(
        'artifact-synthesis',
        buildSynthesizeClarifyAnswersPrompt(packet, answers),
        {
          type: Type.OBJECT,
          properties: {
            artifactBody: { type: Type.STRING },
          },
          required: ['artifactBody'],
        },
        packet,
      ),
    );

    return refineArtifactMarkdown(parseArtifactEnvelope(parsed));
  },

  async suggestChildren(
    block: ThinkingBlock,
    context?: IdeationContextPacket | IdeationContextPacketInput,
  ): Promise<Suggestion[]> {
    const packet = resolveContextPacket(block, context);
    const parsed = await generateJsonWithOptionalRefinement(
      'suggest-children',
      buildSuggestChildrenPrompt(packet),
      {
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
      packet,
    );

    return refineSuggestions(parseSuggestionList(parsed));
  },

  async challengeBlock(
    block: ThinkingBlock,
    context?: IdeationContextPacket | IdeationContextPacketInput,
  ): Promise<ChallengeItemDraft[]> {
    const packet = resolveContextPacket(block, context);
    const challengeUnits = extractChallengeUnitsFromMarkdown(block.artifactBody);
    const sectionSummaries = summarizeMarkdownSections(block.artifactBody);

    const parsed = toJsonObject(
      await generateJsonWithOptionalRefinement(
        'challenge',
        buildChallengeBlockPrompt(packet, challengeUnits, sectionSummaries),
        {
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
        packet,
      ),
    );

    const items = Array.isArray(parsed.items) ? (parsed.items as ChallengeItemDraft[]) : [];
    return refineChallengeItems(items);
  },

  async synthesizeChallengeResponses(
    block: ThinkingBlock,
    items: Array<{ focusText: string; challengePrompt: string; whyItMatters: string; userResponse: string }>,
    context?: IdeationContextPacket | IdeationContextPacketInput,
  ): Promise<ArtifactBody> {
    const packet = resolveContextPacket(block, context);
    const parsed = toJsonObject(
      await generateJsonWithOptionalRefinement(
        'artifact-synthesis',
        buildSynthesizeChallengeResponsesPrompt(packet, items),
        {
          type: Type.OBJECT,
          properties: {
            artifactBody: { type: Type.STRING },
          },
          required: ['artifactBody'],
        },
        packet,
      ),
    );

    return refineArtifactMarkdown(parseArtifactEnvelope(parsed));
  },
};
