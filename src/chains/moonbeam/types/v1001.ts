import type {Result, Option} from './support'

export type DelegatorAdded = DelegatorAdded_AddedToTop | DelegatorAdded_AddedToBottom

export interface DelegatorAdded_AddedToTop {
    __kind: 'AddedToTop'
    newTotal: bigint
}

export interface DelegatorAdded_AddedToBottom {
    __kind: 'AddedToBottom'
}

export interface CollatorCandidate {
    id: Uint8Array
    bond: bigint
    delegators: Uint8Array[]
    topDelegations: Bond[]
    bottomDelegations: Bond[]
    totalCounted: bigint
    totalBacking: bigint
    request: (CandidateBondLessRequest | undefined)
    state: CollatorStatus
}

export interface Delegator {
    id: Uint8Array
    delegations: Bond[]
    total: bigint
    requests: PendingDelegationRequests
    status: DelegatorStatus
}

export interface Nominator2 {
    delegations: Bond[]
    revocations: Uint8Array[]
    total: bigint
    scheduledRevocationsCount: number
    scheduledRevocationsTotal: bigint
    status: DelegatorStatus
}

export interface Bond {
    owner: Uint8Array
    amount: bigint
}

export interface CandidateBondLessRequest {
    amount: bigint
    whenExecutable: number
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

export interface PendingDelegationRequests {
    revocationsCount: number
    requests: [Uint8Array, DelegationRequest][]
    lessTotal: bigint
}

export type DelegatorStatus = DelegatorStatus_Active | DelegatorStatus_Leaving

export interface DelegatorStatus_Active {
    __kind: 'Active'
}

export interface DelegatorStatus_Leaving {
    __kind: 'Leaving'
    value: number
}

export interface DelegationRequest {
    collator: Uint8Array
    amount: bigint
    whenExecutable: number
    action: DelegationChange
}

export type DelegationChange = DelegationChange_Revoke | DelegationChange_Decrease

export interface DelegationChange_Revoke {
    __kind: 'Revoke'
}

export interface DelegationChange_Decrease {
    __kind: 'Decrease'
}
