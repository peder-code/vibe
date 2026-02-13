'use client';

import { motion } from 'framer-motion';
import { Heart, Bookmark, Share2, ExternalLink } from 'lucide-react';
import { NormalizedVideo } from '@/lib/types';

interface VideoCardProps {
  item: NormalizedVideo;
  liked: boolean;
  saved: boolean;
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
  onSource: () => void;
  onTogglePlay: () => void;
  playing: boolean;
}

function AnimatedStat({ value, label }: { value: number; label: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="text-sm font-semibold">{Intl.NumberFormat().format(value)}</div>
      <div className="text-[10px] uppercase text-white/65">{label}</div>
    </motion.div>
  );
}

export function VideoCard({ item, liked, saved, onLike, onSave, onShare, onSource, onTogglePlay, playing }: VideoCardProps) {
  return (
    <article className="relative h-[100dvh] snap-start overflow-hidden">
      {item.embedUrl ? (
        <iframe
          title={item.caption}
          src={item.embedUrl + '?autoplay=1&mute=1&playsinline=1'}
          className="h-full w-full"
          allow="autoplay; encrypted-media; picture-in-picture"
        />
      ) : (
        <button onClick={onTogglePlay} aria-label="Toggle playback" className="h-full w-full">
          <img src={item.thumbnailUrl} alt={item.caption} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/30" />
          <span className="glass absolute left-1/2 top-1/2 -translate-x-1/2 rounded-full px-4 py-2 text-xs">{playing ? 'Pause' : 'Play'}</span>
        </button>
      )}

      <div className="absolute inset-x-0 bottom-20 p-4">
        <div className="glass rounded-2xl p-3">
          <div className="mb-1 text-xs uppercase text-accent">{item.platform}</div>
          <h2 className="line-clamp-2 text-sm font-medium">{item.caption}</h2>
          <p className="mt-1 text-xs text-white/70">{item.author}</p>
          <div className="mt-3 flex gap-4">
            <AnimatedStat value={item.views} label="views" />
            <AnimatedStat value={item.likes} label="likes" />
            <AnimatedStat value={item.comments} label="comments" />
          </div>
        </div>
      </div>

      <div className="absolute right-3 top-1/3 z-20 flex flex-col gap-3">
        <button aria-label="Like" onClick={onLike} className="glass rounded-full p-3">
          <Heart size={18} className={liked ? 'fill-pink-500 text-pink-500' : ''} />
        </button>
        <button aria-label="Save" onClick={onSave} className="glass rounded-full p-3">
          <Bookmark size={18} className={saved ? 'fill-accent text-accent' : ''} />
        </button>
        <button aria-label="Share" onClick={onShare} className="glass rounded-full p-3">
          <Share2 size={18} />
        </button>
        <button aria-label="Open source" onClick={onSource} className="glass rounded-full p-3">
          <ExternalLink size={18} />
        </button>
      </div>
    </article>
  );
}
