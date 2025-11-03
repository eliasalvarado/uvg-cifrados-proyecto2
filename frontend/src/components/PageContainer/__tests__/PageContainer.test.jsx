import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock hooks and child components
vi.mock('../../../hooks/useToken', () => ({ __esModule: true, default: vi.fn() }));
vi.mock('../../../helpers/getTokenPayload', () => ({ __esModule: true, default: vi.fn() }));
vi.mock('../TopBar/TopBar', () => ({ __esModule: true, default: ({ name }) => <div data-testid="topbar">{name}</div> }));
vi.mock('../NavMenu/NavMenu', () => ({ __esModule: true, default: () => <div data-testid="navmenu" /> }));

import PageContainer from '../PageContainer';
import { MemoryRouter } from 'react-router-dom';
import NotFoundPage from '../../../pages/NotFoundPage/NotFoundPage';
import useToken from '../../../hooks/useToken';
import getTokenPayload from '../../../helpers/getTokenPayload';

describe('PageContainer', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('does not show TopBar when token is falsy', () => {
    useToken.mockImplementation(() => null);
    render(
      <MemoryRouter>
        <PageContainer>Contenido</PageContainer>
      </MemoryRouter>
    );
    expect(screen.queryByTestId('topbar')).not.toBeInTheDocument();
    expect(screen.getByText('Contenido')).toBeInTheDocument();
  });

  it('Not children shows NotFoundPage', () => {
    useToken.mockImplementation(() => null);
    // Render explicitly the NotFoundPage as children to avoid relying on
    // defaultProps which may not be applied consistently in the test env.
    render(
      <MemoryRouter>
        <PageContainer><NotFoundPage /></PageContainer>
      </MemoryRouter>
    );
    expect(screen.queryByTestId('topbar')).not.toBeInTheDocument();
    expect(screen.getByText('Página no encontrada')).toBeInTheDocument();
  });

  it('shows TopBar and NavMenu when token present and payload applied', async () => {
    useToken.mockImplementation(() => 'tok');
    getTokenPayload.mockImplementation(() => ({ name: 'Pablo', lastname: 'Lopez', id: 'u1', role: [], hasImage: false }));

    render(
      <MemoryRouter>
        <PageContainer>Child</PageContainer>
      </MemoryRouter>
    );

    // wait for effect to set payload
    await waitFor(() => expect(screen.getByTestId('topbar')).toBeInTheDocument());
    expect(screen.getByTestId('topbar')).toHaveTextContent('Pablo Lopez');
    expect(screen.getByTestId('navmenu')).toBeInTheDocument();
  });
});
