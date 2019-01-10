import {MigrationInterface, QueryRunner} from "typeorm";

export class UserWithPasswordHash1547139487620 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "users" ADD "password" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password"`);
    }

}
