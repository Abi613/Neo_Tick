import { useEffect } from 'react';
import CharacterEditor from './components/CharacterEditor';
import ScreenLayoutEditor from './components/ScreenLayoutEditor';
import Timeline from './components/Timeline';
import ModeTabs from './components/ModeTabs';
import ExportPanel from './components/ExportPanel';
import { useDesignerStore } from './store/useDesignerStore';
import { createKeyboardShortcutsHandler } from './utils/keyboardShortcuts';

export default function App() {
  const { tab, setTab } = useDesignerStore();

  useEffect(() => {
    const onKey = createKeyboardShortcutsHandler();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto p-4 space-y-3">
      <header className="panel p-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Embedded Display UI Designer</h1>
          <p className="text-slate-300 text-sm">Design, animate, and export HD44780 + SSD1306 display interfaces.</p>
        </div>
      </header>

      <ModeTabs tab={tab} onChange={setTab} />

      {tab === 'character' && <CharacterEditor />}
      {tab === 'layout' && <ScreenLayoutEditor />}
      {tab === 'timeline' && <Timeline />}

      <ExportPanel />
    </div>
  );
}
