module.exports = class Data1675775091604 {
    name = 'Data1675775091604'

    async up(db) {
        await db.query(`ALTER TABLE "account" DROP COLUMN "last_update_block"`)
        await db.query(`ALTER TABLE "round_nominator" DROP CONSTRAINT "FK_5fe0aad37b6dfe8988f555262c9"`)
        await db.query(`ALTER TABLE "round_nominator" ALTER COLUMN "staker_id" DROP NOT NULL`)
        await db.query(`ALTER TABLE "round_collator" DROP CONSTRAINT "FK_361329a0fdaf8f4f7e860639bdb"`)
        await db.query(`ALTER TABLE "round_collator" ALTER COLUMN "nominators_count" DROP NOT NULL`)
        await db.query(`ALTER TABLE "round_collator" ALTER COLUMN "staker_id" DROP NOT NULL`)
        await db.query(`ALTER TABLE "staker" ALTER COLUMN "active_bond" DROP NOT NULL`)
        await db.query(`ALTER TABLE "staker" ALTER COLUMN "total_reward" DROP NOT NULL`)
        await db.query(`ALTER TABLE "reward" DROP CONSTRAINT "FK_4a8843fdb7840bfd00f8e4f7b36"`)
        await db.query(`ALTER TABLE "reward" ALTER COLUMN "account_id" DROP NOT NULL`)
        await db.query(`ALTER TABLE "round_nominator" ADD CONSTRAINT "FK_5fe0aad37b6dfe8988f555262c9" FOREIGN KEY ("staker_id") REFERENCES "staker"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "round_collator" ADD CONSTRAINT "FK_361329a0fdaf8f4f7e860639bdb" FOREIGN KEY ("staker_id") REFERENCES "staker"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "reward" ADD CONSTRAINT "FK_4a8843fdb7840bfd00f8e4f7b36" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    }

    async down(db) {
        await db.query(`ALTER TABLE "account" ADD "last_update_block" integer NOT NULL`)
        await db.query(`ALTER TABLE "round_nominator" ADD CONSTRAINT "FK_5fe0aad37b6dfe8988f555262c9" FOREIGN KEY ("staker_id") REFERENCES "staker"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "round_nominator" ALTER COLUMN "staker_id" SET NOT NULL`)
        await db.query(`ALTER TABLE "round_collator" ADD CONSTRAINT "FK_361329a0fdaf8f4f7e860639bdb" FOREIGN KEY ("staker_id") REFERENCES "staker"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "round_collator" ALTER COLUMN "nominators_count" SET NOT NULL`)
        await db.query(`ALTER TABLE "round_collator" ALTER COLUMN "staker_id" SET NOT NULL`)
        await db.query(`ALTER TABLE "staker" ALTER COLUMN "active_bond" SET NOT NULL`)
        await db.query(`ALTER TABLE "staker" ALTER COLUMN "total_reward" SET NOT NULL`)
        await db.query(`ALTER TABLE "reward" ADD CONSTRAINT "FK_4a8843fdb7840bfd00f8e4f7b36" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "reward" ALTER COLUMN "account_id" SET NOT NULL`)
        await db.query(`ALTER TABLE "round_nominator" DROP CONSTRAINT "FK_5fe0aad37b6dfe8988f555262c9"`)
        await db.query(`ALTER TABLE "round_collator" DROP CONSTRAINT "FK_361329a0fdaf8f4f7e860639bdb"`)
        await db.query(`ALTER TABLE "reward" DROP CONSTRAINT "FK_4a8843fdb7840bfd00f8e4f7b36"`)
    }
}
