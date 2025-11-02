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
});
