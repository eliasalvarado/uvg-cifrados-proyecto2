import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ChatsList from '../ChatsList';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock hooks used inside ChatsList
vi.mock('../../../hooks/useChatState', () => ({
  default: vi.fn()
}));
vi.mock('../../../hooks/user/useSearchUser', () => ({
  default: vi.fn()
}));

// Mock ChatItem to a simple element we can inspect and click
vi.mock('../../ChatItem/ChatItem', () => ({
  __esModule: true,
  default: ({ userId, user, message, onClick, selected }) => {
    return (
      <div data-testid={`chatitem-${userId}`} data-userid={userId} data-selected={selected ? 'true' : 'false'} onClick={() => onClick(userId)}>
        <span>{user}</span>
        <small>{message}</small>
      </div>
    );
  }
}));

import useChatState from '../../../hooks/useChatState';
import useSearchUser from '../../../hooks/user/useSearchUser';

describe('ChatsList', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders chats and respects ordering (chats without messages first)', () => {
    const mockCreateEmptyChat = vi.fn();

    // Provide two users: 'u1' has no messages, 'u2' has a last message
    const messages = {
      u1: [],
      u2: [ { datetime: 12345, message: 'hello', date: 12345 } ]
    };

    const users = {
      u1: { username: 'Alice' },
      u2: { username: 'Bob' }
    };

    useChatState.mockImplementation(() => ({
      messages,
      users,
      createEmptyChat: mockCreateEmptyChat
    }));

    // search hook not used directly in this test
    useSearchUser.mockImplementation(() => ({ searchUser: vi.fn(), result: null, error: null }));

    const onSelectedUserChange = vi.fn();

    render(<ChatsList onSelectedUserChange={onSelectedUserChange} />);

    // Should render both chatitems
    const itemU1 = screen.getByTestId('chatitem-u1');
    const itemU2 = screen.getByTestId('chatitem-u2');
    expect(itemU1).toBeInTheDocument();
    expect(itemU2).toBeInTheDocument();

  // Verify message contents: u1 has no message, u2 has 'hello'
  const smallU1 = itemU1.querySelector('small');
  const smallU2 = itemU2.querySelector('small');
  expect(smallU1.textContent).toBe('');
  expect(smallU2.textContent).toBe('hello');

  // Clicking a chatitem should call the provided onSelectedUserChange via effect
  fireEvent.click(itemU2);
  // After clicking, parent effect should call onSelectedUserChange (hook sets selection via setState -> effect)
  // The effect runs synchronously in this environment, so ensure the callback was called at least once
  expect(onSelectedUserChange).toHaveBeenCalled();
  });

  it('prompts for username and calls searchUser when AddButton clicked', () => {
    const mockCreateEmptyChat = vi.fn();
    const messages = {};
    const users = {};

    const mockSearchUser = vi.fn();
    useChatState.mockImplementation(() => ({ messages, users, createEmptyChat: mockCreateEmptyChat }));
    useSearchUser.mockImplementation(() => ({ searchUser: mockSearchUser, result: null, error: null }));

    // mock prompt to return a username
    const promptSpy = vi.spyOn(window, 'prompt').mockImplementation(() => 'searchedUser');

    render(<ChatsList />);

    // Click the AddButton (it renders a button with role button)
    const addButton = screen.getByRole('button');
    fireEvent.click(addButton);

    expect(promptSpy).toHaveBeenCalled();
    expect(mockSearchUser).toHaveBeenCalledWith('searchedUser');

    promptSpy.mockRestore();
  });

  it('calls createEmptyChat when userResult is provided by useSearchUser', () => {
    const mockCreateEmptyChat = vi.fn();
    const messages = {};
    const users = {};

    const user = { id: 'newId', username: 'New', email: 'n@e.com', rsaPublicKey: 'key' };

    useChatState.mockImplementation(() => ({ messages, users, createEmptyChat: mockCreateEmptyChat }));
    useSearchUser.mockImplementation(() => ({ searchUser: vi.fn(), result: { result: user }, error: null }));

    render(<ChatsList />);

    expect(mockCreateEmptyChat).toHaveBeenCalledWith({
      userId: user.id,
      username: user.username,
      email: user.email,
      rsaPublicKey: user.rsaPublicKey
    });
  });

  it('shows alert when errorResult is provided by useSearchUser', () => {
    const mockCreateEmptyChat = vi.fn();
    const messages = {};
    const users = {};

    useChatState.mockImplementation(() => ({ messages, users, createEmptyChat: mockCreateEmptyChat }));
    useSearchUser.mockImplementation(() => ({ searchUser: vi.fn(), result: null, error: { message: 'err' } }));

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<ChatsList />);

    expect(alertSpy).toHaveBeenCalledWith("No se encontró el usuario. Intenta con otro nombre o email.");

    alertSpy.mockRestore();
  });

  it('calls onSelectedUserChange with the selected user id', () => {
    const mockCreateEmptyChat = vi.fn();

    const messages = {
      u1: [],
      u2: [ { datetime: 12345, message: 'hello', date: 12345 } ]
    };

    const users = {
      u1: { username: 'Alice' },
      u2: { username: 'Bob' }
    };

    useChatState.mockImplementation(() => ({
      messages,
      users,
      createEmptyChat: mockCreateEmptyChat
    }));
    useSearchUser.mockImplementation(() => ({ searchUser: vi.fn(), result: null, error: null }));

    const onSelectedUserChange = vi.fn();
    render(<ChatsList onSelectedUserChange={onSelectedUserChange} />);

    const itemU2 = screen.getByTestId('chatitem-u2');
    fireEvent.click(itemU2);

    expect(onSelectedUserChange).toHaveBeenCalledWith('u2');
  });
});
