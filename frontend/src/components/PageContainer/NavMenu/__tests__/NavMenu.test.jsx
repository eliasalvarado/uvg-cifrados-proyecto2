import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock child components to keep tests focused
vi.mock('../../UserPicture/UserPicture', () => ({ __esModule: true, default: ({ name }) => <div data-testid="userpic">{name}</div> }));
vi.mock('../NavMenuButton/NavMenuButton', () => ({ __esModule: true, default: ({ label, clickCallback }) => <button type="button" onClick={clickCallback}>{label}</button> }));
vi.mock('../../LoadingView/LoadingView', () => ({ __esModule: true, default: () => <div data-testid="loading">loading</div> }));

vi.mock('../../../../hooks/useLogout', () => ({ __esModule: true, default: vi.fn() }));

import NavMenu from '../NavMenu';
import useLogout from '../../../../hooks/useLogout';

describe('NavMenu', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders name and basic options and does not show panel when role missing', () => {
    const logoutMock = vi.fn();
    useLogout.mockImplementation(() => ({ logout: logoutMock, loading: false }));

    render(
      <MemoryRouter>
        <NavMenu name="Juan" idUser="u1" toggler={vi.fn()} roles={[]} hasImage={false} />
      </MemoryRouter>
    );

    expect(screen.getByText('Juan')).toBeInTheDocument();
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.queryByText('Panel de opciones')).not.toBeInTheDocument();
  });

  it('shows panel option when roles include admin and shows loading view when loading', () => {
    const logoutMock = vi.fn();
    useLogout.mockImplementation(() => ({ logout: logoutMock, loading: true }));

    render(
      <MemoryRouter>
        <NavMenu name="Admin" idUser="a1" toggler={vi.fn()} roles={["admin"]} hasImage />
      </MemoryRouter>
    );

    expect(screen.getByText('Panel de opciones')).toBeInTheDocument();
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });
});
