import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ResourceSearchProvider, ResourceSearchResult } from './resource-search.provider';

type TavilySearchResponse = {
  results?: Array<{
    title?: string;
    url?: string;
    content?: string;
    score?: number;
    raw_content?: string;
  }>;
};

@Injectable()
export class ExternalSearchProvider implements ResourceSearchProvider {
  constructor(private readonly config: ConfigService) {}

  async search(query: string): Promise<ResourceSearchResult[]> {
    const provider = this.config.get<string>('SEARCH_PROVIDER') ?? 'tavily';
    if (provider !== 'tavily') {
      throw new BadRequestException(`Unsupported search provider: ${provider}. Use SEARCH_PROVIDER=tavily.`);
    }

    const apiKey = this.config.get<string>('TAVILY_API_KEY');
    if (!apiKey) {
      throw new BadRequestException('Tavily is not configured. Set TAVILY_API_KEY in apps/api/.env.');
    }

    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        search_depth: 'basic',
        max_results: 5,
        include_answer: false,
        include_raw_content: false,
      }),
    });

    const json = (await response.json()) as TavilySearchResponse & { error?: string; detail?: string };
    if (!response.ok) {
      throw new BadRequestException(json.error ?? json.detail ?? 'Tavily search request failed');
    }

    return (json.results ?? []).map((result) => ({
      title: result.title ?? 'Untitled Tavily result',
      source: 'Tavily',
      type: 'ARTICLE',
      url: result.url,
      description: result.content ?? result.raw_content ?? 'External Tavily search result.',
      difficulty: 'INTERMEDIATE',
      tags: ['tavily', 'external-search'],
      whyRecommended: `Tavily ranked this result for "${query}"${result.score ? ` with score ${result.score}` : ''}.`,
      isExternal: true,
    }));
  }
}
