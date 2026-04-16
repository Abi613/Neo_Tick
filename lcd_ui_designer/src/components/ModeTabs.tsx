import { TabMode } from '../types';

const tabs: { id: TabMode; label: string }[] = [
  { id: 'character', label: 'Character Editor' },
  { id: 'layout', label: 'Screen Layout Editor' },
  { id: 'timeline', label: 'Animation Timeline' },
];

export default function ModeTabs({ tab, onChange }: { tab: TabMode; onChange: (tab: TabMode) => void }) {
  return (
    <div className="panel p-1 flex gap-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-3 py-2 rounded-md text-sm ${tab === t.id ? 'bg-accent text-white' : 'hover:bg-slate-700 text-slate-200'}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
