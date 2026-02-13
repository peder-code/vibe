import mockItems from '@/fixtures/mock-feed.json';
import { AdapterResult, FeedFilters } from '@/lib/types';
import { SourceAdapter } from './base';

export class TikTokAdapter implements SourceAdapter {
  platform = 'tiktok' as const;

  async fetchViral24h(_filters: FeedFilters): Promise<AdapterResult> {
    // Safe fallback mode for MVP: curated/mock content only.
    return {
      items: mockItems.filter((v) => v.platform === 'tiktok').map((item) => ({ ...item, embedUrl: undefined })),
      metadata: {
        source: 'tiktok',
        fetchedAt: new Date().toISOString(),
        mode: 'mock',
        note: 'TikTok live ingestion is not enabled in MVP to stay within public API limits.'
      }
    };
  }
}
