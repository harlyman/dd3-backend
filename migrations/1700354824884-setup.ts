import { readFileSync } from 'fs';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class Setup1700354824884 implements MigrationInterface {
  name = 'Setup1700354824884';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const fileContent = readFileSync(`${process.cwd()}/words.txt`, 'utf-8');
    const words = fileContent.split('\n');
    await queryRunner.query(
      `CREATE TABLE "words" ("guid" uuid NOT NULL DEFAULT uuid_generate_v4(), "word" character varying(30) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "usedAt" TIMESTAMP, CONSTRAINT "words_pk" PRIMARY KEY ("guid"))`
    );
    await queryRunner.query(
      `CREATE TABLE "challenges" ("guid" uuid NOT NULL DEFAULT uuid_generate_v4(), "beginAt" TIMESTAMP NOT NULL DEFAULT now(), "endAt" TIMESTAMP NOT NULL, "wordGuid" uuid NOT NULL, CONSTRAINT "REL_ecd87b4a2d587cdb1fd84da09f" UNIQUE ("wordGuid"), CONSTRAINT "challenges_pk" PRIMARY KEY ("guid"))`
    );
    await queryRunner.query(
      `CREATE TABLE "roles" ("guid" uuid NOT NULL DEFAULT uuid_generate_v4(), "role" character varying(45) NOT NULL, "description" character varying(200), CONSTRAINT "roles_pk" PRIMARY KEY ("guid"))`
    );
    await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`, [
      'dd3_backend',
      'public',
      'users',
      'GENERATED_COLUMN',
      'search',
      "name || COALESCE(lastName, '') || COALESCE(email, '') || username"
    ]);
    await queryRunner.query(
      `CREATE TABLE "users" ("guid" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50) NOT NULL, "lastname" character varying(50), "email" character varying(50), "search" character varying(200) GENERATED ALWAYS AS (name || COALESCE(lastName, '') || COALESCE(email, '') || username) STORED NOT NULL, "username" character varying(50) NOT NULL, "isActive" boolean NOT NULL DEFAULT 'true', "password" character varying(250) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "roleGuid" uuid NOT NULL, "createdBy" uuid, "updatedBy" uuid, "deletedBy" uuid, CONSTRAINT "users_uk" UNIQUE ("username"), CONSTRAINT "users_pk" PRIMARY KEY ("guid"))`
    );
    await queryRunner.query(
      `CREATE TABLE "challenges_users" ("guid" uuid NOT NULL DEFAULT uuid_generate_v4(), "victory" boolean NOT NULL DEFAULT 'false', "challengeGuid" uuid NOT NULL, "userGuid" uuid NOT NULL, CONSTRAINT "challenges_users_pk" PRIMARY KEY ("guid"))`
    );
    await queryRunner.query(
      `CREATE TABLE "attempts" ("guid" uuid NOT NULL DEFAULT uuid_generate_v4(), "word" character varying(30) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "challengeUserGuid" uuid NOT NULL, CONSTRAINT "attempts_pk" PRIMARY KEY ("guid"))`
    );
    await queryRunner.query(
      `ALTER TABLE "challenges" ADD CONSTRAINT "challenges_fk_1" FOREIGN KEY ("wordGuid") REFERENCES "words"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "users_fk_1" FOREIGN KEY ("roleGuid") REFERENCES "roles"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "users_fk_2" FOREIGN KEY ("createdBy") REFERENCES "users"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "users_fk_3" FOREIGN KEY ("updatedBy") REFERENCES "users"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "users_fk_4" FOREIGN KEY ("deletedBy") REFERENCES "users"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "challenges_users" ADD CONSTRAINT "challenges_users_fk_1" FOREIGN KEY ("challengeGuid") REFERENCES "challenges"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "challenges_users" ADD CONSTRAINT "challenges_users_fk_2" FOREIGN KEY ("userGuid") REFERENCES "users"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "attempts" ADD CONSTRAINT "attempts_fk_1" FOREIGN KEY ("challengeUserGuid") REFERENCES "challenges_users"("guid") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    let sql = `INSERT INTO "words" ("word") VALUES `;
    let idx = 0;
    while (idx < words.length) {
      const rows = [];
      for (let jdx = 0; idx < words.length && jdx < 5000; jdx++) {
        rows.push({ word: words[idx] });
        idx++;
      }

      await queryRunner.query(`${sql} ${rows.map((data) => `('${data.word}')`).join(', ')}`);
    }

    await queryRunner.query('INSERT INTO "roles"  ("guid", "role", "description") VALUES ($1, $2, $3)', ['0667613a-d6a5-42e6-9a9e-0b2a362f6015', 'Admin', '']);
    await queryRunner.query('INSERT INTO "roles"  ("guid", "role", "description") VALUES ($1, $2, $3)', ['1573dc11-a742-4665-a7f0-c349ef084f71', 'Player', '']);

    await queryRunner.query(
      'INSERT INTO "users" ("guid", "name", "email", "username", "password", "isActive", "createdAt", "roleGuid", "createdBy") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [
        '5fb16675-6585-47f2-bf43-a5c0ec570909',
        'Admin',
        'admin@dacodes.com',
        'admin@dacodes.com',
        '$2b$08$EGql1iM0V/gqGjwPonbbCu82mdU5ycIfg.zcJTuukEVdyhNS9eC2a',
        true,
        new Date(),
        '0667613a-d6a5-42e6-9a9e-0b2a362f6015',
        '5fb16675-6585-47f2-bf43-a5c0ec570909'
      ]
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "attempts" DROP CONSTRAINT "attempts_fk_1"`);
    await queryRunner.query(`ALTER TABLE "challenges_users" DROP CONSTRAINT "challenges_users_fk_2"`);
    await queryRunner.query(`ALTER TABLE "challenges_users" DROP CONSTRAINT "challenges_users_fk_1"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "users_fk_4"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "users_fk_3"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "users_fk_2"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "users_fk_1"`);
    await queryRunner.query(`ALTER TABLE "challenges" DROP CONSTRAINT "challenges_fk_1"`);
    await queryRunner.query(`DROP TABLE "attempts"`);
    await queryRunner.query(`DROP TABLE "challenges_users"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`, [
      'GENERATED_COLUMN',
      'search',
      'dd3_backend',
      'public',
      'users'
    ]);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "challenges"`);
    await queryRunner.query(`DROP TABLE "words"`);
  }
}
