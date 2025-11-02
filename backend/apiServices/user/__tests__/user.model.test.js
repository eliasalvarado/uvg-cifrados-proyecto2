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

  test('validation helpers direct tests (exports)', async () => {
    // ensure stringFormat validators are not flagging
    jest.doMock('../../../utils/stringFormatValidators.js', () => ({ detectXSSAttempt: () => false, detectSQLInjectionAttempt: () => false }));
    const model = await import('../user.model.js');
    // validateEmail
    expect(model.validateEmail('ok@example.com')).toBe('ok@example.com');
    await expect(() => model.validateEmail('bad-email')).toThrow('Formato de email inválido');
    // validateUsername
    expect(model.validateUsername('username_ok')).toBe('username_ok');
    await expect(() => model.validateUsername('ab')).toThrow('Username debe tener al menos 3 caracteres');
    // validatePasswordHash
    expect(model.validatePasswordHash('a'.repeat(20))).toBe('a'.repeat(20));
    await expect(() => model.validatePasswordHash('short')).toThrow('Hash de password inválido');
    // validateGoogleId / MFA / search term
    await expect(() => model.validateGoogleId('')).toThrow('Google ID no puede estar vacío');
    await expect(() => model.validateMFASecret('shortsecret')).toThrow('Secreto MFA demasiado corto');
    await expect(() => model.validateSearchTerm('   ')).toThrow('Término de búsqueda vacío');
  });

  test('createGoogleUser success and duplicate and db error', async () => {
    jest.resetModules();
    const mockExecute = jest.fn().mockResolvedValue([{ insertId: 88 }]);
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    const model = await import('../user.model.js');
    const id = await model.createGoogleUser({ email: 'g@gg.com', googleId: 'gid123', publicKeyRSA: 'r', publicKeyECDSA: 'e', username: 'ggg', privateKeyRSA: 'pr', privateKeyECDSA: 'pe' });
    expect(id).toBe(88);

    jest.resetModules();
    const mockExecute2 = jest.fn().mockRejectedValue({ code: 'ER_DUP_ENTRY' });
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute2 }));
    const model2 = await import('../user.model.js');
    await expect(model2.createGoogleUser({ email: 'g@gg.com', googleId: 'gid123', publicKeyRSA: 'r', publicKeyECDSA: 'e', username: 'ggg', privateKeyRSA: 'pr', privateKeyECDSA: 'pe' })).rejects.toThrow('El email o username ya está registrado');
  });

  test('validateKey optional public and required private behavior', async () => {
    const model = await import('../user.model.js');
    // public key optional
    expect(model.validateKey(null, 'Clave pública RSA', true)).toBeNull();
    // private key required
    await expect(() => model.validateKey(null, 'Clave privada RSA', false)).toThrow('Clave privada RSA es obligatoria');
  });

  test('validateUserId accepts and rejects', async () => {
    const model = await import('../user.model.js');
    expect(model.validateUserId('5')).toBe(5);
    await expect(() => model.validateUserId('0')).toThrow('ID de usuario inválido');
  });

  test('createUser throws 500 on unexpected DB error', async () => {
    jest.resetModules();
    const mockExecute = jest.fn().mockRejectedValue(new Error('boom'));
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    const model = await import('../user.model.js');
    await expect(model.createUser({ email: 'a@b.com', username: 'uuu', passwordHash: 'x'.repeat(20), publicKeyRSA: null, publicKeyECDSA: null, privateKeyRSA: 'p', privateKeyECDSA: 'p' })).rejects.toThrow('Error al crear usuario');
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
    const saved = await model4.saveMFASecret(1, 'secret123456789012');
    expect(saved).toBe(true);
    const deleted = await model4.deleteMFASecret(1);
    expect(deleted).toBe(true);
  });

  test('getUserByEmail throws generic on DB error', async () => {
    jest.resetModules();
    const mockExecute = jest.fn().mockRejectedValue(new Error('boom'));
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    const model = await import('../user.model.js');
    await expect(model.getUserByEmail('a@b.com')).rejects.toThrow('Error al obtener usuario');
  });

  test('getUserById throws generic on DB error', async () => {
    jest.resetModules();
    const mockExecute = jest.fn().mockRejectedValue(new Error('boom'));
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    const model = await import('../user.model.js');
    await expect(model.getUserById(1)).rejects.toThrow('Error al obtener usuario');
  });

  test('saveMFASecret throws generic on DB error', async () => {
    jest.resetModules();
    const mockExecute = jest.fn().mockRejectedValue(new Error('boom'));
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    const model = await import('../user.model.js');
    await expect(model.saveMFASecret(1, 'secret123456789012')).rejects.toThrow('Error al guardar secreto MFA');
  });

  test('deleteMFASecret throws generic on DB error', async () => {
    jest.resetModules();
    const mockExecute = jest.fn().mockRejectedValue(new Error('boom'));
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    const model = await import('../user.model.js');
    await expect(model.deleteMFASecret(1)).rejects.toThrow('Error al eliminar secreto MFA');
  });

  test('searchUserByEmailOrUsername throws generic on DB error', async () => {
    jest.resetModules();
    const mockExecute = jest.fn().mockRejectedValue(new Error('boom'));
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    const model = await import('../user.model.js');
    await expect(model.searchUserByEmailOrUsername('term')).rejects.toThrow('Error al buscar usuario');
  });

  test('validateKey throws when too long', async () => {
    const model = await import('../user.model.js');
    const long = 'a'.repeat(10001);
    await expect(() => model.validateKey(long, 'Clave pública RSA', true)).toThrow('Clave pública RSA demasiado larga');
  });
});
