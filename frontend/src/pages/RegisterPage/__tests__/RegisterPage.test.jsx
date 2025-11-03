import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

beforeEach(() => {
  vi.resetModules();
  vi.resetAllMocks();
});

describe('RegisterPage smoke', () => {
  it('renders heading and register button without real network', async () => {
    vi.doMock('../../../hooks/useFetch', () => ({ __esModule: true, default: () => ({ callFetch: () => {}, result: null, loading: false, error: null }) }));
    vi.doMock('../../../components/InputText', () => ({ __esModule: true, default: () => <input data-testid="input-text" /> }));
    vi.doMock('../../../components/Button', () => ({ __esModule: true, default: ({ text }) => <button data-testid="btn">{text}</button> }));
    vi.doMock('../../../components/Spinner', () => ({ __esModule: true, default: () => <div data-testid="spinner" /> }));

    const { default: SessionContext } = await import('../../../context/SessionContext');
    const { default: RegisterPage } = await import('../RegisterPage.jsx');

    render(
      <SessionContext.Provider value={{ refreshToken: () => {} }}>
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      </SessionContext.Provider>
    );

    expect(screen.getByRole('heading', { name: /Registrarse/i })).toBeTruthy();
    expect(screen.getByTestId('btn')).toBeTruthy();
  });
});
