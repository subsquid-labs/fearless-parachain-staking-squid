import {UnknownVersionError} from '../../../../utils/errors'
import {ParachainStakingRewardPaymentDelayConstant} from '../../types/constants'
import {ChainContext} from '../../types/support'

export const RewardPaymentDelay = {
    get(ctx: ChainContext): number {
        const c = new ParachainStakingRewardPaymentDelayConstant(ctx)
        if (!c.isExists) return 2

        if (c.isV900) {
            return c.asV900
        } else {
            throw new UnknownVersionError(c)
        }
    },
}