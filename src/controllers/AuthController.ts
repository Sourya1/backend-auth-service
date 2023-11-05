/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { NextFunction, Response } from 'express';
import { validationResult } from 'express-validator';
import { Logger } from 'winston';
import { JwtPayload, verify } from 'jsonwebtoken';

import { UserService } from '../services/userService';
import { AuthRequest, ResgisterUserRequest } from '../types';
import { TokenService } from '../services/tokenService';
import createHttpError from 'http-errors';
import { CredentialService } from '../services/credentialsService';
import { Request } from 'express-jwt';
import { Config } from '../config';
import { RefreshToken } from '../entity/RefreshToken';
import { AppDataSource } from '../config/data-source';

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
    private tokenService: TokenService,
    private credentialService: CredentialService,
  ) {}
  async register(req: ResgisterUserRequest, res: Response, next: NextFunction) {
    // validation
    const validate = validationResult(req);
    if (!validate.isEmpty()) {
      return res.status(400).json({ errors: validate.array() });
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
  }

  async login(req: ResgisterUserRequest, res: Response, next: NextFunction) {
    const validate = validationResult(req);
    if (!validate.isEmpty()) {
      return res.status(400).json({ errors: validate.array() });
    }

    const { email, password } = req.body;
    this.logger.info('Request to login the user', { email });

    try {
      // check if email exist in db
      const isUserExist = await this.userService.findUserByEmail(email);
      if (!isUserExist) {
        const error = createHttpError(400, 'Email and password does not exist');
        next(error);
      }

      // compare password
      const isPasswordCorrect = await this.credentialService.comparePassword(
        password,
        isUserExist?.password!,
      );

      if (!isPasswordCorrect) {
        const error = createHttpError(400, 'Email and password does not exist');
        next(error);
      }
      // Generate jwt token
      const payload: JwtPayload = {
        sub: String(isUserExist?.id!),
        role: isUserExist?.role!,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);
      const refreshTokenInfo = await this.tokenService.persistRefreshToken(
        isUserExist!,
      ); // persit refresh token

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
      this.logger.info('User successfull logged in', { email });
      res.status(200).json({ id: isUserExist?.id });
    } catch (err) {
      return next(err);
    }
  }

  async self(req: AuthRequest, res: Response) {
    const user = await this.userService.findUserById(Number(req.auth.sub));
    res.status(200).json({ ...user, password: undefined });
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      // get refresh token from cookies
      const { refreshToken } = req.cookies as Record<string, string>;
      if (!refreshToken) {
        const error = createHttpError(400, 'Token is not present');
        throw error;
      }
      const isRefreshTokenValid = verify(
        refreshToken,
        Config.REFRESH_TOKEN_SECRET!,
      );

      // check if the refresh token record present in db
      const {
        jti: refreshTokenId,
        sub: userId,
        role,
      } = isRefreshTokenValid as JwtPayload;

      const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
      const isRefreshTokenPresent = await refreshTokenRepo.findOne({
        where: { id: Number(refreshTokenId), user: { id: Number(userId) } },
      });

      if (!isRefreshTokenPresent) {
        const error = createHttpError(401, 'The token has been revoked');
        throw error;
      }

      // generate new access and refresh token
      const payload: JwtPayload = {
        sub: userId,
        role: role as string,
      };

      const user = await this.userService.findUserById(Number(userId));
      if (!user) {
        const error = createHttpError(401, 'User is not active');
        throw error;
      }

      const accessToken = this.tokenService.generateAccessToken(payload);
      const refreshTokenInfo =
        await this.tokenService.persistRefreshToken(user); // persit refresh token

      // delete old refresh token
      await this.tokenService.deleteRefreshToken(Number(refreshTokenId));

      const newRefreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(refreshTokenInfo.id),
      });

      res.cookie('accessToken', accessToken, {
        domain: 'localhost',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60, //1h
        httpOnly: true,
      });

      res.cookie('refreshToken', newRefreshToken, {
        domain: 'localhost',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 365, //1y
        httpOnly: true,
      });
      this.logger.info('New access Token generated successfully', {
        email: user.email,
      });

      res.status(200).json({ id: user.id });
    } catch (err) {
      return next(err);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // get refresh token from cookies
      const { refreshToken } = req.cookies as Record<string, string>;
      if (!refreshToken) {
        const error = createHttpError(400, 'Token is not present');
        throw error;
      }
      const isRefreshTokenValid = verify(
        refreshToken,
        Config.REFRESH_TOKEN_SECRET!,
      );
      const { jti: refreshTokenId } = isRefreshTokenValid as JwtPayload;

      // delete the refresh token
      await this.tokenService.deleteRefreshToken(Number(refreshTokenId));

      this.logger.info('User has been logged Out', { id: req.auth.sub });

      // clear the cookies
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res.json({ status: 'success' });
    } catch (err) {
      return next(err);
    }
  }
}
