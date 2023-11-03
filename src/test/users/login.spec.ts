/*
    Follow three AAA to write test  
    Arrange -> Arrange the input or connection or data or anything required before testing this schenerio
    Act -> Actually test the functionality
    Assert -> Assert -> Check if the result is expected or not
*/

import { DataSource } from 'typeorm';
import { AppDataSource } from '../../config/data-source';
import request from 'supertest';

import app from '../../app';
import { ErrorResponseFormat, Headers } from '../utils/types';
import { isJwt } from '../utils';

describe('POST /auth/login', () => {
  let connection: DataSource;
  const userData = {
    firstName: 'shourya',
    lastName: 'kaushik',
    email: 'shouryakaushik2223@gmail.com',
    password: 'secret',
  };
  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    //drop and sync db before each test suite runs
    await connection.dropDatabase();
    await connection.synchronize();
    await request(app).post('/auth/register').send(userData); // register a user
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe('All field provided', () => {
    it('should return 200 if everything works fine', async () => {
      const userInfo = {
        email: 'shouryakaushik2223@gmail.com',
        password: 'secret',
      };

      const response = await request(app).post('/auth/login').send(userInfo);
      expect(response.statusCode).toBe(200);
    });
    it('should have access and refresh token in headers', async () => {
      const userInfo = {
        email: 'shouryakaushik2223@gmail.com',
        password: 'secret',
      };

      const response = await request(app).post('/auth/login').send(userInfo);
      const cookies = (response.headers as Headers)['set-cookie'];

      let accessToken = null,
        refreshToken = null;
      cookies.forEach((cookie: string) => {
        if (cookie.startsWith('accessToken=')) {
          accessToken = cookie.split(';')[0].split('=')[1];
        }
        if (cookie.startsWith('refreshToken=')) {
          refreshToken = cookie.split(';')[0].split('=')[1];
        }
      });

      expect(response.statusCode).toBe(200);
      expect(accessToken).not.toBeNull();
      expect(refreshToken).not.toBeNull();

      expect(isJwt(accessToken)).toBeTruthy();
      expect(isJwt(refreshToken)).toBeTruthy();
    });
  });

  describe('sad path', () => {
    it('should throw error if email do not exist', async () => {
      const userInfo = {
        email: 'shouryakaushik222@gmail.com',
        password: 'secret',
      };

      const response: ErrorResponseFormat = await request(app)
        .post('/auth/login')
        .send(userInfo);
      expect(response.statusCode).toBe(400);
      const errObj = response.body;
      expect(errObj.errors[0].msg).toBe('Email and password does not exist');
    });
    it('should throw error if password is not correct', async () => {
      const userInfo = {
        email: 'shouryakaushik2223@gmail.com',
        password: 'secr',
      };

      const response: ErrorResponseFormat = await request(app)
        .post('/auth/login')
        .send(userInfo);
      expect(response.statusCode).toBe(400);
      const errObj = response.body;
      expect(errObj.errors[0].msg).toBe('Email and password does not exist');
    });
  });
  describe('validation error', () => {
    it('should return 400 status code if email is missing or invalid email', async () => {
      // Arrange
      const userData = {
        email: '',
        password: 'secret',
      };

      const response: ErrorResponseFormat = await request(app)
        .post('/auth/login')
        .send(userData);
      const errObj = response.body;
      expect(response.statusCode).toBe(400);
      expect(errObj.errors[0].msg).toBe('Email is a required');
    });
  });
});
