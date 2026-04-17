export type TabMode = 'character' | 'layout' | 'timeline';
export type DrawTool = 'draw' | 'erase' | 'fill' | 'invert' | 'shift_up' | 'shift_down' | 'shift_left' | 'shift_right';
export type OledTool = 'pencil' | 'line' | 'rectangle' | 'text';

export type Matrix = number[][];

export type LCDCell = {
  kind: 'text' | 'custom';
  value: string | number;
};

export type CharacterDefinition = {
  id: number;
  name: string;
  matrix: Matrix;
};

export type FrameLcdData = {
  grid: LCDCell[][];
  usedChars: number[];
};

export type TimelineFrame = {
  id: string;
  duration: number;
  lcd: FrameLcdData;
  oled: Matrix;
};

export type SchedulerInput = {
  frameIndex: number;
  requiredChars: number[];
  previousMap: Record<number, number>;
};

export type SchedulerUpdate = {
  slot: number;
  charId: number;
  previousCharId?: number;
};

export type SchedulerOutput = {
  cgramMap: Record<number, number>;
  updates: SchedulerUpdate[];
};

export type SchedulerFn = (input: SchedulerInput) => SchedulerOutput;

export type SimulationFrame = {
  frameIndex: number;
  cgramMap: Record<number, number>;
  updates: SchedulerUpdate[];
  requiredChars: number[];
  conflicts: number;
};
