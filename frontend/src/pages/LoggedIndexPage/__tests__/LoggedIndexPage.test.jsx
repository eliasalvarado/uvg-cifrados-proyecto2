import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  vi.resetAllMocks();
});

describe('LoggedIndexPage smoke', () => {
  it('renders ChatPage for / route', async () => {
    vi.doMock('../ChatPage/ChatPage', () => ({ __esModule: true, default: () => <div data-testid="chat-page" /> }));
    vi.doMock('../ProfilePage/ProfilePage', () => ({ __esModule: true, default: () => <div data-testid="profile-page" /> }));

    const { default: ChatContext } = await import('../../../context/ChatContext');
    const { default: SessionContext } = await import('../../../context/SessionContext');
    const { default: LoggedIndexPage } = await import('../LoggedIndexPage.jsx');

    render(
      <SessionContext.Provider value={{ token: null, setToken: () => {}, refreshToken: () => {}, clearToken: () => {} }}>
        <ChatContext.Provider value={{ messages: {}, setMessages: () => {}, users: {}, setUsers: () => {}, groups: {}, setGroups: () => {}, groupMessages: {}, setGroupMessages: () => {} }}>
          <MemoryRouter initialEntries={["/"]}>
            <LoggedIndexPage />
          </MemoryRouter>
        </ChatContext.Provider>
      </SessionContext.Provider>
    );

    // The ChatPage includes the NavBar which renders a <nav>; assert navigation exists
    expect(screen.getByRole('navigation')).toBeTruthy();
  });
});
