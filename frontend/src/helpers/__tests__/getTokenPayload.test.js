import getTokenPayload from '../getTokenPayload';

test('getTokenPayload parses a simple JWT payload', () => {
  const payload = { id: 42, email: 'me@example.com' };
  const json = JSON.stringify(payload);
  let encoded;
  if (typeof btoa === 'function') {
    encoded = btoa(json);
  } else if (typeof Buffer !== 'undefined') {
    encoded = Buffer.from(json).toString('base64');
  } else {
    throw new Error('No base64 available in test env');
  }
  const base64url = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const fakeToken = `h.${base64url}.s`;

  const result = getTokenPayload(fakeToken);
  expect(result).toEqual(payload);
});
