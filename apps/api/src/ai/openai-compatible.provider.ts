import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AIProvider,
  AIResult,
  AIUsage,
  GenerateInput,
  GenerateTextInput,
} from './ai-provider.interface';

const defaultSystemPrompt =
  'You are MentorMind AI, a careful senior learning consultant. Be accurate, practical, structured, and answer in Vietnamese unless the user explicitly requests another language.';

@Injectable()
export class OpenAICompatibleProvider implements AIProvider {
  readonly name = 'openai-compatible';
  readonly model: string;
  private readonly baseUrl: string;
  private readonly apiKey: string | undefined;

  constructor(config: ConfigService) {
    this.baseUrl = (
      config.get<string>('AI_BASE_URL')?.trim() || 'https://api.openai.com/v1'
    ).replace(/\/+$/, '');
    this.apiKey = config.get<string>('AI_API_KEY')?.trim() || undefined;
    this.model = config.get<string>('AI_MODEL')?.trim() || 'gpt-4.1-mini';
  }

  async generateText(input: GenerateTextInput): Promise<AIResult<string>> {
    const started = Date.now();
    this.requireApiKey();

    const json = await this.chat(input.prompt, false, input.systemPrompt);
    const content = json.choices?.[0]?.message?.content;
    if (!content?.trim()) {
      throw new Error('AI provider returned an empty completion.');
    }
    return {
      data: content,
      usage: this.normalizeUsage(json.usage),
      provider: this.name,
      model: this.model,
      latencyMs: Date.now() - started,
    };
  }

  async generateJson<T>(input: GenerateInput<T>): Promise<AIResult<T>> {
    const started = Date.now();
    this.requireApiKey();

    const json = await this.chat(
      `${input.prompt}\n\nReturn valid JSON only.`,
      true,
      input.systemPrompt,
      input.temperature,
    );
    const content = json.choices?.[0]?.message?.content;
    if (!content?.trim()) {
      throw new Error('AI provider returned an empty JSON completion.');
    }
    const parsed = input.schema.parse(JSON.parse(content));
    return {
      data: parsed,
      usage: this.normalizeUsage(json.usage),
      provider: this.name,
      model: this.model,
      latencyMs: Date.now() - started,
    };
  }

  async generateEmbedding(input: string): Promise<number[]> {
    const apiKey = this.requireApiKey();

    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model: 'text-embedding-3-small', input }),
    });
    if (!response.ok) {
      throw new Error(`Embedding provider failed: ${response.status}`);
    }
    const json = (await response.json()) as { data?: Array<{ embedding: number[] }> };
    const embedding = json.data?.[0]?.embedding;
    if (!embedding?.length) {
      throw new Error('Embedding provider returned an empty embedding.');
    }
    return embedding;
  }

  estimateCost(usage: AIUsage): number {
    return usage.promptTokens * 0.00000015 + usage.completionTokens * 0.0000006 || 0;
  }

  private async chat(prompt: string, json = false, systemPrompt?: string, temperature = 0.3) {
    const apiKey = this.requireApiKey();
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        temperature,
        response_format: json ? { type: 'json_object' } : undefined,
        messages: [
          {
            role: 'system',
            content: systemPrompt?.trim() || defaultSystemPrompt,
          },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI provider failed: ${response.status}`);
    }
    return response.json() as Promise<{
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    }>;
  }

  private requireApiKey() {
    if (!this.apiKey) {
      throw new Error('AI_API_KEY is required for the OpenAI-compatible provider.');
    }
    return this.apiKey;
  }

  private normalizeUsage(usage?: { prompt_tokens?: number; completion_tokens?: number }): AIUsage {
    return {
      promptTokens: usage?.prompt_tokens ?? 0,
      completionTokens: usage?.completion_tokens ?? 0,
    };
  }
}
