import {assertNotNull} from '@subsquid/substrate-processor'
import assert from 'assert'
import {UnknownVersionError} from '../../../../../utils/errors'
import {
    ParachainStakingBottomDelegationsStorage,
    ParachainStakingCandidateInfoStorage,
    ParachainStakingCandidateStateStorage,
    ParachainStakingTopDelegationsStorage,
    ParachainStakingCollatorState2Storage,
} from '../../../types/storage'
import {Block, ChainContext} from '../../../types/support'

export const CandidateInfo = {
    async getMany(
        ctx: ChainContext,
        block: Block,
        addresses: Uint8Array[]
    ): Promise<(ParachainStaking.CandidateState | undefined)[] | undefined> {
        const pscis = new ParachainStakingCandidateInfoStorage(ctx, block)
        if (!pscis.isExists) return CandidateState.getMany(ctx, block, addresses)

        const bonds: (bigint | undefined)[] = []
        if (pscis.isV1201) {
            let r = await pscis.asV1201.getMany(addresses)
            for (let i = 0; i < addresses.length; i++) {
                bonds.push(r[i]?.bond)
            }
        } else {
            throw new UnknownVersionError(pscis)
        }

        const pstds = new ParachainStakingTopDelegationsStorage(ctx, block)
        assert(pstds.isExists)

        let topDelegations: (ParachainStaking.Delegation[] | undefined)[] = []
        if (pstds.isV1201) {
            let r = await pstds.asV1201.getMany(addresses)
            for (let i = 0; i < addresses.length; i++) {
                topDelegations.push(r[i]?.delegations)
            }
        } else {
            throw new UnknownVersionError(pstds)
        }

        const psbds = new ParachainStakingBottomDelegationsStorage(ctx, block)
        assert(psbds.isExists)

        let bottomDelegations: (ParachainStaking.Delegation[] | undefined)[] = []
        if (psbds.isV1201) {
            let r = await psbds.asV1201.getMany(addresses)
            for (let i = 0; i < addresses.length; i++) {
                bottomDelegations.push(r[i]?.delegations)
            }
        } else {
            throw new UnknownVersionError(psbds)
        }

        const states: (ParachainStaking.CandidateState | undefined)[] = []
        for (let i = 0; i < addresses.length; i++) {
            if (bonds[i] == null) {
                states.push(undefined)
            } else {
                states.push({
                    bond: assertNotNull(bonds[i]),
                    topDelegations: assertNotNull(topDelegations[i]),
                    bottomDelegations: assertNotNull(bottomDelegations[i]),
                })
            }
        }

        return states
    },
}

/**
 * @deprecated use CandidateInfo
 */
export const CandidateState = {
    async getMany(
        ctx: ChainContext,
        block: Block,
        addresses: Uint8Array[]
    ): Promise<(ParachainStaking.CandidateState | undefined)[] | undefined> {
        const pscss = new ParachainStakingCandidateStateStorage(ctx, block)
        if (!pscss.isExists) return CollatorState2.getMany(ctx, block, addresses)

        let states: (ParachainStaking.CandidateState | undefined)[]
        if (pscss.isV1001) {
            states = await pscss.asV1001.getMany(addresses)
        } else {
            throw new UnknownVersionError(pscss)
        }

        return states
    },
}

/**
 * @deprecated use CandidateState
 */
export const CollatorState2 = {
    async getMany(
        ctx: ChainContext,
        block: Block,
        addresses: Uint8Array[]
    ): Promise<(ParachainStaking.CandidateState | undefined)[] | undefined> {
        const pscs2s = new ParachainStakingCollatorState2Storage(ctx, block)
        if (!pscs2s.isExists) return undefined

        let states: (ParachainStaking.CandidateState | undefined)[] = []
        if (pscs2s.isV900) {
            const r = await pscs2s.asV900.getMany(addresses)
            for (let state of r) {
                states.push(
                    state == null
                        ? undefined
                        : {
                              bond: state.bond,
                              topDelegations: state.topNominators,
                              bottomDelegations: state.bottomNominators,
                          }
                )
            }
        } else {
            throw new UnknownVersionError(pscs2s)
        }

        return states
    },
}
