import mockItems from '@/fixtures/mock-feed.json';
import { AdapterResult, FeedFilters } from '@/lib/types';
import { SourceAdapter } from './base';

type YouTubeSearchResponse = {
  items: Array<{
    id: { videoId?: string };
    snippet: {
      title: string;
      publishedAt: string;
      channelTitle: string;
      description: string;
      thumbnails?: { high?: { url?: string }; medium?: { url?: string } };
    };
  }>;
};

type YouTubeStatsResponse = {
  items: Array<{
    id: string;
    statistics: {
      viewCount?: string;
      likeCount?: string;
      commentCount?: string;
      favoriteCount?: string;
    };
  }>;
};

export class YouTubeAdapter implements SourceAdapter {
  platform = 'youtube' as const;

  async fetchViral24h(filters: FeedFilters): Promise<AdapterResult> {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey || process.env.MOCK_MODE === 'true') {
      return {
        items: mockItems.filter((v) => v.platform === 'youtube'),
        metadata: {
          source: 'youtube',
          fetchedAt: new Date().toISOString(),
          mode: 'mock',
          note: 'Set YOUTUBE_API_KEY and MOCK_MODE=false for live mode.'
        }
      };
    }

    const publishedAfter = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const q = filters.q?.trim() || 'shorts trending';
    const region = filters.region || 'US';

    const searchParams = new URLSearchParams({
      key: apiKey,
      part: 'snippet',
      type: 'video',
      maxResults: '20',
      order: 'viewCount',
      publishedAfter,
      q,
      regionCode: region,
      videoEmbeddable: 'true'
    });

    const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?${searchParams}`, { next: { revalidate: 600 } });
    if (!searchRes.ok) throw new Error('YouTube search failed.');
    const searchJson = (await searchRes.json()) as YouTubeSearchResponse;

    const ids = searchJson.items.map((item) => item.id.videoId).filter(Boolean).join(',');
    if (!ids) {
      return {
        items: [],
        metadata: { source: 'youtube', fetchedAt: new Date().toISOString(), mode: 'live', note: 'No matching videos found.' }
      };
    }

    const statsParams = new URLSearchParams({ key: apiKey, part: 'statistics', id: ids });
    const statsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?${statsParams}`, { next: { revalidate: 600 } });
    if (!statsRes.ok) throw new Error('YouTube stats failed.');
    const statsJson = (await statsRes.json()) as YouTubeStatsResponse;
    const statsMap = new Map(statsJson.items.map((item) => [item.id, item.statistics]));

    const items = searchJson.items
      .filter((item) => item.id.videoId)
      .map((item) => {
        const videoId = item.id.videoId as string;
        const stats = statsMap.get(videoId);
        return {
          id: `yt_${videoId}`,
          platform: 'youtube' as const,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
          author: item.snippet.channelTitle,
          caption: item.snippet.title,
          hashtags: Array.from(item.snippet.description.matchAll(/#(\w+)/g)).map((m) => m[1]),
          createdAt: item.snippet.publishedAt,
          views: Number(stats?.viewCount || '0'),
          likes: Number(stats?.likeCount || '0'),
          shares: 0,
          comments: Number(stats?.commentCount || '0'),
          thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || ''
        };
      });

    return {
      items,
      metadata: {
        source: 'youtube',
        fetchedAt: new Date().toISOString(),
        mode: 'live'
      }
    };
  }
}
