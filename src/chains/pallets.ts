namespace ParachainStaking {
    export type Delegation = {
        owner: Uint8Array
        amount: bigint
    }

    export type CandidateState = {
        bond: bigint
        topDelegations: Delegation[]
        bottomDelegations: Delegation[]
    }

    export interface DelegatorState {
        total: bigint
        delegations: {
            owner: Uint8Array
            amount: bigint
        }[]
    }

    export type Round = {
        current: number
    }

    export type NewRound = {
        startingBlock: number
        round: number
        selectedCollatorsNumber: number
        totalBalance: bigint
    }

    export type CandidateBondedLess = {
        account: Uint8Array
        amount: bigint
        newTotal: bigint
    }

    export type CandidateBondedMore = {
        account: Uint8Array
        amount: bigint
        newTotal: bigint
    }

    export type DelegationIncreased = {
        account: Uint8Array
        amount: bigint
        candidate: Uint8Array
    }

    export type DelegationDecreased = {
        account: Uint8Array
        amount: bigint
        candidate: Uint8Array
    }

    export type Rewarded = {
        account: Uint8Array
        amount: bigint
    }
}
