describe('user.route', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('router exposes expected routes', async () => {
    const router = (await import('../user.route.js')).default;
    const routes = router.stack.filter(l => l.route).map(l => ({ path: l.route.path, methods: Object.keys(l.route.methods) }));
    const paths = routes.map(r => r.path).sort();
    expect(paths).toEqual(['/', '/:userId', '/google/login', '/login', '/mfa/delete', '/mfa/setup', '/mfa/verify/:userId', '/profile', '/register', '/search/:search'].sort());
  });

  test('root route handler responds with working message', async () => {
    const router = (await import('../user.route.js')).default;
    // find the layer for path '/'
    const layer = router.stack.find(l => l.route && l.route.path === '/');
    expect(layer).toBeTruthy();
    // find the GET handler
    const getStack = layer.route.stack.find(s => s.method === 'get');
    expect(getStack).toBeTruthy();
    const handler = getStack.handle;
    const send = jest.fn();
    const req = {};
    const res = { send };
    // call handler
    await handler(req, res);
    expect(send).toHaveBeenCalledWith('User route is working!');
  });
});
