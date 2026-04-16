import { useEffect, useRef } from 'react';
import { Matrix } from '../types';

type Props = {
  matrix: Matrix;
  pixelSize?: number;
  onPixelClick?: (x: number, y: number) => void;
  hover?: boolean;
};

export default function PixelGridCanvas({ matrix, pixelSize = 28, onPixelClick, hover = true }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const h = matrix.length;
    const w = matrix[0]?.length ?? 0;
    canvas.width = w * pixelSize;
    canvas.height = h * pixelSize;
    ctx.fillStyle = '#0a0f1d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        ctx.fillStyle = matrix[y][x] ? '#89b4ff' : '#1d273a';
        ctx.fillRect(x * pixelSize + 1, y * pixelSize + 1, pixelSize - 2, pixelSize - 2);
      }
    }
  }, [matrix, pixelSize]);

  return (
    <canvas
      ref={ref}
      className={`rounded border border-slate-600 ${hover ? 'cursor-crosshair' : ''}`}
      onClick={(e) => {
        if (!onPixelClick) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / pixelSize);
        const y = Math.floor((e.clientY - rect.top) / pixelSize);
        onPixelClick(x, y);
      }}
    />
  );
}
