import { FeedSettings, Platform } from './types';

const LIKES_KEY = 'viral24_likes';
const SAVED_KEY = 'viral24_saved';
const SETTINGS_KEY = 'viral24_settings';

export const DEFAULT_SETTINGS: FeedSettings = {
  autoplay: true,
  dataSaver: false,
  nsfwFilter: true,
  visiblePlatforms: ['youtube', 'tiktok', 'x'] as Platform[]
};

function readArray(key: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

export function toggleListItem(key: string, id: string): string[] {
  const current = readArray(key);
  const next = current.includes(id) ? current.filter((i) => i !== id) : [...current, id];
  localStorage.setItem(key, JSON.stringify(next));
  return next;
}

export function toggleLike(id: string) {
  return toggleListItem(LIKES_KEY, id);
}

export function toggleSave(id: string) {
  return toggleListItem(SAVED_KEY, id);
}

export function getLikes() {
  return readArray(LIKES_KEY);
}

export function getSaved() {
  return readArray(SAVED_KEY);
}

export function getSettings(): FeedSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') as Partial<FeedSettings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function setSettings(settings: FeedSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
