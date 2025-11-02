describe('blockchain extra tests (validations and routes)', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('addBlock rejects when detectXSSAttempt returns true', async () => {
    const mockExecute = jest.fn();
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    jest.doMock('../../../utils/stringFormatValidators.js', () => ({
      detectXSSAttempt: () => true,
      detectSQLInjectionAttempt: () => false,
    }));

    const model = await import('../blockchain.model.js');

    await expect(model.addBlock({ a: 'b' })).rejects.toThrow('El objeto contiene un potencial intento de XSS');
  });

  test('addBlock rejects when detectSQLInjectionAttempt returns true', async () => {
    const mockExecute = jest.fn();
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    jest.doMock('../../../utils/stringFormatValidators.js', () => ({
      detectXSSAttempt: () => false,
      detectSQLInjectionAttempt: () => true,
    }));

    const model = await import('../blockchain.model.js');

    await expect(model.addBlock({ a: 'b' })).rejects.toThrow('El objeto contiene un potencial intento de inyección SQL');
  });

  test('addBlock rejects when object too large', async () => {
    const mockExecute = jest.fn();
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    jest.doMock('../../../utils/stringFormatValidators.js', () => ({
      detectXSSAttempt: () => false,
      detectSQLInjectionAttempt: () => false,
    }));

    const model = await import('../blockchain.model.js');

    const big = 'x'.repeat(1000001);
    await expect(model.addBlock({ payload: big })).rejects.toThrow('El objeto es demasiado grande');
  });

  test('addBlock rejects when object not serializable (circular)', async () => {
    const mockExecute = jest.fn();
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    jest.doMock('../../../utils/stringFormatValidators.js', () => ({
      detectXSSAttempt: () => false,
      detectSQLInjectionAttempt: () => false,
    }));

    const model = await import('../blockchain.model.js');

    const a = {};
    a.self = a;

    await expect(model.addBlock(a)).rejects.toThrow('El objeto no es serializable');
  });

  test('createTransaction with missing fields calls errorSender (validation path)', async () => {
    const mockAddBlock = jest.fn();
    jest.doMock('../blockchain.model.js', () => ({ addBlock: mockAddBlock }));

    const mockErrorSender = jest.fn();
    jest.doMock('../../../utils/errorSender.js', () => mockErrorSender);

    const controller = await import('../blockchain.controller.js');

    const req = { body: { from: 'a', to: null } };
    const res = {};

    await controller.createTransaction(req, res);

    expect(mockErrorSender).toHaveBeenCalled();
  });

  test('route exposes POST and GET for /', async () => {
    const router = (await import('../blockchain.route.js')).default;

    // express.Router stores routes in stack entries with .route
    const routes = router.stack.filter((s) => s.route).map((s) => ({ path: s.route.path, methods: s.route.methods }));

    expect(routes).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: '/', methods: expect.objectContaining({ post: true }) }),
      expect.objectContaining({ path: '/', methods: expect.objectContaining({ get: true }) }),
    ]));
  });
});
