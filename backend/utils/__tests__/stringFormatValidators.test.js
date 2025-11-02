import { detectSQLInjectionAttempt, detectXSSAttempt } from '../stringFormatValidators.js';

describe('stringFormatValidators', () => {
  describe('detectSQLInjectionAttempt', () => {
    it('detects simple SELECT pattern', () => {
      expect(detectSQLInjectionAttempt("SELECT * FROM users")).toBe(true);
    });

    it('returns false for safe strings', () => {
      expect(detectSQLInjectionAttempt('hello world')).toBe(false);
    });

    it('returns false for non-string inputs and empty string', () => {
      expect(detectSQLInjectionAttempt(null)).toBe(false);
      expect(detectSQLInjectionAttempt(123)).toBe(false);
      expect(detectSQLInjectionAttempt('')).toBe(false);
    });
  });

  describe('detectXSSAttempt', () => {
    it('detects script tag', () => {
      expect(detectXSSAttempt('<script>alert(1)</script>')).toBe(true);
    });

    it('returns false for plain text', () => {
      expect(detectXSSAttempt('just text')).toBe(false);
    });

    it('returns false for non-string inputs and empty string', () => {
      expect(detectXSSAttempt(undefined)).toBe(false);
      expect(detectXSSAttempt({})).toBe(false);
      expect(detectXSSAttempt('')).toBe(false);
    });
  });
});
