/*
    Follow three AAA to write test  
    Arrange -> Arrange the input or connection or data or anything required before testing this schenerio
    Act -> Actually test the functionality
    Assert -> Assert -> Check if the result is expected or not
*/

import { DataSource } from 'typeorm';
import { AppDataSource } from '../../config/data-source';

import app from '../../app';
import createJWKMocks from 'mock-jwks';
import request from 'supertest';
import { Tenent } from '../../entity/Tenent';
import { Roles } from '../../constants';
import { ErrorResponseFormat } from '../utils/types';

describe('GET /tenents', () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKMocks>;
  let adminToken: string;

  beforeAll(async () => {
    jwks = createJWKMocks('http://localhost:5501');
    connection = await AppDataSource.initialize();
    adminToken = jwks.token({
      sub: '1',
      role: Roles.ADMIN,
    });
  });

  beforeEach(async () => {
    //drop and sync db before each test suite runs
    await connection.dropDatabase();
    await connection.synchronize();
    jwks.start();
  });

  afterAll(async () => {
    await connection.destroy();
    jwks.stop();
  });

  describe('All field provided', () => {
    it('should return 200 status code', async () => {
      const tenentData = {
        name: 'New tenent',
        address: 'My tenent address',
      };

      const tenentRepository = connection.getRepository(Tenent);
      const tenent = await tenentRepository.save(tenentData);

      const response = await request(app)
        .get(`/tenents/${tenent.id}`)
        .set('Cookie', `accessToken=${adminToken}`)
        .send();

      expect(response.statusCode).toBe(200);
    });
    it('should return 200 status code with msg if tenent is not found', async () => {
      const tenentId = '3';
      const response: { statusCode: number; body: { msg: string } } =
        await request(app)
          .get(`/tenents/${tenentId}`)
          .set('Cookie', `accessToken=${adminToken}`)
          .send();

      expect(response.statusCode).toBe(200);
      expect(response.body.msg).toBe(`No tennet exist with id ${tenentId}`);
    });
    it('should throw an error if tenentId is not a valid tenentId', async () => {
      const tenentId = 'RandomId';

      const response: ErrorResponseFormat = await request(app)
        .get(`/tenents/${tenentId}`)
        .set('Cookie', `accessToken=${adminToken}`)
        .send();

      expect(response.statusCode).toBe(500);
      expect(response.body.errors[0].msg).toBe(
        'invalid input syntax for type integer: "NaN"',
      );
    });
    it('should return 401 if user is not authenticated', async () => {
      const response = await request(app).get('/tenents/1234').send();
      expect(response.statusCode).toBe(401);
    });
    it('should return 403 if user is not admin role', async () => {
      const managerToken = jwks.token({
        sub: '1',
        role: Roles.MANAGER,
      });

      const response = await request(app)
        .get('/tenents/1234')
        .set('Cookie', `accessToken=${managerToken}`)
        .send();
      expect(response.statusCode).toBe(403);
    });
  });
});
