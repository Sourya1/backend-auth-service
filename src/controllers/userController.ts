import { NextFunction, Response } from 'express';
import { Request } from 'express-jwt';
import createHttpError from 'http-errors';
import { Logger } from 'winston';
import { Roles } from '../constants';
import { UserService } from '../services/userService';
import { CreateUserRequest, IUpdateUserReq } from '../types';

export class UserController {
  constructor(
    private userService: UserService,
    private logger: Logger,
  ) {}
  async create(req: CreateUserRequest, res: Response, next: NextFunction) {
    this.logger.info('Start => create');
    const { firstName, lastName, email, password } = req.body;
    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role: Roles.MANAGER,
      });

      this.logger.info(`A new user is created:${(user.id, firstName)}`);
      this.logger.info('End => create');
      res.status(201).json({ id: user.id });
    } catch (err) {
      next(err);
    }
  }

  async update(req: IUpdateUserReq, res: Response, next: NextFunction) {
    this.logger.info('Start => update');
    const userId = req.params.userId;

    if (!Number.isNaN(Number(userId))) {
      return next(createHttpError(400, 'Invalid url param.'));
    }

    try {
      const isUserPresent = await this.userService.findUserById(Number(userId));

      if (!isUserPresent) {
        return next(
          createHttpError(400, `No user exist with given id: ${userId}`),
        );
      }

      const { firstName, lastName, role } = req.body;
      const user = await this.userService.update(Number(userId), {
        firstName,
        lastName,
        role,
      });

      this.logger.info(`User updated succesfully: ${userId}`);
      this.logger.info('End => update');
      res.status(200).json({ user });
    } catch (err) {
      next(err);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    this.logger.info('Start => getAllUsers');

    try {
      const users = await this.userService.getAll();

      res.status(200).json(users);
    } catch (err) {
      next(err);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    this.logger.info('Start => getOne');
    const userId = req.params.userId;

    if (!Number.isNaN(Number(userId))) {
      return next(createHttpError(400, 'Invalid url param.'));
    }

    try {
      const isUserPresent = await this.userService.findUserById(Number(userId));

      if (!isUserPresent) {
        return next(
          createHttpError(400, `No user exist with given id: ${userId}`),
        );
      }

      const user = await this.userService.getOne(Number(userId));
      this.logger.info('End => getOne');
      res.status(200).json({ user });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    this.logger.info('Start => delete');
    const userId = req.params.userId;

    if (!Number.isNaN(Number(userId))) {
      return next(createHttpError(400, 'Invalid url param.'));
    }

    try {
      const isUserPresent = await this.userService.findUserById(Number(userId));

      if (!isUserPresent) {
        return next(
          createHttpError(400, `No user exist with given id: ${userId}`),
        );
      }

      await this.userService.getOne(Number(userId));
      this.logger.info('End => delete');
      res.status(200).json({ msg: 'success' });
    } catch (err) {
      next(err);
    }
  }
}
