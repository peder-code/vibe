import { NormalizedVideo } from './types';

const HOURS_24_MS = 24 * 60 * 60 * 1000;

export function weightedEngagementRate(video: Pick<NormalizedVideo, 'views' | 'likes' | 'shares' | 'comments'>): number {
  const safeViews = Math.max(video.views, 1);
  const weighted = video.likes * 1 + video.comments * 1.5 + video.shares * 2.2;
  return weighted / safeViews;
}

export function recencyBoost(createdAtIso: string, now = Date.now()): number {
  const age = Math.max(now - new Date(createdAtIso).getTime(), 0);
  const normalizedAge = Math.min(age / HOURS_24_MS, 1);
  // Favor fresher content strongly while keeping older content in play.
  return 1 + Math.pow(1 - normalizedAge, 1.8) * 2;
}

export function viralScore(video: Pick<NormalizedVideo, 'views' | 'likes' | 'shares' | 'comments' | 'createdAt'>): number {
  return Number((weightedEngagementRate(video) * recencyBoost(video.createdAt)).toFixed(5));
}
