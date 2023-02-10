import type {Result, Option} from './support'

export type NominatorAdded = NominatorAdded_AddedToBottom | NominatorAdded_AddedToTop

export interface NominatorAdded_AddedToBottom {
    __kind: 'AddedToBottom'
}

export interface NominatorAdded_AddedToTop {
    __kind: 'AddedToTop'
    value: bigint
}

export interface Collator2 {
    id: Uint8Array
    bond: bigint
    nominators: Uint8Array[]
    topNominators: Bond[]
    bottomNominators: Bond[]
    totalCounted: bigint
    totalBacking: bigint
    state: CollatorStatus
}

export interface Bond {
    owner: Uint8Array
    amount: bigint
}

export type CollatorStatus = CollatorStatus_Active | CollatorStatus_Idle | CollatorStatus_Leaving

export interface CollatorStatus_Active {
    __kind: 'Active'
}

export interface CollatorStatus_Idle {
    __kind: 'Idle'
}

export interface CollatorStatus_Leaving {
    __kind: 'Leaving'
    value: number
}
