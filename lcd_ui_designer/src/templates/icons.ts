import { Matrix } from '../types';
import { createMatrix } from '../utils/matrix';

const patternToMatrix = (rows: string[]): Matrix => rows.map((r) => r.split('').map((c) => (c === '1' ? 1 : 0)));

export const smartWatchTemplates = {
  battery: patternToMatrix(['01110', '10001', '10001', '11111', '11111', '11111', '11111', '11111']),
  signal: patternToMatrix(['00000', '00001', '00011', '00111', '01111', '11111', '00000', '00000']),
  heart: patternToMatrix(['01010', '11111', '11111', '11111', '01110', '00100', '00000', '00000']),
  clock: patternToMatrix(['01110', '10001', '10101', '10111', '10001', '01110', '00000', '00000']),
  notify: patternToMatrix(['00100', '01110', '01110', '01110', '00100', '00100', '00000', '00100']),
};

export const makeClockDigits = (): Matrix => {
  const grid = createMatrix(24, 16, 0);
  for (let x = 2; x < 10; x++) { grid[2][x] = 1; grid[13][x] = 1; }
  for (let y = 2; y < 14; y++) { grid[y][2] = 1; grid[y][9] = 1; }
  for (let y = 2; y < 14; y++) { grid[y][14] = 1; grid[y][21] = 1; }
  for (let x = 14; x < 22; x++) { grid[2][x] = 1; grid[13][x] = 1; }
  return grid;
};
