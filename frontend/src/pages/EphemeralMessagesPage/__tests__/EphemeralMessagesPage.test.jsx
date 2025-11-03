import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  vi.resetAllMocks();
});

describe('EphemeralMessagesPage smoke', () => {
  it('renders heading and EphemeralMessages component', async () => {
  vi.doMock('../../../components/EphemeralMessages/EphemeralMessages', () => ({ __esModule: true, default: () => <div data-testid="ephemeral-comp" /> }));

    const { default: EphemeralMessagesPage } = await import('../EphemeralMessagesPage.jsx');

    render(<EphemeralMessagesPage />);

    expect(screen.getByText(/Mensajes Efímeros/i)).toBeTruthy();
    expect(screen.getByTestId('ephemeral-comp')).toBeTruthy();
  });
});
