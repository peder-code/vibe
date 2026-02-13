import { getAggregatedFeed } from '@/lib/feed';
import { FeedFilters, Platform } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';

type CacheEntry = { expiresAt: number; data: unknown };

const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map<string, CacheEntry>();

function parsePlatforms(value: string | null): Platform[] | undefined {
  if (!value) return undefined;
  const list = value.split(',').map((v) => v.trim()) as Platform[];
  return list.filter((v) => ['youtube', 'tiktok', 'x'].includes(v));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filters: FeedFilters = {
    region: searchParams.get('region') || 'US',
    q: searchParams.get('q') || '',
    platforms: parsePlatforms(searchParams.get('platforms')),
    nsfwFilter: searchParams.get('nsfwFilter') !== 'false'
  };

  const key = JSON.stringify(filters);
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && cached.expiresAt > now) {
    return NextResponse.json({ items: cached.data, cache: 'hit' });
  }

  const items = await getAggregatedFeed(filters);
  cache.set(key, { data: items, expiresAt: now + CACHE_TTL_MS });

  return NextResponse.json({
    items,
    cache: 'miss',
    fetchedAt: new Date().toISOString(),
    ttlMs: CACHE_TTL_MS
  });
}
