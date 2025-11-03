import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock hooks and child components
vi.mock('../../../hooks/useToken', () => ({ __esModule: true, default: vi.fn() }));
vi.mock('../../../helpers/getTokenPayload', () => ({ __esModule: true, default: vi.fn() }));
vi.mock('../TopBar/TopBar', () => ({ __esModule: true, default: ({ name }) => <div data-testid="topbar">{name}</div> }));
vi.mock('../NavMenu/NavMenu', () => ({ __esModule: true, default: () => <div data-testid="navmenu" /> }));

import PageContainer from '../PageContainer';
import useToken from '../../../hooks/useToken';
import getTokenPayload from '../../../helpers/getTokenPayload';

describe('PageContainer', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('does not show TopBar when token is falsy', () => {
    useToken.mockImplementation(() => null);
    render(<PageContainer>Contenido</PageContainer>);
    expect(screen.queryByTestId('topbar')).not.toBeInTheDocument();
    expect(screen.getByText('Contenido')).toBeInTheDocument();
  });

  it('shows TopBar and NavMenu when token present and payload applied', async () => {
    useToken.mockImplementation(() => 'tok');
    getTokenPayload.mockImplementation(() => ({ name: 'Pablo', lastname: 'Lopez', id: 'u1', role: [], hasImage: false }));

    render(<PageContainer>Child</PageContainer>);

    // wait for effect to set payload
    await waitFor(() => expect(screen.getByTestId('topbar')).toBeInTheDocument());
    expect(screen.getByTestId('topbar')).toHaveTextContent('Pablo Lopez');
    expect(screen.getByTestId('navmenu')).toBeInTheDocument();
  });
});
