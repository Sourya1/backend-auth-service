import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';

import { Repository } from 'typeorm';
import { User } from '../entity/User';
import { LimitedUserData, UserData } from '../types';

export class UserService {
  constructor(private userRepository: Repository<User>) {}
  async create({ firstName, lastName, email, password, role }: UserData) {
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
        role,
      });
    } catch (err) {
      const error = createHttpError(
        500,
        'Failed to store the data in database',
      );
      throw error;
    }
  }

  async findUserByEmailPassword(email: string) {
    try {
      const isPresent = await this.userRepository.findOne({
        where: { email },
        select: ['id', 'firstName', 'lastName', 'email', 'role', 'password'],
      });
      return isPresent;
    } catch (err) {
      const error = createHttpError(500, 'Failed to query the database');
      throw error;
    }
  }

  async findUserById(id: number) {
    try {
      const isPresent = await this.userRepository.findOne({
        where: { id },
      });
      return isPresent;
    } catch (err) {
      const error = createHttpError(500, 'Failed to query the database');
      throw error;
    }
  }

  async update(userId: number, { firstName, lastName, role }: LimitedUserData) {
    try {
      return await this.userRepository.update(userId, {
        firstName,
        lastName,
        role,
      });
    } catch (err) {
      const error = createHttpError(
        500,
        'Failed to update the user in the database',
      );
      throw error;
    }
  }

  async getAll() {
    return await this.userRepository.find();
  }

  async getOne(userId: number) {
    return await this.userRepository.findOne({ where: { id: userId } });
  }

  async delete(userId: number) {
    return await this.userRepository.delete(userId);
  }
}
