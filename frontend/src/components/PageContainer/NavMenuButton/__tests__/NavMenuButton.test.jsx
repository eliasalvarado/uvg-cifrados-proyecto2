import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

import NavMenuButton from '../NavMenuButton';

describe('NavMenuButton', () => {
  it('renders label and calls clickCallback when clicked', () => {
    const cb = vi.fn();
    render(<NavMenuButton label="Prueba" clickCallback={cb}><span /></NavMenuButton>);

    expect(screen.getByText('Prueba')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('renders icon when provided', () => {
    render(<NavMenuButton label="Icono" icon={<span data-testid="i">i</span>} />);
    expect(screen.getByTestId('i')).toBeInTheDocument();
  });
});
