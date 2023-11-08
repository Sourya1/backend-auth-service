import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatedTenentTable1699415393735 implements MigrationInterface {
  name = 'CreatedTenentTable1699415393735';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "Tenents" ("id" SERIAL NOT NULL, "name" character varying(30) NOT NULL, "address" character varying(255) NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_94fcad9b2b1317828b7dfd94af9" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "Tenents"`);
  }
}
