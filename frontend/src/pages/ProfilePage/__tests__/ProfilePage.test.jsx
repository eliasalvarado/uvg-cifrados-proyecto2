import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

beforeEach(() => {
  vi.resetModules();
  vi.resetAllMocks();
});

describe('ProfilePage smoke', () => {
  it('renders heading and buttons and does not require real token', async () => {
    // Mock hooks and child components used inside ProfilePage
    vi.doMock('../../../hooks/useToken', () => ({ __esModule: true, default: () => 'tok' }));
    vi.doMock('../../../hooks/useFetch', () => ({ __esModule: true, default: () => ({ callFetch: () => {}, result: null, loading: false, error: null, reset: () => {} }) }));
    vi.doMock('../../../hooks/usePopup', () => ({ __esModule: true, default: () => [false, () => {}, () => {}] }));
    vi.doMock('../../../components/Button', () => ({ __esModule: true, default: ({ text }) => <button data-testid="btn">{text}</button> }));
    vi.doMock('../../../components/Popup', () => ({ __esModule: true, default: ({ children }) => <div data-testid="popup">{children}</div> }));
    vi.doMock('../../../components/Spinner', () => ({ __esModule: true, default: () => <div data-testid="spinner" /> }));

    const { default: SessionContext } = await import('../../../context/SessionContext');
    const { default: ProfilePage } = await import('../ProfilePage.jsx');

    render(
      <SessionContext.Provider value={{ clearToken: () => {} }}>
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      </SessionContext.Provider>
    );

    expect(screen.getByRole('heading', { name: /Perfil de Usuario/i })).toBeTruthy();
    // Buttons rendered for MFA and logout
    expect(screen.getAllByTestId('btn').length).toBeGreaterThan(0);
  });
});
