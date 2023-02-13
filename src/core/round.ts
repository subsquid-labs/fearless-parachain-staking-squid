import assert from 'assert'
import {In} from 'typeorm'
import {BatchContext} from '@subsquid/substrate-processor'
import {Store} from '@subsquid/typeorm-store'
import {Round, RoundCollator, RoundNomination, RoundNominator, Staker} from '../model'
import {toEntityMap} from '../utils/misc'
import {createStaker} from './entities'

export type Candidate = {
    id: string
    state: {
        bond: bigint
        delegations: {
            owner: string
            amount: bigint
        }[]
    }
}

export type Delegator = {
    id: string
    state: {
        total: bigint
        delegations: {
            owner: string
            amount: bigint
        }[]
    }
}

export type RoundData = {
    index: number
    timestamp: Date
    startedAt: number
    collatorsCount: number
    total: bigint
    selectedCandidates: Candidate[]
    candidateDelegators: Delegator[]
    collatorComission: number
}

export async function processRounds(ctx: BatchContext<Store, unknown>, roundsData: RoundData[]): Promise<void> {
    const stakerIds = new Set<string>()
    for (const data of roundsData) {
        for (const c of data.selectedCandidates) {
            stakerIds.add(c.id)
        }
        for (const d of data.candidateDelegators) {
            stakerIds.add(d.id)
        }
    }

    const stakers = await ctx.store.find(Staker, {where: {id: In([...stakerIds])}}).then(toEntityMap)
    const getStaker = (id: string) => {
        let s = stakers.get(id)
        if (s == null) {
            s = createStaker(id)
            stakers.set(id, s)
        }
        return s
    }

    const rounds: Round[] = []
    const collators: RoundCollator[] = []
    const nominators: RoundNominator[] = []
    const nominations: RoundNomination[] = []
    for (const data of roundsData) {
        const round = new Round({
            id: data.index.toString(),
            ...data,
        })
        rounds.push(round)

        const roundNominators = new Map<string, RoundNominator>()
        for (const nominatorData of data.candidateDelegators) {
            const id = nominatorData.id

            const staker = getStaker(id)

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
        for (const collatorData of data.selectedCandidates) {
            const id = collatorData.id

            const staker = getStaker(id)

            let totalBond = collatorData.state.bond
            for (const delegation of collatorData.state.delegations) {
                totalBond += delegation.amount
            }

            const collator = new RoundCollator({
                id: `${round.index}-${id}`,
                round,
                staker,
                ownBond: collatorData.state.bond,
                totalBond,
                rewardAmount: data.collatorComission,
                nominatorsCount: collatorData.state.delegations.length,
            })

            roundCollators.set(id, collator)

            for (const delegation of collatorData.state.delegations) {
                const nominatorId = delegation.owner
                const nominator = roundNominators.get(nominatorId)
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

    await ctx.store.save([...stakers.values()])
    await ctx.store.insert(rounds)
    await ctx.store.insert(collators)
    await ctx.store.insert(nominators)
    await ctx.store.insert(nominations)
}
