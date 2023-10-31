import { generateKeyPair } from 'crypto';
import fs from 'fs';

generateKeyPair(
  'rsa',
  {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
    // Handle errors and use the generated key pair
  },
  (err, publicKey, privateKey) => {
    if (err) {
      console.error(err);
    }
    fs.writeFileSync('certs/private.pem', privateKey);
    fs.writeFileSync('certs/public.pem', publicKey);
  },
);
