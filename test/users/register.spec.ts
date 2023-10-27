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
  describe('All field provided', () => {
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
    it('should store the hash password', async () => {
      const userData = {
        firstName: 'shourya',
        lastName: 'kaushik',
        email: 'shouryakaushik2223@gmail.com',
        password: 'secret',
      };

      await request(app).post('/auth/register').send(userData);
      const userRepositary = connection.getRepository(User);
      const users = await userRepositary.find();

      expect(users[0].password).not.toBe(userData.password);
      expect(users[0].password).toHaveLength(60);
      expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
    });
    it('should return 400 status code if email is already exists', async () => {
      const userData = {
        firstName: 'shourya',
        lastName: 'kaushik',
        email: 'shouryakaushik2223@gmail.com',
        password: 'secret',
      };

      const userRepositary = connection.getRepository(User);
      await userRepositary.save({ ...userData, role: 'customer' });

      //act
      const response = await request(app).post('/auth/register').send(userData);
      const users = await userRepositary.find();

      expect(response.statusCode).toBe(400);
      expect(users).toHaveLength(1);
    });
  });
  describe('sad path', () => {
    it('should return 400 status code if email is missing or invalid email', async () => {
      // Arrange
      const userData = {
        firstName: 'shourya',
        lastName: 'kaushik',
        email: '',
        password: 'secret',
      };

      const response = await request(app).post('/auth/register').send(userData);
      console.log(response.body);
      expect(response.statusCode).toBe(400);
    });
    it('should return 400 status code if firstName is missing', async () => {
      // Arrange
      const userData = {
        firstName: '',
        lastName: 'kaushik',
        email: 'shouryakaushik2223@gmail.com',
        password: 'secret',
      };

      const response = await request(app).post('/auth/register').send(userData);
      expect(response.statusCode).toBe(400);
    });
    it('should return 400 status code if last is missing', async () => {
      // Arrange
      const userData = {
        firstName: 'shourya',
        lastName: '',
        email: 'shouryakaushik2223@gmail.com',
        password: 'secret',
      };

      const response = await request(app).post('/auth/register').send(userData);
      expect(response.statusCode).toBe(400);
    });
    it('should return 400 status code if password is missing', async () => {
      // Arrange
      const userData = {
        firstName: 'shourya',
        lastName: 'kaushik',
        email: 'shouryakaushik2223@gmail.com',
        password: '',
      };

      const response = await request(app).post('/auth/register').send(userData);
      expect(response.statusCode).toBe(400);
    });
  });
  describe('Fields are not in proper format', () => {
    it('should trim the email field', async () => {
      const userData = {
        firstName: 'shourya',
        lastName: 'kaushik',
        email: ' shouryakaushik2223@gmail.com ',
        password: 'secret',
      };
      await request(app).post('/auth/register').send(userData);
      const userRepositary = connection.getRepository(User);
      const users = await userRepositary.find();
      const user = users[0];
      expect(user.email).toBe('shouryakaushik2223@gmail.com');
    });
    // it('password should be six character long', async () => {
    //   const userData = {
    //     firstName: 'shourya',
    //     lastName: 'kaushik',
    //     email: ' shouryakaushik2223@gmail.com ',
    //     password: 'secre',
    //   };
    //   await request(app).post('/auth/register').send(userData);
    //   const response = await request(app).post('/auth/register').send(userData);

    //   expect(response.statusCode).toBe(400);
    //   const errObj = response.body.error[0];
    //   expect(errObj.msg).toBe('Password should be at least 7 chars long');
    // });
  });
});
