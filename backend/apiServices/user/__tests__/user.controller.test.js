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

  test('registerUser success and createUser throws -> errorSender called', async () => {
    // success path
    jest.resetModules();
    const mockGetUser = jest.fn().mockResolvedValue(null);
    const mockCreate = jest.fn().mockResolvedValue(77);
    jest.doMock('../user.model.js', () => ({ getUserByEmail: mockGetUser, createUser: mockCreate }));
    jest.doMock('argon2', () => ({ hash: jest.fn().mockResolvedValue('hashed') }));
  // mock utils paths relative to the __tests__ folder
  jest.doMock('../../../utils/cypher/RSA.js', () => ({ generateRSAKeys: () => ({ publicKey: 'rp', privateKey: 'rk' }) }));
  jest.doMock('../../../utils/cypher/ECDSA.js', () => ({ generateECDSAKeys: () => ({ publicKey: 'ep', privateKey: 'ek' }) }));
    jest.doMock('jsonwebtoken', () => ({ sign: jest.fn().mockReturnValue('tkn') }));
    let controller = await import('../user.controller.js');
    let req = { body: { email: 'ok@ok.com', username: 'u', password: 'passwordlong' } };
    let json = jest.fn();
    let status = jest.fn().mockReturnValue({ json });
    let res = { status };
    await controller.registerUser(req, res);
    expect(status).toHaveBeenCalledWith(201);

    // createUser throws -> errorSender
    jest.resetModules();
    const mockGet2 = jest.fn().mockResolvedValue(null);
    const mockCreate2 = jest.fn().mockRejectedValue(new Error('boom'));
    const mockErrorSender = jest.fn();
    jest.doMock('../user.model.js', () => ({ getUserByEmail: mockGet2, createUser: mockCreate2 }));
  jest.doMock('../../../utils/errorSender.js', () => mockErrorSender);
    jest.doMock('argon2', () => ({ hash: jest.fn().mockResolvedValue('h') }));
    jest.doMock('../../../utils/cypher/RSA.js', () => ({ generateRSAKeys: () => ({ publicKey: 'rp', privateKey: 'rk' }) }));
    jest.doMock('../../../utils/cypher/ECDSA.js', () => ({ generateECDSAKeys: () => ({ publicKey: 'ep', privateKey: 'ek' }) }));
    controller = await import('../user.controller.js');
    req = { body: { email: 'err@err.com', username: 'u', password: 'passwordlong' } };
    res = {};
    await controller.registerUser(req, res);
    expect(mockErrorSender).toHaveBeenCalled();
  });

  test('loginUser flows: not found, invalid password, mfa enabled, success', async () => {
    jest.resetModules();
    // not found
    let mockGet = jest.fn().mockResolvedValue(null);
    jest.doMock('../user.model.js', () => ({ getUserByEmail: mockGet }));
    let controller = await import('../user.controller.js');
    let req = { body: { email: 'no@u.com', password: 'p' } };
    let json = jest.fn();
    let status = jest.fn().mockReturnValue({ json });
    let res = { status };
    await controller.loginUser(req, res);
    expect(status).toHaveBeenCalledWith(401);

    // invalid password
    jest.resetModules();
    const mockGet2 = jest.fn().mockResolvedValue({ id: 1, password_hash: 'h' });
    jest.doMock('../user.model.js', () => ({ getUserByEmail: mockGet2 }));
    jest.doMock('argon2', () => ({ verify: jest.fn().mockResolvedValue(false) }));
    controller = await import('../user.controller.js');
    req = { body: { email: 'u@u.com', password: 'bad' } };
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    res = { status };
    await controller.loginUser(req, res);
    expect(status).toHaveBeenCalledWith(401);

    // mfa enabled
    jest.resetModules();
    const mockGet3 = jest.fn().mockResolvedValue({ id: 2, password_hash: 'h', mfa_enabled: true });
    jest.doMock('../user.model.js', () => ({ getUserByEmail: mockGet3 }));
    jest.doMock('argon2', () => ({ verify: jest.fn().mockResolvedValue(true) }));
    controller = await import('../user.controller.js');
    req = { body: { email: 'u@u.com', password: 'ok' } };
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    res = { status };
    await controller.loginUser(req, res);
    expect(status).toHaveBeenCalledWith(200);

    // success
    jest.resetModules();
    const mockGet4 = jest.fn().mockResolvedValue({ id: 3, password_hash: 'h', mfa_enabled: false, rsa_private_key: 'p', rsa_public_key: 'q', ecdsa_private_key: 'r', ecdsa_public_key: 's' });
    jest.doMock('../user.model.js', () => ({ getUserByEmail: mockGet4 }));
    jest.doMock('argon2', () => ({ verify: jest.fn().mockResolvedValue(true) }));
    jest.doMock('jsonwebtoken', () => ({ sign: jest.fn().mockReturnValue('tkn') }));
    controller = await import('../user.controller.js');
    req = { body: { email: 'u@u.com', password: 'ok' } };
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    res = { status };
    await controller.loginUser(req, res);
    expect(status).toHaveBeenCalledWith(200);
  });

  test('loginGoogleUser flows: missing token, existing user branches and new user created', async () => {
    // missing token
    jest.resetModules();
    let controller = await import('../user.controller.js');
    let req = { body: {} };
    let json = jest.fn();
    let status = jest.fn().mockReturnValue({ json });
    let res = { status };
    await controller.loginGoogleUser(req, res);
    expect(status).toHaveBeenCalledWith(400);

    // existing user with MFA enabled
    jest.resetModules();
    const mockUser = { id: 9, email: 'e@e.com', mfa_enabled: true, rsa_private_key: 'p', rsa_public_key: 'q', ecdsa_private_key: 'r', ecdsa_public_key: 's' };
    const mockGet = jest.fn().mockResolvedValue(mockUser);
    jest.doMock('../user.model.js', () => ({ getUserByEmail: mockGet }));
    jest.doMock('google-auth-library', () => ({ OAuth2Client: function() { return { verifyIdToken: async () => ({ getPayload: () => ({ email: 'e@e.com', sub: 'gid', name: 'Name' }) }) } } }));
    controller = await import('../user.controller.js');
    req = { body: { token: 'tok' } };
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    res = { status };
    await controller.loginGoogleUser(req, res);
    expect(status).toHaveBeenCalledWith(200);

    // existing user without MFA
    jest.resetModules();
    const mockUser2 = { id: 10, email: 'f@f.com', mfa_enabled: false, rsa_private_key: 'p', rsa_public_key: 'q', ecdsa_private_key: 'r', ecdsa_public_key: 's' };
    const mockGet2 = jest.fn().mockResolvedValue(mockUser2);
    jest.doMock('../user.model.js', () => ({ getUserByEmail: mockGet2 }));
    jest.doMock('jsonwebtoken', () => ({ sign: jest.fn().mockReturnValue('tokjwt') }));
    jest.doMock('google-auth-library', () => ({ OAuth2Client: function() { return { verifyIdToken: async () => ({ getPayload: () => ({ email: 'f@f.com', sub: 'gid2', name: 'F' }) }) } } }));
    controller = await import('../user.controller.js');
    req = { body: { token: 'tok' } };
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    res = { status };
    await controller.loginGoogleUser(req, res);
    expect(status).toHaveBeenCalledWith(200);

    // new user created path
    jest.resetModules();
    const mockGet3 = jest.fn().mockResolvedValue(null);
    const mockCreateGoogle = jest.fn().mockResolvedValue(123);
    jest.doMock('../user.model.js', () => ({ getUserByEmail: mockGet3, createGoogleUser: mockCreateGoogle }));
    jest.doMock('../../../utils/cypher/RSA.js', () => ({ generateRSAKeys: () => ({ publicKey: 'rp', privateKey: 'rk' }) }));
    jest.doMock('../../../utils/cypher/ECDSA.js', () => ({ generateECDSAKeys: () => ({ publicKey: 'ep', privateKey: 'ek' }) }));
    jest.doMock('google-auth-library', () => ({ OAuth2Client: function() { return { verifyIdToken: async () => ({ getPayload: () => ({ email: 'n@n.com', sub: 'gidn', name: 'N' }) }) } } }));
    jest.doMock('jsonwebtoken', () => ({ sign: jest.fn().mockReturnValue('newjwt') }));
    controller = await import('../user.controller.js');
    req = { body: { token: 'tok' } };
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    res = { status };
    await controller.loginGoogleUser(req, res);
    expect(status).toHaveBeenCalledWith(201);
  });

  test('registerUser when user already exists returns 400', async () => {
    jest.resetModules();
    const mockGet = jest.fn().mockResolvedValue({ id: 1 });
    jest.doMock('../user.model.js', () => ({ getUserByEmail: mockGet }));
    const controller = await import('../user.controller.js');
    const req = { body: { email: 'exists@e.com', username: 'u', password: 'passlong' } };
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const res = { status };
    await controller.registerUser(req, res);
    expect(status).toHaveBeenCalledWith(400);
  });

  test('getUserInfo returns 200 when user exists', async () => {
    const mockGet = jest.fn().mockResolvedValue({ id: 2, username: 'u', email: 'u@u.com', rsa_public_key: 'r', ecdsa_public_key: 'e', mfa_enabled: false });
    jest.doMock('../user.model.js', () => ({ getUserById: mockGet }));
    const controller = await import('../user.controller.js');
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const req = { user: { id: 2 } };
    const res = { status };
    await controller.getUserInfo(req, res);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ id: 2, email: 'u@u.com', username: 'u' }));
  });

  test('getUserByIdController success returns 200', async () => {
    jest.resetModules();
    const mockGet = jest.fn().mockResolvedValue({ id: 3, email: 'e@e.com', username: 'name', rsa_public_key: 'r', ecdsa_public_key: 'e' });
    jest.doMock('../user.model.js', () => ({ getUserById: mockGet }));
    const controller = await import('../user.controller.js');
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const req = { params: { userId: '3' } };
    const res = { status };
    await controller.getUserByIdController(req, res);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ id: 3, email: 'e@e.com' }));
  });

  test('deleteMFA when delete fails calls errorSender', async () => {
    jest.resetModules();
    const mockDelete = jest.fn().mockResolvedValue(false);
    const mockErrorSender = jest.fn();
    jest.doMock('../user.model.js', () => ({ deleteMFASecret: mockDelete }));
    jest.doMock('../../../utils/errorSender.js', () => mockErrorSender);
    const controller = await import('../user.controller.js');
    const req = { user: { id: 5 } };
    const res = {};
    await controller.deleteMFA(req, res);
    expect(mockErrorSender).toHaveBeenCalled();
  });

  test('searchUserController missing param calls errorSender', async () => {
    jest.resetModules();
    const mockErrorSender = jest.fn();
    jest.doMock('../../../utils/errorSender.js', () => mockErrorSender);
    const controller = await import('../user.controller.js');
    const req = { params: {} };
    const res = {};
    await controller.searchUserController(req, res);
    expect(mockErrorSender).toHaveBeenCalled();
  });

  test('searchUserController returns 200 when user found', async () => {
    jest.resetModules();
    const mockSearch = jest.fn().mockResolvedValue({ id: 7, email: 's@e.com', username: 'search', rsa_public_key: 'r', ecdsa_public_key: 'e' });
    jest.doMock('../user.model.js', () => ({ searchUserByEmailOrUsername: mockSearch }));
    const controller = await import('../user.controller.js');
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const req = { params: { search: 'search' } };
    const res = { status };
    await controller.searchUserController(req, res);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ ok: true, result: expect.objectContaining({ id: 7 }) }));
  });

});
