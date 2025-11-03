import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

beforeEach(() => {
  vi.resetModules();
  vi.resetAllMocks();
  localStorage.clear();
});

describe('OAuthSuccessPage smoke', () => {
  it('stores token and calls refreshToken', async () => {
      // provide SessionContext
      const { default: SessionContext } = await import('../../../context/SessionContext');

      // set a fake query string using history API (works in jsdom)
      window.history.pushState({}, '', '/?token=tok123');

      // mock useNavigate to avoid actual navigation implementation
      vi.doMock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return { __esModule: true, ...actual, useNavigate: () => vi.fn() };
      });

      const refreshToken = vi.fn();

      const { default: OAuthSuccessPage } = await import('../OAuthSuccessPage.jsx');

      render(
        <SessionContext.Provider value={{ refreshToken }}>
          <OAuthSuccessPage />
        </SessionContext.Provider>
      );

      // effect should run synchronously after render; check localStorage and that refreshToken called
      expect(localStorage.getItem('token')).toBe('tok123');
      expect(refreshToken).toHaveBeenCalled();
      expect(screen.getByText(/Procesando autenticaci/i)).toBeTruthy();
  });
});
