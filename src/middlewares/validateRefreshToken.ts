import { expressjwt, Request } from 'express-jwt';
import { Config } from '../config';
import { AppDataSource } from '../config/data-source';
import logger from '../config/logger';
import { RefreshToken } from '../entity/RefreshToken';
import { IRefreshTokenPayload } from '../types';

export default expressjwt({
  secret: Config.REFRESH_TOKEN_SECRET!,
  algorithms: ['HS256'],
  getToken(req: Request) {
    const { refreshToken } = req.cookies as Record<string, string>;
    return refreshToken;
  },
  async isRevoked(req: Request, token) {
    try {
      const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
      const refreshtoken = await refreshTokenRepo.findOne({
        where: {
          id: Number((token?.payload as IRefreshTokenPayload).id),
          user: {
            id: Number(token?.payload.sub),
          },
        },
      });
      return refreshtoken === null;
    } catch (err) {
      logger.error('Error while getting the refreshToken');
    }
    return true;
  },
});
