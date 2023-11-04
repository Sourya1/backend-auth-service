import { expressjwt, GetVerificationKey } from 'express-jwt';
import { Request } from 'express';
import jwksClient from 'jwks-rsa';
import { Config } from '../config';

export default expressjwt({
  secret: jwksClient.expressJwtSecret({
    jwksUri: Config.JWKS_URI!,
    cache: true,
    rateLimit: true,
  }) as GetVerificationKey,
  algorithms: ['RS256'],
  getToken(req: Request) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.split(' ')[1] !== 'undefinded') {
      const token = authHeader.split(' ')[1];
      if (token) return token;
    }

    const { accessToken: token } = req.cookies as Record<string, string>;
    return token;
  },
});
