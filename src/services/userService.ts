import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';

import { Repository } from 'typeorm';
import { Roles } from '../constants';
import { User } from '../entity/User';
import { UserData } from '../types';

export class UserService {
  constructor(private userRepository: Repository<User>) {}
  async create({ firstName, lastName, email, password }: UserData) {
    const isEmailPresent = await this.userRepository.findOne({
      where: { email: email },
    });
    if (isEmailPresent) {
      const error = createHttpError(400, 'Email already exist');
      throw error;
    }
    // Hash password
    const saltRounds = 10;
    const hashPassword = await bcrypt.hash(password, saltRounds);
    try {
      return await this.userRepository.save({
        firstName,
        lastName,
        email,
        password: hashPassword,
        role: Roles.CUSTOMER,
      });
    } catch (err) {
      const error = createHttpError(
        500,
        'Failed to store the data in database',
      );
      throw error;
    }
  }

  async findUserByEmail(email: string) {
    try {
      const isPresent = await this.userRepository.findOne({
        where: { email: email },
      });
      return isPresent;
    } catch (err) {
      const error = createHttpError(500, 'Failed to query the database');
      throw error;
    }
  }
}
