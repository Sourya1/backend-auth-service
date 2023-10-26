import { Response } from 'express';
import { UserService } from '../services/userService';
import { ResgisterUserRequest } from '../types';

export class AuthController {
  constructor(private userService: UserService) {}
  async register(req: ResgisterUserRequest, res: Response) {
    const { firstName, lastName, email, password } = req.body;

    await this.userService.create({ firstName, lastName, email, password });

    res.status(201).json();
  }
}
