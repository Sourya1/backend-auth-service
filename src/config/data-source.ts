import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Config } from './index';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: Config.DB_HOST,
  port: Number(Config.DB_PORT),
  username: Config.DB_USERNAME,
  password: Config.DB_PASSWORD,
  database: Config.DB_NAME,
  // Don't use in production, also make it false
  synchronize: false,
  logging: false,
  entities: ['src/entity/*.ts'], // tables info
  migrations: ['src/migration/*.ts'],
  subscribers: [],
});
