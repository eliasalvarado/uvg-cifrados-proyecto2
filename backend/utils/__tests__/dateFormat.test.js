import toMysql from '../dateFormat.js';

describe('toMysql', () => {
  it('formats a Date to MySQL-like string with milliseconds', () => {
    const d = new Date(Date.UTC(2025, 10, 1, 12, 34, 56, 789)); // 2025-11-01T12:34:56.789Z
    const result = toMysql(d);
    expect(result).toBe('2025-11-01 12:34:56.789');
  });
});
