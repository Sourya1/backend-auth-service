import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express';
import { Roles } from '../constants';

import authenticate from '../middlewares/authenticate';
import canAccess from '../middlewares/canAccess';
import { UserController } from '../controllers/userController';
import { UserService } from '../services/userService';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import logger from '../config/logger';
import createUserValidation from '../validators/users/create.user';
import updateUserValidation from '../validators/users/update.user';

const userRouter = express.Router();
const userReso = AppDataSource.getRepository(User);
const userService = new UserService(userReso);
const userController = new UserController(userService, logger);

userRouter.use(authenticate as RequestHandler);
userRouter.use(canAccess([Roles.ADMIN]));

userRouter.post('/', createUserValidation, (async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await userController.create(req, res, next);
}) as RequestHandler);

userRouter.get('/', (async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await userController.getAll(req, res, next);
}) as RequestHandler);

userRouter
  .route('/:userId')
  .patch(updateUserValidation, (async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    await userController.update(req, res, next);
  }) as RequestHandler)
  .get((async (req: Request, res: Response, next: NextFunction) => {
    await userController.getOne(req, res, next);
  }) as RequestHandler)
  .delete((async (req: Request, res: Response, next: NextFunction) => {
    await userController.delete(req, res, next);
  }) as RequestHandler);

export default userRouter;
