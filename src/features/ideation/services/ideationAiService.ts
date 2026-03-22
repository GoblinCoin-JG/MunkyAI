import { GoogleGenAI, Type } from '@google/genai';
import { ClarifyQuestionDraft, ScaffoldingBlock, Suggestion, ThinkingBlock } from '../types';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

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

      Each block should have a title, a one-sentence summary, a paragraph of starting content/notes, and 2-3 relevant tags.
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
                  summary: { type: Type.STRING },
                  content: { type: Type.STRING },
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['title', 'summary', 'content', 'tags'],
              },
            },
          },
          required: ['projectName', 'blocks'],
        },
      },
    });

    return JSON.parse(response.text);
  },

  async expandBlock(block: ThinkingBlock): Promise<{ summary: string; content: string }> {
    if (!genAI) {
      throw new Error('AI not configured');
    }

    const response = await genAI.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Expand on this idea block.
      Title: ${block.title}
      Current Summary: ${block.summary}
      Current Notes: ${block.content}

      Provide a more detailed summary and expanded notes. Return as JSON.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            content: { type: Type.STRING },
          },
          required: ['summary', 'content'],
        },
      },
    });

    return JSON.parse(response.text);
  },

  async clarifyBlock(block: ThinkingBlock): Promise<ClarifyQuestionDraft[]> {
    if (!genAI) {
      throw new Error('AI not configured');
    }

    const response = await genAI.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate 4-6 structured clarification question cards for this idea:
      Title: ${block.title}
      Summary: ${block.summary}
      Notes: ${block.content}

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
      Summary: ${block.summary}
      Notes: ${block.content}

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
  ): Promise<{ summary: string; content: string }> {
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
      contents: `Update this idea block using the answered clarification board.
      Current block title: ${block.title}
      Current summary: ${block.summary}
      Current notes: ${block.content}

      Clarification answers:
      ${answerText}

      Return an improved summary and content that integrate the new details.
      Keep it concrete, and preserve the original intent.
      Return as JSON.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            content: { type: Type.STRING },
          },
          required: ['summary', 'content'],
        },
      },
    });

    return JSON.parse(response.text);
  },

  async suggestChildren(block: ThinkingBlock): Promise<Suggestion[]> {
    if (!genAI) {
      throw new Error('AI not configured');
    }

    const response = await genAI.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest 3 related sub-ideas (child blocks) for:
      Title: ${block.title}
      Summary: ${block.summary}

      Return as a JSON array of objects with 'title' and 'description'.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ['title', 'description'],
          },
        },
      },
    });

    return JSON.parse(response.text);
  },

  async generateArtifact(block: ThinkingBlock, children: ThinkingBlock[]): Promise<string> {
    if (!genAI) {
      throw new Error('AI not configured');
    }

    const childrenText = children
      .map((child) => `### ${child.title}\n${child.summary}\n${child.content}`)
      .join('\n\n');

    const response = await genAI.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a polished markdown artifact draft based on this block and its children.
      Main Block: ${block.title}
      Summary: ${block.summary}
      Notes: ${block.content}

      Children:
      ${childrenText}

      Return the markdown text directly.`,
    });

    return response.text;
  },
};
