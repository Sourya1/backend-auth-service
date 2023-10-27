/*
    Follow three AAA to write test  
    Arrange -> Arrange the input or connection or data or anything required before testing this schenerio
    Act -> Actually test the functionality
    Assert -> Assert -> Check if the result is expected or not
*/

import request from 'supertest';
import { DataSource } from 'typeorm';
import app from '../../src/app';
import { AppDataSource } from '../../src/config/data-source';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';

describe('POST /auth/register', () => {
  describe('All field provided', () => {
    let connection: DataSource;

    beforeAll(async () => {
      connection = await AppDataSource.initialize();
    });
    beforeEach(async () => {
      //drop and sync db before each test suite runs
      await connection.dropDatabase();
      await connection.synchronize();
    });
    afterAll(async () => {
      await connection.destroy();
    });

    it('should return 201 status code', async () => {
      // Arrange
      const userData = {
        firstName: 'shourya',
        lastName: 'kaushik',
        email: 'shouryakaushik2223@gmail.com',
        password: 'secret',
      };

      // Act
      const response = await request(app).post('/auth/register').send(userData);

      // Assert
      expect(response.statusCode).toBe(201);
    });
    it('should return valid json', async () => {
      const userData = {
        firstName: 'shourya',
        lastName: 'kaushik',
        email: 'shouryakaushik2223@gmail.com',
        password: 'secret',
      };

      const response = await request(app).post('/auth/register').send(userData);

      expect(
        (response.headers as Record<string, string>)['content-type'],
      ).toEqual(expect.stringContaining('json'));
    });

    it('should persist data into db', async () => {
      const userData = {
        firstName: 'shourya',
        lastName: 'kaushik',
        email: 'shouryakaushik2223@gmail.com',
        password: 'secret',
      };

      // Act
      await request(app).post('/auth/register').send(userData);

      // Assert
      const userRepositary = connection.getRepository(User);
      const users = await userRepositary.find();
      expect(users).toHaveLength(1);
      expect(users[0].firstName).toBe(userData.firstName);
      expect(users[0].email).toBe(userData.email);
    });
    it('should assign a customer role to register user', async () => {
      const userData = {
        firstName: 'shourya',
        lastName: 'kaushik',
        email: 'shouryakaushik2223@gmail.com',
        password: 'secret',
      };

      await request(app).post('/auth/register').send(userData);
      const userRepositary = connection.getRepository(User);
      const users = await userRepositary.find();
      expect(users[0]).toHaveProperty('role');
      expect(users[0].role).toBe(Roles.CUSTOMER);
    });
  });
  describe('sad path', () => {});
});
