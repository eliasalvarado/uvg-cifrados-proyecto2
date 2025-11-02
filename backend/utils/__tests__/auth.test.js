import jwt from 'jsonwebtoken';
import { verifyToken } from '../auth.js';

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

describe('verifyToken', () => {
  it('returns payload when jwt.verify succeeds', () => {
    const payload = { id: 'user123' };
    jwt.verify.mockReturnValue(payload);

    const result = verifyToken('fake-token');

    expect(jwt.verify).toHaveBeenCalledWith('fake-token', process.env.JWT_SECRET || 'secret-key');
    expect(result).toEqual(payload);
  });

  it('throws when jwt.verify throws', () => {
    jwt.verify.mockImplementation(() => { throw new Error('invalid'); });
    expect(() => verifyToken('bad-token')).toThrow('invalid');
  });
});
