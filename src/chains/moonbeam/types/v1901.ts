import type {Result, Option} from './support'

export type DelegatorAdded = DelegatorAdded_AddedToTop | DelegatorAdded_AddedToBottom

export interface DelegatorAdded_AddedToTop {
    __kind: 'AddedToTop'
    newTotal: bigint
}

export interface DelegatorAdded_AddedToBottom {
    __kind: 'AddedToBottom'
}
