import { NextFunction, Response } from 'express';
import { validationResult } from 'express-validator';
import { Logger } from 'winston';
import { JwtPayload } from 'jsonwebtoken';

import { UserService } from '../services/userService';
import { ResgisterUserRequest } from '../types';
import { TokenService } from '../services/tokenService';

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
    private tokenService: TokenService,
  ) {}
  async register(req: ResgisterUserRequest, res: Response, next: NextFunction) {
    // validation
    const validate = validationResult(req);
    if (!validate.isEmpty()) {
      return res.status(400).json({ error: validate.array() });
    }

    const { firstName, lastName, email, password } = req.body;
    this.logger.debug('New request to register a user', {
      firstName,
      lastName,
      email,
    });
    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
      });

      this.logger.info('User has been register', { id: user.id });

      // Generate jwt token
      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);
      const refreshTokenInfo =
        await this.tokenService.persistRefreshToken(user); // persit refresh token

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(refreshTokenInfo.id),
      });

      res.cookie('accessToken', accessToken, {
        domain: 'localhost',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60, //1h
        httpOnly: true,
      });

      res.cookie('refreshToken', refreshToken, {
        domain: 'localhost',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 365, //1y
        httpOnly: true,
      });

      res.status(201).json({ id: user.id });
    } catch (err) {
      return next(err);
    }

    res.status(201).json();
  }
}
