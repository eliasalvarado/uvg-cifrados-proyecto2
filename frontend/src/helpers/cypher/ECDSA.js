function encodeDER(r, s) {
  const trim = b => (b[0] & 0x80) ? [0x00, ...b] : b;

  const rBytes = trim(Array.from(r));
  const sBytes = trim(Array.from(s));

  const totalLength = rBytes.length + sBytes.length + 4;

  return new Uint8Array([
    0x30, totalLength,
    0x02, rBytes.length, ...rBytes,
    0x02, sBytes.length, ...sBytes
  ]);
}


async function signMessage(message, privateKeyPem) {
  const pemKey = privateKeyPem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
    
  const keyBuffer = Uint8Array.from(atob(pemKey), c => c.charCodeAt(0));

  const cryptoKey = await window.crypto.subtle.importKey(
    'pkcs8',
    keyBuffer,
    {
      name: 'ECDSA',
      namedCurve: 'P-256'
    },
    false,
    ['sign']
  );

  const messageBuffer = new TextEncoder().encode(message);

  const signature = await window.crypto.subtle.sign(
    {
      name: 'ECDSA',
      hash: 'SHA-256'
    },
    cryptoKey,
    messageBuffer
  );

  const signatureArray = new Uint8Array(signature);
  const r = signatureArray.slice(0, signatureArray.length / 2);
  const s = signatureArray.slice(signatureArray.length / 2);
  const derSignature = encodeDER(r, s);
  const signatureFinal = btoa(String.fromCharCode(...derSignature));

  return signatureFinal
}

export{
  signMessage
}