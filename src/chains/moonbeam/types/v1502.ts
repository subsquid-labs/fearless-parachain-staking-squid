import type {Result, Option} from './support'

export interface Delegator {
    id: Uint8Array
    delegations: Bond[]
    total: bigint
    lessTotal: bigint
    status: DelegatorStatus
}

export interface Bond {
    owner: Uint8Array
    amount: bigint
}

export type DelegatorStatus = DelegatorStatus_Active | DelegatorStatus_Leaving

export interface DelegatorStatus_Active {
    __kind: 'Active'
}

export interface DelegatorStatus_Leaving {
    __kind: 'Leaving'
    value: number
}
