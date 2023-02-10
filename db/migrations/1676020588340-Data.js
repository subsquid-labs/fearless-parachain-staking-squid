module.exports = class Data1676020588340 {
    name = 'Data1676020588340'

    async up(db) {
        await db.query(`ALTER TABLE "reward" DROP CONSTRAINT "FK_4a8843fdb7840bfd00f8e4f7b36"`)
        await db.query(`ALTER TABLE "staker" DROP CONSTRAINT "FK_828b14269265a736e4fef52ce26"`)
        await db.query(`DROP INDEX "public"."IDX_828b14269265a736e4fef52ce2"`)
        await db.query(`ALTER TABLE "staker" DROP COLUMN "commission"`)
        await db.query(`ALTER TABLE "round_collator" ALTER COLUMN "own_bond" SET NOT NULL`)
        await db.query(`DROP INDEX "public"."IDX_4a8843fdb7840bfd00f8e4f7b3"`)
        await db.query(`ALTER TABLE "reward" DROP COLUMN "account_id"`)
        await db.query(`ALTER TABLE "reward" ADD "account_id" text NOT NULL`)
        await db.query(`ALTER TABLE "staker" DROP CONSTRAINT "REL_828b14269265a736e4fef52ce2"`)
        await db.query(`ALTER TABLE "staker" DROP COLUMN "stash_id"`)
        await db.query(`ALTER TABLE "staker" ADD "stash_id" text`)
        await db.query(`ALTER TABLE "staker" ALTER COLUMN "active_bond" SET NOT NULL`)
        await db.query(`ALTER TABLE "staker" ALTER COLUMN "total_reward" SET NOT NULL`)
        await db.query(`CREATE INDEX "IDX_4a8843fdb7840bfd00f8e4f7b3" ON "reward" ("account_id") `)
        await db.query(`CREATE INDEX "IDX_828b14269265a736e4fef52ce2" ON "staker" ("stash_id") `)
    }

    async down(db) {
        await db.query(`ALTER TABLE "reward" ADD CONSTRAINT "FK_4a8843fdb7840bfd00f8e4f7b36" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "staker" ADD CONSTRAINT "FK_828b14269265a736e4fef52ce26" FOREIGN KEY ("stash_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`CREATE UNIQUE INDEX "IDX_828b14269265a736e4fef52ce2" ON "staker" ("stash_id") `)
        await db.query(`ALTER TABLE "staker" ADD "commission" numeric`)
        await db.query(`ALTER TABLE "round_collator" ALTER COLUMN "own_bond" DROP NOT NULL`)
        await db.query(`CREATE INDEX "IDX_4a8843fdb7840bfd00f8e4f7b3" ON "reward" ("account_id") `)
        await db.query(`ALTER TABLE "reward" ADD "account_id" character varying`)
        await db.query(`ALTER TABLE "reward" DROP COLUMN "account_id"`)
        await db.query(`ALTER TABLE "staker" ADD CONSTRAINT "REL_828b14269265a736e4fef52ce2" UNIQUE ("stash_id")`)
        await db.query(`ALTER TABLE "staker" ADD "stash_id" character varying NOT NULL`)
        await db.query(`ALTER TABLE "staker" DROP COLUMN "stash_id"`)
        await db.query(`ALTER TABLE "staker" ALTER COLUMN "active_bond" DROP NOT NULL`)
        await db.query(`ALTER TABLE "staker" ALTER COLUMN "total_reward" DROP NOT NULL`)
        await db.query(`DROP INDEX "public"."IDX_4a8843fdb7840bfd00f8e4f7b3"`)
        await db.query(`DROP INDEX "public"."IDX_828b14269265a736e4fef52ce2"`)
    }
}
