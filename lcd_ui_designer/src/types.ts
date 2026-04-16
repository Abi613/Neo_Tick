export type TabMode = 'character' | 'layout' | 'timeline';
export type DrawTool = 'draw' | 'erase' | 'fill' | 'invert' | 'shift_up' | 'shift_down' | 'shift_left' | 'shift_right';
export type OledTool = 'pencil' | 'line' | 'rectangle' | 'text';

export type Matrix = number[][];

export type TimelineFrame = {
  id: string;
  duration: number;
  lcd: string[][];
  oled: Matrix;
};
