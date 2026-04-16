import { useEffect, useRef } from 'react';
import { Matrix, OledTool } from '../types';

type Props = {
  matrix: Matrix;
  previous?: Matrix;
  onionSkin?: boolean;
  tool: OledTool;
  onDraw: (x: number, y: number, dragging: boolean) => void;
};

export default function OLEDCanvas({ matrix, previous, onionSkin, tool, onDraw }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const scale = 4;

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    c.width = 128 * scale;
    c.height = 32 * scale;
    ctx.fillStyle = '#03060d';
    ctx.fillRect(0, 0, c.width, c.height);

    if (onionSkin && previous) {
      for (let y = 0; y < 32; y++) for (let x = 0; x < 128; x++) if (previous[y][x]) {
        ctx.fillStyle = 'rgba(79,140,255,0.25)';
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }

    for (let y = 0; y < 32; y++) for (let x = 0; x < 128; x++) if (matrix[y][x]) {
      ctx.fillStyle = '#b9ccff';
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  }, [matrix, previous, onionSkin]);

  const pos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: Math.floor((e.clientX - r.left) / scale), y: Math.floor((e.clientY - r.top) / scale) };
  };

  return (
    <div>
      <div className="text-xs text-slate-300 mb-1">Tool: {tool}</div>
      <canvas
        ref={ref}
        className="rounded border border-slate-600 cursor-crosshair"
        onMouseDown={(e) => {
          drawing.current = true;
          const { x, y } = pos(e);
          onDraw(x, y, false);
        }}
        onMouseMove={(e) => {
          if (!drawing.current) return;
          const { x, y } = pos(e);
          onDraw(x, y, true);
        }}
        onMouseUp={() => { drawing.current = false; }}
        onMouseLeave={() => { drawing.current = false; }}
      />
    </div>
  );
}
