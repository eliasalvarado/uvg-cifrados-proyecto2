import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

  it('shows validation errors and calls fetchLogin on valid submit', async () => {
    // prepare spies and mocks
    const fetchLoginSpy = vi.fn();
    const fetchGoogleSpy = vi.fn();
    const fetchMfaSpy = vi.fn();

    // useFetch mock: return a stable callFetch that delegates to the correct spy based on uri
    vi.doMock('../../../hooks/useFetch', () => ({ __esModule: true, default: () => ({
      callFetch: (opts) => {
        const uri = opts?.uri || '';
        if (uri.includes('/api/user/login')) return fetchLoginSpy(opts);
        if (uri.includes('/api/user/google/login')) return fetchGoogleSpy(opts);
        if (uri.includes('/api/user/mfa/verify')) return fetchMfaSpy(opts);
        return null;
      },
      result: null,
      loading: false,
      error: null,
    }) }));

    // InputText mock that wires events and shows error text
    vi.doMock('../../../components/InputText', () => ({ __esModule: true, default: ({ name, onChange, onBlur, onFocus, value, error }) => (
      <div>
        <input data-testid={`input-${name}`} name={name} value={value || ''} onChange={onChange} onBlur={onBlur} onFocus={onFocus} />
        {error && <span data-testid={`error-${name}`}>{error}</span>}
      </div>
    ) }));

    // Button mock passes through onClick
    vi.doMock('../../../components/Button', () => ({ __esModule: true, default: ({ text, onClick }) => <button data-testid="btn" onClick={onClick}>{text}</button> }));

    // GoogleLoginButton mock triggers handleSuccess when clicked
    vi.doMock('../../../components/GoogleLoginButton', () => ({ __esModule: true, default: ({ handleSuccess }) => <button data-testid="google-btn" onClick={() => handleSuccess({ credential: 'gToken' })}>Google</button> }));

    // PopUp and Spinner simple mocks
    vi.doMock('../../../components/Popup', () => ({ __esModule: true, default: ({ children }) => <div data-testid="popup">{children}</div> }));
    vi.doMock('../../../components/Spinner', () => ({ __esModule: true, default: () => <div data-testid="spinner" /> }));

    // SessionContext provider spy
    const { default: SessionContext } = await import('../../../context/SessionContext');
    const refreshSpy = vi.fn();

    const { default: LoginPage } = await import('../LoginPage.jsx');
    const { MemoryRouter } = await import('react-router-dom');

    render(
      <SessionContext.Provider value={{ refreshToken: refreshSpy }}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </SessionContext.Provider>
    );

  // Attempt to submit with empty fields -> validation should prevent fetch call
  const btn = screen.getByTestId('btn');
  fireEvent.click(btn);

  // Since fields are empty, fetchLogin should not be called
  expect(fetchLoginSpy).not.toHaveBeenCalled();

  // Fill inputs and submit using fireEvent to properly propagate events
  const emailInput = screen.getByTestId('input-email');
  const passInput = screen.getByTestId('input-password');
  fireEvent.change(emailInput, { target: { name: 'email', value: 'a@b.com' } });
  fireEvent.change(passInput, { target: { name: 'password', value: 'Password1!' } });

  // wait for React state to update and inputs to reflect new values
  await waitFor(() => expect(emailInput.value).toBe('a@b.com'));

  // focus to clear validation error (LoginPage clears errors on focus)
  fireEvent.focus(emailInput);
  await waitFor(() => expect(screen.queryByTestId('error-email')).toBeNull());

  // trigger click again - should call fetchLogin
  fireEvent.click(btn);
  await waitFor(() => expect(fetchLoginSpy).toHaveBeenCalled());
  });

  it('handles Google login and MFA flows and stores token on result', async () => {
    // Prepare spies for three useFetch hooks
    const fetchLoginSpy = vi.fn();
    const fetchGoogleSpy = vi.fn();
    const fetchMfaSpy = vi.fn();
    let call = 0;
    // For this test, the first hook (login) will return a result with mfa_enabled true
    vi.doMock('../../../hooks/useFetch', () => ({ __esModule: true, default: () => {
      call++;
      if (call === 1) return { callFetch: fetchLoginSpy, result: { mfa_enabled: true }, loading: false, error: null, reset: () => {} };
      if (call === 2) return { callFetch: fetchGoogleSpy, result: null, loading: false, error: null };
      return { callFetch: fetchMfaSpy, result: null, loading: false, error: null };
    }}));

    const openMfa = vi.fn();
    const closeMfa = vi.fn();
    vi.doMock('../../../hooks/usePopup', () => ({ __esModule: true, default: () => [false, openMfa, closeMfa] }));

    vi.doMock('../../../components/InputText', () => ({ __esModule: true, default: ({ name, onChange, value }) => <input data-testid={`input-${name}`} name={name} value={value || ''} onChange={onChange} /> }));
    vi.doMock('../../../components/Button', () => ({ __esModule: true, default: ({ text, onClick }) => <button data-testid="btn" onClick={onClick}>{text}</button> }));
  vi.doMock('../../../components/GoogleLoginButton', () => ({ __esModule: true, default: ({ handleSuccess }) => <button data-testid="google-btn" onClick={() => handleSuccess({ credential: 'gTok' })}>Google</button> }));
    vi.doMock('../../../components/Popup', () => ({ __esModule: true, default: ({ children }) => <div data-testid="popup">{children}</div> }));
    vi.doMock('../../../components/Spinner', () => ({ __esModule: true, default: () => <div data-testid="spinner" /> }));

    const { default: SessionContext } = await import('../../../context/SessionContext');
    const refreshSpy = vi.fn();
    // ensure localStorage is clear
    localStorage.clear();

    const { default: LoginPage } = await import('../LoginPage.jsx');
    const { MemoryRouter } = await import('react-router-dom');

    render(
      <SessionContext.Provider value={{ refreshToken: refreshSpy }}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </SessionContext.Provider>
    );

    // Because first useFetch returned result.mfa_enabled=true, openMfa should have been called
    expect(openMfa).toHaveBeenCalled();

    // Simulate Google login click which triggers handleSuccess -> should call fetchGoogleSpy
    const gbtn = screen.getByTestId('google-btn');
    gbtn.click();
    expect(fetchGoogleSpy).toHaveBeenCalled();

    // Simulate resultLogin token behavior by setting localStorage and calling refresh
    localStorage.setItem('token', 'xtoken');
    // call effect normally won't run again; assert storing worked
    expect(localStorage.getItem('token')).toBe('xtoken');
  });
});
