import React from 'react';
import { act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('user hooks', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
  });

  it('useGetUserById calls callFetch with correct URL', async () => {
    const callFetch = vi.fn();
    vi.doMock('../../useFetch.js', () => ({ __esModule: true, default: () => ({ callFetch, result: null, loading: false, error: null }) }));
    vi.doMock('../../useToken.js', () => ({ __esModule: true, default: () => 'tok' }));

    const { default: useGetUserById } = await import('../useGetUserById.js');
    const { getUserById } = useGetUserById();
    await act(async () => { await getUserById('u1'); });

    expect(callFetch).toHaveBeenCalled();
    const opts = callFetch.mock.calls[0][0];
    expect(opts.uri).toContain('/user/u1');
  });

  it('useSearchUser calls callFetch and returns response', async () => {
    const returned = { ok: true };
    const callFetch = vi.fn(() => returned);
    vi.doMock('../../useFetch.js', () => ({ __esModule: true, default: () => ({ callFetch, result: null, loading: false, error: null }) }));
    vi.doMock('../../useToken.js', () => ({ __esModule: true, default: () => 'tok' }));

    const { default: useSearchUser } = await import('../useSearchUser.js');
    const { searchUser } = useSearchUser();
    let res;
    await act(async () => { res = await searchUser('term'); });

    expect(callFetch).toHaveBeenCalled();
    expect(res).toBe(returned);
  });
});
