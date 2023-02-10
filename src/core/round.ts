import assert from 'assert'
import {In} from 'typeorm'
import {BatchContext, BatchProcessorItem, SubstrateBatchProcessor, assertNotNull} from '@subsquid/substrate-processor'
import {Store} from '@subsquid/typeorm-store'
import {chain} from '../chains'
import {Round, RoundCollator, RoundNomination, RoundNominator, Staker} from '../model'
import {createStaker} from './entities'
import {EventItem, CallItem} from '@subsquid/substrate-processor/lib/interfaces/dataSelection'
import {toEntityMap} from '../utils/misc'

type Item = EventItem<string, {event: {args: true}}> | CallItem<string>

export function setupRound(processor: SubstrateBatchProcessor) {
    for (let i in chain.ParachainStaking.events.NewRound.names) {
        processor.addEvent(i, {data: {event: {args: true}}})
    }
}

type RoundData = {
    index: number
    timestamp: Date
    startedAt: number
    collatorsCount: number
    total: bigint
    selectedCandidates: ParachainStaking.Candidate[]
    candidateDelegators: ParachainStaking.Delegator[]
}

export async function processRounds(ctx: BatchContext<Store, Item>): Promise<void> {
    const roundsData = await getRoundsData(ctx)

    let stakerIds = new Set<string>()
    for (let data of roundsData) {
        for (let c of data.selectedCandidates) {
            stakerIds.add(chain.encodeAddress(c.id))
        }
        for (let d of data.candidateDelegators) {
            stakerIds.add(chain.encodeAddress(d.id))
        }
    }

    let stakers = await ctx.store.find(Staker, {where: {id: In([...stakerIds])}}).then(toEntityMap)
    let newStakers: Staker[] = []
    let getStaker = (id: string) => {
        let s = stakers.get(id)
        if (s == null) {
            s = createStaker(id)
            stakers.set(id, s)
            newStakers.push(s)
        }
        return s
    }

    const rounds: Round[] = []
    const collators: RoundCollator[] = []
    const nominators: RoundNominator[] = []
    const nominations: RoundNomination[] = []
    for (let data of roundsData) {
        const round = new Round({
            id: data.index.toString(),
            ...data,
        })
        rounds.push(round)

        const roundNominators = new Map<string, RoundNominator>()
        for (let nominatorData of data.candidateDelegators) {
            let id = chain.encodeAddress(nominatorData.id)

            let staker = getStaker(id)

            roundNominators.set(
                id,
                new RoundNominator({
                    id: `${round.index}-${id}`,
                    round,
                    staker,
                    bond: nominatorData.state.total,
                    collatorsCount: 0,
                })
            )
        }
        nominators.push(...roundNominators.values())

        const roundCollators = new Map<string, RoundCollator>()
        for (let collatorData of data.selectedCandidates) {
            let id = chain.encodeAddress(collatorData.id)

            let staker = getStaker(id)

            const allDelegations = [...collatorData.state.topDelegations, ...collatorData.state.bottomDelegations]

            let totalBond = collatorData.state.bond
            for (let delegation of allDelegations) {
                totalBond += delegation.amount
            }

            let collator = new RoundCollator({
                id: `${round.index}-${id}`,
                round,
                staker,
                ownBond: collatorData.state.bond,
                totalBond,
                rewardAmount: 0,
                nominatorsCount: allDelegations.length,
            })

            roundCollators.set(id, collator)

            for (let delegation of allDelegations) {
                let nominatorId = chain.encodeAddress(delegation.owner)
                let nominator = roundNominators.get(nominatorId)
                assert(nominator != null)

                nominations.push(
                    new RoundNomination({
                        id: `${round.index}-${id}-${nominatorId}`,
                        round,
                        collator,
                        nominator,
                        amount: delegation.amount,
                    })
                )

                nominator.collatorsCount += 1
            }
        }
        collators.push(...roundCollators.values())
    }

    await ctx.store.insert(newStakers)
    await ctx.store.insert(rounds)
    await ctx.store.insert(collators)
    await ctx.store.insert(nominators)
    await ctx.store.insert(nominations)
}

async function getRoundsData(ctx: BatchContext<unknown, Item>): Promise<RoundData[]> {
    const roundsData: RoundData[] = []

    for (const {header: block, items} of ctx.blocks) {
        for (const item of items) {
            if (item.kind !== 'event') continue

            if (item.name in chain.ParachainStaking.events.NewRound.names) {
                const e = chain.ParachainStaking.events.NewRound.decode(ctx, item.event)

                const selectedCandidates = await chain.ParachainStaking.storage.SelectedCandidates.get(ctx, block)
                if (selectedCandidates == null) continue

                const delegatorIds = selectedCandidates
                    .map((c) => [
                        ...c.state.topDelegations.map((d) => d.owner),
                        ...c.state.bottomDelegations.map((d) => d.owner),
                    ])
                    .flat()

                let delegatorStates = await chain.ParachainStaking.storage.DelegatorState.getMany(
                    ctx,
                    block,
                    delegatorIds
                )
                assert(delegatorStates != null)

                let candidateDelegators: ParachainStaking.Delegator[] = []
                for (let i = 0; i < delegatorIds.length; i++) {
                    let id = delegatorIds[i]
                    let state = assertNotNull(delegatorStates[i])
                    candidateDelegators.push({
                        id,
                        state,
                    })
                }

                roundsData.push({
                    index: e.round,
                    timestamp: new Date(block.timestamp),
                    startedAt: e.startingBlock,
                    collatorsCount: selectedCandidates.length,
                    total: e.totalBalance,
                    selectedCandidates,
                    candidateDelegators,
                })
            }
        }
    }

    return roundsData
}
