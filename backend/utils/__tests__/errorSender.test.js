import errorSender from '../errorSender.js';
import CustomError from '../customError.js';

jest.mock('node:fs', () => ({
  existsSync: jest.fn(() => false),
  mkdirSync: jest.fn(),
  appendFileSync: jest.fn(),
}));

describe('errorSender', () => {
  it('writes log and sends CustomError response', async () => {
    const res = {
      statusMessage: '',
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const ex = new CustomError('boom', 404);

    await errorSender({ res, ex });

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({ err: 'boom', status: 404, ok: false });
  });

  it('uses default message when ex is undefined', async () => {
    const res = {
      statusMessage: '',
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await errorSender({ res, ex: undefined, defaultError: 'def', defaultStatus: 501 });

    expect(res.status).toHaveBeenCalledWith(501);
    expect(res.send).toHaveBeenCalledWith({ err: 'def', status: 501, ok: false });
  });

  it('does not create logs dir when it already exists', async () => {
    // change mock to simulate existing dir
    const fs = require('node:fs');
    fs.existsSync.mockReturnValue(true);
    fs.mkdirSync.mockClear();
    const res = {
      statusMessage: '',
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const ex = new Error('x');
    await errorSender({ res, ex });
    expect(fs.mkdirSync).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalled();
  });
});
