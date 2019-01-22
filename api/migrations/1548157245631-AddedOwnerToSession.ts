import {MigrationInterface, QueryRunner} from "typeorm";

export class AddedOwnerToSession1548157245631 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "token"`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "sessions" ADD "token" uuid NOT NULL DEFAULT uuid_generate_v4()`);
    }

}
