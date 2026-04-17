import { CharacterDefinition, LCDCell, Matrix } from '../types';

const glyphCache = new Map<string, Matrix>();

const emptyTile = (): Matrix => Array.from({ length: 8 }, () => Array.from({ length: 5 }, () => 0));

const normalizeTile = (matrix?: Matrix): Matrix => {
  if (!matrix || !matrix.length) return emptyTile();
  return Array.from({ length: 8 }, (_, y) =>
    Array.from({ length: 5 }, (_, x) => (matrix[y]?.[x] ? 1 : 0)),
  );
};

const asciiTile = (char: string): Matrix => {
  const key = char || ' ';
  if (glyphCache.has(key)) return glyphCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 5;
  canvas.height = 8;
  const ctx = canvas.getContext('2d');
  if (!ctx) return emptyTile();

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 5, 8);
  ctx.fillStyle = '#fff';
  ctx.font = '8px monospace';
  ctx.textBaseline = 'top';
  ctx.fillText(key, -1, -1);
  const data = ctx.getImageData(0, 0, 5, 8).data;
  const matrix = Array.from({ length: 8 }, (_, y) =>
    Array.from({ length: 5 }, (_, x) => {
      const a = data[(y * 5 + x) * 4 + 3];
      return a > 80 ? 1 : 0;
    }),
  );
  glyphCache.set(key, matrix);
  return matrix;
};

const tileForCell = (cell: LCDCell, characters: CharacterDefinition[], cgramMap: Record<number, number>): Matrix => {
  if (cell.kind === 'custom') {
    const charId = Number(cell.value);
    if (typeof cgramMap[charId] !== 'number') return emptyTile();
    const found = characters.find((c) => c.id === charId);
    return normalizeTile(found?.matrix);
  }

  return asciiTile(String(cell.value ?? ' ').slice(0, 1));
};

export const buildLcdPixelBuffer = (
  grid: LCDCell[][],
  characters: CharacterDefinition[],
  cgramMap: Record<number, number>,
): Matrix => {
  const pixelBuffer = Array.from({ length: grid.length * 8 }, () => Array.from({ length: (grid[0]?.length ?? 0) * 5 }, () => 0));

  for (let cy = 0; cy < grid.length; cy++) {
    for (let cx = 0; cx < grid[cy].length; cx++) {
      const tile = tileForCell(grid[cy][cx], characters, cgramMap);
      for (let py = 0; py < 8; py++) {
        for (let px = 0; px < 5; px++) {
          pixelBuffer[cy * 8 + py][cx * 5 + px] = tile[py][px];
        }
      }
    }
  }

  return pixelBuffer;
};
