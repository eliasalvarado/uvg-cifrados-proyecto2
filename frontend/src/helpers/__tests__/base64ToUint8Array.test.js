import base64ToUint8Array from '../base64ToUint8Array';

test('base64ToUint8Array converts base64 string to Uint8Array', () => {
  // 'AQID' is base64 for bytes [1,2,3]
  const arr = base64ToUint8Array('AQID');
  expect(arr).toEqual(new Uint8Array([1, 2, 3]));
});
