import { vi, test, expect } from 'vitest';
import { generateAES256Key } from '../AES-256';

test('generateAES256Key returns 32-byte Uint8Array using crypto.getRandomValues', () => {
  // stub global crypto.getRandomValues to return deterministic data
  vi.stubGlobal('crypto', {
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i++) arr[i] = i + 5;
      return arr;
    }
  });

  const key = generateAES256Key();
  expect(key).toBeInstanceOf(Uint8Array);
  expect(key.length).toBe(32);
  // ensure deterministic stub applied
  expect(key[0]).toBe(5);

  vi.unstubAllGlobals();
});
