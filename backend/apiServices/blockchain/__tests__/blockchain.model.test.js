import crypto from 'node:crypto';

describe('blockchain.model', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('getLastBlock returns the last row from DB', async () => {
    const mockRow = { block_index: 5, hash: 'h' };
    const mockExecute = jest.fn().mockResolvedValue([[mockRow], []]);

    // mock the db module before importing the model
    jest.doMock('../../../db/connection.js', () => ({
      executeQuery: mockExecute,
    }));

    const model = await import('../blockchain.model.js');

    const last = await model.getLastBlock();

    expect(mockExecute).toHaveBeenCalledWith(
      'SELECT * FROM blockchain ORDER BY block_index DESC LIMIT 1',
      []
    );
    expect(last).toEqual(mockRow);
  });

  test('addBlock inserts a new block and returns index and hash', async () => {
    // first call: getLastBlock -> returns previous block
    const prev = { block_index: 0, hash: 'prevhash' };
    const mockExecute = jest
      .fn()
      .mockResolvedValueOnce([[prev], []]) // getLastBlock
      .mockResolvedValueOnce([{}, {}]); // insert

    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    const model = await import('../blockchain.model.js');

    const data = { from: 'a', to: 'b', msgHash: 'm', sig: 's' };
    const res = await model.addBlock(data);

    expect(res).toHaveProperty('index', 1);
    expect(res).toHaveProperty('hash');
    expect(typeof res.hash).toBe('string');
    expect(mockExecute).toHaveBeenCalledTimes(2);
  });

  test('addBlock when no previous block sets index 0 and uses GENESIS_HASH', async () => {
    const mockExecute = jest
      .fn()
      .mockResolvedValueOnce([[], []]) // getLastBlock returns empty
      .mockResolvedValueOnce([{}, {}]); // insert

    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    const model = await import('../blockchain.model.js');

    const data = { from: 'x', to: 'y', msgHash: 'm', sig: 's' };
    const res = await model.addBlock(data);

    expect(res).toHaveProperty('index', 0);
    expect(res).toHaveProperty('hash');
    expect(mockExecute).toHaveBeenCalledTimes(2);
  });

  test('addBlock throws when data is invalid', async () => {
    const mockExecute = jest.fn();
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    const model = await import('../blockchain.model.js');

    await expect(model.addBlock(null)).rejects.toThrow('El objeto ingresado no es válido');
  });

  test('getAllBlocks returns rows', async () => {
    const rows = [
      { block_index: 0, timestamp: 1000, data: 'd', hash: 'h0' },
      { block_index: 1, timestamp: 2000, data: 'd2', hash: 'h1' },
    ];
    const mockExecute = jest.fn().mockResolvedValue([rows, []]);
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    const model = await import('../blockchain.model.js');

    const all = await model.getAllBlocks();
    expect(all).toEqual(rows);
    expect(mockExecute).toHaveBeenCalledWith('SELECT * FROM blockchain ORDER BY block_index', []);
  });

  test('validateChain returns ok true for untampered chain and false for tampered', async () => {
    const GENESIS_HASH = '0'.repeat(64);

    const sha256 = (txt) => crypto.createHash('sha256').update(txt).digest('hex');

    const ts0 = 1000;
    const data0 = 'payload0';
    const h0 = sha256(GENESIS_HASH + ts0.toString() + data0);
    const blk0 = { block_index: 0, timestamp: ts0, data: data0, hash: h0 };

    const ts1 = 2000;
    const data1 = 'payload1';
    const h1 = sha256(h0 + ts1.toString() + data1);
    const blk1 = { block_index: 1, timestamp: ts1, data: data1, hash: h1 };

    // valid chain
    let mockExecute = jest.fn().mockResolvedValue([[blk0, blk1], []]);
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    let model = await import('../blockchain.model.js');
    let result = await model.validateChain();
    expect(result).toEqual({ ok: true, firstTamperedIndex: null });

    // tampered chain (change blk1.hash)
    const tampered = { ...blk1, hash: 'badhash' };
    jest.resetModules();
    mockExecute = jest.fn().mockResolvedValue([[blk0, tampered], []]);
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    model = await import('../blockchain.model.js');
    result = await model.validateChain();
    expect(result).toEqual({ ok: false, firstTamperedIndex: tampered.block_index });
  });
});
