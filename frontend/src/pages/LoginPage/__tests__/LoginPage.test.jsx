import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  vi.resetAllMocks();
});

describe('LoginPage smoke', () => {
  it('renders heading and google button', async () => {
    // Mock child components and hooks
    vi.doMock('../../../hooks/useFetch', () => ({ __esModule: true, default: () => ({ callFetch: () => {}, result: null, loading: false, error: null }) }));
    vi.doMock('../../../components/InputText', () => ({ __esModule: true, default: () => <input data-testid="input-text" /> }));
    vi.doMock('../../../components/Button', () => ({ __esModule: true, default: ({ text }) => <button data-testid="btn">{text}</button> }));
    vi.doMock('../../../components/GoogleLoginButton', () => ({ __esModule: true, default: () => <div data-testid="google-btn" /> }));
    vi.doMock('../../../components/Popup', () => ({ __esModule: true, default: ({ children }) => <div data-testid="popup">{children}</div> }));
    vi.doMock('../../../components/Spinner', () => ({ __esModule: true, default: () => <div data-testid="spinner" /> }));

    // Import SessionContext to provide a minimal provider value
    const { default: SessionContext } = await import('../../../context/SessionContext');
    const { default: LoginPage } = await import('../LoginPage.jsx');

    const { MemoryRouter } = await import('react-router-dom');
    render(
      <SessionContext.Provider value={{ refreshToken: () => {} }}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </SessionContext.Provider>
    );

  // There are multiple elements with the text 'Iniciar sesión' (heading and button).
  // Assert the page heading specifically to avoid ambiguity.
  expect(screen.getByRole('heading', { name: /Iniciar sesión/i })).toBeTruthy();
    expect(screen.getByTestId('google-btn')).toBeTruthy();
  });
});
