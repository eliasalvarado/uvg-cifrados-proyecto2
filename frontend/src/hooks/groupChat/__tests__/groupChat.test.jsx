import React from 'react';
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('groupChat hooks', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
    localStorage.clear();
  });

  it('useAddReceivedGroupMessage - adds decrypted message when group exists', async () => {
    const addGroupChatMessage = vi.fn();

    // mock useChatState
    vi.doMock('../../useChatState.js', () => ({ __esModule: true, default: () => ({ addGroupChatMessage, groups: { g1: { key: 'abc' } } }) }));

    // mock base64ToUint8Array and decryptAES256 and getGroupMessageObject
    vi.doMock('../../../helpers/base64ToUint8Array.js', () => ({ __esModule: true, default: () => new Uint8Array([1,2,3]) }));
  vi.doMock('../../../helpers/cypher/AES-256.js', () => ({ __esModule: true, decryptAES256: async () => 'plaintext' }));
    vi.doMock('../../../helpers/dto/getGroupMessageObject.js', () => ({ __esModule: true, default: (obj) => ({ ...obj, _ok: true }) }));

    const { default: useAddReceivedGroupMessage } = await import('../useAddReceivedGroupMessage.js');

    // render a component that exposes the hook result via ref
    const holder = { current: null };
    const TestComp = () => {
      const fn = useAddReceivedGroupMessage();
      // expose
      holder.current = fn;
      return null;
    };

    render(<TestComp />);

    // call the exposed function
    await act(async () => {
      await holder.current({ message: 'enc', groupId: 'g1', datetime: Date.now(), userId: 'u1', username: 'U1', verified: true });
    });

    expect(addGroupChatMessage).toHaveBeenCalled();
    const [calledGroupId, calledMsg] = addGroupChatMessage.mock.calls[0];
    expect(calledGroupId).toBe('g1');
    expect(calledMsg).toHaveProperty('message', 'plaintext');
  });

  it('useAddReceivedGroupMessage - logs error when group not found', async () => {
    const addGroupChatMessage = vi.fn();
    vi.doMock('../../useChatState.js', () => ({ __esModule: true, default: () => ({ addGroupChatMessage, groups: {} }) }));
    vi.doMock('../../../helpers/base64ToUint8Array.js', () => ({ __esModule: true, default: () => new Uint8Array([1]) }));
    // spy console.error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { default: useAddReceivedGroupMessage } = await import('../useAddReceivedGroupMessage.js');

    const holder = { current: null };
    const TestComp = () => {
      const fn = useAddReceivedGroupMessage();
      holder.current = fn;
      return null;
    };

    render(<TestComp />);
    await act(async () => {
      await holder.current({ message: 'enc', groupId: 'missing', datetime: Date.now(), userId: 'u1' });
    });

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('useCreateGroup calls callFetch with token header', async () => {
    const callFetch = vi.fn();
    vi.doMock('../../useFetch.js', () => ({ __esModule: true, default: () => ({ callFetch, result: null, loading: false, error: null }) }));
    vi.doMock('../../useToken.js', () => ({ __esModule: true, default: () => 'my-token' }));

    const { default: useCreateGroup } = await import('../useCreateGroup.js');
    const { createGroup } = useCreateGroup();
    await act(async () => { await createGroup({ name: 'G' }); });

    expect(callFetch).toHaveBeenCalled();
    const opts = callFetch.mock.calls[0][0];
    expect(opts.headers.Authorization).toBe('my-token');
  });

  it('useJoinGroup calls callFetch with groupName', async () => {
    const callFetch = vi.fn();
    vi.doMock('../../useFetch.js', () => ({ __esModule: true, default: () => ({ callFetch, result: null, loading: false, error: null }) }));
    vi.doMock('../../useToken.js', () => ({ __esModule: true, default: () => 'tok' }));

    const { default: useJoinGroup } = await import('../useJoinGroup.js');
    const { joinGroup } = useJoinGroup();
    await act(async () => { await joinGroup({ groupName: 'room' }); });

    expect(callFetch).toHaveBeenCalled();
    const opts = callFetch.mock.calls[0][0];
    expect(opts.body).toContain('room');
  });

  it('useJoinGroupSocket emits join_group_room', async () => {
    const emit = vi.fn();
    vi.doMock('../../useSocket.js', () => ({ __esModule: true, default: () => ({ emit }) }));
    const { default: useJoinGroupSocket } = await import('../useJoinGroupSocket.js');
    const join = useJoinGroupSocket();
    join('g1');
    expect(emit).toHaveBeenCalledWith('join_group_room', { groupId: 'g1' });
  });

  it('useSendGroupMessage handles empty message and missing group', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // no group
    vi.doMock('../../useChatState.js', () => ({ __esModule: true, default: () => ({ groups: {} }) }));
    const { default: useSendGroupMessage } = await import('../useSendGroupMessage.js');
    const { sendGroupMessage } = useSendGroupMessage();

    await act(async () => { await sendGroupMessage({ groupId: 'g', message: '' }); });
    expect(spy).toHaveBeenCalled();

    await act(async () => { await sendGroupMessage({ groupId: 'g', message: 'hi' }); });
    // still error because group missing
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('useSendGroupMessage encrypts, signs and calls fetch when group exists', async () => {
    const callFetch = vi.fn();
    vi.doMock('../../useFetch.js', () => ({ __esModule: true, default: () => ({ callFetch, result: null, loading: false, error: null }) }));
    vi.doMock('../../useToken.js', () => ({ __esModule: true, default: () => 'tok' }));
    // mock chat state with a group key
    vi.doMock('../../useChatState.js', () => ({ __esModule: true, default: () => ({ groups: { g1: { key: 'k' } } }) }));
    vi.doMock('../../../helpers/base64ToUint8Array.js', () => ({ __esModule: true, default: () => new Uint8Array([1]) }));
  vi.doMock('../../../helpers/cypher/AES-256.js', () => ({ __esModule: true, encryptAES256: async () => 'enc-msg' }));
  vi.doMock('../../../helpers/cypher/ECDSA.js', () => ({ __esModule: true, signMessage: async () => 'sig' }));

    // set private key in localStorage
    localStorage.setItem('privateKeyECDSA', 'mypriv');

    const { default: useSendGroupMessage } = await import('../useSendGroupMessage.js');
    const { sendGroupMessage } = useSendGroupMessage();

    await act(async () => { await sendGroupMessage({ groupId: 'g1', message: 'hello' }); });

    expect(callFetch).toHaveBeenCalled();
    const opts = callFetch.mock.calls[0][0];
    const body = JSON.parse(opts.body);
    expect(body).toHaveProperty('message', 'enc-msg');
    expect(body).toHaveProperty('signature', 'sig');
  });
});
