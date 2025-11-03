import { vi, describe, it, expect, beforeEach } from 'vitest';

// Spies used by the test
const toSpy = vi.fn();
const eventCallbackSpy = vi.fn();
const timelineSpy = vi.fn(() => ({ to: toSpy, eventCallback: eventCallbackSpy }));

// Use a global hook name so the vi.mock factory does not reference local
// variables (vi.mock is hoisted). The factory returns a timeline function
// that will call `globalThis.__timeline_call__` at runtime.
vi.mock('gsap', () => ({ gsap: { timeline: (...args) => globalThis.__timeline_call__(...args) } }));

// Assign the global hook before importing the module under test so the
// mocked gsap.timeline will delegate to our spy when invoked.
globalThis.__timeline_call__ = timelineSpy;

import fadeOut from '../fadeOut';

beforeEach(() => {
  // reset spies between tests
  toSpy.mockReset();
  eventCallbackSpy.mockReset();
  timelineSpy.mockReset();
  globalThis.__timeline_call__ = timelineSpy;
});

describe('fadeOut', () => {
  it('calls gsap.timeline with correct defaults and sets to + onComplete', () => {
    const comp = { node: true };
    const cb = vi.fn();
    fadeOut(comp, 500, cb);

    expect(timelineSpy).toHaveBeenCalledWith({ defaults: { duration: 0.5 } });
    expect(toSpy).toHaveBeenCalledWith(comp, { opacity: 0 });
    expect(eventCallbackSpy).toHaveBeenCalledWith('onComplete', cb);
  });
});
