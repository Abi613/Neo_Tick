import { useEffect, useRef, useState } from 'react';
import LCDPreview from '../canvas/LCDPreview';
import OLEDCanvas from '../canvas/OLEDCanvas';
import { useDesignerStore } from '../store/useDesignerStore';

export default function Timeline() {
  const { timeline, addFrame, deleteFrame, duplicateFrame, setFrameDuration, playing, setPlaying, onionSkin, setOnionSkin, oled } = useDesignerStore();
  const [idx, setIdx] = useState(0);
  const rafRef = useRef<number>();
  const elapsedRef = useRef(0);
  const lastRef = useRef(0);

  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    const loop = (t: number) => {
      if (!lastRef.current) lastRef.current = t;
      const delta = t - lastRef.current;
      lastRef.current = t;
      elapsedRef.current += delta;
      const current = timeline[idx];
      if (current && elapsedRef.current >= current.duration) {
        elapsedRef.current = 0;
        setIdx((i) => (i + 1) % timeline.length);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [playing, timeline, idx]);

  const active = timeline[idx];
  const prev = idx > 0 ? timeline[idx - 1] : undefined;

  return (
    <div className="space-y-3">
      <div className="panel p-3 flex gap-2 items-center">
        <button className="btn" onClick={() => setPlaying(!playing)}>{playing ? 'Pause' : 'Play'}</button>
        <button className="btn" onClick={addFrame}>Add Frame</button>
        <button className="btn" onClick={() => active && duplicateFrame(active.id)}>Duplicate</button>
        <button className="btn" onClick={() => active && deleteFrame(active.id)}>Delete</button>
        <label className="ml-4 text-sm flex items-center gap-2"><input type="checkbox" checked={onionSkin} onChange={(e) => setOnionSkin(e.target.checked)} /> Onion skin</label>
      </div>

      <div className="panel p-3 overflow-x-auto flex gap-2">
        {timeline.map((f, i) => (
          <div key={f.id} className={`min-w-40 p-2 rounded border ${idx === i ? 'border-accent' : 'border-slate-600'}`}>
            <button className="text-xs mb-1" onClick={() => setIdx(i)}>Frame {i + 1}</button>
            <LCDPreview grid={f.lcd} />
            <div className="mt-2 text-xs">Duration <input className="bg-slate-900 w-20 ml-1" type="number" value={f.duration} onChange={(e) => setFrameDuration(f.id, Number(e.target.value))} /></div>
          </div>
        ))}
      </div>

      <div className="panel p-3">
        <h4 className="font-semibold mb-2">Current OLED Frame</h4>
        <OLEDCanvas matrix={active?.oled ?? oled} previous={prev?.oled} onionSkin={onionSkin} tool="pencil" onDraw={() => void 0} />
      </div>
    </div>
  );
}
