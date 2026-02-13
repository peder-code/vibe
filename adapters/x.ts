import mockItems from '@/fixtures/mock-feed.json';
import { AdapterResult, FeedFilters } from '@/lib/types';
import { SourceAdapter } from './base';

export class XAdapter implements SourceAdapter {
  platform = 'x' as const;

  async fetchViral24h(_filters: FeedFilters): Promise<AdapterResult> {
    // Safe fallback mode for MVP: curated/mock content only.
    return {
      items: mockItems.filter((v) => v.platform === 'x').map((item) => ({ ...item, embedUrl: undefined })),
      metadata: {
        source: 'x',
        fetchedAt: new Date().toISOString(),
        mode: 'mock',
        note: 'X live ingestion requires elevated API tiers; using mock feed in MVP.'
      }
    };
  }
}
