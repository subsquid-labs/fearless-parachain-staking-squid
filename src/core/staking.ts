import {SubstrateBatchProcessor, BatchContext, assertNotNull, BatchProcessorItem} from '@subsquid/substrate-processor'
import {CallItem, EventItem} from '@subsquid/substrate-processor/lib/interfaces/dataSelection'
import {Store} from '@subsquid/typeorm-store'
import assert from 'assert'
import {In, MoreThanOrEqual} from 'typeorm'
import {chain} from '../chains'
import {HistoryElement, Reward, Round, RoundCollator, RoundNominator, Staker} from '../model'
import {toEntityMap} from '../utils/misc'
import {createStaker} from './entities'

type Item = EventItem<string, {event: {args: true}}> | CallItem<string>

export function setupStaking(processor: SubstrateBatchProcessor) {
    for (let i in chain.ParachainStaking.events.CandidateBondedLess.names) {
        processor.addEvent(i, {data: {event: {args: true}}})
    }

    for (let i in chain.ParachainStaking.events.CandidateBondedMore.names) {
        processor.addEvent(i, {data: {event: {args: true}}})
    }

    for (let i in chain.ParachainStaking.events.Delegation.names) {
        processor.addEvent(i, {data: {event: {args: true}}})
    }

    for (let i in chain.ParachainStaking.events.DelegationDecreased.names) {
        processor.addEvent(i, {data: {event: {args: true}}})
    }

    for (let i in chain.ParachainStaking.events.DelegationIncreased.names) {
        processor.addEvent(i, {data: {event: {args: true}}})
    }

    for (let i in chain.ParachainStaking.events.Rewarded.names) {
        processor.addEvent(i, {data: {event: {args: true}}})
    }
}

export async function processStaking(ctx: BatchContext<Store, Item>) {
    let firstRoundIndex = await getFirstRound(ctx)

    const stakingData = await getStakingData(ctx)

    let rounds = await ctx.store.find(Round, {
        where: {index: MoreThanOrEqual(firstRoundIndex - 5)},
        order: {index: 'ASC'},
    })
    const cachedHeightRound: Record<number, Round> = {}
    const getRound = (height: number) => {
        let r = cachedHeightRound[height]
        if (r == null) {
            for (let i = 0; i < rounds.length; i++) {
                if (i + 1 === rounds.length || rounds[i + 1].startedAt > height) {
                    r = rounds[i]
                    break
                }
            }
            cachedHeightRound[height] = r
        }
        return r
    }

    let stakerIds = new Set<string>()
    let roundCollatorIds = new Set<string>()
    for (let data of stakingData) {
        let round = getRound(data.blockNumber)

        let stakerId = data.accountId
        stakerIds.add(stakerId)

        if (data.__kind === 'Reward') {
            for (let i = 3; i < 6; i++) {
                roundCollatorIds.add(`${round.index - i}-${stakerId}`)
            }
        }
    }

    const stakers = await ctx.store.find(Staker, {where: {id: In([...stakerIds])}}).then(toEntityMap)
    const roundCollators = await ctx.store
        .find(RoundCollator, {where: {id: In([...roundCollatorIds])}})
        .then(toEntityMap)

    const historyElements: HistoryElement[] = []
    const rewards: Reward[] = []
    for (let data of stakingData) {
        let round = getRound(data.blockNumber)

        let stakerId = data.accountId
        switch (data.__kind) {
            case 'Bond': {
                let staker = stakers.get(stakerId)
                if (staker == null) {
                    staker = createStaker(stakerId)
                    stakers.set(stakerId, staker)
                }

                staker.role = 'collator'
                staker.activeBond += data.isUnstake ? -data.amount : data.amount

                historyElements.push(
                    new HistoryElement({
                        id: data.id,
                        timestamp: data.timestamp,
                        blockNumber: data.blockNumber,
                        amount: data.amount,
                        type: data.isUnstake ? 1 : 0,
                        round: round,
                        staker: staker,
                    })
                )

                break
            }
            case 'Delegation': {
                let staker = stakers.get(stakerId)
                if (staker == null) {
                    staker = createStaker(stakerId)
                    stakers.set(stakerId, staker)
                }

                staker.role = 'delegator'
                staker.activeBond += data.isUnstake ? -data.amount : data.amount

                historyElements.push(
                    new HistoryElement({
                        id: data.id,
                        timestamp: data.timestamp,
                        blockNumber: data.blockNumber,
                        amount: data.amount,
                        type: data.isUnstake ? 1 : 0,
                        round: round,
                        staker: staker,
                    })
                )

                break
            }
            case 'Reward': {
                const staker = stakers.get(stakerId)
                assert(staker != null)

                staker.totalReward += data.amount
                staker.activeBond += data.amount

                historyElements.push(
                    new HistoryElement({
                        id: data.id,
                        timestamp: data.timestamp,
                        blockNumber: data.blockNumber,
                        amount: data.amount,
                        type: 2,
                        round: round,
                        staker: staker,
                    })
                )

                rewards.push(
                    new Reward({
                        id: data.id,
                        timestamp: data.timestamp,
                        blockNumber: data.blockNumber,
                        round: round.index - 2,
                        amount: data.amount,
                        accountId: stakerId,
                        staker,
                    })
                )

                if (staker.role === 'collator') {
                    const roundCollator = roundCollators.get(`${round.index - 2}-${staker.stashId}`)
                    if (roundCollator == null) {
                        // lets hope he wasn't collator
                    } else {
                        const colStakeShare = roundCollator.ownBond / roundCollator.totalBond
                        const amountDue = Number(data.amount) / (0.2 + 0.5 * Number(colStakeShare))
                        const colRew = 0.2 * amountDue + 0.5 * amountDue * Number(colStakeShare)
                        const colAnnualRew = colRew * Number(1460)
                        roundCollator.apr = colAnnualRew / Number(roundCollator.ownBond)

                        const collatorLastRound = roundCollators.get(`${round.index - 6}-${staker.stashId}`)
                        const lastApr = collatorLastRound?.apr || 0
                        if (collatorLastRound == null || lastApr <= 0) {
                            staker.apr24h = roundCollator.apr / 4
                        } else {
                            const Apr = staker.apr24h || 0
                            const avgApr = Apr * 4
                            if (avgApr > 0) {
                                staker.apr24h = (avgApr - lastApr + roundCollator.apr) / 4
                            } else {
                                const lastRound3Collator = roundCollators.get(`${round.index - 5}-${staker.stashId}`)
                                const lastRound3Apr = lastRound3Collator?.apr || 0
                                const lastRound2Collator = roundCollators.get(`${round.index - 4}-${staker.stashId}`)
                                const lastRound2Apr = lastRound2Collator?.apr || 0
                                const lastRound1Collator = roundCollators.get(`${round.index - 3}-${staker.stashId}`)
                                const lastRound1Apr = lastRound1Collator?.apr || 0
                                staker.apr24h = (lastRound3Apr + lastRound2Apr + lastRound1Apr + roundCollator.apr) / 4
                            }
                        }
                    }
                }
            }
        }
    }

    await ctx.store.save([...stakers.values()])
    await ctx.store.save([...roundCollators.values()])

    await ctx.store.insert(historyElements)
    await ctx.store.insert(rewards)
}

type BondData = {
    __kind: 'Bond'
    id: string
    timestamp: Date
    blockNumber: number
    accountId: string
    amount: bigint
    newTotal: bigint
    isUnstake: boolean
}

type DelegationData = {
    __kind: 'Delegation'
    id: string
    timestamp: Date
    blockNumber: number
    accountId: string
    amount: bigint
    candidateId: string
    isUnstake: boolean
}

type RewardData = {
    __kind: 'Reward'
    id: string
    timestamp: Date
    blockNumber: number
    amount: bigint
    accountId: string
}

type StakingData = BondData | DelegationData | RewardData

async function getStakingData(ctx: BatchContext<unknown, Item>): Promise<StakingData[]> {
    const stakingData: StakingData[] = []

    for (const {header: block, items} of ctx.blocks) {
        for (const item of items) {
            if (item.kind !== 'event') continue

            if (item.name in chain.ParachainStaking.events.CandidateBondedLess.names) {
                let e = chain.ParachainStaking.events.CandidateBondedLess.decode(ctx, item.event)
                stakingData.push({
                    __kind: 'Bond',
                    id: item.event.id,
                    timestamp: new Date(block.timestamp),
                    blockNumber: block.height,
                    amount: e.amount,
                    accountId: chain.encodeAddress(e.account),
                    newTotal: e.newTotal,
                    isUnstake: true,
                })
            }

            if (item.name in chain.ParachainStaking.events.CandidateBondedMore.names) {
                let e = chain.ParachainStaking.events.CandidateBondedMore.decode(ctx, item.event)
                stakingData.push({
                    __kind: 'Bond',
                    id: item.event.id,
                    timestamp: new Date(block.timestamp),
                    blockNumber: block.height,
                    amount: e.amount,
                    accountId: chain.encodeAddress(e.account),
                    newTotal: e.newTotal,
                    isUnstake: false,
                })
            }

            if (item.name in chain.ParachainStaking.events.Delegation.names) {
                let e = chain.ParachainStaking.events.Delegation.decode(ctx, item.event)
                stakingData.push({
                    __kind: 'Delegation',
                    id: item.event.id,
                    timestamp: new Date(block.timestamp),
                    blockNumber: block.height,
                    amount: e.amount,
                    accountId: chain.encodeAddress(e.account),
                    candidateId: chain.encodeAddress(e.candidate),
                    isUnstake: false,
                })
            }

            if (item.name in chain.ParachainStaking.events.DelegationDecreased.names) {
                let e = chain.ParachainStaking.events.DelegationDecreased.decode(ctx, item.event)
                stakingData.push({
                    __kind: 'Delegation',
                    id: item.event.id,
                    timestamp: new Date(block.timestamp),
                    blockNumber: block.height,
                    amount: e.amount,
                    accountId: chain.encodeAddress(e.account),
                    candidateId: chain.encodeAddress(e.candidate),
                    isUnstake: true,
                })
            }

            if (item.name in chain.ParachainStaking.events.DelegationIncreased.names) {
                let e = chain.ParachainStaking.events.DelegationIncreased.decode(ctx, item.event)
                stakingData.push({
                    __kind: 'Delegation',
                    id: item.event.id,
                    timestamp: new Date(block.timestamp),
                    blockNumber: block.height,
                    amount: e.amount,
                    accountId: chain.encodeAddress(e.account),
                    candidateId: chain.encodeAddress(e.candidate),
                    isUnstake: false,
                })
            }

            if (item.name in chain.ParachainStaking.events.DelegationRevoked.names) {
                let e = chain.ParachainStaking.events.DelegationRevoked.decode(ctx, item.event)
                stakingData.push({
                    __kind: 'Delegation',
                    id: item.event.id,
                    timestamp: new Date(block.timestamp),
                    blockNumber: block.height,
                    amount: e.amount,
                    accountId: chain.encodeAddress(e.account),
                    candidateId: chain.encodeAddress(e.candidate),
                    isUnstake: true,
                })
            }

            if (item.name in chain.ParachainStaking.events.Rewarded.names) {
                let e = chain.ParachainStaking.events.Rewarded.decode(ctx, item.event)
                stakingData.push({
                    __kind: 'Reward',
                    id: item.event.id,
                    timestamp: new Date(block.timestamp),
                    blockNumber: block.height,
                    amount: e.amount,
                    accountId: chain.encodeAddress(e.account),
                })
            }
        }
    }

    return stakingData
}

async function getFirstRound(ctx: BatchContext<Store, unknown>) {
    let round = await chain.ParachainStaking.storage.Round.get(ctx, ctx.blocks[0].header)
    assert(round != null)
    return round.current
}
