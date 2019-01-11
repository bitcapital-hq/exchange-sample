import {MigrationInterface, QueryRunner} from "typeorm";

export class BitcapitalTokenOnModel1547214375495 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "token" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL, "is_valid" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "bitcapitalid"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "bitcapital_id" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "bitcapital_token" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "bitcapital_token"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "bitcapital_id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "bitcapitalid" character varying`);
        await queryRunner.query(`DROP TABLE "sessions"`);
    }

}
