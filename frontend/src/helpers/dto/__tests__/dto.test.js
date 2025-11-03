import { describe, it, expect } from 'vitest';

import getGroupMessageObject from '../getGroupMessageObject';
import getGroupObject from '../getGroupObject';
import getUserObject from '../getUserObject';

describe('DTO helpers', () => {
  it('getGroupMessageObject returns an object with provided fields', () => {
    const now = new Date();
    const obj = getGroupMessageObject({
      message: 'hola',
      userId: 'u1',
      datetime: now,
      sent: true,
      username: 'Pablo',
      verified: false,
    });

    expect(obj).toEqual({
      message: 'hola',
      userId: 'u1',
      datetime: now,
      sent: true,
      username: 'Pablo',
      verified: false,
    });
  });

  it('getGroupObject sets defaults for members and key when missing', () => {
    const obj1 = getGroupObject({ name: 'G1', members: ['u1', 'u2'], key: 'k' });
    expect(obj1).toEqual({ name: 'G1', members: ['u1', 'u2'], key: 'k' });

    const obj2 = getGroupObject({ name: 'G2' });
    // members should default to empty array and key to null
    expect(obj2).toEqual({ name: 'G2', members: [], key: null });
  });

  it('getUserObject maps properties directly', () => {
    const obj = getUserObject({ userId: 'u1', username: 'Ana', email: 'a@b.c', rsaPublicKey: 'pk' });
    expect(obj).toEqual({ userId: 'u1', username: 'Ana', email: 'a@b.c', rsaPublicKey: 'pk' });

    // missing fields remain undefined
    const obj2 = getUserObject({ userId: 'u2' });
    expect(obj2).toEqual({ userId: 'u2', username: undefined, email: undefined, rsaPublicKey: undefined });
  });
});
