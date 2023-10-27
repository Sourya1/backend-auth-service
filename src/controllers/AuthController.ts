import { NextFunction, Response } from 'express';
import { Logger } from 'winston';
import { UserService } from '../services/userService';
import { ResgisterUserRequest } from '../types';

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
  ) {}
  async register(req: ResgisterUserRequest, res: Response, next: NextFunction) {
    const { firstName, lastName, email, password } = req.body;
    this.logger.debug('New request to register a user', {
      firstName,
      lastName,
      email,
    });
    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
      });

      this.logger.info('User has been register', { id: user.id });
      res.status(201).json({ id: user.id });
    } catch (err) {
      next(err);
      return;
    }

    res.status(201).json();
  }
}
