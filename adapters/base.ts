import { AdapterResult, FeedFilters, Platform } from '@/lib/types';

export interface SourceAdapter {
  platform: Platform;
  fetchViral24h(filters: FeedFilters): Promise<AdapterResult>;
}
