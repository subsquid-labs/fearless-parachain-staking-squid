import type {Result, Option} from './support'

export interface Nominator2 {
    nominations: Bond[]
    revocations: Uint8Array[]
    total: bigint
    scheduledRevocationsCount: number
    scheduledRevocationsTotal: bigint
    status: NominatorStatus
}

export interface Bond {
    owner: Uint8Array
    amount: bigint
}

export type NominatorStatus = NominatorStatus_Active | NominatorStatus_Leaving

export interface NominatorStatus_Active {
    __kind: 'Active'
}

export interface NominatorStatus_Leaving {
    __kind: 'Leaving'
    value: number
}
