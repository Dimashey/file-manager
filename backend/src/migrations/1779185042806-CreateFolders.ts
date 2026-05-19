import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFolders1779185042806 implements MigrationInterface {
    name = 'CreateFolders1779185042806'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "folders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "parentId" uuid, "ownerId" uuid NOT NULL, "isPublic" boolean NOT NULL DEFAULT false, "position" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8578bd31b0e7f6d6c2480dbbca8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "folders" ADD CONSTRAINT "FK_1be2fce400dcc657602d336f23f" FOREIGN KEY ("parentId") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "folders" ADD CONSTRAINT "FK_6228242ce9f7a8f3aec9397c6a7" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "folders" DROP CONSTRAINT "FK_6228242ce9f7a8f3aec9397c6a7"`);
        await queryRunner.query(`ALTER TABLE "folders" DROP CONSTRAINT "FK_1be2fce400dcc657602d336f23f"`);
        await queryRunner.query(`DROP TABLE "folders"`);
    }

}
