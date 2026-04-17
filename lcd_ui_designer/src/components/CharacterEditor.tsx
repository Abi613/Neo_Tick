import { useMemo, useState } from 'react';
import PixelGridCanvas from '../canvas/PixelGridCanvas';
import { useDesignerStore } from '../store/useDesignerStore';
import { CharacterToolbar } from './Toolbar';
import { DrawTool } from '../types';
import { fillMatrix, invertMatrix, shiftMatrix } from '../utils/matrix';

export default function CharacterEditor() {
  const {
    charMatrix,
    characterLibrary,
    selectedCharId,
    createCharacter,
    saveActiveCharacter,
    selectCharacter,
    renameCharacter,
    setCharPixel,
    setCharMatrix,
  } = useDesignerStore((s) => s);
  const [tool, setTool] = useState<DrawTool>('draw');

  const binary = useMemo(() => charMatrix.map((r) => `0b${r.join('')},`).join('\n'), [charMatrix]);
  const hex = useMemo(() => charMatrix.map((r) => `0x${parseInt(r.join(''), 2).toString(16).padStart(2, '0')},`).join('\n'), [charMatrix]);

  const apply = (x: number, y: number) => {
    if (tool === 'draw') return setCharPixel(x, y, 1);
    if (tool === 'erase') return setCharPixel(x, y, 0);
    if (tool === 'fill') return setCharMatrix(fillMatrix(5, 8, 1));
    if (tool === 'invert') return setCharMatrix(invertMatrix(charMatrix));
    if (tool.startsWith('shift_')) {
      const d = tool.replace('shift_', '') as 'up' | 'down' | 'left' | 'right';
      return setCharMatrix(shiftMatrix(charMatrix, d));
    }
  };

  return (
    <div className="grid grid-cols-12 gap-3">
      <div className="col-span-5 space-y-3">
        <CharacterToolbar tool={tool} setTool={setTool} />
        <div className="panel p-3">
          <h3 className="font-semibold mb-2">Character Pixel Editor</h3>
          <PixelGridCanvas matrix={charMatrix} onPixelClick={apply} pixelSize={30} />
          <div className="mt-3 flex gap-2">
            <button className="btn" onClick={createCharacter}>Create New Character</button>
            <button className="btn btn-primary" onClick={saveActiveCharacter} disabled={selectedCharId === null}>Save Selected</button>
          </div>
        </div>
        <div className="panel p-3 text-sm">
          <div className="mb-2 font-semibold">Unlimited Character Palette ({characterLibrary.length})</div>
          <div className="max-h-64 overflow-auto space-y-2">
            {characterLibrary.length === 0 && <div className="text-slate-400">Create a character to start building your library.</div>}
            {characterLibrary.map((char) => (
              <div key={char.id} className={`p-2 rounded border ${char.id === selectedCharId ? 'border-accent' : 'border-slate-700'} flex items-center justify-between gap-2`}>
                <button className="text-left text-sm" onClick={() => selectCharacter(char.id)}>
                  #{char.id} {char.name}
                </button>
                <input
                  className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs w-28"
                  value={char.name}
                  onChange={(e) => renameCharacter(char.id, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="col-span-7 panel p-3 grid grid-cols-2 gap-3 text-xs">
        <div><h3 className="font-semibold mb-2">Binary</h3><pre>{binary}</pre></div>
        <div><h3 className="font-semibold mb-2">Hex</h3><pre>{hex}</pre></div>
      </div>
    </div>
  );
}
