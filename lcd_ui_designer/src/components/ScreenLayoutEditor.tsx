import LCDPreview from '../canvas/LCDPreview';
import OLEDCanvas from '../canvas/OLEDCanvas';
import { useDesignerStore } from '../store/useDesignerStore';
import { OledToolbar } from './Toolbar';
import { makeClockDigits, smartWatchTemplates } from '../templates/icons';
import { cloneMatrix } from '../utils/matrix';

export default function ScreenLayoutEditor() {
  const store = useDesignerStore();

  const placeTemplate = (name: keyof typeof smartWatchTemplates) => {
    const tpl = smartWatchTemplates[name];
    useDesignerStore.setState((s) => {
      const next = cloneMatrix(s.oled);
      tpl.forEach((row, y) => row.forEach((v, x) => { if (x < 128 && y < 32) next[y][x] = v; }));
      return { oled: next };
    });
  };

  const placeClock = () => {
    const clock = makeClockDigits();
    useDesignerStore.setState((s) => {
      const next = cloneMatrix(s.oled);
      clock.forEach((row, y) => row.forEach((v, x) => { if (x + 48 < 128 && y + 8 < 32) next[y + 8][x + 48] = v; }));
      return { oled: next };
    });
  };

  const mergedGrid = store.lcdStatic.map((row, y) =>
    row.map((v, x) => (store.lcdAnimated[y][x].kind === 'text' && store.lcdAnimated[y][x].value === ' ' ? v : store.lcdAnimated[y][x])),
  );

  return (
    <div className="grid grid-cols-12 gap-3">
      <div className="col-span-6 space-y-3">
        <div className="panel p-3">
          <h3 className="font-semibold mb-2">20x4 LCD Layout</h3>
          <LCDPreview
            grid={mergedGrid}
            characters={store.characterLibrary}
            cursor={store.cursor}
            onCellClick={(x, y) => {
              store.setCursor(x, y);
              store.placeChar('static', x, y, store.activeCell);
            }}
          />
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <input
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 w-16"
                maxLength={1}
                value={store.activeCell.kind === 'text' ? String(store.activeCell.value) : ''}
                onChange={(e) => store.setActiveText(e.target.value)}
              />
              <button className="btn" onClick={() => store.setActiveCell({ kind: 'text', value: ' ' })}>Use Text Cell</button>
              <button className="btn" onClick={() => store.placeChar('animated', store.cursor.x, store.cursor.y, store.activeCell)}>Place on Animated Layer</button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {store.characterLibrary.map((char) => (
                <button key={char.id} className={`btn ${store.activeCell.kind === 'custom' && store.activeCell.value === char.id ? 'btn-primary' : ''}`} onClick={() => store.setActiveCell({ kind: 'custom', value: char.id })}>
                  {char.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-6 space-y-3">
        <OledToolbar tool={store.oledTool} setTool={store.setOledTool} />
        <div className="panel p-3">
          <OLEDCanvas
            matrix={store.oled}
            tool={store.oledTool}
            onDraw={(x, y) => store.setOledPixel(x, y, 1)}
          />
        </div>
        <div className="panel p-3">
          <h4 className="font-semibold mb-2">Smartwatch Templates</h4>
          <div className="flex gap-2 flex-wrap">
            {Object.keys(smartWatchTemplates).map((name) => (
              <button className="btn" key={name} onClick={() => placeTemplate(name as keyof typeof smartWatchTemplates)}>{name}</button>
            ))}
            <button className="btn" onClick={placeClock}>clock digits</button>
          </div>
        </div>
      </div>
    </div>
  );
}
