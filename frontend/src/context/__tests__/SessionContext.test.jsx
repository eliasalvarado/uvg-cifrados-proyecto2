import React, { useContext } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import SessionContext, { SessionProvider } from '../SessionContext';

const Consumer = () => {
  const ctx = useContext(SessionContext);
  return (
    <div>
      <span data-testid="token">{ctx.token}</span>
      <button type="button" onClick={ctx.clearToken}>clear</button>
      <button type="button" onClick={ctx.refreshToken}>refresh</button>
    </div>
  );
};

describe('SessionContext', () => {
  it('loads token from localStorage on mount and exposes clear/refresh', () => {
    localStorage.setItem('token', 'abc');
    render(
      <SessionProvider>
        <Consumer />
      </SessionProvider>
    );

    expect(screen.getByTestId('token').textContent).toBe('abc');

    // clear token via context
    fireEvent.click(screen.getByText('clear'));
    expect(screen.getByTestId('token').textContent).toBe('');

    // refresh should reload token from localStorage
    localStorage.setItem('token', 'xyz');
    fireEvent.click(screen.getByText('refresh'));
    expect(screen.getByTestId('token').textContent).toBe('xyz');
  });
});
