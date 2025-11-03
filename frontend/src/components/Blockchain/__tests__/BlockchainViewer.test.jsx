import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mocks for hooks and consts
vi.mock('../../../hooks/useFetch', () => ({
  __esModule: true,
  default: vi.fn()
}));
vi.mock('../../../hooks/useToken', () => ({
  __esModule: true,
  default: vi.fn()
}));

import useFetch from '../../../hooks/useFetch';
import useToken from '../../../hooks/useToken';
import consts from '../../../helpers/consts';
import BlockchainViewer from '../BlockchainViewer';

describe('BlockchainViewer', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('does not call fetch when token is null and shows nothing', () => {
    const callFetch = vi.fn();
    useToken.mockImplementation(() => null);
    useFetch.mockImplementation(() => ({ callFetch, result: null, error: null, loading: false, reset: vi.fn() }));

    render(<BlockchainViewer />);

    expect(callFetch).not.toHaveBeenCalled();
    expect(screen.queryByText('Cargando…')).toBeNull();
  });

  it('calls callFetch when token exists and shows loading', () => {
    const callFetch = vi.fn();
    const reset = vi.fn();
    useToken.mockImplementation(() => 'tok');
    useFetch.mockImplementation(() => ({ callFetch, result: null, error: null, loading: true, reset }));

    render(<BlockchainViewer />);

    expect(callFetch).toHaveBeenCalled();
    // should show loading text
    expect(screen.getByText('Cargando…')).toBeInTheDocument();
  });

  it('shows error message when error present', () => {
    useToken.mockImplementation(() => 'tok');
    useFetch.mockImplementation(() => ({ callFetch: vi.fn(), result: null, error: { message: 'fail' }, loading: false, reset: vi.fn() }));

    render(<BlockchainViewer />);

    expect(screen.getByText(/Error:/)).toBeInTheDocument();
    expect(screen.getByText(/fail/)).toBeInTheDocument();
  });

  it('renders chain table when chainData present and validation ok', () => {
    useToken.mockImplementation(() => 'tok');
    const block = {
      id: 'b1',
      block_index: 1,
      timestamp: String(Date.now()),
      prev_hash: 'p',
      hash: 'h',
      data: JSON.stringify({ from: 'A', to: 'B', msgHash: 'm1' })
    };

    useFetch.mockImplementation(() => ({ callFetch: vi.fn(), result: { chain: [block], validation: { ok: true } }, error: null, loading: false, reset: vi.fn() }));

    render(<BlockchainViewer />);

    expect(screen.getByText('Blockchain interna')).toBeInTheDocument();
    expect(screen.getByText('Cadena íntegra ✅')).toBeInTheDocument();
    // table headers
    expect(screen.getByText('#')).toBeInTheDocument();
    // check values from block
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('m1')).toBeInTheDocument();
  });

  it('renders broken badge when validation fails and shows corrupted text', () => {
    useToken.mockImplementation(() => 'tok');
    const block = {
      id: 'b2',
      block_index: 5,
      timestamp: String(Date.now()),
      prev_hash: 'p2',
      hash: 'h2',
      data: { from: 'X', to: 'Y', msgHash: 'm2' }
    };

    useFetch.mockImplementation(() => ({ callFetch: vi.fn(), result: { chain: [block], validation: { ok: false, firstTamperedIndex: 5 } }, error: null, loading: false, reset: vi.fn() }));

    render(<BlockchainViewer />);

    expect(screen.getByText('Cadena corrupta ⚠️')).toBeInTheDocument();
    expect(screen.getByText('X')).toBeInTheDocument();
    expect(screen.getByText('Y')).toBeInTheDocument();
  });
});
