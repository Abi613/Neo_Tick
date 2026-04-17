import { create } from 'zustand';
import {
  CharacterDefinition,
  LCDCell,
  Matrix,
  OledTool,
  SchedulerOutput,
  TabMode,
  TimelineFrame,
} from '../types';
import { cloneMatrix, createMatrix } from '../utils/matrix';
import { compileScheduler, defaultScheduler, defaultSchedulerCode } from '../simulation/scheduler';

const GRID_W = 20;
const GRID_H = 4;

const makeCell = (): LCDCell => ({ kind: 'text', value: ' ' });
const makeGrid = () => Array.from({ length: GRID_H }, () => Array.from({ length: GRID_W }, () => makeCell()));

const collectUsedChars = (grid: LCDCell[]) => {
  const used = new Set<number>();
  grid.forEach((cell) => {
    if (cell.kind === 'custom') used.add(Number(cell.value));
  });
  return Array.from(used);
};

const makeFrame = (): TimelineFrame => {
  const grid = makeGrid();
  return {
    id: crypto.randomUUID(),
    duration: 300,
    lcd: {
      grid,
      usedChars: collectUsedChars(grid.flat()),
    },
    oled: createMatrix(128, 32),
  };
};

const nextCharName = (chars: CharacterDefinition[]) => `Char ${chars.length + 1}`;

const normalizeGrid = (grid: LCDCell[][]) => ({
  grid,
  usedChars: collectUsedChars(grid.flat()),
});

type State = {
  tab: TabMode;
  charMatrix: Matrix;
  characterLibrary: CharacterDefinition[];
  selectedCharId: number | null;
  activeCell: LCDCell;
  lcdStatic: LCDCell[][];
  lcdAnimated: LCDCell[][];
  cursor: { x: number; y: number };
  oled: Matrix;
  oledTool: OledTool;
  timeline: TimelineFrame[];
  playing: boolean;
  onionSkin: boolean;
  code: string;
  schedulerCode: string;
  schedulerError: string | null;
  simulationDebug: SchedulerOutput[];
  setTab: (tab: TabMode) => void;
  setCharPixel: (x: number, y: number, v: number) => void;
  setCharMatrix: (m: Matrix) => void;
  createCharacter: () => void;
  saveActiveCharacter: () => void;
  selectCharacter: (id: number) => void;
  renameCharacter: (id: number, name: string) => void;
  setActiveCell: (cell: LCDCell) => void;
  setActiveText: (text: string) => void;
  setCursor: (x: number, y: number) => void;
  placeChar: (layer: 'static' | 'animated', x: number, y: number, value: LCDCell) => void;
  setOledPixel: (x: number, y: number, v: number) => void;
  setOledTool: (tool: OledTool) => void;
  setOled: (m: Matrix) => void;
  addFrame: () => void;
  deleteFrame: (id: string) => void;
  duplicateFrame: (id: string) => void;
  setFrameDuration: (id: string, duration: number) => void;
  setFrameGridFromLayout: (id: string) => void;
  setPlaying: (p: boolean) => void;
  setOnionSkin: (v: boolean) => void;
  setCode: (code: string) => void;
  setSchedulerCode: (code: string) => void;
  runSchedulerForFrame: (frameIndex: number, previousMap: Record<number, number>) => SchedulerOutput;
  setSimulationDebug: (debug: SchedulerOutput[]) => void;
};

export const useDesignerStore = create<State>((set, get) => ({
  tab: 'character',
  charMatrix: createMatrix(5, 8),
  characterLibrary: [],
  selectedCharId: null,
  activeCell: { kind: 'text', value: 'A' },
  lcdStatic: makeGrid(),
  lcdAnimated: makeGrid(),
  cursor: { x: 0, y: 0 },
  oled: createMatrix(128, 32),
  oledTool: 'pencil',
  timeline: [makeFrame()],
  playing: false,
  onionSkin: true,
  code: '',
  schedulerCode: defaultSchedulerCode,
  schedulerError: null,
  simulationDebug: [],
  setTab: (tab) => set({ tab }),
  setCharPixel: (x, y, v) =>
    set((s) => {
      const next = cloneMatrix(s.charMatrix);
      next[y][x] = v;
      return { charMatrix: next };
    }),
  setCharMatrix: (m) => set({ charMatrix: m }),
  createCharacter: () =>
    set((s) => {
      const maxId = s.characterLibrary.reduce((acc, item) => Math.max(acc, item.id), 0);
      const id = maxId + 1;
      const created: CharacterDefinition = { id, name: nextCharName(s.characterLibrary), matrix: cloneMatrix(s.charMatrix) };
      return {
        characterLibrary: [...s.characterLibrary, created],
        selectedCharId: id,
        activeCell: { kind: 'custom', value: id },
      };
    }),
  saveActiveCharacter: () =>
    set((s) => {
      if (s.selectedCharId === null) return {};
      return {
        characterLibrary: s.characterLibrary.map((char) =>
          char.id === s.selectedCharId ? { ...char, matrix: cloneMatrix(s.charMatrix) } : char,
        ),
      };
    }),
  selectCharacter: (id) =>
    set((s) => {
      const selected = s.characterLibrary.find((c) => c.id === id);
      if (!selected) return {};
      return {
        selectedCharId: id,
        charMatrix: cloneMatrix(selected.matrix),
        activeCell: { kind: 'custom', value: id },
      };
    }),
  renameCharacter: (id, name) =>
    set((s) => ({ characterLibrary: s.characterLibrary.map((char) => (char.id === id ? { ...char, name } : char)) })),
  setActiveCell: (activeCell) => set({ activeCell }),
  setActiveText: (text) => set({ activeCell: { kind: 'text', value: (text || ' ').slice(0, 1) } }),
  setCursor: (x, y) => set({ cursor: { x, y } }),
  placeChar: (layer, x, y, value) =>
    set((s) => {
      const key = layer === 'static' ? 'lcdStatic' : 'lcdAnimated';
      const next = s[key].map((r) => r.map((cell) => ({ ...cell })));
      next[y][x] = { ...value };
      return { [key]: next } as Pick<State, 'lcdStatic' | 'lcdAnimated'>;
    }),
  setOledPixel: (x, y, v) =>
    set((s) => {
      const next = cloneMatrix(s.oled);
      if (y >= 0 && x >= 0 && y < 32 && x < 128) next[y][x] = v;
      return { oled: next };
    }),
  setOledTool: (tool) => set({ oledTool: tool }),
  setOled: (m) => set({ oled: m }),
  addFrame: () => set((s) => ({ timeline: [...s.timeline, makeFrame()] })),
  deleteFrame: (id) =>
    set((s) => ({ timeline: s.timeline.length > 1 ? s.timeline.filter((f) => f.id !== id) : s.timeline })),
  duplicateFrame: (id) =>
    set((s) => {
      const frame = s.timeline.find((f) => f.id === id);
      if (!frame) return {};
      const copy: TimelineFrame = {
        ...frame,
        id: crypto.randomUUID(),
        lcd: normalizeGrid(frame.lcd.grid.map((r) => r.map((cell) => ({ ...cell })))),
        oled: cloneMatrix(frame.oled),
      };
      return { timeline: [...s.timeline, copy] };
    }),
  setFrameDuration: (id, duration) => set((s) => ({ timeline: s.timeline.map((f) => (f.id === id ? { ...f, duration } : f)) })),
  setFrameGridFromLayout: (id) =>
    set((s) => {
      const composed = s.lcdStatic.map((row, y) =>
        row.map((v, x) => (s.lcdAnimated[y][x].kind === 'text' && s.lcdAnimated[y][x].value === ' ' ? v : s.lcdAnimated[y][x])),
      );
      return {
        timeline: s.timeline.map((f) => (f.id === id ? { ...f, lcd: normalizeGrid(composed.map((r) => r.map((c) => ({ ...c })))) } : f)),
      };
    }),
  setPlaying: (playing) => set({ playing }),
  setOnionSkin: (onionSkin) => set({ onionSkin }),
  setCode: (code) => set({ code }),
  setSchedulerCode: (schedulerCode) => set({ schedulerCode }),
  runSchedulerForFrame: (frameIndex, previousMap) => {
    const s = get();
    const frame = s.timeline[frameIndex];
    if (!frame) return { cgramMap: previousMap, updates: [] };

    try {
      const scheduler = compileScheduler(s.schedulerCode);
      const output = scheduler({
        frameIndex,
        requiredChars: frame.lcd.usedChars,
        previousMap,
      });
      set({ schedulerError: null });
      return output;
    } catch (error) {
      const fallback = defaultScheduler({ frameIndex, requiredChars: frame.lcd.usedChars, previousMap });
      set({ schedulerError: error instanceof Error ? error.message : 'Scheduler failed; default applied.' });
      return fallback;
    }
  },
  setSimulationDebug: (simulationDebug) => set({ simulationDebug }),
}));

export const snapshotProject = () => {
  const s = useDesignerStore.getState();
  return {
    characterLibrary: s.characterLibrary,
    lcdStatic: s.lcdStatic,
    lcdAnimated: s.lcdAnimated,
    oled: s.oled,
    timeline: s.timeline,
    schedulerCode: s.schedulerCode,
  };
};
