import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

// Mock IndexPage so we don't pull actual pages
vi.mock('../../../pages/IndexPage/IndexPage', () => ({
  __esModule: true,
  default: () => <div>INDEX PAGE</div>
}));

// Mock providers to simple wrappers
vi.mock('../../../context/SessionContext', () => ({
  __esModule: true,
  SessionProvider: ({ children }) => <div data-testid="session">{children}</div>
}));
vi.mock('../../../context/ChatContext', () => ({
  __esModule: true,
  ChatProvider: ({ children }) => <div data-testid="chat">{children}</div>
}));
vi.mock('../../../context/SocketContext', () => ({
  __esModule: true,
  SocketProvider: ({ children }) => <div data-testid="socket">{children}</div>
}));

vi.mock('@react-oauth/google', () => ({
  __esModule: true,
  GoogleOAuthProvider: ({ children }) => <div data-testid="google">{children}</div>,
  GoogleLogin: ({ onSuccess }) => (
    <button data-testid="google-login" onClick={() => onSuccess && onSuccess({})}>G</button>
  ),
}));

import App from '../App';

describe('App', () => {
  it('renders IndexPage inside providers', () => {
    render(<App />);
    expect(screen.getByText('INDEX PAGE')).toBeInTheDocument();
    // providers wrappers exist
    expect(screen.getByTestId('session')).toBeInTheDocument();
    expect(screen.getByTestId('chat')).toBeInTheDocument();
    expect(screen.getByTestId('socket')).toBeInTheDocument();
    expect(screen.getByTestId('google')).toBeInTheDocument();
  });
});
