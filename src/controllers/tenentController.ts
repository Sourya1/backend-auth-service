import { NextFunction, Response } from 'express';
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
}
