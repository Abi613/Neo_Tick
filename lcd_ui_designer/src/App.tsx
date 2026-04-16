import { useEffect } from 'react';
import CharacterEditor from './components/CharacterEditor';
import ScreenLayoutEditor from './components/ScreenLayoutEditor';
import Timeline from './components/Timeline';
import ModeTabs from './components/ModeTabs';
import ExportPanel from './components/ExportPanel';
import { useDesignerStore } from './store/useDesignerStore';

export default function App() {
  const { tab, setTab, cursor, setCursor, activeChar, placeChar, charMatrix, setCharMatrix } = useDesignerStore();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'c') {
        localStorage.setItem('embedded-char-copy', JSON.stringify(charMatrix));
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'v') {
        const raw = localStorage.getItem('embedded-char-copy');
        if (raw) setCharMatrix(JSON.parse(raw));
      }
      if (e.key === 'ArrowUp') setCursor(cursor.x, Math.max(0, cursor.y - 1));
      if (e.key === 'ArrowDown') setCursor(cursor.x, Math.min(3, cursor.y + 1));
      if (e.key === 'ArrowLeft') setCursor(Math.max(0, cursor.x - 1), cursor.y);
      if (e.key === 'ArrowRight') setCursor(Math.min(19, cursor.x + 1), cursor.y);
      if (e.code === 'Space') {
        e.preventDefault();
        placeChar('static', cursor.x, cursor.y, activeChar);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cursor, setCursor, placeChar, activeChar, charMatrix, setCharMatrix]);

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
