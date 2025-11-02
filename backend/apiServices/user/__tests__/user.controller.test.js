describe('user.controller', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('registerUser missing fields returns 400', async () => {
    const controller = await import('../user.controller.js');
    const req = { body: { email: 'a@b.com' } };
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const res = { status, statusMessage: '' };
    await controller.registerUser(req, res);
    expect(status).toHaveBeenCalledWith(400);
  });

  test('loginUser missing fields returns 400', async () => {
    const controller = await import('../user.controller.js');
    const req = { body: { email: 'a@b.com' } };
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const res = { status, statusMessage: '' };
    await controller.loginUser(req, res);
    expect(status).toHaveBeenCalledWith(400);
  });

  test('getUserInfo returns 404 when user not found', async () => {
    const mockGetUserById = jest.fn().mockResolvedValue(null);
    jest.doMock('../user.model.js', () => ({ getUserById: mockGetUserById }));
    const controller = await import('../user.controller.js');
    const req = { user: { id: 9 } };
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const res = { status };
    await controller.getUserInfo(req, res);
    expect(status).toHaveBeenCalledWith(404);
  });

  test('getUserByIdController calls errorSender when user not found', async () => {
    const mockGetUserById = jest.fn().mockResolvedValue(null);
    jest.doMock('../user.model.js', () => ({ getUserById: mockGetUserById }));
  const mockErrorSender = jest.fn();
  jest.doMock('../../../utils/errorSender.js', () => mockErrorSender);
    const controller = await import('../user.controller.js');
    const req = { params: { userId: '1' } };
    const res = {};
    await controller.getUserByIdController(req, res);
    expect(mockErrorSender).toHaveBeenCalled();
  });

  test('deleteMFA success returns 200', async () => {
    const mockDelete = jest.fn().mockResolvedValue(true);
    jest.doMock('../user.model.js', () => ({ deleteMFASecret: mockDelete }));
    const controller = await import('../user.controller.js');
    const req = { user: { id: 3 } };
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const res = { status };
    await controller.deleteMFA(req, res);
    expect(status).toHaveBeenCalledWith(200);
  });
});
