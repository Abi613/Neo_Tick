import { CharacterDefinition, Matrix, TimelineFrame } from '../types';

const rowToBinary = (row: number[]) => `0b${row.map((c) => (c ? '1' : '0')).join('')}`;
const rowToHex = (row: number[]) => `0x${parseInt(row.join(''), 2).toString(16).padStart(2, '0')}`;

export const toCgramCode = (characters: CharacterDefinition[]) => {
  const chars = characters
    .slice(0, 8)
    .map((char, i) => {
      const rows = char.matrix.map((r) => `  ${rowToBinary(r)}, // ${rowToHex(r)}`).join('\n');
      return `byte customChar${char.id}[8] = {\n${rows}\n};\nlcd.createChar(${i}, customChar${char.id}); // ${char.name}`;
    })
    .join('\n\n');
  return `#include <LiquidCrystal.h>\nLiquidCrystal lcd(12, 11, 5, 4, 3, 2);\n\nvoid setup() {\n  lcd.begin(20, 4);\n${chars.split('\n').map((line) => `  ${line}`).join('\n')}\n}`;
};

export const toU8g2Code = (oled: Matrix) => {
  const points: string[] = [];
  oled.forEach((row, y) => row.forEach((p, x) => p && points.push(`u8g2.drawPixel(${x}, ${y});`)));
  return `#include <U8g2lib.h>\nU8G2_SSD1306_128X32_UNIVISION_F_HW_I2C u8g2(U8G2_R0);\n\nvoid draw(){\n${points.map((p) => `  ${p}`).join('\n')}\n}`;
};

export const toAdafruitCode = (oled: Matrix) => {
  const points: string[] = [];
  oled.forEach((row, y) => row.forEach((p, x) => p && points.push(`display.drawPixel(${x}, ${y}, SSD1306_WHITE);`)));
  return `#include <Adafruit_GFX.h>\n#include <Adafruit_SSD1306.h>\n\nvoid render(){\n${points.map((p) => `  ${p}`).join('\n')}\n  display.display();\n}`;
};

export const toProjectJSON = (project: object) => JSON.stringify(project, null, 2);

export const toWokwiProject = (frames: TimelineFrame[]) => JSON.stringify({
  version: 1,
  author: 'Embedded Display UI Designer',
  parts: [{ type: 'wokwi-arduino-uno', id: 'uno', top: 0, left: 0 }],
  timeline: frames.map((f) => ({ id: f.id, duration: f.duration })),
}, null, 2);
