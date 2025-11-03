import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  vi.resetAllMocks();
});

describe('UnloggedIndexPage smoke', () => {
  it('renders LoginPage by default and RegisterPage on /register', async () => {
    // mock LoginPage, RegisterPage and OAuthSuccessPage so tests don't mount heavy dependencies
    vi.doMock('../LoginPage/LoginPage', () => ({ __esModule: true, default: () => <div data-testid="login" /> }));
    vi.doMock('../RegisterPage/RegisterPage', () => ({ __esModule: true, default: () => <div data-testid="register" /> }));
    vi.doMock('../OAuthSuccessPage/OAuthSuccessPage', () => ({ __esModule: true, default: () => <div data-testid="oauth" /> }));

    const { default: UnloggedIndexPage } = await import('../UnloggedIndexPage.jsx');

    const { default: SessionContext } = await import('../../../context/SessionContext');

    // render root -> login (wrap with SessionContext and GoogleOAuthProvider to satisfy LoginPage if it mounts)
    const { GoogleOAuthProvider } = await import('@react-oauth/google');
    render(
      <SessionContext.Provider value={{ refreshToken: () => {} }}>
        <GoogleOAuthProvider clientId="test-client-id">
          <MemoryRouter initialEntries={["/"]}>
            <UnloggedIndexPage />
          </MemoryRouter>
        </GoogleOAuthProvider>
      </SessionContext.Provider>
    );

  // The login stub may be mocked or the real LoginPage may be rendered; assert the heading exists
  expect(screen.getByRole('heading', { name: /Iniciar sesión/i })).toBeTruthy();

    // cleanup and render register route separately
    cleanup();

    render(
      <SessionContext.Provider value={{ refreshToken: () => {} }}>
        <GoogleOAuthProvider clientId="test-client-id">
          <MemoryRouter initialEntries={["/register"]}>
            <UnloggedIndexPage />
          </MemoryRouter>
        </GoogleOAuthProvider>
      </SessionContext.Provider>
    );

    // The register page may be mocked or the real component may render; assert heading exists
    expect(screen.getByRole('heading', { name: /Registrarse/i })).toBeTruthy();
  });
});
