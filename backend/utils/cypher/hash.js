import crypto from 'crypto';

function sha256Hex(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

  export default sha256Hex;