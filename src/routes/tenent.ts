import express, { NextFunction, Response } from 'express';
import { Request } from 'express-jwt';
import { AppDataSource } from '../config/data-source';
import logger from '../config/logger';

import { TenentController } from '../controllers/tenentController';
import { Tenent } from '../entity/Tenent';
import { TenentService } from '../services/TenentService';
import authenticate from '../middlewares/authenticate';

const tenentRouter = express.Router();
const tenentRepository = AppDataSource.getRepository(Tenent);
const tenentService = new TenentService(tenentRepository);
const tenentController = new TenentController(tenentService, logger);

tenentRouter.post(
  '/',
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  authenticate,
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  async (req: Request, res: Response, next: NextFunction) => {
    await tenentController.create(req, res, next);
  },
);

export default tenentRouter;
