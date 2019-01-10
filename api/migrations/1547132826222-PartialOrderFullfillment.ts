import {MigrationInterface, QueryRunner} from "typeorm";

export class PartialOrderFullfillment1547132826222 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "filled" integer NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "filled"`);
    }

}
