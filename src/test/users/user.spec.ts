/*
    Follow three AAA to write test  
    Arrange -> Arrange the input or connection or data or anything required before testing this schenerio
    Act -> Actually test the functionality
    Assert -> Assert -> Check if the result is expected or not
*/

import { DataSource } from 'typeorm';
import { AppDataSource } from '../../config/data-source';
import app from '../../app';

import request from 'supertest';
import createJWKMocks from 'mock-jwks';
import { User } from '../../entity/User';
import { Roles } from '../../constants';

describe('GET auth/self', () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKMocks>;
  beforeAll(async () => {
    connection = await AppDataSource.initialize();
    jwks = createJWKMocks('http://localhost:5501');
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
    jwks.start();
  });

  afterEach(() => {
    jwks.stop();
  });

  afterAll(async () => {
    await connection.destroy();
  });
  describe('If all fields present', () => {
    it('should return 200 status code', async () => {
      //Arrange
      const userData = {
        firstName: 'shourya',
        lastName: 'kaushik',
        email: 'shouryakaushik2223@gmail.com',
        password: 'secret',
      };

      const userRepository = connection.getRepository(User); // Regsiter a user
      const data = await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      });
      // create token
      const accessToken = jwks.token({ sub: String(data.id), role: data.role });

      const response = await request(app)
        .get('/auth/self')
        .set('Cookie', [`accessToken=${accessToken};`])
        .send();
      const body = response.body as Record<string, string>;
      expect(body.id).toBe(data.id);
    });
    it('should not return password field', async () => {
      //Arrange
      const userData = {
        firstName: 'shourya',
        lastName: 'kaushik',
        email: 'shouryakaushik2223@gmail.com',
        password: 'secret',
      };

      const userRepository = connection.getRepository(User); // Regsiter a user
      const data = await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      });
      // create token
      const accessToken = jwks.token({ sub: String(data.id), role: data.role });

      const response = await request(app)
        .get('/auth/self')
        .set('Cookie', [`accessToken=${accessToken};`])
        .send();

      expect(response.body).not.toHaveProperty('password');
    });
  });
});
