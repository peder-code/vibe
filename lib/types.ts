export type Platform = 'youtube' | 'tiktok' | 'x';

export interface NormalizedVideo {
  id: string;
  platform: Platform;
  url: string;
  embedUrl?: string;
  author: string;
  caption: string;
  hashtags: string[];
  createdAt: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  score: number;
  thumbnailUrl: string;
}

export interface AdapterMetadata {
  source: Platform;
  fetchedAt: string;
  mode: 'live' | 'mock';
  note?: string;
}

export interface AdapterResult {
  items: Omit<NormalizedVideo, 'score'>[];
  metadata: AdapterMetadata;
}

export interface FeedFilters {
  region?: string;
  q?: string;
  platforms?: Platform[];
  nsfwFilter?: boolean;
}

export interface FeedSettings {
  autoplay: boolean;
  dataSaver: boolean;
  nsfwFilter: boolean;
  visiblePlatforms: Platform[];
}
