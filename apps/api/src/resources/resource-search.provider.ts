export type ResourceSearchResult = {
  title: string;
  source: string;
  author?: string;
  type: string;
  url?: string;
  description: string;
  difficulty: string;
  tags: string[];
  whyRecommended: string;
  isExternal: boolean;
};

export interface ResourceSearchProvider {
  search(query: string, context?: Record<string, unknown>): Promise<ResourceSearchResult[]>;
}
