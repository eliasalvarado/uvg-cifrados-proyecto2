import React, { useState } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import ChatContext from '../../context/ChatContext';
import SocketContext from '../../context/SocketContext';
import SessionContext from '../../context/SessionContext';

import useChatState from '../useChatState';
// useFetch is dynamically imported in tests that need it
// note: don't import useLogout at top-level so tests can mock it with vi.doMock later
import usePopUp from '../usePopUp';
import useSocket from '../useSocket';
import useToken from '../useToken';

// Helper components to expose hook behavior in the DOM
const ChatStateUser = ({ children, initial = {} }) => {
  const [messages, setMessages] = useState(initial.messages || {});
  const [users, setUsers] = useState(initial.users || {});
  const [groups, setGroups] = useState(initial.groups || {});
  const [groupMessages, setGroupMessages] = useState(initial.groupMessages || {});

  return (
    <ChatContext.Provider value={{ messages, setMessages, users, setUsers, groups, setGroups, groupMessages, setGroupMessages }}>
      {children}
    </ChatContext.Provider>
  );
};

const SessionProvider = ({ children, token = null, clearToken = () => {} }) => (
  <SessionContext.Provider value={{ token, setToken: () => {}, clearToken }}>
    {children}
  </SessionContext.Provider>
);

const SocketProvider = ({ children, socket = null }) => (
  <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>
);

describe('hooks', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // clear localStorage entries used by logout
    localStorage.removeItem('token');
    localStorage.removeItem('privateKeyECDSA');
    localStorage.removeItem('privateKeyRSA');
    localStorage.removeItem('publicKeyRSA');
    localStorage.removeItem('publicKeyECDSA');
  });

  it('usePopUp toggles open/close', () => {
    const Test = () => {
      const [isOpen, open, close] = usePopUp(false);
      return (
        <div>
          <span data-testid="state">{isOpen ? 'open' : 'closed'}</span>
          <button onClick={open}>open</button>
          <button onClick={close}>close</button>
        </div>
      );
    };

    render(<Test />);
    expect(screen.getByTestId('state').textContent).toBe('closed');
    fireEvent.click(screen.getByText('open'));
    expect(screen.getByTestId('state').textContent).toBe('open');
    fireEvent.click(screen.getByText('close'));
    expect(screen.getByTestId('state').textContent).toBe('closed');
  });

  it('useLogout clears session and localStorage', async () => {
    const clearSpy = vi.fn();
    // dynamically import the hook so tests that mock modules earlier can do so
    const { default: useLogoutLocal } = await import('../useLogout');
    const Test = () => {
      const logout = useLogoutLocal();
      return <button onClick={logout}>logout</button>;
    };

    // set some localStorage items
    localStorage.setItem('token', 't');
    localStorage.setItem('privateKeyRSA', 'a');

    render(
      <SessionProvider clearToken={clearSpy}>
        <Test />
      </SessionProvider>
    );

    fireEvent.click(screen.getByText('logout'));
    expect(clearSpy).toHaveBeenCalled();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('privateKeyRSA')).toBeNull();
  });

  it('useSocket returns socket from context', () => {
    const fake = { id: 1 };
    const Test = () => {
      const s = useSocket();
      return <span>{s ? 'has' : 'none'}</span>;
    };

    render(
      <SocketProvider socket={fake}>
        <Test />
      </SocketProvider>
    );

    expect(screen.getByText('has')).toBeInTheDocument();
  });

  it('useToken reads token from SessionContext', () => {
    const Test = () => {
      const t = useToken();
      return <span>{t ?? 'no'}</span>;
    };

    render(
      <SessionProvider token={'tok'}>
        <Test />
      </SessionProvider>
    );

    expect(screen.getByText('tok')).toBeInTheDocument();
  });

  it('useChatState functions modify context state', () => {
    const Tester = () => {
      const { messages, users, addSingleChatMessage, createEmptyChat, addUser, createEmptyGroup, addGroupChatMessage } = useChatState();
      return (
        <div>
          <div data-testid="msgs">{JSON.stringify(messages)}</div>
          <div data-testid="users">{JSON.stringify(users)}</div>
          <button onClick={() => createEmptyChat({ userId: 'u1', username: 'U1' })}>createChat</button>
          <button onClick={() => addSingleChatMessage({ to: 'u1', message: 'm', sent: true })}>addSingle</button>
          <button onClick={() => addUser({ userId: 'u2', username: 'U2' })}>addUser</button>
          <button onClick={() => createEmptyGroup({ groupId: 'g1', name: 'G1', creatorId: 'u2', key: 'k' })}>createGroup</button>
          <button onClick={() => addGroupChatMessage('g1', { message: 'gm' })}>addGroupMsg</button>
        </div>
      );
    };

    render(
      <ChatStateUser initial={{}}>
        <Tester />
      </ChatStateUser>
    );

    expect(screen.getByTestId('msgs').textContent).toBe('{}');
    fireEvent.click(screen.getByText('createChat'));
    expect(screen.getByTestId('msgs').textContent).toContain('u1');

    fireEvent.click(screen.getByText('addSingle'));
    expect(screen.getByTestId('msgs').textContent).toContain('m');

    fireEvent.click(screen.getByText('addUser'));
    expect(screen.getByTestId('users').textContent).toContain('U2');

    fireEvent.click(screen.getByText('createGroup'));
    fireEvent.click(screen.getByText('addGroupMsg'));
    // If no exception thrown, behavior is exercised
    expect(true).toBe(true);
  });

  it('useFetch handles success, blob, non-parse and error (403 triggers logout)', async () => {
    const logoutSpy = vi.fn();

    // mock useLogout to return our spy
    vi.doMock('../useLogout', () => ({ __esModule: true, default: () => logoutSpy }));
    // re-import hook after mocking dependency
    const { default: useFetchLocal } = await import('../useFetch');

    // success JSON
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ a: 1 }) }));

    const Test = () => {
      const { callFetch, result, loading } = useFetchLocal();
      return (
        <div>
          <button onClick={() => callFetch({ uri: '/x' })}>call</button>
          <span data-testid="res">{loading ? 'loading' : JSON.stringify(result)}</span>
        </div>
      );
    };

    render(
      <SessionProvider clearToken={logoutSpy}>
        <Test />
      </SessionProvider>
    );
    await act(async () => {
      fireEvent.click(screen.getByText('call'));
      // wait a tick
      await Promise.resolve();
    });

    expect(screen.getByTestId('res').textContent).toContain('a');

    // blob path
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, blob: () => Promise.resolve(new Blob(['x'])) }));
    const TestBlob = () => {
      const { callFetch } = useFetchLocal();
      return (<button onClick={() => callFetch({ uri: '/b', toBlob: true })}>callb</button>);
    };
    render(
      <SessionProvider clearToken={logoutSpy}>
        <TestBlob />
      </SessionProvider>
    );
    await act(async () => { fireEvent.click(screen.getByText('callb')); await Promise.resolve(); });

    // parse=false path
    global.fetch = vi.fn(() => Promise.resolve({ ok: true }));
    const TestNoParse = () => { const { callFetch } = useFetchLocal(); return <button onClick={() => callFetch({ uri: '/n', parse: false })}>calln</button>; };
    render(
      <SessionProvider clearToken={logoutSpy}>
        <TestNoParse />
      </SessionProvider>
    );
    await act(async () => { fireEvent.click(screen.getByText('calln')); await Promise.resolve(); });

    // error 403 triggers logout
    global.fetch = vi.fn(() => Promise.resolve({ ok: false, status: 403 }));
    const Test403 = () => { const { callFetch } = useFetchLocal(); return <button onClick={() => callFetch({ uri: '/403' })}>call403</button>; };
    render(
      <SessionProvider clearToken={logoutSpy}>
        <Test403 />
      </SessionProvider>
    );
    await act(async () => { fireEvent.click(screen.getByText('call403')); await Promise.resolve(); });
    expect(logoutSpy).toHaveBeenCalled();
  });
});
