import { describe, expect, it } from 'vitest';
import { TikTokAdapter } from '@/adapters/tiktok';
import { XAdapter } from '@/adapters/x';
import { YouTubeAdapter } from '@/adapters/youtube';

const requiredFields = ['id', 'platform', 'url', 'author', 'caption', 'createdAt', 'views', 'likes', 'shares', 'comments', 'thumbnailUrl'];

describe('adapters normalize shape', () => {
  it('youtube mock adapter returns normalized fields', async () => {
    process.env.MOCK_MODE = 'true';
    const result = await new YouTubeAdapter().fetchViral24h({});
    expect(result.items.length).toBeGreaterThan(0);
    requiredFields.forEach((field) => expect(result.items[0]).toHaveProperty(field));
  });

  it('tiktok adapter returns normalized fields', async () => {
    const result = await new TikTokAdapter().fetchViral24h({});
    requiredFields.forEach((field) => expect(result.items[0]).toHaveProperty(field));
  });

  it('x adapter returns normalized fields', async () => {
    const result = await new XAdapter().fetchViral24h({});
    requiredFields.forEach((field) => expect(result.items[0]).toHaveProperty(field));
  });
});
