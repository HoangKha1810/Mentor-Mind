import { z } from 'zod';

export type AIUsage = {
  promptTokens: number;
  completionTokens: number;
};

export type AIResult<T> = {
  data: T;
  usage: AIUsage;
  provider: string;
  model: string;
  latencyMs: number;
};

export type GenerateInput<T> = {
  prompt: string;
  schema: z.ZodSchema<T>;
  fallback: T;
};

export interface AIProvider {
  readonly name: string;
  readonly model: string;
  generateText(input: { prompt: string; fallback?: string }): Promise<AIResult<string>>;
  generateJson<T>(input: GenerateInput<T>): Promise<AIResult<T>>;
  generateEmbedding(input: string): Promise<number[]>;
  estimateCost(usage: AIUsage): number;
}
