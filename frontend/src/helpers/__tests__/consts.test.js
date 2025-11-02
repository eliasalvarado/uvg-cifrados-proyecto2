import consts from '../consts';

test('consts exports apiPath', () => {
  expect(consts).toBeDefined();
  expect(consts.apiPath).toBe('/api');
});
