import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

// Mock randomId to deterministic value
vi.mock('@helpers/randomString', () => ({ __esModule: true, default: () => 'fixed-id' }));

import InputText from '../InputText';

describe('InputText', () => {
  it('renders title and value and calls onChange', () => {
    const onChange = vi.fn();
    render(<InputText title="Email" value="a@b.com" onChange={onChange} />);
    expect(screen.getByText('Email')).toBeInTheDocument();
    const input = screen.getByDisplayValue('a@b.com');
    fireEvent.change(input, { target: { value: 'x' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('renders error and uses password type when hidden prop true', () => {
    const onChange = vi.fn();
    render(<InputText title="Pwd" value="p" hidden error="err" onChange={onChange} />);
    expect(screen.getByText('Pwd')).toBeInTheDocument();
    expect(screen.getByText('err')).toBeInTheDocument();
    const input = screen.getByDisplayValue('p');
    expect(input.getAttribute('type')).toBe('password');
  });
});
