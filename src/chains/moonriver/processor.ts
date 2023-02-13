import assert from 'assert'
import {BatchContext, BatchProcessorItem, SubstrateBatchProcessor, assertNotNull} from '@subsquid/substrate-processor'
import {TypeormDatabase} from '@subsquid/typeorm-store'
import {Candidate, Delegator, RoundData, processRounds} from '../../core/round'
import {StakingData, processStaking} from '../../core/staking'
import {encodeAddress, ParachainStaking} from './api'
import config from './config'

const DEFAULT_SELECTION = {event: {args: true}} as const

const database = new TypeormDatabase()
const processor = new SubstrateBatchProcessor()
    .setDataSource(config.dataSource)
    .addEvent('ParachainStaking.NewRound', {data: DEFAULT_SELECTION})
    .addEvent('ParachainStaking.Rewarded', {data: DEFAULT_SELECTION})
    .addEvent('ParachainStaking.CollatorBondedLess', {data: DEFAULT_SELECTION})
    .addEvent('ParachainStaking.CandidateBondedLess', {data: DEFAULT_SELECTION})
    .addEvent('ParachainStaking.CollatorBondedMore', {data: DEFAULT_SELECTION})
    .addEvent('ParachainStaking.CandidateBondedMore', {data: DEFAULT_SELECTION})
    .addEvent('ParachainStaking.Nomination', {data: DEFAULT_SELECTION})
    .addEvent('ParachainStaking.Delegation', {data: DEFAULT_SELECTION})
    .addEvent('ParachainStaking.NominationIncreased', {data: DEFAULT_SELECTION})
    .addEvent('ParachainStaking.DelegationIncreased', {data: DEFAULT_SELECTION})
    .addEvent('ParachainStaking.NominationDecreased', {data: DEFAULT_SELECTION})
    .addEvent('ParachainStaking.DelegationDecreased', {data: DEFAULT_SELECTION})
    .addEvent('ParachainStaking.DelegationRevoked', {data: DEFAULT_SELECTION})

processor.run(database, async (ctx) => {
    let roundsData = await getRoundsData(ctx)
    await processRounds(ctx, roundsData)

    let stakingData = await getStakingData(ctx)
    await processStaking(ctx, {
        stakingData,
        rewardPaymentDelay: ParachainStaking.constants.RewardPaymentDelay.get(ctx),
        startRoundIndex: await getStartRound(ctx),
    })
})

type Item = BatchProcessorItem<typeof processor>

async function getRoundsData(ctx: BatchContext<unknown, Item>): Promise<RoundData[]> {
    const roundsData: RoundData[] = []

    for (const {header: block, items} of ctx.blocks) {
        for (const item of items) {
            if (item.kind !== 'event') continue

            if (item.name === 'ParachainStaking.NewRound') {
                const e = ParachainStaking.events.NewRound.decode(ctx, item.event)

                const candidateIds = await ParachainStaking.storage.SelectedCandidates.get(ctx, block)
                assert(candidateIds != null)

                let candidateStates = await ParachainStaking.storage.CandidateInfo.getMany(ctx, block, candidateIds)
                assert(candidateStates != null)

                let selectedCandidates: Candidate[] = []
                for (let i = 0; i < candidateIds.length; i++) {
                    let id = candidateIds[i]
                    let state = assertNotNull(candidateStates[i])

                    selectedCandidates.push({
                        id,
                        state,
                    })
                }

                const delegatorIds = selectedCandidates
                    .map((c) => [
                        ...c.state.topDelegations.map((d) => d.owner),
                        ...c.state.bottomDelegations.map((d) => d.owner),
                    ])
                    .flat()

                let delegatorStates = await ParachainStaking.storage.DelegatorState.getMany(ctx, block, delegatorIds)
                assert(delegatorStates != null)

                let candidateDelegators: Delegator[] = []
                for (let i = 0; i < delegatorIds.length; i++) {
                    let id = delegatorIds[i]
                    let state = assertNotNull(delegatorStates[i])
                    candidateDelegators.push({
                        id,
                        state,
                    })
                }

                let collatorComission = await ParachainStaking.storage.CollatorComission.get(ctx, block)
                assert(collatorComission != null)

                roundsData.push({
                    index: e.round,
                    timestamp: new Date(block.timestamp),
                    startedAt: e.startingBlock,
                    collatorsCount: selectedCandidates.length,
                    total: e.totalBalance,
                    selectedCandidates,
                    candidateDelegators,
                    collatorComission,
                })
            }
        }
    }

    return roundsData
}

async function getStartRound(ctx: BatchContext<unknown, unknown>) {
    let round = await ParachainStaking.storage.Round.get(ctx, ctx.blocks[0].header)
    assert(round != null)
    return round.current
}

async function getStakingData(ctx: BatchContext<unknown, Item>): Promise<StakingData[]> {
    const stakingData: StakingData[] = []

    for (const {header: block, items} of ctx.blocks) {
        for (const item of items) {
            if (item.kind !== 'event') continue

            switch (item.name) {
                case 'ParachainStaking.CollatorBondedLess':
                case 'ParachainStaking.CandidateBondedLess': {
                    let e = ParachainStaking.events.CandidateBondedLess.decode(ctx, item.event)
                    stakingData.push({
                        __kind: 'Bond',
                        id: item.event.id,
                        timestamp: new Date(block.timestamp),
                        blockNumber: block.height,
                        amount: e.amount,
                        accountId: encodeAddress(e.account),
                        newTotal: e.newTotal,
                        isUnstake: true,
                    })
                    break
                }
                case 'ParachainStaking.CollatorBondedMore':
                case 'ParachainStaking.CandidateBondedMore': {
                    let e = ParachainStaking.events.CandidateBondedMore.decode(ctx, item.event)
                    stakingData.push({
                        __kind: 'Bond',
                        id: item.event.id,
                        timestamp: new Date(block.timestamp),
                        blockNumber: block.height,
                        amount: e.amount,
                        accountId: encodeAddress(e.account),
                        newTotal: e.newTotal,
                        isUnstake: false,
                    })
                    break
                }
                case 'ParachainStaking.Nomination':
                case 'ParachainStaking.Delegation': {
                    let e = ParachainStaking.events.Delegation.decode(ctx, item.event)
                    stakingData.push({
                        __kind: 'Delegation',
                        id: item.event.id,
                        timestamp: new Date(block.timestamp),
                        blockNumber: block.height,
                        amount: e.amount,
                        accountId: encodeAddress(e.account),
                        candidateId: encodeAddress(e.candidate),
                        isUnstake: false,
                    })
                    break
                }
                case 'ParachainStaking.NominationDecreased':
                case 'ParachainStaking.DelegationDecreased': {
                    let e = ParachainStaking.events.DelegationDecreased.decode(ctx, item.event)
                    stakingData.push({
                        __kind: 'Delegation',
                        id: item.event.id,
                        timestamp: new Date(block.timestamp),
                        blockNumber: block.height,
                        amount: e.amount,
                        accountId: encodeAddress(e.account),
                        candidateId: encodeAddress(e.candidate),
                        isUnstake: true,
                    })
                    break
                }
                case 'ParachainStaking.NominationIncreased':
                case 'ParachainStaking.DelegationIncreased': {
                    let e = ParachainStaking.events.DelegationIncreased.decode(ctx, item.event)
                    stakingData.push({
                        __kind: 'Delegation',
                        id: item.event.id,
                        timestamp: new Date(block.timestamp),
                        blockNumber: block.height,
                        amount: e.amount,
                        accountId: encodeAddress(e.account),
                        candidateId: encodeAddress(e.candidate),
                        isUnstake: false,
                    })
                    break
                }
                case 'ParachainStaking.DelegationRevoked': {
                    let e = ParachainStaking.events.DelegationRevoked.decode(ctx, item.event)
                    stakingData.push({
                        __kind: 'Delegation',
                        id: item.event.id,
                        timestamp: new Date(block.timestamp),
                        blockNumber: block.height,
                        amount: e.amount,
                        accountId: encodeAddress(e.account),
                        candidateId: encodeAddress(e.candidate),
                        isUnstake: true,
                    })
                    break
                }
                case 'ParachainStaking.Rewarded': {
                    let e = ParachainStaking.events.Rewarded.decode(ctx, item.event)
                    stakingData.push({
                        __kind: 'Reward',
                        id: item.event.id,
                        timestamp: new Date(block.timestamp),
                        blockNumber: block.height,
                        amount: e.amount,
                        accountId: encodeAddress(e.account),
                    })
                    break
                }
            }
        }
    }

    return stakingData
}
