import assert from 'assert'
import {In} from 'typeorm'
import {BatchContext} from '@subsquid/substrate-processor'
import {Store} from '@subsquid/typeorm-store'
import {chain} from '../chains'
import {Round, RoundCollator, RoundNomination, RoundNominator, Staker} from '../model'
import {toEntityMap} from '../utils/misc'
import {createStaker} from './entities'

export type Candidate = {
    id: Uint8Array
    state: ParachainStaking.CandidateState
}

export type Delegator = {
    id: Uint8Array
    state: ParachainStaking.DelegatorState
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
    let getStaker = (id: string) => {
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
                rewardAmount: data.collatorComission,
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

    await ctx.store.save([...stakers.values()])
    await ctx.store.insert(rounds)
    await ctx.store.insert(collators)
    await ctx.store.insert(nominators)
    await ctx.store.insert(nominations)
}
