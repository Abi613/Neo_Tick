import { SchedulerInput, SchedulerOutput } from '../types';

type SchedulerRunnerResult =
  | { ok: true; output: SchedulerOutput }
  | { ok: false; error: string };

const isValidOutput = (value: unknown): value is SchedulerOutput => {
  if (!value || typeof value !== 'object') return false;
  const maybe = value as SchedulerOutput;
  return !!maybe.cgramMap && typeof maybe.cgramMap === 'object' && Array.isArray(maybe.updates);
};

export const runSchedulerSource = (
  source: string,
  input: SchedulerInput,
  timeoutMs = 30,
): SchedulerRunnerResult => {
  try {
    const factory = new Function(
      'input',
      `'use strict';\n${source};\nif (typeof scheduler !== 'function') { throw new Error('Define function scheduler(input)'); }\nreturn scheduler(input);`,
    ) as (input: SchedulerInput) => SchedulerOutput;

    const startedAt = performance.now();
    const output = factory(input);
    const elapsed = performance.now() - startedAt;
    if (elapsed > timeoutMs) {
      throw new Error(`Scheduler timeout (${Math.round(elapsed)}ms > ${timeoutMs}ms).`);
    }
    if (!isValidOutput(output)) {
      throw new Error('Scheduler must return { cgramMap, updates }.');
    }
    return { ok: true, output };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Scheduler execution failed.',
    };
  }
};
