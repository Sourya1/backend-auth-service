import { NextFunction, Request, Response } from 'express';
import { Logger } from 'winston';
import { TenentService } from '../services/TenentService';
import { TenentRequest } from '../types';

export class TenentController {
  constructor(
    private tenentService: TenentService,
    private logger: Logger,
  ) {}

  async create(req: TenentRequest, res: Response, next: NextFunction) {
    this.logger.info('Start => TenentController');
    try {
      const { name, address } = req.body;
      const tenent = await this.tenentService.create({ name, address });

      this.logger.info('A New Tenent is created Successfully');
      this.logger.info('End => TenentController');
      res.status(201).json({ id: tenent.id });
    } catch (err) {
      next(err);
    }
  }

  async getTenents(req: Request, res: Response, next: NextFunction) {
    this.logger.info('Start => getTenents');
    try {
      const tenents = await this.tenentService.getTenents();
      return res.status(200).json(tenents);
    } catch (err) {
      next(err);
    }
  }

  async getTenent(req: Request, res: Response, next: NextFunction) {
    this.logger.info('Start => getTenent');
    try {
      const tenentId = req.params.tenentId;
      const tenent = await this.tenentService.getTenent(Number(tenentId));

      if (!tenent) {
        return res
          .status(200)
          .json({ msg: `No tennet exist with id ${tenentId}` });
      }
      this.logger.info('End => getTenent');
      return res.status(200).json(tenent);
    } catch (err) {
      next(err);
    }
  }
}
