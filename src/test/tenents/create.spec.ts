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
import { Tenent } from '../../entity/Tenent';

describe('POST /tenents', () => {
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
      const tenentData = {
        name: 'New tenent',
        address: 'My tenent address',
      };

      const response = await request(app).post('/tenents').send(tenentData);

      expect(response.statusCode).toBe(201);
    });
    it('should presist tenent data in db', async () => {
      const tenentData = {
        name: 'New tenent',
        address: 'My tenent address',
      };

      await request(app).post('/tenents').send(tenentData);
      const tenentRepo = connection.getRepository(Tenent);
      const tenent = await tenentRepo.find();

      expect(tenent).toHaveLength(1);
      expect(tenent[0].name).toBe(tenentData.name);
      expect(tenent[0].address).toBe(tenentData.address);
    });
  });
});
