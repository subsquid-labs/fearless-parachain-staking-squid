import {Staker} from '../model'

export function createStaker(id: string) {
    return new Staker({
        id,
        stashId: id,
        activeBond: 0n,
        totalReward: 0n,
    })
}
