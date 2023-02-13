import {UnknownVersionError} from '../../../../../utils/errors'
import {ParachainStakingDelegatorStateStorage, ParachainStakingNominatorState2Storage} from '../../../types/storage'
import {Block, ChainContext} from '../../../types/support'

export const DelegatorState = {
    async getMany(
        ctx: ChainContext,
        block: Block,
        addresses: Uint8Array[]
    ): Promise<(ParachainStaking.DelegatorState | undefined)[] | undefined> {
        const pscss = new ParachainStakingDelegatorStateStorage(ctx, block)
        if (!pscss.isExists) return NominatorState2.getMany(ctx, block, addresses)

        let states: (ParachainStaking.DelegatorState | undefined)[]
        if (pscss.isV1001) {
            states = await pscss.asV1001.getMany(addresses)
        } else if (pscss.isV1502) {
            states = await pscss.asV1502.getMany(addresses)
        } else {
            throw new UnknownVersionError(pscss)
        }

        return states
    },
}

/**
 * @deprecated use DelegatorState
 */
export const NominatorState2 = {
    async getMany(
        ctx: ChainContext,
        block: Block,
        addresses: Uint8Array[]
    ): Promise<(ParachainStaking.DelegatorState | undefined)[] | undefined> {
        const pscs2s = new ParachainStakingNominatorState2Storage(ctx, block)
        if (!pscs2s.isExists) return undefined

        let states: (ParachainStaking.DelegatorState | undefined)[] = []
        if (pscs2s.isV900) {
            let r = await pscs2s.asV900.getMany(addresses)
            for (let state of r) {
                states.push(
                    state == null
                        ? undefined
                        : {
                              total: state.total,
                              delegations: state.nominations,
                          }
                )
            }
        } else if (pscs2s.isV1001) {
            let r = await pscs2s.asV1001.getMany(addresses)
            for (let state of r) {
                states.push(state)
            }
        } else {
            throw new UnknownVersionError(pscs2s)
        }

        return states
    },
}
