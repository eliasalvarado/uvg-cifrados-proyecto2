describe('chat.controller', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('sendMessageController success path emits and responds ok', async () => {
    // mock dependencies used in controller
    const mockGetUserById = jest.fn().mockResolvedValue({ id: 2, ecdsa_public_key: 'pub' });
    const mockInsertMessage = jest.fn().mockResolvedValue(true);
    const mockAddBlock = jest.fn().mockResolvedValue({});
    const mockVerifySignature = jest.fn().mockReturnValue(true);

  jest.doMock('../../user/user.model.js', () => ({ getUserById: mockGetUserById }));
  jest.doMock('../chat.model.js', () => ({ insertMessage: mockInsertMessage }));
  jest.doMock('../../blockchain/blockchain.model.js', () => ({ addBlock: mockAddBlock }));
  jest.doMock('../../../utils/cypher/ECDSA.js', () => ({ verifySignature: mockVerifySignature }));

    // mock getIo to return an emitter with to().emit
    const emit = jest.fn();
    const to = jest.fn(() => ({ emit }));
    const getIo = jest.fn(() => ({ to }));
  jest.doMock('../../../sockets/ioInstance.js', () => ({ getIo }));

    const controller = await import('../chat.controller.js');

    const req = { params: { userId: '2' }, body: { message: 'hi', originKey: 'k1', targetKey: 'k2', signature: 's' }, user: { id: 1 } };
    const send = jest.fn();
    const res = { send };

    await controller.sendMessageController(req, res);

    expect(mockInsertMessage).toHaveBeenCalled();
    expect(emit).toHaveBeenCalled();
    expect(send).toHaveBeenCalledWith({ ok: true });
  });

  test('sendMessageController missing fields triggers errorSender', async () => {
  const mockErrorSender = jest.fn();
  jest.doMock('../../../utils/errorSender.js', () => mockErrorSender);
    const controller = await import('../chat.controller.js');

    const req = { params: { userId: '2' }, body: { message: null }, user: { id: 1 } };
    const res = {};
    await controller.sendMessageController(req, res);
    expect(mockErrorSender).toHaveBeenCalled();
  });
  
  test.each([['originKey'], ['targetKey'], ['signature']])('sendMessageController missing %s triggers errorSender', async (field) => {
    const mockErrorSender = jest.fn();
    jest.doMock('../../../utils/errorSender.js', () => mockErrorSender);
    const controller = await import('../chat.controller.js');

    const body = { message: 'hi', originKey: 'k1', targetKey: 'k2', signature: 's' };
    delete body[field];

    const req = { params: { userId: '2' }, body, user: { id: 1 } };
    const res = {};

    await controller.sendMessageController(req, res);
    expect(mockErrorSender).toHaveBeenCalled();
  });

  test('sendMessageController recipient not found triggers errorSender', async () => {
    const mockGetUserById = jest.fn().mockResolvedValue(null);
    jest.doMock('../../user/user.model.js', () => ({ getUserById: mockGetUserById }));
    const mockErrorSender = jest.fn();
    jest.doMock('../../../utils/errorSender.js', () => mockErrorSender);

    const controller = await import('../chat.controller.js');
    const req = { params: { userId: '99' }, body: { message: 'hi', originKey: 'k1', targetKey: 'k2', signature: 's' }, user: { id: 1 } };
    const res = {};
    await controller.sendMessageController(req, res);
    expect(mockErrorSender).toHaveBeenCalled();
  });

  test('sendMessageController insertMessage false triggers errorSender', async () => {
    const mockGetUserById = jest.fn().mockResolvedValue({ id: 2, ecdsa_public_key: 'pub' });
    jest.doMock('../../user/user.model.js', () => ({ getUserById: mockGetUserById }));
    const mockInsertMessage = jest.fn().mockResolvedValue(false);
    jest.doMock('../chat.model.js', () => ({ insertMessage: mockInsertMessage }));
    const mockErrorSender = jest.fn();
    jest.doMock('../../../utils/errorSender.js', () => mockErrorSender);

    const controller = await import('../chat.controller.js');
    const req = { params: { userId: '2' }, body: { message: 'hi', originKey: 'k1', targetKey: 'k2', signature: 's' }, user: { id: 1 } };
    const res = {};
    await controller.sendMessageController(req, res);
    expect(mockErrorSender).toHaveBeenCalled();
  });

  test('sendMessageController with no io still responds ok (no emit)', async () => {
    const mockGetUserById = jest.fn().mockResolvedValue({ id: 2, ecdsa_public_key: 'pub' });
    jest.doMock('../../user/user.model.js', () => ({ getUserById: mockGetUserById }));
    const mockInsertMessage = jest.fn().mockResolvedValue(true);
    jest.doMock('../chat.model.js', () => ({ insertMessage: mockInsertMessage }));
    jest.doMock('../../blockchain/blockchain.model.js', () => ({ addBlock: jest.fn().mockResolvedValue({}) }));
    jest.doMock('../../../utils/cypher/ECDSA.js', () => ({ verifySignature: () => true }));
    // getIo returns null
    jest.doMock('../../../sockets/ioInstance.js', () => ({ getIo: () => null }));

    const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const controller = await import('../chat.controller.js');
    const req = { params: { userId: '2' }, body: { message: 'hi', originKey: 'k1', targetKey: 'k2', signature: 's' }, user: { id: 1 } };
    const send = jest.fn();
    const res = { send };
    await controller.sendMessageController(req, res);

    expect(send).toHaveBeenCalledWith({ ok: true });
    expect(consoleWarn).toHaveBeenCalled();
    consoleWarn.mockRestore();
  });

  test('joinGroupController success path', async () => {
    const mockGetGroupByName = jest.fn().mockResolvedValue({ groupId: 5, key: 'k' });
    const mockInsertGroupMember = jest.fn().mockResolvedValue(true);
    jest.doMock('../chat.model.js', () => ({ getGroupByName: mockGetGroupByName, insertGroupMember: mockInsertGroupMember }));

    const controller = await import('../chat.controller.js');
    const req = { body: { groupName: 'g' }, user: { id: 4 } };
    const send = jest.fn();
    const res = { send };
    await controller.joinGroupController(req, res);
    expect(send).toHaveBeenCalledWith({ ok: true, groupId: 5, name: 'g', newMemberId: 4, key: 'k' });
  });

  test('createGroupController insertGroup fails triggers errorSender', async () => {
    const mockInsertGroup = jest.fn().mockResolvedValue(null);
    jest.doMock('../chat.model.js', () => ({ insertGroup: mockInsertGroup }));
    const mockErrorSender = jest.fn();
    jest.doMock('../../../utils/errorSender.js', () => mockErrorSender);

    const controller = await import('../chat.controller.js');
    const req = { body: { name: 'grp' }, user: { id: 5 } };
    const res = {};
    await controller.createGroupController(req, res);
    expect(mockErrorSender).toHaveBeenCalled();
  });

  test('sendGroupMessageController member false triggers errorSender', async () => {
    const mockVerifyMember = jest.fn().mockResolvedValue(false);
    jest.doMock('../chat.model.js', () => ({ verifyIfUserIsGroupMember: mockVerifyMember }));
    const mockErrorSender = jest.fn();
    jest.doMock('../../../utils/errorSender.js', () => mockErrorSender);

    const controller = await import('../chat.controller.js');
    const req = { params: { groupId: '1' }, body: { message: 'hi', signature: 's' }, user: { id: 1 } };
    const res = {};
    await controller.sendGroupMessageController(req, res);
    expect(mockErrorSender).toHaveBeenCalled();
  });

  test('sendGroupMessageController success emits and responds ok', async () => {
    const mockVerifyMember = jest.fn().mockResolvedValue(true);
    const mockGetUserById = jest.fn().mockResolvedValue({ username: 'u', ecdsa_public_key: 'pub' });
    const mockInsertGroupMessage = jest.fn().mockResolvedValue(true);
    const mockAddBlock = jest.fn().mockResolvedValue({});
    const emit = jest.fn();
    const to = jest.fn(() => ({ emit }));
    jest.doMock('../chat.model.js', () => ({ verifyIfUserIsGroupMember: mockVerifyMember, insertGroupMessage: mockInsertGroupMessage }));
    jest.doMock('../../user/user.model.js', () => ({ getUserById: mockGetUserById }));
    jest.doMock('../../blockchain/blockchain.model.js', () => ({ addBlock: mockAddBlock }));
    jest.doMock('../../../sockets/ioInstance.js', () => ({ getIo: () => ({ to }) }));

    const controller = await import('../chat.controller.js');
    const req = { params: { groupId: '2' }, body: { message: 'hi', signature: 's' }, user: { id: 7 } };
    const send = jest.fn();
    const res = { send };
    await controller.sendGroupMessageController(req, res);
    expect(emit).toHaveBeenCalled();
    expect(send).toHaveBeenCalledWith({ ok: true });
  });

  test('getGroupChatsController success path returns groups and messages', async () => {
    const mockGetGroupsForUser = jest.fn().mockResolvedValue([{ groupId: 1 }]);
    const mockGetUserGroupMessages = jest.fn().mockResolvedValue([{ id: 1 }]);
    jest.doMock('../chat.model.js', () => ({ getGroupsForUser: mockGetGroupsForUser, getUserGroupMessages: mockGetUserGroupMessages }));

    const controller = await import('../chat.controller.js');
    const req = { user: { id: 1 } };
    const send = jest.fn();
    const res = { send };
    await controller.getGroupChatsController(req, res);
    expect(send).toHaveBeenCalledWith({ ok: true, groups: [{ groupId: 1 }], messages: [{ id: 1 }] });
  });

  test('createGroupController missing name triggers errorSender', async () => {
    const mockErrorSender = jest.fn();
    jest.doMock('../../../utils/errorSender.js', () => mockErrorSender);
    const controller = await import('../chat.controller.js');

    const req = { body: {}, user: { id: 5 } };
    const res = {};
    await controller.createGroupController(req, res);
    expect(mockErrorSender).toHaveBeenCalled();
  });

  test('createGroupController memberAdded false triggers errorSender', async () => {
    const mockInsertGroup = jest.fn().mockResolvedValue(11);
    const mockInsertGroupMember = jest.fn().mockResolvedValue(false);
    jest.doMock('../chat.model.js', () => ({ insertGroup: mockInsertGroup, insertGroupMember: mockInsertGroupMember }));
    const mockErrorSender = jest.fn();
    jest.doMock('../../../utils/errorSender.js', () => mockErrorSender);

    const controller = await import('../chat.controller.js');
    const req = { body: { name: 'grp' }, user: { id: 5 } };
    const res = {};
    await controller.createGroupController(req, res);
    expect(mockErrorSender).toHaveBeenCalled();
  });

  test('joinGroupController missing groupName triggers errorSender', async () => {
    const mockErrorSender = jest.fn();
    jest.doMock('../../../utils/errorSender.js', () => mockErrorSender);
    const controller = await import('../chat.controller.js');

    const req = { body: {}, user: { id: 4 } };
    const res = {};
    await controller.joinGroupController(req, res);
    expect(mockErrorSender).toHaveBeenCalled();
  });

  test('joinGroupController memberAdded false triggers errorSender', async () => {
    const mockGetGroupByName = jest.fn().mockResolvedValue({ groupId: 6, key: 'k' });
    const mockInsertGroupMember = jest.fn().mockResolvedValue(false);
    jest.doMock('../chat.model.js', () => ({ getGroupByName: mockGetGroupByName, insertGroupMember: mockInsertGroupMember }));
    const mockErrorSender = jest.fn();
    jest.doMock('../../../utils/errorSender.js', () => mockErrorSender);

    const controller = await import('../chat.controller.js');
    const req = { body: { groupName: 'g' }, user: { id: 4 } };
    const res = {};
    await controller.joinGroupController(req, res);
    expect(mockErrorSender).toHaveBeenCalled();
  });

  test('sendGroupMessageController missing message triggers errorSender', async () => {
    const mockErrorSender = jest.fn();
    jest.doMock('../../../utils/errorSender.js', () => mockErrorSender);
    const controller = await import('../chat.controller.js');

    const req = { params: { groupId: '1' }, body: {}, user: { id: 1 } };
    const res = {};
    await controller.sendGroupMessageController(req, res);
    expect(mockErrorSender).toHaveBeenCalled();
  });

  test('sendGroupMessageController userData not found triggers errorSender', async () => {
    const mockVerifyMember = jest.fn().mockResolvedValue(true);
    const mockGetUserById = jest.fn().mockResolvedValue(null);
    jest.doMock('../chat.model.js', () => ({ verifyIfUserIsGroupMember: mockVerifyMember }));
    jest.doMock('../../user/user.model.js', () => ({ getUserById: mockGetUserById }));
    const mockErrorSender = jest.fn();
    jest.doMock('../../../utils/errorSender.js', () => mockErrorSender);

    const controller = await import('../chat.controller.js');
    const req = { params: { groupId: '2' }, body: { message: 'hi', signature: 's' }, user: { id: 7 } };
    const res = {};
    await controller.sendGroupMessageController(req, res);
    expect(mockErrorSender).toHaveBeenCalled();
  });

  test('sendGroupMessageController insertGroupMessage false triggers errorSender', async () => {
    const mockVerifyMember = jest.fn().mockResolvedValue(true);
    const mockGetUserById = jest.fn().mockResolvedValue({ username: 'u', ecdsa_public_key: 'pub' });
    const mockInsertGroupMessage = jest.fn().mockResolvedValue(false);
    jest.doMock('../chat.model.js', () => ({ verifyIfUserIsGroupMember: mockVerifyMember, insertGroupMessage: mockInsertGroupMessage }));
    jest.doMock('../../user/user.model.js', () => ({ getUserById: mockGetUserById }));
    const mockErrorSender = jest.fn();
    jest.doMock('../../../utils/errorSender.js', () => mockErrorSender);

    const controller = await import('../chat.controller.js');
    const req = { params: { groupId: '2' }, body: { message: 'hi', signature: 's' }, user: { id: 7 } };
    const res = {};
    await controller.sendGroupMessageController(req, res);
    expect(mockErrorSender).toHaveBeenCalled();
  });

  test('sendGroupMessageController with no io still responds ok (no emit)', async () => {
    const mockVerifyMember = jest.fn().mockResolvedValue(true);
    const mockGetUserById = jest.fn().mockResolvedValue({ username: 'u', ecdsa_public_key: 'pub' });
    const mockInsertGroupMessage = jest.fn().mockResolvedValue(true);
    jest.doMock('../chat.model.js', () => ({ verifyIfUserIsGroupMember: mockVerifyMember, insertGroupMessage: mockInsertGroupMessage }));
    jest.doMock('../../user/user.model.js', () => ({ getUserById: mockGetUserById }));
    jest.doMock('../../blockchain/blockchain.model.js', () => ({ addBlock: jest.fn().mockResolvedValue({}) }));
    // getIo returns null to hit the console.warn branch
    jest.doMock('../../../sockets/ioInstance.js', () => ({ getIo: () => null }));

    const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const controller = await import('../chat.controller.js');
    const req = { params: { groupId: '2' }, body: { message: 'hi', signature: 's' }, user: { id: 7 } };
    const send = jest.fn();
    const res = { send };
    await controller.sendGroupMessageController(req, res);

    expect(send).toHaveBeenCalledWith({ ok: true });
    expect(consoleWarn).toHaveBeenCalled();
    consoleWarn.mockRestore();
  });

  test('getSingleChatsController error path triggers errorSender', async () => {
    const mockGetUserContacts = jest.fn().mockRejectedValue(new Error('fail'));
    jest.doMock('../chat.model.js', () => ({ getUserContacts: mockGetUserContacts }));
    const mockErrorSender = jest.fn();
    jest.doMock('../../../utils/errorSender.js', () => mockErrorSender);

    const controller = await import('../chat.controller.js');
    const req = { user: { id: 1 } };
    const res = {};
    await controller.getSingleChatsController(req, res);
    expect(mockErrorSender).toHaveBeenCalled();
  });

  test('createGroupController success path', async () => {
    const mockInsertGroup = jest.fn().mockResolvedValue(10);
    const mockInsertGroupMember = jest.fn().mockResolvedValue(true);
    const mockGenKey = jest.fn().mockReturnValue('k');

  jest.doMock('../chat.model.js', () => ({ insertGroup: mockInsertGroup, insertGroupMember: mockInsertGroupMember }));

    const controller = await import('../chat.controller.js');

    const req = { body: { name: 'grp' }, user: { id: 5 } };
    const send = jest.fn();
    const res = { send };

    await controller.createGroupController(req, res);
    expect(send).toHaveBeenCalled();
  });

  test('createGroupController success path with mocked key generator covers key generation branch', async () => {
    const mockInsertGroup = jest.fn().mockResolvedValue(123);
    const mockInsertGroupMember = jest.fn().mockResolvedValue(true);
    jest.doMock('../chat.model.js', () => ({ insertGroup: mockInsertGroup, insertGroupMember: mockInsertGroupMember }));
    jest.doMock('../../../../frontend/src/helpers/cypher/generateAES256KeyBase64.js', () => jest.fn(() => 'mockedKey'));

    const controller = await import('../chat.controller.js');
    const req = { body: { name: 'grp2' }, user: { id: 55 } };
    const send = jest.fn();
    const res = { send };
    await controller.createGroupController(req, res);

    expect(mockInsertGroup).toHaveBeenCalledWith(expect.objectContaining({ key: 'mockedKey' }));
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ ok: true, groupId: 123, name: 'grp2' }));
  });

  test('joinGroupController accepts string groupId and parses it', async () => {
    const mockGetGroupByName = jest.fn().mockResolvedValue({ groupId: '7', key: 'k' });
    const mockInsertGroupMember = jest.fn().mockResolvedValue(true);
    jest.doMock('../chat.model.js', () => ({ getGroupByName: mockGetGroupByName, insertGroupMember: mockInsertGroupMember }));

    const controller = await import('../chat.controller.js');
    const req = { body: { groupName: 'g' }, user: { id: 4 } };
    const send = jest.fn();
    const res = { send };
    await controller.joinGroupController(req, res);
    expect(send).toHaveBeenCalledWith({ ok: true, groupId: '7', name: 'g', newMemberId: 4, key: 'k' });
  });

  test('sendMessageController handles invalid signature (still stores and responds)', async () => {
    const mockGetUserById = jest.fn().mockResolvedValue({ id: 2, ecdsa_public_key: 'pub' });
    const mockInsertMessage = jest.fn().mockResolvedValue(true);
    const mockAddBlock = jest.fn().mockResolvedValue({});
    const mockVerifySignature = jest.fn().mockReturnValue(false);

    jest.doMock('../../user/user.model.js', () => ({ getUserById: mockGetUserById }));
    jest.doMock('../chat.model.js', () => ({ insertMessage: mockInsertMessage }));
    jest.doMock('../../blockchain/blockchain.model.js', () => ({ addBlock: mockAddBlock }));
    jest.doMock('../../../utils/cypher/ECDSA.js', () => ({ verifySignature: mockVerifySignature }));
    jest.doMock('../../../sockets/ioInstance.js', () => ({ getIo: () => ({ to: () => ({ emit: jest.fn() }) }) }));

    const controller = await import('../chat.controller.js');
    const req = { params: { userId: '2' }, body: { message: 'hi', originKey: 'k1', targetKey: 'k2', signature: 's' }, user: { id: 1 } };
    const send = jest.fn();
    const res = { send };

    await controller.sendMessageController(req, res);

    expect(mockInsertMessage).toHaveBeenCalled();
    expect(send).toHaveBeenCalledWith({ ok: true });
  });

  test('joinGroupController not found group calls errorSender', async () => {
    const mockGetGroupByName = jest.fn().mockResolvedValue(null);
  jest.doMock('../chat.model.js', () => ({ getGroupByName: mockGetGroupByName }));
  const mockErrorSender = jest.fn();
  jest.doMock('../../../utils/errorSender.js', () => mockErrorSender);

    const controller = await import('../chat.controller.js');
    const req = { body: { groupName: 'notfound' }, user: { id: 4 } };
    const res = {};
    await controller.joinGroupController(req, res);
    expect(mockErrorSender).toHaveBeenCalled();
  });

  test('getSingleChatsController returns contacts and messages', async () => {
    const mockGetUserContacts = jest.fn().mockResolvedValue([{ id: 2 }]);
    const mockGetUserMessages = jest.fn().mockResolvedValue([{ id: 1 }]);
  jest.doMock('../chat.model.js', () => ({ getUserContacts: mockGetUserContacts, getUserMessages: mockGetUserMessages }));
    const controller = await import('../chat.controller.js');

    const send = jest.fn();
    const req = { user: { id: 1 } };
    const res = { send };
    await controller.getSingleChatsController(req, res);
    expect(send).toHaveBeenCalledWith({ ok: true, contacts: [{ id: 2 }], messages: [{ id: 1 }] });
  });

  test('getGroupChatsController returns 404 when no groups', async () => {
    const mockGetGroupsForUser = jest.fn().mockResolvedValue([]);
    const mockGetUserGroupMessages = jest.fn().mockResolvedValue([]);
  jest.doMock('../chat.model.js', () => ({ getGroupsForUser: mockGetGroupsForUser, getUserGroupMessages: mockGetUserGroupMessages }));
  const mockErrorSender = jest.fn();
  jest.doMock('../../../utils/errorSender.js', () => mockErrorSender);

    const controller = await import('../chat.controller.js');
    const req = { user: { id: 1 } };
    const res = {};
    await controller.getGroupChatsController(req, res);
    expect(mockErrorSender).toHaveBeenCalled();
  });
});
