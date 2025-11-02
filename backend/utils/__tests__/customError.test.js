import CustomError from '../customError.js';

describe('CustomError', () => {
  it('creates an Error with message and status', () => {
    const e = new CustomError('fail', 400);
    expect(e).toBeInstanceOf(Error);
    expect(e.message).toBe('fail');
    expect(e.status).toBe(400);
  });
});
