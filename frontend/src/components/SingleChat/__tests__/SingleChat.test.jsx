import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock hooks and child components before importing the component under test
const addSingleChatMessage = vi.fn();
const sendMessageSpy = vi.fn();

vi.mock('../../../hooks/useChatState', () => ({
  __esModule: true,
  default: () => ({ messages: { u1: [ { message: 'hello', datetime: new Date(), sent: false, from: 'other', verified: true } ] }, addSingleChatMessage }),
}));

vi.mock('../../../hooks/simpleChat/useSendMessage', () => ({
  __esModule: true,
  default: () => ({ sendMessage: sendMessageSpy, error: null }),
}));

// Mock Message to render the message text so we can assert it exists
vi.mock('../../Message/Message', () => ({ __esModule: true, default: ({ message }) => <li>{message}</li> }));

// Mock ChatInput to provide a controllable button that triggers onSend
vi.mock('../../ChatInput/ChatInput', () => ({ __esModule: true, default: ({ onSend }) => (
  <div>
    <button data-testid="send-button" onClick={() => onSend('test-message')}>Send</button>
  </div>
)}));

import SingleChat from '../SingleChat';

describe('SingleChat', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders header and messages and sends messages via hooks', () => {
    render(<SingleChat userId="u1" username="User One" />);

    // header
    expect(screen.getByText('User One')).toBeInTheDocument();

    // message from mocked useChatState/Message
    expect(screen.getByText('hello')).toBeInTheDocument();

    // trigger send via mocked ChatInput
    fireEvent.click(screen.getByTestId('send-button'));

    expect(sendMessageSpy).toHaveBeenCalledWith({ targetUserId: 'u1', message: 'test-message' });

    // addSingleChatMessage should be called with a message object containing our text
    expect(addSingleChatMessage).toHaveBeenCalled();
    const added = addSingleChatMessage.mock.calls[0][0];
    expect(added.message).toBe('test-message');
    expect(added.sent).toBe(true);
  });

  it('alerts when sendError has status 503', async () => {
    // Reset module registry so we can mock differently for this test
    vi.resetModules();
    // Provide a mock implementation that returns an error
    vi.doMock('../../../hooks/simpleChat/useSendMessage', () => ({
      __esModule: true,
      default: () => ({ sendMessage: vi.fn(), error: { status: 503, message: 'Service down' } }),
    }));

    const alertSpy = vi.spyOn(global, 'alert').mockImplementation(() => {});

    // Import the component after the mock so it picks it up
    const mod = await import('../SingleChat');
    const SingleChatReloaded = mod.default;
    render(<SingleChatReloaded userId="u1" username="User One" />);

    expect(alertSpy).toHaveBeenCalledWith('Service down');

    alertSpy.mockRestore();
  });
});
