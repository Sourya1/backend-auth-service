import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameTables1699347651207 implements MigrationInterface {
  name = 'RenameTables1699347651207';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_8e913e288156c133999341156ad"`,
    );
    await queryRunner.renameTable('user', 'users');
    await queryRunner.renameTable('refresh_token', 'refreshToken');
    await queryRunner.query(
      `ALTER TABLE "refreshToken" ADD CONSTRAINT "FK_265bec4e500714d5269580a0219" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refreshToken" DROP CONSTRAINT "FK_265bec4e500714d5269580a0219"`,
    );
    await queryRunner.renameTable('users', 'user');
    await queryRunner.renameTable('refreshToken', 'refresh_token');
  }
}
