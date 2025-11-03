import React from 'react';
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
// Ensure tests use the same context instances as the app by hoisting simple mocks
vi.mock('../../../context/SessionContext', () => {
  const React = require('react');
  return { __esModule: true, default: React.createContext() };
});
vi.mock('../../../context/ChatContext', () => {
  const React = require('react');
  return { __esModule: true, default: React.createContext() };
});
import SessionContext from '../../../context/SessionContext';
import ChatContext from '../../../context/ChatContext';

describe('simpleChat hooks', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
    localStorage.clear();
  });

  // Simple providers to satisfy hooks that use context
  const SessionProvider = ({ children, token = 'tok', clearToken = () => {} }) => (
    <SessionContext.Provider value={{ token, setToken: () => {}, clearToken }}>
      {children}
    </SessionContext.Provider>
  );

  const ChatStateUser = ({ children, initial = {} }) => {
    const msgs = initial.messages || {};
    const users = initial.users || {};
    const groups = initial.groups || {};
    const groupMessages = initial.groupMessages || {};
    return (
      <ChatContext.Provider value={{ messages: msgs, setMessages: () => {}, users, setUsers: () => {}, groups, setGroups: () => {}, groupMessages, setGroupMessages: () => {} }}>
        {children}
      </ChatContext.Provider>
    );
  };

  it('useAddReceivedMessage adds message and requests user when missing', async () => {
    const addSingleChatMessage = vi.fn();
    const addUser = vi.fn();
    // users empty so getUserById should be called
  vi.doMock('../../useChatState.js', () => ({ __esModule: true, default: () => ({ addSingleChatMessage, users: {}, addUser }) }));

  // token and token payload
  vi.doMock('../../useToken.js', () => ({ __esModule: true, default: () => 'tok' }));
  vi.doMock('../../../helpers/getTokenPayload.js', () => ({ __esModule: true, default: () => ({ id: 'me' }) }));

  // decrypt and DTO
  vi.doMock('../../../helpers/cypher/AES_RSA.js', () => ({ __esModule: true, decryptAESRSA: async () => 'hello' }));
  vi.doMock('../../../helpers/dto/getMessageObject.js', () => ({ __esModule: true, default: (o) => ({ ...o }) }));

  const getUserById = vi.fn();
  vi.doMock('../../user/useGetUserById.js', () => ({ __esModule: true, default: () => ({ getUserById, result: null }) }));

    // set private key in localStorage
    localStorage.setItem('privateKeyRSA', 'priv');

  const { default: useAddReceivedMessage } = await import('../useAddReceivedMessage.js');

    const holder = { current: null };
    const TestComp = () => {
      const fn = useAddReceivedMessage();
      holder.current = fn;
      return null;
    };

    render(
      <SessionProvider>
        <ChatStateUser>
          <TestComp />
        </ChatStateUser>
      </SessionProvider>
    );

    await act(async () => {
      await holder.current({ from: 'u1', to: 'me', message: 'enc', targetKey: 'k', datetime: Date.now(), verified: true });
    });

    expect(addSingleChatMessage).toHaveBeenCalled();
    expect(getUserById).toHaveBeenCalledWith('u1');
  });

  it('useAddReceivedMessage logs when privateKey missing', async () => {
    const addSingleChatMessage = vi.fn();
  vi.doMock('../../useChatState.js', () => ({ __esModule: true, default: () => ({ addSingleChatMessage, users: {}, addUser: () => {} }) }));
  vi.doMock('../../useToken.js', () => ({ __esModule: true, default: () => 'tok' }));
  vi.doMock('../../../helpers/getTokenPayload.js', () => ({ __esModule: true, default: () => ({ id: 'me' }) }));
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

  const { default: useAddReceivedMessage } = await import('../useAddReceivedMessage.js');
    const holder = { current: null };
    const TestComp = () => { holder.current = useAddReceivedMessage(); return null; };
    render(
      <SessionProvider>
        <ChatStateUser>
          <TestComp />
        </ChatStateUser>
      </SessionProvider>
    );

    await act(async () => { await holder.current({ from: 'u1', to: 'me', message: 'enc', targetKey: 'k', datetime: Date.now() }); });

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
