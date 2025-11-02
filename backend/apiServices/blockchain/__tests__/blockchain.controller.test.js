describe('blockchain.controller', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('createTransaction responds 201 and json on success', async () => {
    const mockAddBlock = jest.fn().mockResolvedValue({ index: 2, hash: 'hh' });
    const mockGetAll = jest.fn();
    const mockValidate = jest.fn();

    jest.doMock('../blockchain.model.js', () => ({
      addBlock: mockAddBlock,
      getAllBlocks: mockGetAll,
      validateChain: mockValidate,
    }));

    const mockErrorSender = jest.fn();
    jest.doMock('../../../utils/errorSender.js', () => mockErrorSender);

    const controller = await import('../blockchain.controller.js');

    const req = { body: { from: 'a', to: 'b', msgHash: 'm', sig: 's' } };
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res = { status };

    await controller.createTransaction(req, res);

    expect(mockAddBlock).toHaveBeenCalledWith(req.body);
    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith({ message: 'Bloque añadido', index: 2, hash: 'hh' });
    expect(mockErrorSender).not.toHaveBeenCalled();
  });

  test('createTransaction calls errorSender on error', async () => {
    const mockAddBlock = jest.fn().mockRejectedValue(new Error('db fail'));
  jest.doMock('../blockchain.model.js', () => ({ addBlock: mockAddBlock }));

  const mockErrorSender = jest.fn();
  jest.doMock('../../../utils/errorSender.js', () => mockErrorSender);

    const controller = await import('../blockchain.controller.js');

    const req = { body: { from: 'a', to: 'b', msgHash: 'm', sig: 's' } };
    const res = {};

    await controller.createTransaction(req, res);

    expect(mockErrorSender).toHaveBeenCalled();
  });

  test('listTransactions returns chain and validation on success', async () => {
    const chain = [{ block_index: 0 }];
    const validation = { ok: true, firstTamperedIndex: null };

    const mockGetAll = jest.fn().mockResolvedValue(chain);
    const mockValidate = jest.fn().mockResolvedValue(validation);

    jest.doMock('../blockchain.model.js', () => ({
      getAllBlocks: mockGetAll,
      validateChain: mockValidate,
    }));

    const mockErrorSender = jest.fn();
    jest.doMock('../../../utils/errorSender.js', () => mockErrorSender);

    const controller = await import('../blockchain.controller.js');

    const json = jest.fn();
    const res = { json };

    await controller.listTransactions({}, res);

    expect(mockGetAll).toHaveBeenCalled();
    expect(mockValidate).toHaveBeenCalled();
    expect(json).toHaveBeenCalledWith({ chain, validation });
    expect(mockErrorSender).not.toHaveBeenCalled();
  });

  test('listTransactions calls errorSender on error', async () => {
    const mockGetAll = jest.fn().mockRejectedValue(new Error('fail'));
  jest.doMock('../blockchain.model.js', () => ({ getAllBlocks: mockGetAll }));

  const mockErrorSender = jest.fn();
  jest.doMock('../../../utils/errorSender.js', () => mockErrorSender);

    const controller = await import('../blockchain.controller.js');

    const res = {};
    await controller.listTransactions({}, res);

    expect(mockErrorSender).toHaveBeenCalled();
  });
});
