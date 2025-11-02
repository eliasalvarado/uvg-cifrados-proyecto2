// backend/utils/__tests__/hash.test.js
import sha256Hex from '../cypher/hash.js';

test('sha256Hex produces consistent hash for known input', () => {
  const input = 'hello';
  const h = sha256Hex(input);
  expect(h).toHaveLength(64); // hex length for sha-256
  expect(h).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
});