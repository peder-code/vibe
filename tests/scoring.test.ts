import { describe, expect, it } from 'vitest';
import { recencyBoost, viralScore, weightedEngagementRate } from '@/lib/scoring';

describe('scoring', () => {
  it('computes weighted engagement safely', () => {
    expect(weightedEngagementRate({ views: 0, likes: 10, shares: 5, comments: 4 })).toBeGreaterThan(0);
  });

  it('prefers newer videos in recency boost', () => {
    const now = Date.now();
    const fresh = recencyBoost(new Date(now - 60 * 60 * 1000).toISOString(), now);
    const stale = recencyBoost(new Date(now - 23 * 60 * 60 * 1000).toISOString(), now);
    expect(fresh).toBeGreaterThan(stale);
  });

  it('returns deterministic score', () => {
    const score = viralScore({
      views: 1000,
      likes: 100,
      shares: 10,
      comments: 20,
      createdAt: new Date().toISOString()
    });
    expect(score).toBeTypeOf('number');
    expect(score).toBeGreaterThan(0);
  });
});
