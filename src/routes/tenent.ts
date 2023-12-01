import express, { NextFunction, RequestHandler, Response } from 'express';
import { Request } from 'express-jwt';
import { AppDataSource } from '../config/data-source';
import logger from '../config/logger';

import { TenentController } from '../controllers/tenentController';
import { Tenent } from '../entity/Tenent';
import { TenentService } from '../services/TenentService';
import authenticate from '../middlewares/authenticate';
import canAccess from '../middlewares/canAccess';
import { Roles } from '../constants';
import tenentValidation from '../validators/tenents/create&update';

const tenentRouter = express.Router();
const tenentRepository = AppDataSource.getRepository(Tenent);
const tenentService = new TenentService(tenentRepository);
const tenentController = new TenentController(tenentService, logger);

tenentRouter.use(authenticate as RequestHandler);
tenentRouter.use(canAccess([Roles.ADMIN]));

tenentRouter.post('/', tenentValidation, (async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await tenentController.create(req, res, next);
}) as RequestHandler);

tenentRouter.get('/', (async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await tenentController.getTenents(req, res, next);
}) as RequestHandler);

tenentRouter
  .route('/:tenentId')
  .get((async (req: Request, res: Response, next: NextFunction) => {
    await tenentController.getTenent(req, res, next);
  }) as RequestHandler)
  .patch(tenentValidation, (async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    await tenentController.updateTenent(req, res, next);
  }) as RequestHandler)
  .delete((async (req: Request, res: Response, next: NextFunction) => {
    await tenentController.deleteTenent(req, res, next);
  }) as RequestHandler);

export default tenentRouter;
