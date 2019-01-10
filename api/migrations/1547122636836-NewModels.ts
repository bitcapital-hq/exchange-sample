import {MigrationInterface, QueryRunner} from "typeorm";

export class NewModels1547122636836 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying NOT NULL, "originId" uuid, "destinationId" uuid, CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" integer NOT NULL, "price" character varying NOT NULL, "status" character varying NOT NULL, "type" character varying NOT NULL, "userId" uuid, "assetId" uuid, CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Assets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "code" character varying NOT NULL, "type" character varying NOT NULL, CONSTRAINT "PK_ef32ecacd30a84855b7dd59b72d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_ac8532363b9a2bba851877107d7" FOREIGN KEY ("originId") REFERENCES "users"("id")`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_4e23f9a12cc44828e1c78572855" FOREIGN KEY ("destinationId") REFERENCES "users"("id")`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1" FOREIGN KEY ("userId") REFERENCES "users"("id")`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_9bd5a8f3d798e5e0adb24fe2084" FOREIGN KEY ("assetId") REFERENCES "Assets"("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_9bd5a8f3d798e5e0adb24fe2084"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_4e23f9a12cc44828e1c78572855"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_ac8532363b9a2bba851877107d7"`);
        await queryRunner.query(`DROP TABLE "Assets"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "payments"`);
    }

}
