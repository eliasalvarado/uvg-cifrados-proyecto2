import { test, expect } from 'vitest';
import generateAES256KeyBase64 from '../generateAES256KeyBase64';

test('generateAES256KeyBase64 returns base64 string of 32 bytes when decoded', () => {
  const k = generateAES256KeyBase64();
  expect(typeof k).toBe('string');
  const buf = Buffer.from(k, 'base64');
  expect(buf.length).toBe(32);
});
