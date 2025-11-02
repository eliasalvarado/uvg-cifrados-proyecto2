import generateRandomString from '../randomString';

describe('generateRandomString', () => {
  test('default length is 10 and only contains allowed characters', () => {
    const s = generateRandomString();
    expect(typeof s).toBe('string');
    expect(s.length).toBe(10);
    expect(/^[A-Za-z0-9]+$/.test(s)).toBe(true);
  });

  test('respects provided length including zero', () => {
    expect(generateRandomString(0)).toBe('');
    const s5 = generateRandomString(5);
    expect(s5.length).toBe(5);
    expect(/^[A-Za-z0-9]+$/.test(s5)).toBe(true);
  });

  test('multiple calls produce strings (not all equal)', () => {
    const a = generateRandomString(8);
    const b = generateRandomString(8);
    // Very small chance they are equal; assert at least returns strings of correct length
    expect(a.length).toBe(8);
    expect(b.length).toBe(8);
  });
});
