import express, { NextFunction, Response } from 'express';
import { Request } from 'express-jwt';
import { AppDataSource } from '../config/data-source';
import logger from '../config/logger';

import { TenentController } from '../controllers/tenentController';
import { Tenent } from '../entity/Tenent';
import { TenentService } from '../services/TenentService';
import authenticate from '../middlewares/authenticate';
import canAccess from '../middlewares/canAccess';
import { Roles } from '../constants';

const tenentRouter = express.Router();
const tenentRepository = AppDataSource.getRepository(Tenent);
const tenentService = new TenentService(tenentRepository);
const tenentController = new TenentController(tenentService, logger);

// eslint-disable-next-line @typescript-eslint/no-misused-promises
tenentRouter.use(authenticate);
tenentRouter.use(canAccess([Roles.ADMIN]));

tenentRouter.post(
  '/',
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  async (req: Request, res: Response, next: NextFunction) => {
    await tenentController.create(req, res, next);
  },
);

tenentRouter.get(
  '/',
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  async (req: Request, res: Response, next: NextFunction) => {
    await tenentController.getTenents(req, res, next);
  },
);

tenentRouter.get(
  '/:tenentId',
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  async (req: Request, res: Response, next: NextFunction) => {
    await tenentController.getTenent(req, res, next);
  },
);

export default tenentRouter;
