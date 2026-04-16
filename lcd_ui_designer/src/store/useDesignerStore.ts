import { create } from 'zustand';
import { Matrix, OledTool, TabMode, TimelineFrame } from '../types';
import { cloneMatrix, createMatrix } from '../utils/matrix';

const makeLcd = () => Array.from({ length: 4 }, () => Array.from({ length: 20 }, () => ' '));
const makeFrame = (): TimelineFrame => ({
  id: crypto.randomUUID(),
  duration: 300,
  lcd: makeLcd(),
  oled: createMatrix(128, 32),
});

type State = {
  tab: TabMode;
  charMatrix: Matrix;
  cgram: Matrix[];
  selectedSlot: number;
  activeChar: string;
  lcdStatic: string[][];
  lcdAnimated: string[][];
  cursor: { x: number; y: number };
  oled: Matrix;
  oledTool: OledTool;
  timeline: TimelineFrame[];
  playing: boolean;
  onionSkin: boolean;
  code: string;
  setTab: (tab: TabMode) => void;
  setCharPixel: (x: number, y: number, v: number) => void;
  setCharMatrix: (m: Matrix) => void;
  saveCharToSlot: (slot: number) => void;
  setActiveChar: (char: string) => void;
  setCursor: (x: number, y: number) => void;
  placeChar: (layer: 'static' | 'animated', x: number, y: number, value: string) => void;
  setOledPixel: (x: number, y: number, v: number) => void;
  setOledTool: (tool: OledTool) => void;
  setOled: (m: Matrix) => void;
  addFrame: () => void;
  deleteFrame: (id: string) => void;
  duplicateFrame: (id: string) => void;
  setFrameDuration: (id: string, duration: number) => void;
  setPlaying: (p: boolean) => void;
  setOnionSkin: (v: boolean) => void;
  setCode: (code: string) => void;
};

export const useDesignerStore = create<State>((set, get) => ({
  tab: 'character',
  charMatrix: createMatrix(5, 8),
  cgram: Array.from({ length: 8 }, () => createMatrix(5, 8)),
  selectedSlot: 0,
  activeChar: 'A',
  lcdStatic: makeLcd(),
  lcdAnimated: makeLcd(),
  cursor: { x: 0, y: 0 },
  oled: createMatrix(128, 32),
  oledTool: 'pencil',
  timeline: [makeFrame()],
  playing: false,
  onionSkin: true,
  code: '',
  setTab: (tab) => set({ tab }),
  setCharPixel: (x, y, v) => set((s) => {
    const next = cloneMatrix(s.charMatrix);
    next[y][x] = v;
    return { charMatrix: next };
  }),
  setCharMatrix: (m) => set({ charMatrix: m }),
  saveCharToSlot: (slot) => set((s) => {
    const cgram = [...s.cgram];
    cgram[slot] = cloneMatrix(s.charMatrix);
    return { cgram, selectedSlot: slot, activeChar: String.fromCharCode(slot) };
  }),
  setActiveChar: (char) => set({ activeChar: char }),
  setCursor: (x, y) => set({ cursor: { x, y } }),
  placeChar: (layer, x, y, value) => set((s) => {
    const key = layer === 'static' ? 'lcdStatic' : 'lcdAnimated';
    const next = s[key].map((r) => [...r]);
    next[y][x] = value;
    return { [key]: next } as Pick<State, 'lcdStatic' | 'lcdAnimated'>;
  }),
  setOledPixel: (x, y, v) => set((s) => {
    const next = cloneMatrix(s.oled);
    if (y >= 0 && x >= 0 && y < 32 && x < 128) next[y][x] = v;
    return { oled: next };
  }),
  setOledTool: (tool) => set({ oledTool: tool }),
  setOled: (m) => set({ oled: m }),
  addFrame: () => set((s) => ({ timeline: [...s.timeline, makeFrame()] })),
  deleteFrame: (id) => set((s) => ({ timeline: s.timeline.length > 1 ? s.timeline.filter((f) => f.id !== id) : s.timeline })),
  duplicateFrame: (id) => set((s) => {
    const frame = s.timeline.find((f) => f.id === id);
    if (!frame) return {};
    const copy: TimelineFrame = { ...frame, id: crypto.randomUUID(), lcd: frame.lcd.map((r) => [...r]), oled: cloneMatrix(frame.oled) };
    return { timeline: [...s.timeline, copy] };
  }),
  setFrameDuration: (id, duration) => set((s) => ({ timeline: s.timeline.map((f) => (f.id === id ? { ...f, duration } : f)) })),
  setPlaying: (playing) => set({ playing }),
  setOnionSkin: (onionSkin) => set({ onionSkin }),
  setCode: (code) => set({ code }),
}));

export const getUsedCgramSlots = (slots: Matrix[]) => slots.filter((s) => s.some((r) => r.some(Boolean))).length;

export const snapshotProject = () => {
  const s = useDesignerStore.getState();
  return {
    cgram: s.cgram,
    lcdStatic: s.lcdStatic,
    lcdAnimated: s.lcdAnimated,
    oled: s.oled,
    timeline: s.timeline,
  };
};
