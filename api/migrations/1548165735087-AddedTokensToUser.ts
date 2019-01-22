import {MigrationInterface, QueryRunner} from "typeorm";

export class AddedTokensToUser1548165735087 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "sessions" ADD "ownerId" uuid`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_4ff4338a217fbcf774e41f35889" FOREIGN KEY ("ownerId") REFERENCES "users"("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_4ff4338a217fbcf774e41f35889"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "ownerId"`);
    }

}
