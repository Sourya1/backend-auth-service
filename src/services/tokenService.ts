import createHttpError from 'http-errors';
import { JwtPayload, sign } from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';

import { Config } from '../config';

export class TokenService {
  generateAccessToken(payload: JwtPayload) {
    let privateKey: Buffer;
    try {
      privateKey = fs.readFileSync(
        path.join(__dirname, '../../certs/private.pem'),
      );
    } catch (err) {
      const error = createHttpError(500, 'Error while reading private key');
      throw error;
    }

    const accessToken = sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: '1h',
      issuer: 'auth-service',
    });
    return accessToken;
  }

  generateRefreshToken(payload: JwtPayload) {
    const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
      algorithm: 'HS256',
      expiresIn: '1y',
      issuer: 'auth-servcie',
      jwtid: String(payload.id),
      // store the refresh token id so the if someone tempers the refresh token the signature will change
    });
    return refreshToken;
  }
}
