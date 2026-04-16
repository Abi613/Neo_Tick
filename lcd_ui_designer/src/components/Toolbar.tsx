import { DrawTool, OledTool } from '../types';

export function CharacterToolbar({ tool, setTool }: { tool: DrawTool; setTool: (t: DrawTool) => void }) {
  const tools: DrawTool[] = ['draw', 'erase', 'fill', 'invert', 'shift_up', 'shift_down', 'shift_left', 'shift_right'];
  return (
    <div className="panel p-2 flex gap-2 flex-wrap">
      {tools.map((t) => (
        <button key={t} className={`btn ${tool === t ? 'btn-primary' : ''}`} onClick={() => setTool(t)}>{t}</button>
      ))}
    </div>
  );
}

export function OledToolbar({ tool, setTool }: { tool: OledTool; setTool: (t: OledTool) => void }) {
  const tools: OledTool[] = ['pencil', 'line', 'rectangle', 'text'];
  return (
    <div className="panel p-2 flex gap-2">
      {tools.map((t) => (
        <button key={t} className={`btn ${tool === t ? 'btn-primary' : ''}`} onClick={() => setTool(t)}>{t}</button>
      ))}
    </div>
  );
}
