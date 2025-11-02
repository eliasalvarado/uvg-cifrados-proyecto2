import getTokenPayload from '../getTokenPayload';

describe('getTokenPayload - error cases', () => {
  test('throws when token is not a string', () => {
    // non-string token
    expect(() => getTokenPayload(null)).toThrow('Token Invalido.');
    expect(() => getTokenPayload(123)).toThrow('Token Invalido.');
    expect(() => getTokenPayload({})).toThrow('Token Invalido.');
  });

  test('throws when token has no payload part', () => {
    // token without dots or without second segment
    expect(() => getTokenPayload('onlyonepart')).toThrow('Token Invalido.');
    // token with an empty second segment (e.g. trailing dot) should be considered invalid
    expect(() => getTokenPayload('a.')).toThrow('Token Invalido.');
  });
});
