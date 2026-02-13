'use client';

export type TabKey = 'feed' | 'categories' | 'saved' | 'settings';

export function BottomNav({ active, onChange }: { active: TabKey; onChange: (tab: TabKey) => void }) {
  const tabs: TabKey[] = ['feed', 'categories', 'saved', 'settings'];
  return (
    <nav className="glass fixed inset-x-2 bottom-2 z-30 rounded-2xl p-2" aria-label="Bottom navigation">
      <ul className="grid grid-cols-4 gap-1 text-center text-xs uppercase tracking-wide">
        {tabs.map((tab) => (
          <li key={tab}>
            <button
              aria-label={tab}
              className={`w-full rounded-xl px-2 py-2 ${active === tab ? 'bg-accent/20 text-accent' : 'text-white/75'}`}
              onClick={() => onChange(tab)}
            >
              {tab}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
