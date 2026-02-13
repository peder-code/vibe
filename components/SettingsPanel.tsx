'use client';

import { FeedSettings, Platform } from '@/lib/types';

export function SettingsPanel({ settings, setSettings }: { settings: FeedSettings; setSettings: (settings: FeedSettings) => void }) {
  const togglePlatform = (platform: Platform) => {
    const current = settings.visiblePlatforms;
    const visiblePlatforms = current.includes(platform) ? current.filter((p) => p !== platform) : [...current, platform];
    setSettings({ ...settings, visiblePlatforms });
  };

  return (
    <section className="p-4 pt-20 pb-28">
      <div className="glass rounded-2xl p-4 space-y-4">
        <h2 className="text-lg">Settings</h2>
        <label className="flex items-center justify-between"><span>Autoplay</span><input type="checkbox" checked={settings.autoplay} onChange={(e) => setSettings({ ...settings, autoplay: e.target.checked })} /></label>
        <label className="flex items-center justify-between"><span>Data saver</span><input type="checkbox" checked={settings.dataSaver} onChange={(e) => setSettings({ ...settings, dataSaver: e.target.checked })} /></label>
        <label className="flex items-center justify-between"><span>NSFW filter</span><input type="checkbox" checked={settings.nsfwFilter} onChange={(e) => setSettings({ ...settings, nsfwFilter: e.target.checked })} /></label>
        <div>
          <p className="mb-2 text-sm text-white/70">Visible platforms</p>
          <div className="flex gap-2">
            {(['youtube', 'tiktok', 'x'] as Platform[]).map((platform) => (
              <button key={platform} className={`rounded-lg px-3 py-1 ${settings.visiblePlatforms.includes(platform) ? 'bg-accent/20 text-accent' : 'bg-white/10'}`} onClick={() => togglePlatform(platform)}>
                {platform}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
