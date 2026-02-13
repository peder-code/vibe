'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BottomNav, TabKey } from '@/components/BottomNav';
import { SettingsPanel } from '@/components/SettingsPanel';
import { TopBar } from '@/components/TopBar';
import { VideoCard } from '@/components/VideoCard';
import { DEFAULT_SETTINGS, getLikes, getSaved, getSettings, setSettings as persistSettings, toggleLike, toggleSave } from '@/lib/storage';
import { FeedSettings, NormalizedVideo } from '@/lib/types';

export default function HomePage() {
  const [tab, setTab] = useState<TabKey>('feed');
  const [region, setRegion] = useState('US');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<NormalizedVideo[]>([]);
  const [index, setIndex] = useState(0);
  const [likes, setLikes] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [settings, setSettings] = useState<FeedSettings>(DEFAULT_SETTINGS);
  const [playing, setPlaying] = useState(true);
  const touchStartY = useRef(0);

  useEffect(() => {
    setLikes(getLikes());
    setSaved(getSaved());
    setSettings(getSettings());
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    fetch(`/api/feed?region=${region}&q=${encodeURIComponent(query)}&platforms=${settings.visiblePlatforms.join(',')}&nsfwFilter=${settings.nsfwFilter}`, {
      signal: ctrl.signal
    })
      .then((res) => res.json())
      .then((json) => setItems(json.items || []))
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [region, query, settings.visiblePlatforms, settings.nsfwFilter]);

  useEffect(() => {
    persistSettings(settings);
  }, [settings]);

  const current = items[index];
  const savedItems = useMemo(() => items.filter((i) => saved.includes(i.id)), [items, saved]);

  const step = (dir: 1 | -1) => setIndex((prev) => Math.max(0, Math.min(items.length - 1, prev + dir)));

  const handleShare = async (url: string) => {
    if (navigator.share) {
      await navigator.share({ url, title: 'Viral24' });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => (touchStartY.current = e.touches[0].clientY);
  const onTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(delta) > 40) {
      step(delta > 0 ? 1 : -1);
      if (navigator.vibrate) navigator.vibrate(10);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') step(1);
      if (e.key === 'ArrowUp') step(-1);
      if (e.key === ' ') setPlaying((p) => !p);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <main className="mx-auto min-h-screen max-w-md bg-cockpit text-white">
      <TopBar region={region} setRegion={setRegion} query={query} setQuery={setQuery} />

      {tab === 'settings' ? (
        <SettingsPanel settings={settings} setSettings={setSettings} />
      ) : tab === 'saved' ? (
        <section className="p-4 pt-20 pb-28 space-y-3">
          {savedItems.length ? (
            savedItems.map((item) => <div key={item.id} className="glass rounded-xl p-3 text-sm">{item.caption}</div>)
          ) : (
            <div className="glass rounded-xl p-4 text-sm text-white/70">No saved videos yet.</div>
          )}
        </section>
      ) : tab === 'categories' ? (
        <section className="p-4 pt-20 pb-28">
          <div className="glass rounded-xl p-4 text-sm text-white/70">Categories arrive in v1.1. Use search + platform filters in this MVP.</div>
        </section>
      ) : loading ? (
        <section className="p-4 pt-20 pb-28 space-y-3" aria-label="Loading feed">
          {[1, 2, 3].map((s) => (
            <div key={s} className="glass h-48 animate-pulse rounded-2xl" />
          ))}
        </section>
      ) : current ? (
        <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onDoubleClick={() => setLikes(toggleLike(current.id))}>
          <motion.div key={current.id} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.25 }}>
            <VideoCard
              item={current}
              playing={playing}
              liked={likes.includes(current.id)}
              saved={saved.includes(current.id)}
              onLike={() => setLikes(toggleLike(current.id))}
              onSave={() => setSaved(toggleSave(current.id))}
              onShare={() => handleShare(current.url)}
              onSource={() => window.open(current.url, '_blank', 'noopener,noreferrer')}
              onTogglePlay={() => setPlaying((p) => !p)}
            />
          </motion.div>
        </div>
      ) : (
        <section className="p-4 pt-20 pb-28">
          <div className="glass rounded-xl p-4 text-sm text-white/70">No results for current filters. Try another region or query.</div>
        </section>
      )}

      <BottomNav active={tab} onChange={setTab} />
    </main>
  );
}
