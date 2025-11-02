describe('chat.route', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('router has expected routes and middlewares', async () => {
    const router = (await import('../chat.route.js')).default;
    // express Router stores layers in router.stack; filter route layers
    const routes = router.stack.filter(l => l.route).map(l => ({ path: l.route.path, methods: Object.keys(l.route.methods), handlers: l.route.stack.map(s => s.name) }));

    // Expect routes for single (get), single/:userId (post), group (post/get), group/join (post), group/:groupId (post)
    const paths = routes.map(r => r.path).sort();
    expect(paths).toEqual(['/group', '/group', '/group/:groupId', '/group/join', '/single', '/single/:userId'].sort());

    const singlePost = routes.find(r => r.path === '/single/:userId');
    expect(singlePost.methods).toContain('post');
    // handler names should include sendMessageController (last handler)
    expect(singlePost.handlers.pop()).toBe('sendMessageController');

    const groupGet = routes.find(r => r.path === '/group' && r.methods.includes('get'));
    expect(groupGet.handlers.pop()).toBe('getGroupChatsController');
  });
});