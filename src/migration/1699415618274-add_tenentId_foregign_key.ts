import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTenentIdForegignKey1699415618274 implements MigrationInterface {
  name = 'AddTenentIdForegignKey1699415618274';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "tenentId" integer`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_f7f8a0c48606f22dffaeb0e903a" FOREIGN KEY ("tenentId") REFERENCES "Tenents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_f7f8a0c48606f22dffaeb0e903a"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "tenentId"`);
  }
}
