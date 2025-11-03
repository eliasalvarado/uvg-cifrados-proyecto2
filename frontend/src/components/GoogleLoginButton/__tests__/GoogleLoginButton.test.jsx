import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

// Mock @react-oauth/google
vi.mock('@react-oauth/google', () => ({
  __esModule: true,
  GoogleLogin: ({ onSuccess }) => (
    <button data-testid="google-login" onClick={() => onSuccess && onSuccess({})}>G</button>
  ),
}));

// Mock Spinner
vi.mock('../../Spinner', () => ({ __esModule: true, default: () => <div data-testid="spinner">S</div> }));

import GoogleLoginButton from '../GoogleLoginButton';

describe('GoogleLoginButton', () => {
  it('renders Spinner when loading', () => {
    render(<GoogleLoginButton handleSuccess={() => {}} loading={true} />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders GoogleLogin and calls onSuccess on click', () => {
    const onSuccess = vi.fn();
    render(<GoogleLoginButton handleSuccess={onSuccess} loading={false} />);
    const btn = screen.getByTestId('google-login');
    fireEvent.click(btn);
    expect(onSuccess).toHaveBeenCalled();
  });

  it('shows error message when error provided', () => {
    const err = { message: 'boom' };
    render(<GoogleLoginButton handleSuccess={() => {}} loading={false} error={err} />);
    expect(screen.getByText(/Error: boom/)).toBeInTheDocument();
  });
});
