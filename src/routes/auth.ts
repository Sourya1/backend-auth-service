import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express';

import { AuthController } from '../controllers/AuthController';
import { UserService } from '../services/userService';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import logger from '../config/logger';
import registerValidator from '../validators/register-validator';
import { TokenService } from '../services/tokenService';
import { RefreshToken } from '../entity/RefreshToken';
import loginValidator from '../validators/login-validator';
import { CredentialService } from '../services/credentialsService';
import authenticate from '../middlewares/authenticate';
import { AuthRequest } from '../types';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenService(refreshTokenRepository);
const credentialService = new CredentialService();
const authController = new AuthController(
  userService,
  logger,
  tokenService,
  credentialService,
); // dependency injection

router.post(
  '/register',
  registerValidator,
  (async (req: Request, res: Response, next: NextFunction) =>
    await authController.register(req, res, next)) as RequestHandler,
);

router.post(
  '/login',
  loginValidator,
  (async (req: Request, res: Response, next: NextFunction) =>
    await authController.login(req, res, next)) as RequestHandler,
);

router.get(
  '/self',
  authenticate as RequestHandler,
  (async (req: Request, res: Response) => {
    await authController.self(req as AuthRequest, res);
  }) as RequestHandler,
);

router.post('/refreshToken', (async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await authController.refreshToken(req, res, next);
}) as RequestHandler);

router.post(
  '/logout',
  authenticate as RequestHandler,
  (async (req: Request, res: Response, next: NextFunction) => {
    await authController.logout(req as AuthRequest, res, next);
  }) as RequestHandler,
);

export default router;
