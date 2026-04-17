import Editor from '@monaco-editor/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import LCDPreview from '../canvas/LCDPreview';
import OLEDCanvas from '../canvas/OLEDCanvas';
import { useDesignerStore } from '../store/useDesignerStore';
import { SimulationFrame } from '../types';

export default function Timeline() {
  const {
    timeline,
    addFrame,
    deleteFrame,
    duplicateFrame,
    setFrameDuration,
    playing,
    setPlaying,
    onionSkin,
    setOnionSkin,
    oled,
    setFrameGridFromLayout,
    runSchedulerForFrame,
    schedulerCode,
    setSchedulerCode,
    schedulerError,
    characterLibrary,
  } = useDesignerStore();
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
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, timeline, idx]);

  const simulation = useMemo<SimulationFrame[]>(() => {
    let map: Record<number, number> = {};
    return timeline.map((frame, frameIndex) => {
      const requiredChars = frame.lcd.usedChars;
      const output = runSchedulerForFrame(frameIndex, map);
      map = output.cgramMap;
      return {
        frameIndex,
        cgramMap: output.cgramMap,
        updates: output.updates,
        requiredChars,
        conflicts: Math.max(0, requiredChars.length - 8),
      };
    });
  }, [timeline, runSchedulerForFrame]);

  const active = timeline[idx];
  const prev = idx > 0 ? timeline[idx - 1] : undefined;
  const activeSim = simulation[idx];

  return (
    <div className="space-y-3">
      <div className="panel p-3 flex gap-2 items-center flex-wrap">
        <button className="btn" onClick={() => setPlaying(!playing)}>{playing ? 'Pause' : 'Play'}</button>
        <button className="btn" onClick={addFrame}>Add Frame</button>
        <button className="btn" onClick={() => active && duplicateFrame(active.id)}>Duplicate</button>
        <button className="btn" onClick={() => active && deleteFrame(active.id)}>Delete</button>
        <button className="btn" onClick={() => active && setFrameGridFromLayout(active.id)}>Capture Layout → Frame</button>
        <label className="ml-2 text-sm flex items-center gap-2"><input type="checkbox" checked={onionSkin} onChange={(e) => setOnionSkin(e.target.checked)} /> Onion skin</label>
      </div>

      {schedulerError && <div className="panel p-2 text-sm text-amber-300">Scheduler error: {schedulerError}. Using default scheduler fallback.</div>}

      <div className="panel p-3 overflow-x-auto flex gap-2">
        {timeline.map((f, i) => {
          const sim = simulation[i];
          return (
            <div key={f.id} className={`min-w-40 p-2 rounded border ${idx === i ? 'border-accent' : 'border-slate-600'}`}>
              <button className="text-xs mb-1" onClick={() => setIdx(i)}>Frame {i + 1}</button>
              <LCDPreview grid={f.lcd.grid} cgramMap={sim?.cgramMap} characters={characterLibrary} />
              <div className="mt-2 text-xs">Duration <input className="bg-slate-900 w-20 ml-1" type="number" value={f.duration} onChange={(e) => setFrameDuration(f.id, Number(e.target.value))} /></div>
              {sim && sim.conflicts > 0 && <div className="text-amber-300 text-xs mt-2">Conflict: {sim.requiredChars.length} chars → only 8 CGRAM slots.</div>}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-6 panel p-3">
          <h4 className="font-semibold mb-2">Simulation LCD Preview</h4>
          {active && activeSim && <LCDPreview grid={active.lcd.grid} cgramMap={activeSim.cgramMap} characters={characterLibrary} />}
        </div>
        <div className="col-span-6 panel p-3">
          <h4 className="font-semibold mb-2">Current OLED Frame</h4>
          <OLEDCanvas matrix={active?.oled ?? oled} previous={prev?.oled} onionSkin={onionSkin} tool="pencil" onDraw={() => void 0} />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-7 panel p-3">
          <h4 className="font-semibold mb-2">Custom Scheduler Algorithm (Monaco)</h4>
          <Editor
            height="260px"
            theme="vs-dark"
            defaultLanguage="javascript"
            value={schedulerCode}
            onChange={(v) => setSchedulerCode(v ?? '')}
            options={{ minimap: { enabled: false }, fontSize: 13 }}
          />
        </div>
        <div className="col-span-5 panel p-3">
          <h4 className="font-semibold mb-2">Debug Panel</h4>
          {activeSim && (
            <div className="text-xs space-y-3">
              <div>
                <div className="font-semibold">Frame {activeSim.frameIndex + 1} map</div>
                <pre>{JSON.stringify(activeSim.cgramMap, null, 2)}</pre>
              </div>
              <div>
                <div className="font-semibold">Updated slots</div>
                {activeSim.updates.length === 0 ? <div>No swaps</div> : (
                  <ul className="list-disc pl-4">
                    {activeSim.updates.map((u, i) => (
                      <li key={`${u.slot}-${u.charId}-${i}`}>
                        Slot {u.slot}: char {u.previousCharId ?? '∅'} → {u.charId}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <div className="font-semibold">Required chars</div>
                <div>{activeSim.requiredChars.join(', ') || 'none'}</div>
              </div>
              {activeSim.conflicts > 0 && (
                <div className="text-amber-300">
                  Conflict detected: {activeSim.requiredChars.length} requested; 8 available. Optimized mapping retained for first 8.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
