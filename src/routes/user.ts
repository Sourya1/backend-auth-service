/* eslint-disable @typescript-eslint/no-misused-promises */
import express, { NextFunction, Request, Response } from 'express';
import { Roles } from '../constants';

import authenticate from '../middlewares/authenticate';
import canAccess from '../middlewares/canAccess';
import { UserController } from '../controllers/userController';
import { UserService } from '../services/userService';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';

const userRouter = express.Router();
const userReso = AppDataSource.getRepository(User);
const userService = new UserService(userReso);
const userController = new UserController(userService);

userRouter.use(authenticate);
userRouter.use(canAccess([Roles.ADMIN]));

userRouter.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    await userController.create(req, res, next);
  },
);

export default userRouter;
