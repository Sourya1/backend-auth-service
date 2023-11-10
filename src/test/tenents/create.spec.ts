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

describe('POST /tenents', () => {
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
    it('should return 201 status code', async () => {
      const tenentData = {
        name: 'New tenent',
        address: 'My tenent address',
      };

      const response = await request(app)
        .post('/tenents')
        .set('Cookie', `accessToken=${adminToken}`)
        .send(tenentData);

      expect(response.statusCode).toBe(201);
    });
    it('should presist tenent data in db', async () => {
      const tenentData = {
        name: 'New tenent',
        address: 'My tenent address',
      };

      await request(app)
        .post('/tenents')
        .set('Cookie', `accessToken=${adminToken}`)
        .send(tenentData);
      const tenentRepo = connection.getRepository(Tenent);
      const tenent = await tenentRepo.find();

      expect(tenent).toHaveLength(1);
      expect(tenent[0].name).toBe(tenentData.name);
      expect(tenent[0].address).toBe(tenentData.address);
    });
    it('should return 401 if user is not authenticated', async () => {
      const tenentData = {
        name: 'New tenent',
        address: 'My tenent address',
      };

      const response = await request(app).post('/tenents').send(tenentData);
      expect(response.statusCode).toBe(401);

      const tenentRepo = connection.getRepository(Tenent);
      const tenent = await tenentRepo.find();

      expect(tenent).toHaveLength(0); // no tenent record should created
    });
  });
});
