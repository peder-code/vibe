const NSFW_KEYWORDS = ['nsfw', 'explicit', '18+', 'adult', 'leaked'];

export function isPotentiallyNsfw(text: string): boolean {
  const lower = text.toLowerCase();
  return NSFW_KEYWORDS.some((word) => lower.includes(word));
}
