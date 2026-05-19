import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFiles1779185794529 implements MigrationInterface {
  name = 'CreateFiles1779185794529';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "originalName" character varying NOT NULL, "mimeType" character varying NOT NULL, "extension" character varying NOT NULL, "size" bigint NOT NULL, "storagePath" character varying NOT NULL, "thumbnailPath" character varying, "folderId" uuid, "ownerId" uuid NOT NULL, "isPublic" boolean NOT NULL DEFAULT false, "position" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" ADD CONSTRAINT "FK_24dfe39188240d442f380dd8c04" FOREIGN KEY ("folderId") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "files" ADD CONSTRAINT "FK_a23484d1055e34d75b25f616792" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "files" DROP CONSTRAINT "FK_a23484d1055e34d75b25f616792"`);
    await queryRunner.query(`ALTER TABLE "files" DROP CONSTRAINT "FK_24dfe39188240d442f380dd8c04"`);
    await queryRunner.query(`DROP TABLE "files"`);
  }
}
