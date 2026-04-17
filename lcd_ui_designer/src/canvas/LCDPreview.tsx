import { useEffect, useMemo, useRef } from 'react';
import { buildLcdPixelBuffer } from '../simulation/lcdEngine';
import { CharacterDefinition, LCDCell } from '../types';

type Props = {
  grid: LCDCell[][];
  cgramMap?: Record<number, number>;
  characters?: CharacterDefinition[];
  cursor?: { x: number; y: number };
  onCellClick?: (x: number, y: number) => void;
};

export default function LCDPreview({ grid, cgramMap = {}, characters = [], cursor, onCellClick }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const cellW = 24;
  const cellH = 30;

  const pixelBuffer = useMemo(() => buildLcdPixelBuffer(grid, characters, cgramMap), [grid, characters, cgramMap]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 20 * cellW;
    canvas.height = 4 * cellH;
    ctx.fillStyle = '#0f1728';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const pixelSize = 2;
    const offsetX = 6;
    const offsetY = 7;

    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 20; x++) {
        ctx.fillStyle = '#172038';
        ctx.fillRect(x * cellW + 1, y * cellH + 1, cellW - 2, cellH - 2);

        for (let py = 0; py < 8; py++) {
          for (let px = 0; px < 5; px++) {
            const on = pixelBuffer[y * 8 + py]?.[x * 5 + px];
            ctx.fillStyle = on ? '#dbe4ff' : '#25324a';
            ctx.fillRect(x * cellW + offsetX + px * pixelSize, y * cellH + offsetY + py * pixelSize, pixelSize - 0.3, pixelSize - 0.3);
          }
        }

        if (cursor && cursor.x === x && cursor.y === y) {
          ctx.strokeStyle = '#4f8cff';
          ctx.lineWidth = 2;
          ctx.strokeRect(x * cellW + 1, y * cellH + 1, cellW - 2, cellH - 2);
        }
      }
    }
  }, [pixelBuffer, cursor]);

  return (
    <canvas
      ref={ref}
      className="rounded border border-slate-600 cursor-cell"
      onClick={(e) => {
        if (!onCellClick) return;
        const rect = e.currentTarget.getBoundingClientRect();
        onCellClick(Math.floor((e.clientX - rect.left) / cellW), Math.floor((e.clientY - rect.top) / cellH));
      }}
    />
  );
}
