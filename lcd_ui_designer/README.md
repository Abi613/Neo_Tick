# 20x4 LCD UI & Animation Designer

A standalone browser app to:

- Design a 20x4 character LCD screen layout.
- Build multiple frames for animation.
- Preview frame order in-app.
- Export C code compatible with common Arduino `LiquidCrystal` workflows.

## Run

Open `index.html` in any modern browser.

## Notes

- Each frame stores exactly 4 rows × 20 columns.
- Exported code defines `lcdFrames` and helper rendering functions.
- Update LCD pin mapping in generated code to match your hardware.
