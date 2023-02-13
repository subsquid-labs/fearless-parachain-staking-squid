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
    .addEvent('ParachainStaking.Compounded', {data: DEFAULT_SELECTION})

processor.run(database, async (ctx) => {
    const roundsData = await getRoundsData(ctx)
    await processRounds(ctx, roundsData)

    const stakingData = await getStakingData(ctx)
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

                const candidateStates = await ParachainStaking.storage.CandidateInfo.getMany(ctx, block, candidateIds)
                assert(candidateStates != null)

                const delegatorIds: Uint8Array[] = []
                const selectedCandidates: Candidate[] = []
                for (let i = 0; i < candidateIds.length; i++) {
                    const id = encodeAddress(candidateIds[i])
                    const state = assertNotNull(candidateStates[i])

                    delegatorIds.push(...state.topDelegations.map((d) => d.owner))
                    delegatorIds.push(...state.bottomDelegations.map((d) => d.owner))

                    selectedCandidates.push({
                        id,
                        state: {
                            bond: state.bond,
                            delegations: [
                                ...state.topDelegations.map((d) => ({
                                    owner: encodeAddress(d.owner),
                                    amount: d.amount,
                                })),
                                ...state.bottomDelegations.map((d) => ({
                                    owner: encodeAddress(d.owner),
                                    amount: d.amount,
                                })),
                            ],
                        },
                    })
                }

                const delegatorStates = await ParachainStaking.storage.DelegatorState.getMany(ctx, block, delegatorIds)
                assert(delegatorStates != null)

                const candidateDelegators: Delegator[] = []
                for (let i = 0; i < delegatorIds.length; i++) {
                    const id = encodeAddress(delegatorIds[i])
                    const state = assertNotNull(delegatorStates[i])
                    candidateDelegators.push({
                        id,
                        state: {
                            total: state.total,
                            delegations: state.delegations.map((d) => ({
                                owner: encodeAddress(d.owner),
                                amount: d.amount,
                            })),
                        },
                    })
                }

                const collatorComission = await ParachainStaking.storage.CollatorComission.get(ctx, block)
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
    const round = await ParachainStaking.storage.Round.get(ctx, ctx.blocks[0].header)
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
                    const e = ParachainStaking.events.CandidateBondedLess.decode(ctx, item.event)
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
                    const e = ParachainStaking.events.CandidateBondedMore.decode(ctx, item.event)
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
                    const e = ParachainStaking.events.Delegation.decode(ctx, item.event)
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
                    const e = ParachainStaking.events.DelegationDecreased.decode(ctx, item.event)
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
                    const e = ParachainStaking.events.DelegationIncreased.decode(ctx, item.event)
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
                    const e = ParachainStaking.events.DelegationRevoked.decode(ctx, item.event)
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
                    const e = ParachainStaking.events.Rewarded.decode(ctx, item.event)
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
                case 'ParachainStaking.Compounded': {
                    const e = ParachainStaking.events.Compounded.decode(ctx, item.event)
                    stakingData.push({
                        __kind: 'Compound',
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
