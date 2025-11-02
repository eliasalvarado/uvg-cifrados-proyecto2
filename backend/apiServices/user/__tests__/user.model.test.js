describe('user.model', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('createUser throws on invalid email format', async () => {
    const model = await import('../user.model.js');
    await expect(model.createUser({ email: 'bad-email', passwordHash: 'x'.repeat(20), username: 'u1', publicKeyRSA: null, publicKeyECDSA: null, privateKeyRSA: 'p', privateKeyECDSA: 'p' })).rejects.toThrow('Formato de email inválido');
  });

  test('createUser handles ER_DUP_ENTRY and throws 409', async () => {
    const mockExecute = jest.fn().mockRejectedValue({ code: 'ER_DUP_ENTRY' });
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    const model = await import('../user.model.js');
    await expect(model.createUser({ email: 'a@b.com', passwordHash: 'x'.repeat(20), username: 'user1', publicKeyRSA: null, publicKeyECDSA: null, privateKeyRSA: 'p', privateKeyECDSA: 'p' })).rejects.toThrow('ya está registrado');
  });

  test('getUserByEmail returns user row or null', async () => {
    const rows = [{ id: 5, email: 'a@b.com' }];
    const mockExecute = jest.fn().mockResolvedValue([rows, []]);
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    const model = await import('../user.model.js');
    const r = await model.getUserByEmail('a@b.com');
    expect(r).toEqual(rows[0]);
  });

  test('saveMFASecret returns true on affectedRows>0', async () => {
    const mockExecute = jest.fn().mockResolvedValue([{ affectedRows: 1 }]);
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    const model = await import('../user.model.js');
    const ok = await model.saveMFASecret(3, 'secret123456789012');
    expect(ok).toBe(true);
  });

  test('deleteMFASecret returns false when no affected rows', async () => {
    const mockExecute = jest.fn().mockResolvedValue([{ affectedRows: 0 }]);
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    const model = await import('../user.model.js');
    const ok = await model.deleteMFASecret(2);
    expect(ok).toBe(false);
  });

  test('searchUserByEmailOrUsername returns null when not found', async () => {
    const mockExecute = jest.fn().mockResolvedValue([[], []]);
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    const model = await import('../user.model.js');
    const res = await model.searchUserByEmailOrUsername('noexist');
    expect(res).toBeNull();
  });

  test('validation helpers and db branches', async () => {
    jest.resetModules();
  const model = await import('../user.model.js');
  // validations exercised via exported functions (validate helpers are internal)
  await expect(model.getUserByEmail('notanemail')).rejects.toThrow('Formato de email inválido');
  await expect(model.createUser({ email: 'bad-email', passwordHash: 'x'.repeat(20), username: 'u1', publicKeyRSA: null, publicKeyECDSA: null, privateKeyRSA: 'p', privateKeyECDSA: 'p' })).rejects.toThrow('Formato de email inválido');

    // createUser success
    jest.resetModules();
    const mockExecute = jest.fn().mockResolvedValue([{ insertId: 11 }]);
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    const model2 = await import('../user.model.js');
    const id = await model2.createUser({ email: 'a@b.com', username: 'uuu', passwordHash: 'x'.repeat(20), publicKeyRSA: null, publicKeyECDSA: null, privateKeyRSA: 'p', privateKeyECDSA: 'p' });
    expect(id).toBe(11);

    // getUserByEmail/getUserById/search
    jest.resetModules();
    const rows = [[{ id: 2, email: 'a@b.com' }], []];
    const mockExecute2 = jest.fn().mockResolvedValue(rows);
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute2 }));
    const model3 = await import('../user.model.js');
    const u = await model3.getUserByEmail('a@b.com');
    expect(u.email).toBe('a@b.com');
    const u2 = await model3.getUserById(2);
    expect(u2.id).toBe(2);

    // save/delete mfa
    jest.resetModules();
    const mockExecute3 = jest.fn().mockResolvedValue([{ affectedRows: 1 }]);
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute3 }));
    const model4 = await import('../user.model.js');
    const saved = await model4.saveMFASecret(1, 'secretbase32long');
    expect(saved).toBe(true);
    const deleted = await model4.deleteMFASecret(1);
    expect(deleted).toBe(true);
  });
});
