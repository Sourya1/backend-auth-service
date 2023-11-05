import createHttpError from 'http-errors';
import { JwtPayload, sign } from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';

import { Config } from '../config';
import { RefreshToken } from '../entity/RefreshToken';
import { User } from '../entity/User';
import { Repository } from 'typeorm';

export class TokenService {
  constructor(private refreshtokenRepo: Repository<RefreshToken>) {}

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

  async persistRefreshToken(user: User) {
    // Persist the refresh token
    const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;
    const refreshTokenInfo = await this.refreshtokenRepo.save({
      user: user,
      expiresAt: new Date(Date.now() + MS_IN_YEAR),
    });
    return refreshTokenInfo;
  }

  async deleteRefreshToken(refreshTokenId: number) {
    return await this.refreshtokenRepo.delete({ id: refreshTokenId });
  }
}
