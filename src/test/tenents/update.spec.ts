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
import { Roles } from '../../constants';
import { Tenent } from '../../entity/Tenent';
import { ErrorResponseFormat } from '../utils/types';

describe('Patch /tenents/:tenentId', () => {
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
        .patch(`/tenents/${tenent.id}`)
        .set('Cookie', `accessToken=${adminToken}`)
        .send(tenentData);

      expect(response.statusCode).toBe(200);
    });
    it('should return 400 status code if tenent id is not valid number', async () => {
      const tenentData = {
        name: 'New tenent',
        address: 'My tenent address',
      };
      const response = await request(app)
        .patch(`/tenents/InvalidId`)
        .set('Cookie', `accessToken=${adminToken}`)
        .send(tenentData);

      expect(response.statusCode).toBe(400);
    });
    it('should return 400 status code if tenent id is not present in db', async () => {
      const tenentData = {
        name: 'New tenent',
        address: 'My tenent address',
      };
      const response: ErrorResponseFormat = await request(app)
        .patch(`/tenents/${1}`)
        .set('Cookie', `accessToken=${adminToken}`)
        .send(tenentData);

      expect(response.statusCode).toBe(400);
      const errObj = response.body;
      expect(errObj.errors[0].msg).toBe('No tenent exist with given id');
    });
    it('should return 403 if user is not admin role', async () => {
      const managerToken = jwks.token({
        sub: '1',
        role: Roles.MANAGER,
      });

      const response = await request(app)
        .patch('/tenents/1234')
        .set('Cookie', `accessToken=${managerToken}`)
        .send();
      expect(response.statusCode).toBe(403);
    });
  });
  describe('Missing fields', () => {
    it('should return 400 if name is missing in body', async () => {
      const tenentData = {
        address: 'My tenent address',
      };

      const response: ErrorResponseFormat = await request(app)
        .patch(`/tenents/${123}`)
        .set('Cookie', `accessToken=${adminToken}`)
        .send(tenentData);

      expect(response.statusCode).toBe(400);
      const errObj = response.body;
      expect(errObj.errors[0].msg).toBe('name is a required');
    });
    it('should return 400 if name proerty length is less than 5 char', async () => {
      const tenentData = {
        name: 'my',
        address: 'My tenent address',
      };

      const response: ErrorResponseFormat = await request(app)
        .patch(`/tenents/${123}`)
        .set('Cookie', `accessToken=${adminToken}`)
        .send(tenentData);

      expect(response.statusCode).toBe(400);
      const errObj = response.body;
      expect(errObj.errors[0].msg).toBe('Name should be 5 char long');
    });
  });
});
