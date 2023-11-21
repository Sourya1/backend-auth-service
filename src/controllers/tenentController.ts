import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import { Logger } from 'winston';

import { TenentService } from '../services/TenentService';
import { IUpdatTenentReq, ITenentRequest } from '../types';

export class TenentController {
  constructor(
    private tenentService: TenentService,
    private logger: Logger,
  ) {}

  async create(req: ITenentRequest, res: Response, next: NextFunction) {
    this.logger.info('Start => TenentController');
    try {
      // validation
      const validate = validationResult(req);
      if (!validate.isEmpty()) {
        return res.status(400).json({ errors: validate.array() });
      }

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
      if (Number.isNaN(Number(tenentId))) {
        return next(createHttpError(400, 'Invalid url param.'));
      }

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

  async updateTenent(req: IUpdatTenentReq, res: Response, next: NextFunction) {
    this.logger.info('Start => updateTenent');
    try {
      // validation
      const validate = validationResult(req);
      if (!validate.isEmpty()) {
        return res.status(400).json({ errors: validate.array() });
      }

      const tenentId = req.params.tenentId;

      if (Number.isNaN(Number(tenentId))) {
        return next(createHttpError(400, 'Invalid url param.'));
      }

      const isTenentPresent = await this.tenentService.getTenent(
        Number(tenentId),
      );

      if (!isTenentPresent) {
        const error = createHttpError(400, 'No tenent exist with given id');
        next(error);
      }

      const { name, address } = req.body;
      const updatedTenent = await this.tenentService.updateTenent(
        Number(tenentId),
        {
          name,
          address,
        },
      );

      this.logger.info(`Tenent info has been updated: ${tenentId}`);
      this.logger.info('End => updateTenent');

      res.status(200).json({
        data: updatedTenent,
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteTenent(req: Request, res: Response, next: NextFunction) {
    this.logger.info('Start => deleteTenent');

    const tenentId = req.params.tenentId;
    if (Number.isNaN(Number(tenentId))) {
      return next(createHttpError(400, 'Invalid url param.'));
    }

    try {
      const isTenentPresent = await this.tenentService.getTenent(
        Number(tenentId),
      );

      if (!isTenentPresent) {
        const error = createHttpError(400, 'No tenent exist with given id');
        next(error);
      }

      await this.tenentService.deleteById(Number(tenentId));

      this.logger.info(`Tenent info is deleted: ${tenentId}`);
      this.logger.info('End => deleteTenent');
      res.status(200).json({
        msg: 'success',
      });
    } catch (err) {
      next(err);
    }
  }
}
