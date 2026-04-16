import { Matrix } from '../types';

export const createMatrix = (w: number, h: number, fill = 0): Matrix =>
  Array.from({ length: h }, () => Array.from({ length: w }, () => fill));

export const cloneMatrix = (matrix: Matrix): Matrix => matrix.map((r) => [...r]);

export const shiftMatrix = (matrix: Matrix, direction: 'up' | 'down' | 'left' | 'right') => {
  const h = matrix.length;
  const w = matrix[0]?.length ?? 0;
  const next = createMatrix(w, h, 0);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sx = x;
      let sy = y;
      if (direction === 'up') sy = y + 1;
      if (direction === 'down') sy = y - 1;
      if (direction === 'left') sx = x + 1;
      if (direction === 'right') sx = x - 1;
      if (sx >= 0 && sy >= 0 && sx < w && sy < h) next[y][x] = matrix[sy][sx];
    }
  }
  return next;
};

export const invertMatrix = (matrix: Matrix): Matrix => matrix.map((r) => r.map((v) => (v ? 0 : 1)));

export const fillMatrix = (w: number, h: number, val: number): Matrix => createMatrix(w, h, val);
