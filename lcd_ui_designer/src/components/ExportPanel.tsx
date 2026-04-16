import Editor from '@monaco-editor/react';
import { toAdafruitCode, toCgramCode, toProjectJSON, toU8g2Code, toWokwiProject } from '../export/generators';
import { snapshotProject, useDesignerStore } from '../store/useDesignerStore';

export default function ExportPanel() {
  const { cgram, oled, timeline, code, setCode } = useDesignerStore();

  return (
    <div className="panel p-3 space-y-3">
      <div className="flex gap-2 flex-wrap">
        <button className="btn" onClick={() => setCode(toCgramCode(cgram))}>Arduino LiquidCrystal</button>
        <button className="btn" onClick={() => setCode(toU8g2Code(oled))}>U8g2</button>
        <button className="btn" onClick={() => setCode(toAdafruitCode(oled))}>Adafruit SSD1306</button>
        <button className="btn" onClick={() => setCode(toProjectJSON(snapshotProject()))}>Project JSON</button>
        <button className="btn" onClick={() => setCode(toWokwiProject(timeline))}>Wokwi JSON</button>
        <button className="btn btn-primary" onClick={() => {
          const data = encodeURIComponent(toWokwiProject(timeline));
          window.open(`https://wokwi.com/projects/new?diagram=${data}`, '_blank');
        }}>Open in Wokwi</button>
      </div>
      <Editor
        height="280px"
        theme="vs-dark"
        defaultLanguage="cpp"
        value={code}
        onChange={(v) => setCode(v ?? '')}
        options={{ minimap: { enabled: false }, fontSize: 13 }}
      />
    </div>
  );
}
