import React, { useContext } from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// We'll create a fake socket that collects handlers and allows triggering
let handlers = {};
const fakeSocket = {
  id: 'socket-1',
  on: (ev, cb) => { handlers[ev] = cb; },
  off: () => {},
  disconnect: vi.fn(),
};

vi.mock('socket.io-client', () => ({ io: vi.fn(() => fakeSocket) }));
vi.mock('../../helpers/getTokenPayload', () => ({ __esModule: true, default: () => ({ id: 'user1' }) }));
vi.mock('../../hooks/simpleChat/useAddReceivedMessage', () => ({ __esModule: true, default: vi.fn() }));
vi.mock('../../hooks/groupChat/useAddReceivedGroupMessage', () => ({ __esModule: true, default: vi.fn() }));
vi.mock('../../hooks/useToken', () => ({ __esModule: true, default: () => 'tok' }));

import SocketContext, { SocketProvider } from '../SocketContext';
import useAddReceivedMessage from '../../hooks/simpleChat/useAddReceivedMessage';
import useAddReceivedGroupMessage from '../../hooks/groupChat/useAddReceivedGroupMessage';

const Consumer = () => {
  const { socket } = useContext(SocketContext);
  return <div data-testid="has-socket">{socket ? 'yes' : 'no'}</div>;
};

describe('SocketProvider', () => {
  beforeEach(() => {
    handlers = {};
    vi.resetAllMocks();
  });

  it('connects socket and handles chat_message and group messages', () => {
    const addMsg = vi.fn();
    const addGroup = vi.fn();
    // override mocks to return our spies
    useAddReceivedMessage.mockImplementation(() => addMsg);
    useAddReceivedGroupMessage.mockImplementation(() => addGroup);

    render(
      <SocketProvider>
        <Consumer />
      </SocketProvider>
    );

    expect(screen.getByTestId('has-socket').textContent).toBe('no');

    // simulate incoming chat_message
    act(() => {
      handlers['chat_message'] && handlers['chat_message']({ text: 'hello' });
    });
    expect(addMsg).toHaveBeenCalledWith({ text: 'hello' });

    // simulate incoming group message from other user
    act(() => {
      handlers['chat_group_message'] && handlers['chat_group_message']({ userId: 'other', data: 'x' });
    });
    expect(addGroup).toHaveBeenCalled();

    // simulate group message from same user -> should not call again
    addGroup.mockClear();
    act(() => {
      handlers['chat_group_message'] && handlers['chat_group_message']({ userId: 'user1', data: 'y' });
    });
    expect(addGroup).not.toHaveBeenCalled();
  });
});
