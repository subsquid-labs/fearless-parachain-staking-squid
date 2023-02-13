import assert from 'assert'
import {Block, Chain, ChainContext, BlockContext, Result, Option} from './support'

export class ParachainStakingRewardPaymentDelayConstant {
    private readonly _chain: Chain

    constructor(ctx: ChainContext) {
        this._chain = ctx._chain
    }

    /**
     *  Number of rounds after which block authors are rewarded
     */
    get isV900() {
        return this._chain.getConstantTypeHash('ParachainStaking', 'RewardPaymentDelay') === 'b76f37d33f64f2d9b3234e29034ab4a73ee9da01a61ab139c27f8c841971e469'
    }

    /**
     *  Number of rounds after which block authors are rewarded
     */
    get asV900(): number {
        assert(this.isV900)
        return this._chain.getConstant('ParachainStaking', 'RewardPaymentDelay')
    }

    /**
     * Checks whether the constant is defined for the current chain version.
     */
    get isExists(): boolean {
        return this._chain.getConstantTypeHash('ParachainStaking', 'RewardPaymentDelay') != null
    }
}
