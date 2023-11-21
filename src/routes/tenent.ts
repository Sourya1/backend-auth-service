/* eslint-disable @typescript-eslint/no-misused-promises */
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
import updateTenentValidation from '../validators/tenents/create&update';

const tenentRouter = express.Router();
const tenentRepository = AppDataSource.getRepository(Tenent);
const tenentService = new TenentService(tenentRepository);
const tenentController = new TenentController(tenentService, logger);

tenentRouter.use(authenticate);
tenentRouter.use(canAccess([Roles.ADMIN]));

tenentRouter.post(
  '/',
  updateTenentValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    await tenentController.create(req, res, next);
  },
);

tenentRouter.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    await tenentController.getTenents(req, res, next);
  },
);

tenentRouter
  .route('/:tenentId')
  .get(async (req: Request, res: Response, next: NextFunction) => {
    await tenentController.getTenent(req, res, next);
  })
  .patch(
    updateTenentValidation,
    async (req: Request, res: Response, next: NextFunction) => {
      await tenentController.updateTenent(req, res, next);
    },
  )
  .delete(async (req: Request, res: Response, next: NextFunction) => {
    await tenentController.deleteTenent(req, res, next);
  });

export default tenentRouter;
