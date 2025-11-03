import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// hoist-safe: reset modules before each test to ensure mocks are applied
beforeEach(() => {
  vi.resetModules();
  vi.resetAllMocks();
});

describe('ChatPage smoke', () => {
  it('renders NavBar and chats list by default', async () => {
    // Mock child components (relative paths from this test file)
    vi.doMock('../../../components/NavBar/NavBar', () => ({ __esModule: true, default: () => <div data-testid="nav" /> }));
    vi.doMock('../../../components/ChatsList/ChatsList', () => ({ __esModule: true, default: ({ children }) => <div data-testid="chats-list" /> }));
    vi.doMock('../../../components/SingleChat/SingleChat', () => ({ __esModule: true, default: () => <div data-testid="single-chat" /> }));
    vi.doMock('../../../pages/ProfilePage/ProfilePage', () => ({ __esModule: true, default: () => <div data-testid="profile" /> }));
    vi.doMock('../../../components/ChatRoomsList/ChatRoomsList', () => ({ __esModule: true, default: () => <div data-testid="rooms-list" /> }));
    vi.doMock('../../../components/RoomChat/RoomChat', () => ({ __esModule: true, default: () => <div data-testid="room-chat" /> }));
    vi.doMock('../../../components/EphemeralMessages/EphemeralMessages', () => ({ __esModule: true, default: () => <div data-testid="ephemeral" /> }));
    vi.doMock('../../../components/Blockchain/BlockchainViewer', () => ({ __esModule: true, default: () => <div data-testid="blockchain" /> }));

    // Mock hook useChatState used by ChatPage
    vi.doMock('../../../hooks/useChatState', () => ({ __esModule: true, default: () => ({ users: {}, groups: {} }) }));

    const { default: ChatPage } = await import('../ChatPage.jsx');

    render(<ChatPage />);

    expect(screen.getByTestId('nav')).toBeTruthy();
    expect(screen.getByTestId('chats-list')).toBeTruthy();
  });
});
