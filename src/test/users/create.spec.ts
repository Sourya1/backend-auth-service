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
import { Tenent } from '../../entity/Tenent';

describe('POST /users', () => {
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
    it('should persist user in database', async () => {
      //Arrange
      const adminToken = jwks.token({
        sub: '1',
        role: Roles.ADMIN,
      });
      const tenentRepo = connection.getRepository(Tenent);
      const tenent = await tenentRepo.save({
        name: 'New tenent',
        address: 'My tenent address',
      });
      const userData = {
        firstName: 'shourya',
        lastName: 'kaushik',
        email: 'shouryakaushik2223@gmail.com',
        password: 'secret',
        role: Roles.MANAGER,
        tenent: tenent.id,
      };

      const response = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${adminToken};`])
        .send(userData);

      const userReposiory = connection.getRepository(User);
      const user = await userReposiory.find();

      expect(user).toHaveLength(1);
      expect(user[0].email).toBe(userData.email);
      expect(response.statusCode).toBe(201);
    });
    it('should persist user role as Manager', async () => {
      //Arrange
      const adminToken = jwks.token({
        sub: '1',
        role: Roles.ADMIN,
      });
      const tenentRepo = connection.getRepository(Tenent);
      const tenent = await tenentRepo.save({
        name: 'New tenent',
        address: 'My tenent address',
      });
      const userData = {
        firstName: 'shourya',
        lastName: 'kaushik',
        email: 'shouryakaushik2223@gmail.com',
        password: 'secret',
        role: Roles.MANAGER,
        tenent: tenent.id,
      };

      const response = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${adminToken};`])
        .send(userData);

      const userReposiory = connection.getRepository(User);
      const user = await userReposiory.find();

      expect(user).toHaveLength(1);
      expect(user[0].role).toBe(Roles.MANAGER);
      expect(response.statusCode).toBe(201);
    });
    it('should return 403 if non admin user tries to create a user', async () => {
      const nonAdminToken = jwks.token({
        sub: '1',
        role: Roles.MANAGER,
      });

      const userData = {
        firstName: 'shourya',
        lastName: 'kaushik',
        email: 'shouryakaushik2223@gmail.com',
        password: 'secret',
        tenent: 1,
      };

      // Add token to cookie
      const response = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${nonAdminToken}`])
        .send(userData);

      expect(response.statusCode).toBe(403);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users).toHaveLength(0);
    });
  });
});
