import { useEffect, useRef } from 'react';

type Props = {
  grid: string[][];
  cursor?: { x: number; y: number };
  onCellClick?: (x: number, y: number) => void;
};

export default function LCDPreview({ grid, cursor, onCellClick }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const cellW = 24;
  const cellH = 30;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 20 * cellW;
    canvas.height = 4 * cellH;
    ctx.fillStyle = '#0f1728';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '18px monospace';
    ctx.textBaseline = 'middle';

    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 20; x++) {
        ctx.fillStyle = '#172038';
        ctx.fillRect(x * cellW + 1, y * cellH + 1, cellW - 2, cellH - 2);
        if (cursor && cursor.x === x && cursor.y === y) {
          ctx.strokeStyle = '#4f8cff';
          ctx.lineWidth = 2;
          ctx.strokeRect(x * cellW + 1, y * cellH + 1, cellW - 2, cellH - 2);
        }
        ctx.fillStyle = '#dbe4ff';
        ctx.fillText(grid[y][x] || ' ', x * cellW + 6, y * cellH + cellH / 2);
      }
    }
  }, [grid, cursor]);

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
