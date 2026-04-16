# Embedded Display UI Designer

Production-ready React + Vite application for designing and simulating embedded UIs targeting:

- HD44780 20x4 character LCD (with CGRAM)
- SSD1306 128x32 OLED (pixel display)

## Tech Stack

- React + Vite + TypeScript
- Zustand state management
- HTML5 Canvas rendering
- TailwindCSS dark UI
- Monaco Editor code output panel

## Features

- Tab-based IDE workflow:
  1. Character Editor
  2. Screen Layout Editor
  3. Animation Timeline
- 5x8 CGRAM character tools: draw, erase, fill, invert, shift
- CGRAM slots 0-7 with usage bar and binary/hex output
- 20x4 LCD click-to-place editor with static + animated layer placement
- 128x32 OLED pixel canvas with core tools and templates
- Smartwatch templates: battery, signal, heart, clock, notification
- Animation timeline: thumbnails, add/delete/duplicate, per-frame duration, onion skin, play/pause/loop
- Export generators:
  - Arduino LiquidCrystal + CGRAM
  - U8g2
  - Adafruit SSD1306
  - JSON project format
  - Wokwi JSON + "Open in Wokwi"
- Keyboard shortcuts:
  - Arrow keys move LCD cursor
  - Space places active character
  - Ctrl+C/Ctrl+V copy/paste character matrix

## File Structure

```txt
src/
  components/
    CharacterEditor.tsx
    ExportPanel.tsx
    ModeTabs.tsx
    ScreenLayoutEditor.tsx
    Timeline.tsx
    Toolbar.tsx
  canvas/
    LCDPreview.tsx
    OLEDCanvas.tsx
    PixelGridCanvas.tsx
  export/
    generators.ts
  store/
    useDesignerStore.ts
  templates/
    icons.ts
  utils/
    matrix.ts
  App.tsx
  main.tsx
  styles.css
```

## Run

```bash
npm install
npm run dev
```

Then open the local Vite URL.
