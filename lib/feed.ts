import { TikTokAdapter } from '@/adapters/tiktok';
import { XAdapter } from '@/adapters/x';
import { YouTubeAdapter } from '@/adapters/youtube';
import { isPotentiallyNsfw } from './nsfw';
import { FeedFilters, NormalizedVideo, Platform } from './types';
import { viralScore } from './scoring';

const adapters = [new YouTubeAdapter(), new TikTokAdapter(), new XAdapter()];

export async function getAggregatedFeed(filters: FeedFilters): Promise<NormalizedVideo[]> {
  const enabledPlatforms = filters.platforms?.length ? filters.platforms : (['youtube', 'tiktok', 'x'] as Platform[]);
  const selectedAdapters = adapters.filter((a) => enabledPlatforms.includes(a.platform));

  const results = await Promise.all(selectedAdapters.map((adapter) => adapter.fetchViral24h(filters)));

  let normalized = results.flatMap((result) =>
    result.items.map((item) => ({
      ...item,
      score: viralScore(item)
    }))
  );

  if (filters.nsfwFilter) {
    normalized = normalized.filter((item) => !isPotentiallyNsfw(`${item.caption} ${item.hashtags.join(' ')}`));
  }

  const q = filters.q?.toLowerCase().trim();
  if (q) {
    normalized = normalized.filter(
      (item) =>
        item.caption.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q) ||
        item.hashtags.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  return normalized.sort((a, b) => b.score - a.score);
}
