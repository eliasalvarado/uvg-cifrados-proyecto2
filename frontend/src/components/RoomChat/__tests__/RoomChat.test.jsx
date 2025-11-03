import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock ChatInput to a simple button that triggers onSend
vi.mock('../../ChatInput/ChatInput', () => ({
  __esModule: true,
  default: ({ onSend }) => <button data-testid="trigger-send" onClick={() => onSend('hello')}>send</button>
}));

// Mock hooks used by RoomChat so we can set implementations in tests
vi.mock('../../../hooks/useChatState', () => ({
  __esModule: true,
  default: vi.fn()
}));
vi.mock('../../../hooks/groupChat/useSendGroupMessage', () => ({
  __esModule: true,
  default: vi.fn()
}));

// Mock getGroupMessageObject to return the message object we expect
vi.mock('../../../helpers/dto/getGroupMessageObject', () => ({
  __esModule: true,
  default: (obj) => ({ ...obj, datetime: obj.datetime, message: obj.message })
}));

// Mock Message to inspect props and set refObj.current when provided
vi.mock('../../Message/Message', () => ({
  __esModule: true,
  default: ({ message, refObj, left, user }) => {
    if (refObj) refObj.current = { offsetTop: 10 };
    return <div data-testid="mock-message">{message}{user ? `|${user}` : ''}{left ? '|L' : '|R'}</div>;
  }
}));

import RoomChat from '../RoomChat';
import useChatState from '../../../hooks/useChatState';
import useSendGroupMessage from '../../../hooks/groupChat/useSendGroupMessage';

describe('RoomChat', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('sends group message and adds it to state on send', () => {
    const addGroupChatMessage = vi.fn();
    const sendGroupMessage = vi.fn();

    useChatState.mockImplementation(() => ({ groupMessages: { g1: [] }, addGroupChatMessage }));
    useSendGroupMessage.mockImplementation(() => ({ sendGroupMessage, error: null }));

    render(<RoomChat groupId="g1" name="G1" />);

    const btn = screen.getByTestId('trigger-send');
    fireEvent.click(btn);

    expect(sendGroupMessage).toHaveBeenCalledWith({ groupId: 'g1', message: 'hello' });
    expect(addGroupChatMessage).toHaveBeenCalled();
  });

  it('logs error when sendGroupMessage has error', () => {
    const addGroupChatMessage = vi.fn();
    const sendGroupMessage = vi.fn();

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    useChatState.mockImplementation(() => ({ groupMessages: { g1: [] }, addGroupChatMessage }));
    useSendGroupMessage.mockImplementation(() => ({ sendGroupMessage, error: 'boom' }));

    render(<RoomChat groupId="g1" name="G1" />);

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
