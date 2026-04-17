import { SchedulerFn, SchedulerInput, SchedulerOutput } from '../types';

const normalizeRequired = (requiredChars: number[]) => Array.from(new Set(requiredChars.filter((v) => Number.isInteger(v))));

export const defaultScheduler: SchedulerFn = ({ requiredChars, previousMap }) => {
  const required = normalizeRequired(requiredChars);
  const nextMap: Record<number, number> = {};
  const updates: SchedulerOutput['updates'] = [];

  const taken = new Set<number>();
  const previousBySlot = new Map<number, number>();
  Object.entries(previousMap).forEach(([charId, slot]) => {
    const numericChar = Number(charId);
    previousBySlot.set(slot, numericChar);
  });

  for (const charId of required) {
    const prevSlot = previousMap[charId];
    if (typeof prevSlot === 'number' && prevSlot >= 0 && prevSlot < 8 && !taken.has(prevSlot)) {
      nextMap[charId] = prevSlot;
      taken.add(prevSlot);
    }
  }

  for (const charId of required) {
    if (typeof nextMap[charId] === 'number') continue;
    let slot = -1;
    for (let i = 0; i < 8; i++) {
      if (!taken.has(i)) {
        slot = i;
        break;
      }
    }
    if (slot === -1) break;

    taken.add(slot);
    nextMap[charId] = slot;
    const previousCharId = previousBySlot.get(slot);
    updates.push({ slot, charId, previousCharId });
  }

  return {
    cgramMap: nextMap,
    updates,
  };
};

export const compileScheduler = (source: string): SchedulerFn => {
  const factory = new Function(
    `'use strict';\n${source};\nif (typeof scheduler !== 'function') { throw new Error('Define function scheduler(input)'); }\nreturn scheduler;`,
  ) as () => SchedulerFn;
  const fn = factory();
  return (input: SchedulerInput) => {
    const result = fn(input);
    if (!result || typeof result !== 'object' || !result.cgramMap || !Array.isArray(result.updates)) {
      throw new Error('Scheduler must return { cgramMap, updates }');
    }
    return result;
  };
};

export const defaultSchedulerCode = `function scheduler({ requiredChars, previousMap }) {
  const cgramMap = {};
  const updates = [];
  const takenSlots = new Set();

  for (const charId of requiredChars) {
    const prevSlot = previousMap[charId];
    if (typeof prevSlot === 'number' && prevSlot >= 0 && prevSlot < 8 && !takenSlots.has(prevSlot)) {
      cgramMap[charId] = prevSlot;
      takenSlots.add(prevSlot);
    }
  }

  for (const charId of requiredChars) {
    if (typeof cgramMap[charId] === 'number') continue;
    let free = -1;
    for (let i = 0; i < 8; i++) {
      if (!takenSlots.has(i)) {
        free = i;
        break;
      }
    }
    if (free === -1) break;
    cgramMap[charId] = free;
    takenSlots.add(free);
    updates.push({ slot: free, charId });
  }

  return { cgramMap, updates };
}`;
