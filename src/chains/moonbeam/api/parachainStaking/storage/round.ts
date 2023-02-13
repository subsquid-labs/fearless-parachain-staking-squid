import {UnknownVersionError} from '../../../../../utils/errors'
import {ParachainStakingCollatorCommissionStorage, ParachainStakingRoundStorage} from '../../../types/storage'
import {ChainContext, Block} from '../../../types/support'

export const Round = {
    async get(ctx: ChainContext, block: Block): Promise<ParachainStaking.Round | undefined> {
        const psrs = new ParachainStakingRoundStorage(ctx, block)
        if (!psrs.isExists) return undefined

        if (psrs.isV900) {
            return await psrs.asV900.get()
        } else {
            throw new UnknownVersionError(psrs)
        }
    },
}

export const CollatorComission = {
    async get(ctx: ChainContext, block: Block): Promise<number | undefined> {
        const psrs = new ParachainStakingCollatorCommissionStorage(ctx, block)
        if (!psrs.isExists) return undefined

        if (psrs.isV900) {
            return await psrs.asV900.get()
        } else {
            throw new UnknownVersionError(psrs)
        }
    },
}
