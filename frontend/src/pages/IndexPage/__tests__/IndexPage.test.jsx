import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  vi.resetAllMocks();
});

describe('IndexPage smoke', () => {
  it('renders UnloggedIndexPage when no token', async () => {
    // mock useToken to return null
    vi.doMock('@hooks/useToken', () => ({ __esModule: true, default: () => null }));
    vi.doMock('../../LoggedIndexPage/LoggedIndexPage', () => ({ __esModule: true, default: () => <div data-testid="logged" /> }));
    vi.doMock('../../UnloggedIndexPage/UnloggedIndexPage', () => ({ __esModule: true, default: () => <div data-testid="unlogged" /> }));

    const { default: IndexPage } = await import('../IndexPage.jsx');
    render(<IndexPage />);

    expect(screen.getByTestId('unlogged')).toBeTruthy();
  });

  it('renders LoggedIndexPage when token present', async () => {
    vi.doMock('@hooks/useToken', () => ({ __esModule: true, default: () => 'tok' }));
    vi.doMock('../../LoggedIndexPage/LoggedIndexPage', () => ({ __esModule: true, default: () => <div data-testid="logged" /> }));
    vi.doMock('../../UnloggedIndexPage/UnloggedIndexPage', () => ({ __esModule: true, default: () => <div data-testid="unlogged" /> }));

    const { default: IndexPage } = await import('../IndexPage.jsx');
    render(<IndexPage />);

    expect(screen.getByTestId('logged')).toBeTruthy();
  });
});
