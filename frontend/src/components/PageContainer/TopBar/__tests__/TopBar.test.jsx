import React, { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';

// Mock UserInfo to keep test focused
vi.mock('../../UserInfo/UserInfo', () => ({ __esModule: true, default: ({ name }) => <div data-testid="user-info">{name}</div> }));

import TopBar from '../TopBar';

describe('TopBar', () => {
  it('renders logo, user info and toggler when showToggler is true', () => {
    const toggler = vi.fn();
    const ref = createRef();
    render(
      <MemoryRouter>
        <TopBar toggler={toggler} logo="/logo.png" name="Ana" showToggler={true} menuButtonRef={ref} />
      </MemoryRouter>
    );

    expect(screen.getByAltText('Logo de ASIGBO')).toBeInTheDocument();
    expect(screen.getByTestId('user-info')).toHaveTextContent('Ana');

    // toggler button exists
    const btn = screen.getByRole('button');
    fireEvent.click(btn);
    expect(toggler).toHaveBeenCalled();
  });
});
