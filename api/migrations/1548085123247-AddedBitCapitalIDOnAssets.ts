import {MigrationInterface, QueryRunner} from "typeorm";

export class AddedBitCapitalIDOnAssets1548085123247 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "assets" ADD "bitcapital_asset_id" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "assets" DROP COLUMN "bitcapital_asset_id"`);
    }

}
