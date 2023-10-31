import express, { NextFunction, Request, Response } from 'express';

import { AuthController } from '../controllers/AuthController';
import { UserService } from '../services/userService';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import logger from '../config/logger';
import registerValidator from '../validators/register-validator';
import { TokenService } from '../services/tokenService';
import { RefreshToken } from '../entity/RefreshToken';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenService(refreshTokenRepository);
const authController = new AuthController(userService, logger, tokenService); // dependency injection

router.post(
  '/register',
  registerValidator,
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  (req: Request, res: Response, next: NextFunction) =>
    authController.register(req, res, next),
);

export default router;
