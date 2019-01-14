import {MigrationInterface, QueryRunner} from "typeorm";

export class RemovedBitcapitalTokenFromUserModel1547480025990 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "bitcapital_token"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "token"`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "sessions" ADD "token" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "bitcapital_token" character varying`);
    }

}
