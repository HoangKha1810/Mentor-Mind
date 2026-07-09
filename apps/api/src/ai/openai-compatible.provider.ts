import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProvider, AIResult, AIUsage, GenerateInput } from './ai-provider.interface';

@Injectable()
export class OpenAICompatibleProvider implements AIProvider {
  readonly name = 'openai-compatible';
  readonly model: string;
  private readonly baseUrl: string;
  private readonly apiKey: string | undefined;

  constructor(config: ConfigService) {
    this.baseUrl = config.get<string>('AI_BASE_URL') || 'https://api.openai.com/v1';
    this.apiKey = config.get<string>('AI_API_KEY') || undefined;
    this.model = config.get<string>('AI_MODEL') || 'gpt-4.1-mini';
  }

  async generateText(input: { prompt: string; fallback?: string }): Promise<AIResult<string>> {
    const started = Date.now();
    if (!this.apiKey) {
      return this.fallback(input.prompt, input.fallback ?? 'AI provider key is missing.');
    }

    const json = await this.chat(input.prompt);
    const content = json.choices?.[0]?.message?.content ?? input.fallback ?? '';
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
    if (!this.apiKey) {
      return this.fallback(input.prompt, input.fallback);
    }

    const json = await this.chat(`${input.prompt}\n\nReturn valid JSON only.`, true);
    const content = json.choices?.[0]?.message?.content ?? '{}';
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
    if (!this.apiKey) {
      return Array.from({ length: 1536 }, (_, index) => (input.length + index) / 10_000);
    }

    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ model: 'text-embedding-3-small', input }),
    });
    if (!response.ok) {
      throw new Error(`Embedding provider failed: ${response.status}`);
    }
    const json = (await response.json()) as { data?: Array<{ embedding: number[] }> };
    return json.data?.[0]?.embedding ?? [];
  }

  estimateCost(usage: AIUsage): number {
    return (usage.promptTokens * 0.00000015 + usage.completionTokens * 0.0000006) || 0;
  }

  private async chat(prompt: string, json = false) {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.3,
        response_format: json ? { type: 'json_object' } : undefined,
        messages: [
          {
            role: 'system',
            content:
              'You are MentorMind AI, a careful senior learning consultant. Be accurate, practical, structured, and answer in Vietnamese unless the user explicitly requests another language.',
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

  private fallback<T>(prompt: string, data: T): AIResult<T> {
    const text = typeof data === 'string' ? data : JSON.stringify(data);
    return {
      data,
      usage: { promptTokens: Math.ceil(prompt.length / 4), completionTokens: Math.ceil(text.length / 4) },
      provider: this.name,
      model: this.model,
      latencyMs: 0,
    };
  }

  private normalizeUsage(usage?: { prompt_tokens?: number; completion_tokens?: number }): AIUsage {
    return {
      promptTokens: usage?.prompt_tokens ?? 0,
      completionTokens: usage?.completion_tokens ?? 0,
    };
  }
}
