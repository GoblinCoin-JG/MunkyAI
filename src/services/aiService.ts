import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

export type MaturityState = 'Exploratory' | 'Developing' | 'Validated' | 'Locked';

export interface ThinkingBlock {
  id: string;
  projectId: string;
  parentId: string | null;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  maturityState: MaturityState;
}

export interface Suggestion {
  title: string;
  description: string;
}

export interface ScaffoldingBlock {
  title: string;
  summary: string;
  content: string;
  tags: string[];
}

export const aiService = {
  async generateProjectStructure(idea: string): Promise<{ projectName: string; blocks: ScaffoldingBlock[] }> {
    if (!genAI) throw new Error("AI not configured");
    const model = genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this idea and generate a structured project name and a set of 4-6 initial thinking blocks to explore it.
      Idea: ${idea}
      
      Each block should have a title, a one-sentence summary, a paragraph of starting content/notes, and 2-3 relevant tags.
      Return as JSON.`,
      config: {
        responseMimeType: "application/json",
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
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["title", "summary", "content", "tags"]
              }
            }
          },
          required: ["projectName", "blocks"]
        }
      }
    });
    const res = await model;
    return JSON.parse(res.text);
  },

  async expandBlock(block: ThinkingBlock): Promise<{ summary: string; content: string }> {
    if (!genAI) throw new Error("AI not configured");
    const model = genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Expand on this idea block. 
      Title: ${block.title}
      Current Summary: ${block.summary}
      Current Notes: ${block.content}
      
      Provide a more detailed summary and expanded notes. Return as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            content: { type: Type.STRING }
          },
          required: ["summary", "content"]
        }
      }
    });
    const res = await model;
    return JSON.parse(res.text);
  },

  async clarifyBlock(block: ThinkingBlock): Promise<string[]> {
    if (!genAI) throw new Error("AI not configured");
    const model = genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 3-5 follow-up questions to clarify this idea:
      Title: ${block.title}
      Summary: ${block.summary}
      Notes: ${block.content}
      
      Return as a JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    const res = await model;
    return JSON.parse(res.text);
  },

  async suggestChildren(block: ThinkingBlock): Promise<Suggestion[]> {
    if (!genAI) throw new Error("AI not configured");
    const model = genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest 3 related sub-ideas (child blocks) for:
      Title: ${block.title}
      Summary: ${block.summary}
      
      Return as a JSON array of objects with 'title' and 'description'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["title", "description"]
          }
        }
      }
    });
    const res = await model;
    return JSON.parse(res.text);
  },

  async generateArtifact(block: ThinkingBlock, children: ThinkingBlock[]): Promise<string> {
    if (!genAI) throw new Error("AI not configured");
    const childrenText = children.map(c => `### ${c.title}\n${c.summary}\n${c.content}`).join('\n\n');
    const model = genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a polished markdown artifact draft based on this block and its children.
      Main Block: ${block.title}
      Summary: ${block.summary}
      Notes: ${block.content}
      
      Children:
      ${childrenText}
      
      Return the markdown text directly.`,
    });
    const res = await model;
    return res.text;
  }
};
