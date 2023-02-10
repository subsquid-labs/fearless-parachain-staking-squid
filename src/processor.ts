import {SubstrateBatchProcessor} from '@subsquid/substrate-processor'
import {TypeormDatabase} from '@subsquid/typeorm-store'
import config from './config'
import {processRounds, setupRound} from './core/round'
import {processStaking, setupStaking} from './core/staking'

const database = new TypeormDatabase()
const processor = new SubstrateBatchProcessor().setDataSource(config.dataSource)

setupRound(processor)
setupStaking(processor)

processor.run(database, async (ctx) => {
    await processRounds(ctx as any)
    await processStaking(ctx as any)
})
