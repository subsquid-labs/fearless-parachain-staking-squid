import type {Result, Option} from './support'

export interface Collator {
    id: Uint8Array
    bond: bigint
    nominators: Bond[]
    total: bigint
    state: CollatorStatus
}

export interface Nominator {
    nominations: Bond[]
    total: bigint
}

export interface RoundInfo {
    current: number
    first: number
    length: number
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
