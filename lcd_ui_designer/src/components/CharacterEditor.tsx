import { useMemo, useState } from 'react';
import PixelGridCanvas from '../canvas/PixelGridCanvas';
import { useDesignerStore, getUsedCgramSlots } from '../store/useDesignerStore';
import { CharacterToolbar } from './Toolbar';
import { DrawTool } from '../types';
import { fillMatrix, invertMatrix, shiftMatrix } from '../utils/matrix';

export default function CharacterEditor() {
  const { charMatrix, cgram, saveCharToSlot, setCharPixel, setCharMatrix, selectedSlot } = useDesignerStore((s) => s);
  const [tool, setTool] = useState<DrawTool>('draw');
  const used = getUsedCgramSlots(cgram);

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
          <PixelGridCanvas matrix={charMatrix} onPixelClick={apply} />
        </div>
        <div className="panel p-3 text-sm">
          <div className="mb-2">CGRAM usage: {'■'.repeat(used)}{'□'.repeat(8 - used)} {used}/8 used</div>
          <div className="grid grid-cols-4 gap-2">
            {cgram.map((_, i) => (
              <button key={i} className={`btn ${i === selectedSlot ? 'btn-primary' : ''}`} onClick={() => saveCharToSlot(i)}>
                Save Slot {i}
              </button>
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
