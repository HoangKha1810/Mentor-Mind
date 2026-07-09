import { Injectable } from '@nestjs/common';
import { AIProvider, AIResult, AIUsage, GenerateInput } from './ai-provider.interface';

@Injectable()
export class MockAIProvider implements AIProvider {
  readonly name = 'mock';
  readonly model = 'mock-mentor-v1';

  async generateText(input: { prompt: string; fallback?: string }): Promise<AIResult<string>> {
    const started = Date.now();
    const text =
      input.fallback ??
      'Mình có thể hỗ trợ lộ trình, luyện phỏng vấn, bài code, tài nguyên và sửa CV. Hãy cho mình biết vai trò mục tiêu, trình độ hiện tại hoặc điều bạn đang vướng.';
    return {
      data: text,
      usage: this.usage(input.prompt, text),
      provider: this.name,
      model: this.model,
      latencyMs: Date.now() - started,
    };
  }

  async generateJson<T>(input: GenerateInput<T>): Promise<AIResult<T>> {
    const started = Date.now();
    return {
      data: input.schema.parse(input.fallback),
      usage: this.usage(input.prompt, JSON.stringify(input.fallback)),
      provider: this.name,
      model: this.model,
      latencyMs: Date.now() - started,
    };
  }

  async generateEmbedding(input: string): Promise<number[]> {
    return Array.from({ length: 1536 }, (_, index) => {
      const code = input.charCodeAt(index % Math.max(input.length, 1)) || 17;
      return ((code * (index + 3)) % 997) / 997;
    });
  }

  estimateCost(_usage: AIUsage): number {
    return 0;
  }

  private usage(prompt: string, completion: string): AIUsage {
    return {
      promptTokens: Math.ceil(prompt.length / 4),
      completionTokens: Math.ceil(completion.length / 4),
    };
  }
}
