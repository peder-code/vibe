'use client';

interface TopBarProps {
  region: string;
  setRegion: (value: string) => void;
  query: string;
  setQuery: (value: string) => void;
}

export function TopBar({ region, setRegion, query, setQuery }: TopBarProps) {
  return (
    <header className="glass fixed inset-x-2 top-2 z-30 rounded-2xl p-3 text-sm">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-accent/20 px-2 py-1 text-xs text-accent">Last 24h</span>
        <select aria-label="Select region" value={region} onChange={(e) => setRegion(e.target.value)} className="glass rounded-lg px-2 py-1">
          {['US', 'GB', 'IN', 'BR', 'JP'].map((r) => (
            <option key={r} value={r} className="bg-slate-900">
              {r}
            </option>
          ))}
        </select>
        <input
          aria-label="Search feed"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="glass min-w-0 flex-1 rounded-lg px-3 py-1.5"
        />
      </div>
    </header>
  );
}
