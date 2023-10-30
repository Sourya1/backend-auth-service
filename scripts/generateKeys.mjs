import crypto from 'crypto';
import fs from 'fs';

try {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publickeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
    privatekeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
  });

  console.log('public', publicKey);
  console.log('private', privateKey);
  fs.writeFileSync('certs/private.pem', privateKey);
  fs.writeFileSync('certs/public.pem', publicKey);
} catch (err) {
  console.error('error is', err);
}
