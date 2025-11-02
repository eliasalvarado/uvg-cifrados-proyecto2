describe('chat.model', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('getUserMessages maps rows and verifies signatures', async () => {
    const rows = [
      { id: 1, message: 'hello', origin_user_id: 2, target_user_id: 3, created_at: '2020-01-01', origin_key: 'o', target_key: 't', signature: 'sig', signature_key: 'pub' }
    ];

    const mockExecute = jest.fn().mockResolvedValue([rows, []]);
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    // verifySignature returns true
    jest.doMock('../../../utils/cypher/ECDSA.js', () => ({ verifySignature: () => true }));
    jest.doMock('../../../utils/stringFormatValidators.js', () => ({ detectXSSAttempt: () => false, detectSQLInjectionAttempt: () => false }));

    const model = await import('../chat.model.js');
    const msgs = await model.getUserMessages(3);

    expect(msgs).toHaveLength(1);
    expect(msgs[0].isValid).toBe(true);
    expect(msgs[0].signature_key).toBeUndefined();
  });

  test('getUserMessages handles verifySignature throwing and returns isValid false', async () => {
    const rows = [ { id: 1, message: 'bad', origin_user_id: 2, target_user_id: 3, created_at: '2020', origin_key: '', target_key: '', signature: 'sig', signature_key: 'pub' } ];
    const mockExecute = jest.fn().mockResolvedValue([rows, []]);
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    jest.doMock('../../../utils/cypher/ECDSA.js', () => ({ verifySignature: () => { throw new Error('fail'); } }));
    jest.doMock('../../../utils/stringFormatValidators.js', () => ({ detectXSSAttempt: () => false, detectSQLInjectionAttempt: () => false }));

    const model = await import('../chat.model.js');
    const msgs = await model.getUserMessages(3);

    expect(msgs[0].isValid).toBe(false);
  });

  test('insertMessage validates and returns true on affectedRows===1', async () => {
    const mockExecute = jest.fn().mockResolvedValue([{ affectedRows: 1 }, {}]);
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    jest.doMock('../../../utils/stringFormatValidators.js', () => ({ detectXSSAttempt: () => false, detectSQLInjectionAttempt: () => false }));

    const model = await import('../chat.model.js');

    const ok = await model.insertMessage({ message: 'hi', originUserId: 1, targetUserId: 2, originKey: 'k', targetKey: 'k2', signature: 's' });
    expect(ok).toBe(true);
  });

  test('insertMessage rejects when origin equals target', async () => {
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: jest.fn() }));
    jest.doMock('../../../utils/stringFormatValidators.js', () => ({ detectXSSAttempt: () => false, detectSQLInjectionAttempt: () => false }));
    const model = await import('../chat.model.js');

    await expect(model.insertMessage({ message: 'x', originUserId: 1, targetUserId: 1, originKey: 'k', targetKey: 'k', signature: 's' })).rejects.toThrow('No puedes enviarte mensajes a ti mismo');
  });

  test('insertGroup handles ER_DUP_ENTRY and throws 409', async () => {
    const mockExecute = jest.fn().mockRejectedValue({ code: 'ER_DUP_ENTRY' });
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    jest.doMock('../../../utils/stringFormatValidators.js', () => ({ detectXSSAttempt: () => false, detectSQLInjectionAttempt: () => false }));

    const model = await import('../chat.model.js');

    await expect(model.insertGroup({ name: 'g', creatorId: 1, key: 'k' })).rejects.toThrow('ya existe');
  });

  test('getGroupByName returns parsed group when found', async () => {
    const rows = [ { id: 7, name: 'g', key: 'k', creator_id: 1 } ];
    const mockExecute = jest.fn().mockResolvedValue([rows, []]);
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    jest.doMock('../../../utils/stringFormatValidators.js', () => ({ detectXSSAttempt: () => false, detectSQLInjectionAttempt: () => false }));

    const model = await import('../chat.model.js');
    const r = await model.getGroupByName('g');
    expect(r).toEqual({ groupId: 7, name: 'g', key: 'k', creatorId: 1 });
  });

  test('verifyIfUserIsGroupMember returns true when count>0', async () => {
    const rows = [ { count: 1 } ];
    const mockExecute = jest.fn().mockResolvedValue([rows, []]);
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    const model = await import('../chat.model.js');
    const res = await model.verifyIfUserIsGroupMember(1,2);
    expect(res).toBe(true);
  });

  test('getGroupsForUser groups rows correctly', async () => {
    const rows = [
      { groupId: 1, name: 'g1', key: 'k', creatorId: 1, memberId: 10 },
      { groupId: 1, name: 'g1', key: 'k', creatorId: 1, memberId: 11 },
      { groupId: 2, name: 'g2', key: 'k2', creatorId: 2, memberId: 20 }
    ];
    const mockExecute = jest.fn().mockResolvedValue([rows, []]);
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    const model = await import('../chat.model.js');
    const groups = await model.getGroupsForUser(1);
    expect(groups).toHaveLength(2);
    const g1 = groups.find(g => g.groupId === 1);
    expect(g1.members).toEqual([10,11]);
  });

  test('getUserMessages invalid id throws CustomError', async () => {
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: jest.fn() }));
    const model = await import('../chat.model.js');
    await expect(model.getUserMessages('not-a-number')).rejects.toThrow('ID de usuario inválido');
  });

  test('insertMessage rejects when message is not a string', async () => {
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: jest.fn() }));
    jest.doMock('../../../utils/stringFormatValidators.js', () => ({ detectXSSAttempt: () => false, detectSQLInjectionAttempt: () => false }));
    const model = await import('../chat.model.js');
    await expect(model.insertMessage({ message: 12345, originUserId: 1, targetUserId: 2, originKey: 'k', targetKey: 'k2', signature: 's' })).rejects.toThrow('El mensaje debe ser texto');
  });

  test('insertGroup returns insertId on success', async () => {
    const mockExecute = jest.fn().mockResolvedValue([{ affectedRows: 1, insertId: 99 }, {}]);
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    jest.doMock('../../../utils/stringFormatValidators.js', () => ({ detectXSSAttempt: () => false, detectSQLInjectionAttempt: () => false }));
    const model = await import('../chat.model.js');
    const id = await model.insertGroup({ name: 'newgrp', creatorId: 3, key: 'k' });
    expect(id).toBe(99);
  });

  test('insertGroupMember ER_DUP_ENTRY throws 409', async () => {
    const mockExecute = jest.fn().mockRejectedValue({ code: 'ER_DUP_ENTRY' });
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    const model = await import('../chat.model.js');
    await expect(model.insertGroupMember({ groupId: 1, userId: 2 })).rejects.toThrow('ya es miembro');
  });

  test('getGroupMembersId returns user ids array', async () => {
    const rows = [{ user_id: 5 }, { user_id: 6 }];
    const mockExecute = jest.fn().mockResolvedValue([rows, []]);
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    const model = await import('../chat.model.js');
    const res = await model.getGroupMembersId(1);
    expect(res).toEqual([5,6]);
  });

  test('getGroupsIdForUser returns ids', async () => {
    const rows = [{ id: 8 }];
    const mockExecute = jest.fn().mockResolvedValue([rows, []]);
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    const model = await import('../chat.model.js');
    const res = await model.getGroupsIdForUser(1);
    expect(res).toEqual([8]);
  });

  test('getUserContacts returns rows as-is', async () => {
    const rows = [{ id: 2, email: 'a@x', username: 'u' }];
    const mockExecute = jest.fn().mockResolvedValue([rows, []]);
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    const model = await import('../chat.model.js');
    const res = await model.getUserContacts(1);
    expect(res).toEqual(rows);
  });

  test('getUserGroupMessages sanitizes signature before verifySignature', async () => {
    const rows = [{ id: 1, message: 'hello', group_id: 2, user_id: 3, created_at: 't', sent: 0, username: 'u', signature: 's i g', signature_key: 'pub' }];
    const mockExecute = jest.fn().mockResolvedValue([rows, []]);
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    jest.doMock('../../../utils/stringFormatValidators.js', () => ({ detectXSSAttempt: () => false, detectSQLInjectionAttempt: () => false }));
    jest.doMock('../../../utils/cypher/ECDSA.js', () => ({ verifySignature: (message, signature, key) => { expect(signature).toBe('sig'); return true; } }));
    const model = await import('../chat.model.js');
    const msgs = await model.getUserGroupMessages(3);
    expect(msgs[0].isValid).toBe(true);
  });

  test('getUserGroupMessages when SQL injection detected calls errorSender', async () => {
    const rows = [{ id: 1, message: 'bad', group_id: 2, user_id: 3, created_at: 't', sent: 0, username: 'u', signature: 's', signature_key: 'pub' }];
    const mockExecute = jest.fn().mockResolvedValue([rows, []]);
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    const mockErrorSender = jest.fn();
    jest.doMock('../../../utils/errorSender.js', () => mockErrorSender);
    jest.doMock('../../../utils/stringFormatValidators.js', () => ({ detectXSSAttempt: () => false, detectSQLInjectionAttempt: () => true }));
    jest.doMock('../../../utils/cypher/ECDSA.js', () => ({ verifySignature: () => true }));
    const model = await import('../chat.model.js');
    const msgs = await model.getUserGroupMessages(3);
    expect(mockErrorSender).toHaveBeenCalled();
    expect(msgs[0].isValid).toBe(false);
  });

  test('insertGroupMessage rejects when message too long', async () => {
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: jest.fn() }));
    jest.doMock('../../../utils/stringFormatValidators.js', () => ({ detectXSSAttempt: () => false, detectSQLInjectionAttempt: () => false }));
    const model = await import('../chat.model.js');
    const longMsg = 'a'.repeat(10001);
    await expect(model.insertGroupMessage({ message: longMsg, groupId: 1, userId: 2, signature: 's' })).rejects.toThrow('demasiado largo');
  });

  test('insertGroup throws when affectedRows !== 1', async () => {
    const mockExecute = jest.fn().mockResolvedValue([{ affectedRows: 0 }, {}]);
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    jest.doMock('../../../utils/stringFormatValidators.js', () => ({ detectXSSAttempt: () => false, detectSQLInjectionAttempt: () => false }));
    const model = await import('../chat.model.js');
    await expect(model.insertGroup({ name: 'x', creatorId: 1, key: 'k' })).rejects.toThrow('No se pudo crear el grupo');
  });

  test('insertGroupMember generic error calls errorSender and throws', async () => {
    const mockExecute = jest.fn().mockRejectedValue(new Error('db fail'));
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    const mockErrorSender = jest.fn();
    jest.doMock('../../../utils/errorSender.js', () => mockErrorSender);
    const model = await import('../chat.model.js');
    await expect(model.insertGroupMember({ groupId: 1, userId: 2 })).rejects.toThrow('Error al añadir miembro al grupo');
    expect(mockErrorSender).toHaveBeenCalled();
  });

  test('getGroupByName validation errors propagate', async () => {
    const model = await import('../chat.model.js');
    await expect(model.getGroupByName(123)).rejects.toThrow('El nombre del grupo debe ser texto');
  });

  test('insertMessage detects SQL injection via validator', async () => {
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: jest.fn() }));
    jest.doMock('../../../utils/stringFormatValidators.js', () => ({ detectXSSAttempt: () => false, detectSQLInjectionAttempt: () => true }));
    const model = await import('../chat.model.js');
    await expect(model.insertMessage({ message: 'select *', originUserId: 1, targetUserId: 2, originKey: 'k', targetKey: 'k2', signature: 's' })).rejects.toThrow('inyección SQL');
  });

  test('getGroupsIdForUser invalid id throws', async () => {
    const model = await import('../chat.model.js');
    await expect(model.getGroupsIdForUser('x')).rejects.toThrow('ID de usuario inválido');
  });

  test('getUserGroupMessages invalid id throws', async () => {
    const model = await import('../chat.model.js');
    await expect(model.getUserGroupMessages('x')).rejects.toThrow('ID de usuario inválido');
  });

  test('getUserMessages on DB error calls errorSender and throws', async () => {
    const mockExecute = jest.fn().mockRejectedValue(new Error('db'));
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    const mockErrorSender = jest.fn();
    jest.doMock('../../../utils/errorSender.js', () => mockErrorSender);
    const model = await import('../chat.model.js');
    await expect(model.getUserMessages(1)).rejects.toThrow('Error al obtener mensajes');
    expect(mockErrorSender).toHaveBeenCalled();
  });

  test('insertGroupMessage success returns true', async () => {
    const mockExecute = jest.fn().mockResolvedValue([{ affectedRows: 1 }, {}]);
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    jest.doMock('../../../utils/stringFormatValidators.js', () => ({ detectXSSAttempt: () => false, detectSQLInjectionAttempt: () => false }));
    const model = await import('../chat.model.js');
    const ok = await model.insertGroupMessage({ message: 'ok', groupId: 1, userId: 2, signature: 's' });
    expect(ok).toBe(true);
  });

  test('insertMessage invalid signature type throws', async () => {
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: jest.fn() }));
    jest.doMock('../../../utils/stringFormatValidators.js', () => ({ detectXSSAttempt: () => false, detectSQLInjectionAttempt: () => false }));
    const model = await import('../chat.model.js');
    await expect(model.insertMessage({ message: 'hi', originUserId: 1, targetUserId: 2, originKey: 'k', targetKey: 'k2', signature: { obj: true } })).rejects.toThrow('Firma inválida');
  });

  test('getUserContacts db error calls errorSender and throws', async () => {
    const mockExecute = jest.fn().mockRejectedValue(new Error('dbfail'));
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    const mockErrorSender = jest.fn();
    jest.doMock('../../../utils/errorSender.js', () => mockErrorSender);
    const model = await import('../chat.model.js');
    await expect(model.getUserContacts(1)).rejects.toThrow('Error al obtener contactos');
    expect(mockErrorSender).toHaveBeenCalled();
  });

  test('insertGroup rejects when key is not string', async () => {
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: jest.fn() }));
    jest.doMock('../../../utils/stringFormatValidators.js', () => ({ detectXSSAttempt: () => false, detectSQLInjectionAttempt: () => false }));
    const model = await import('../chat.model.js');
    await expect(model.insertGroup({ name: 'g', creatorId: 1, key: 123 })).rejects.toThrow('Clave del grupo inválida');
  });

  test('insertGroup rejects when name too long', async () => {
    const longName = 'a'.repeat(101);
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: jest.fn() }));
    jest.doMock('../../../utils/stringFormatValidators.js', () => ({ detectXSSAttempt: () => false, detectSQLInjectionAttempt: () => false }));
    const model = await import('../chat.model.js');
    await expect(model.insertGroup({ name: longName, creatorId: 1, key: 'k' })).rejects.toThrow('demasiado largo');
  });

  test('insertMessage without signature works (signature optional)', async () => {
    const mockExecute = jest.fn().mockResolvedValue([{ affectedRows: 1 }, {}]);
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    jest.doMock('../../../utils/stringFormatValidators.js', () => ({ detectXSSAttempt: () => false, detectSQLInjectionAttempt: () => false }));
    const model = await import('../chat.model.js');
    const ok = await model.insertMessage({ message: 'hi', originUserId: 1, targetUserId: 2, originKey: 'k', targetKey: 'k2' });
    expect(ok).toBe(true);
  });

  test('getUserMessages SQL injection in message logs error and returns isValid false', async () => {
    const rows = [ { id: 1, message: 'bad', origin_user_id: 2, target_user_id: 3, created_at: '2020', origin_key: '', target_key: '', signature: 'sig', signature_key: 'pub' } ];
    const mockExecute = jest.fn().mockResolvedValue([rows, []]);
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.doMock('../../../utils/stringFormatValidators.js', () => ({ detectXSSAttempt: () => false, detectSQLInjectionAttempt: () => true }));
    jest.doMock('../../../utils/cypher/ECDSA.js', () => ({ verifySignature: () => true }));
    const model = await import('../chat.model.js');
    const msgs = await model.getUserMessages(3);
    expect(msgs[0].isValid).toBe(false);
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  test('getUserGroupMessages XSS detected calls errorSender', async () => {
    const rows = [{ id: 1, message: '<script>', group_id: 2, user_id: 3, created_at: 't', sent: 0, username: 'u', signature: 's', signature_key: 'pub' }];
    const mockExecute = jest.fn().mockResolvedValue([rows, []]);
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: mockExecute }));
    const mockErrorSender = jest.fn();
    jest.doMock('../../../utils/errorSender.js', () => mockErrorSender);
    jest.doMock('../../../utils/stringFormatValidators.js', () => ({ detectXSSAttempt: () => true, detectSQLInjectionAttempt: () => false }));
    jest.doMock('../../../utils/cypher/ECDSA.js', () => ({ verifySignature: () => true }));
    const model = await import('../chat.model.js');
    const msgs = await model.getUserGroupMessages(3);
    expect(mockErrorSender).toHaveBeenCalled();
    expect(msgs[0].isValid).toBe(false);
  });

  test('insertGroup rejects when key empty string', async () => {
    jest.doMock('../../../db/connection.js', () => ({ executeQuery: jest.fn() }));
    jest.doMock('../../../utils/stringFormatValidators.js', () => ({ detectXSSAttempt: () => false, detectSQLInjectionAttempt: () => false }));
    const model = await import('../chat.model.js');
    await expect(model.insertGroup({ name: 'g', creatorId: 1, key: '   ' })).rejects.toThrow('Clave del grupo no puede estar vacía');
  });
});
