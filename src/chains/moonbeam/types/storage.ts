import assert from 'assert'
import {Block, BlockContext, Chain, ChainContext, Option, Result, StorageBase} from './support'
import * as v900 from './v900'
import * as v1001 from './v1001'
import * as v1201 from './v1201'
import * as v1502 from './v1502'

export class ParachainStakingBottomDelegationsStorage extends StorageBase {
    protected getPrefix() {
        return 'ParachainStaking'
    }

    protected getName() {
        return 'BottomDelegations'
    }

    /**
     *  Bottom delegations for collator candidate
     */
    get isV1201(): boolean {
        return this.getTypeHash() === 'e681b7cbb9992622456e4ee66d20daa7968a64b6a52ef599f5992850855cc3ee'
    }

    /**
     *  Bottom delegations for collator candidate
     */
    get asV1201(): ParachainStakingBottomDelegationsStorageV1201 {
        assert(this.isV1201)
        return this as any
    }
}

/**
 *  Bottom delegations for collator candidate
 */
export interface ParachainStakingBottomDelegationsStorageV1201 {
    get(key: Uint8Array): Promise<(v1201.Delegations | undefined)>
    getAll(): Promise<v1201.Delegations[]>
    getMany(keys: Uint8Array[]): Promise<(v1201.Delegations | undefined)[]>
    getKeys(): Promise<Uint8Array[]>
    getKeys(key: Uint8Array): Promise<Uint8Array[]>
    getKeysPaged(pageSize: number): AsyncIterable<Uint8Array[]>
    getKeysPaged(pageSize: number, key: Uint8Array): AsyncIterable<Uint8Array[]>
    getPairs(): Promise<[k: Uint8Array, v: v1201.Delegations][]>
    getPairs(key: Uint8Array): Promise<[k: Uint8Array, v: v1201.Delegations][]>
    getPairsPaged(pageSize: number): AsyncIterable<[k: Uint8Array, v: v1201.Delegations][]>
    getPairsPaged(pageSize: number, key: Uint8Array): AsyncIterable<[k: Uint8Array, v: v1201.Delegations][]>
}

export class ParachainStakingCandidateInfoStorage extends StorageBase {
    protected getPrefix() {
        return 'ParachainStaking'
    }

    protected getName() {
        return 'CandidateInfo'
    }

    /**
     *  Get collator candidate info associated with an account if account is candidate else None
     */
    get isV1201(): boolean {
        return this.getTypeHash() === '248231639cd86f1a3ffea0da2b9ed3fc64e1b7784d3759f68d733ac1ef08db19'
    }

    /**
     *  Get collator candidate info associated with an account if account is candidate else None
     */
    get asV1201(): ParachainStakingCandidateInfoStorageV1201 {
        assert(this.isV1201)
        return this as any
    }
}

/**
 *  Get collator candidate info associated with an account if account is candidate else None
 */
export interface ParachainStakingCandidateInfoStorageV1201 {
    get(key: Uint8Array): Promise<(v1201.CandidateMetadata | undefined)>
    getAll(): Promise<v1201.CandidateMetadata[]>
    getMany(keys: Uint8Array[]): Promise<(v1201.CandidateMetadata | undefined)[]>
    getKeys(): Promise<Uint8Array[]>
    getKeys(key: Uint8Array): Promise<Uint8Array[]>
    getKeysPaged(pageSize: number): AsyncIterable<Uint8Array[]>
    getKeysPaged(pageSize: number, key: Uint8Array): AsyncIterable<Uint8Array[]>
    getPairs(): Promise<[k: Uint8Array, v: v1201.CandidateMetadata][]>
    getPairs(key: Uint8Array): Promise<[k: Uint8Array, v: v1201.CandidateMetadata][]>
    getPairsPaged(pageSize: number): AsyncIterable<[k: Uint8Array, v: v1201.CandidateMetadata][]>
    getPairsPaged(pageSize: number, key: Uint8Array): AsyncIterable<[k: Uint8Array, v: v1201.CandidateMetadata][]>
}

export class ParachainStakingCandidateStateStorage extends StorageBase {
    protected getPrefix() {
        return 'ParachainStaking'
    }

    protected getName() {
        return 'CandidateState'
    }

    /**
     *  Get collator candidate state associated with an account if account is a candidate else None
     */
    get isV1001(): boolean {
        return this.getTypeHash() === '84ab01b9f5d971571bb4cd8288174dc552c917250ba2c5256263959a40438f09'
    }

    /**
     *  Get collator candidate state associated with an account if account is a candidate else None
     */
    get asV1001(): ParachainStakingCandidateStateStorageV1001 {
        assert(this.isV1001)
        return this as any
    }
}

/**
 *  Get collator candidate state associated with an account if account is a candidate else None
 */
export interface ParachainStakingCandidateStateStorageV1001 {
    get(key: Uint8Array): Promise<(v1001.CollatorCandidate | undefined)>
    getAll(): Promise<v1001.CollatorCandidate[]>
    getMany(keys: Uint8Array[]): Promise<(v1001.CollatorCandidate | undefined)[]>
    getKeys(): Promise<Uint8Array[]>
    getKeys(key: Uint8Array): Promise<Uint8Array[]>
    getKeysPaged(pageSize: number): AsyncIterable<Uint8Array[]>
    getKeysPaged(pageSize: number, key: Uint8Array): AsyncIterable<Uint8Array[]>
    getPairs(): Promise<[k: Uint8Array, v: v1001.CollatorCandidate][]>
    getPairs(key: Uint8Array): Promise<[k: Uint8Array, v: v1001.CollatorCandidate][]>
    getPairsPaged(pageSize: number): AsyncIterable<[k: Uint8Array, v: v1001.CollatorCandidate][]>
    getPairsPaged(pageSize: number, key: Uint8Array): AsyncIterable<[k: Uint8Array, v: v1001.CollatorCandidate][]>
}

export class ParachainStakingCollatorCommissionStorage extends StorageBase {
    protected getPrefix() {
        return 'ParachainStaking'
    }

    protected getName() {
        return 'CollatorCommission'
    }

    /**
     *  Commission percent taken off of rewards for all collators
     */
    get isV900(): boolean {
        return this.getTypeHash() === '81bbbe8e62451cbcc227306706c919527aa2538970bd6d67a9969dd52c257d02'
    }

    /**
     *  Commission percent taken off of rewards for all collators
     */
    get asV900(): ParachainStakingCollatorCommissionStorageV900 {
        assert(this.isV900)
        return this as any
    }
}

/**
 *  Commission percent taken off of rewards for all collators
 */
export interface ParachainStakingCollatorCommissionStorageV900 {
    get(): Promise<number>
}

export class ParachainStakingCollatorState2Storage extends StorageBase {
    protected getPrefix() {
        return 'ParachainStaking'
    }

    protected getName() {
        return 'CollatorState2'
    }

    /**
     *  Get collator state associated with an account if account is collating else None
     */
    get isV900(): boolean {
        return this.getTypeHash() === 'a4d9c3541b410bd0ebf9e6919cad26ad7aa3481dd09c1495650af46ea30787a9'
    }

    /**
     *  Get collator state associated with an account if account is collating else None
     */
    get asV900(): ParachainStakingCollatorState2StorageV900 {
        assert(this.isV900)
        return this as any
    }
}

/**
 *  Get collator state associated with an account if account is collating else None
 */
export interface ParachainStakingCollatorState2StorageV900 {
    get(key: Uint8Array): Promise<(v900.Collator2 | undefined)>
    getAll(): Promise<v900.Collator2[]>
    getMany(keys: Uint8Array[]): Promise<(v900.Collator2 | undefined)[]>
    getKeys(): Promise<Uint8Array[]>
    getKeys(key: Uint8Array): Promise<Uint8Array[]>
    getKeysPaged(pageSize: number): AsyncIterable<Uint8Array[]>
    getKeysPaged(pageSize: number, key: Uint8Array): AsyncIterable<Uint8Array[]>
    getPairs(): Promise<[k: Uint8Array, v: v900.Collator2][]>
    getPairs(key: Uint8Array): Promise<[k: Uint8Array, v: v900.Collator2][]>
    getPairsPaged(pageSize: number): AsyncIterable<[k: Uint8Array, v: v900.Collator2][]>
    getPairsPaged(pageSize: number, key: Uint8Array): AsyncIterable<[k: Uint8Array, v: v900.Collator2][]>
}

export class ParachainStakingDelegatorStateStorage extends StorageBase {
    protected getPrefix() {
        return 'ParachainStaking'
    }

    protected getName() {
        return 'DelegatorState'
    }

    /**
     *  Get delegator state associated with an account if account is delegating else None
     */
    get isV1001(): boolean {
        return this.getTypeHash() === '03dfb3b8e1ca16deb35d7040cc81f72b135e75c4caeea578cfc2294e1f1f41ad'
    }

    /**
     *  Get delegator state associated with an account if account is delegating else None
     */
    get asV1001(): ParachainStakingDelegatorStateStorageV1001 {
        assert(this.isV1001)
        return this as any
    }

    /**
     *  Get delegator state associated with an account if account is delegating else None
     */
    get isV1502(): boolean {
        return this.getTypeHash() === '637263cfee3190d24faafd4e41f925a782ec1a9b5d80de08bd6ae287d0f0a10a'
    }

    /**
     *  Get delegator state associated with an account if account is delegating else None
     */
    get asV1502(): ParachainStakingDelegatorStateStorageV1502 {
        assert(this.isV1502)
        return this as any
    }
}

/**
 *  Get delegator state associated with an account if account is delegating else None
 */
export interface ParachainStakingDelegatorStateStorageV1001 {
    get(key: Uint8Array): Promise<(v1001.Delegator | undefined)>
    getAll(): Promise<v1001.Delegator[]>
    getMany(keys: Uint8Array[]): Promise<(v1001.Delegator | undefined)[]>
    getKeys(): Promise<Uint8Array[]>
    getKeys(key: Uint8Array): Promise<Uint8Array[]>
    getKeysPaged(pageSize: number): AsyncIterable<Uint8Array[]>
    getKeysPaged(pageSize: number, key: Uint8Array): AsyncIterable<Uint8Array[]>
    getPairs(): Promise<[k: Uint8Array, v: v1001.Delegator][]>
    getPairs(key: Uint8Array): Promise<[k: Uint8Array, v: v1001.Delegator][]>
    getPairsPaged(pageSize: number): AsyncIterable<[k: Uint8Array, v: v1001.Delegator][]>
    getPairsPaged(pageSize: number, key: Uint8Array): AsyncIterable<[k: Uint8Array, v: v1001.Delegator][]>
}

/**
 *  Get delegator state associated with an account if account is delegating else None
 */
export interface ParachainStakingDelegatorStateStorageV1502 {
    get(key: Uint8Array): Promise<(v1502.Delegator | undefined)>
    getAll(): Promise<v1502.Delegator[]>
    getMany(keys: Uint8Array[]): Promise<(v1502.Delegator | undefined)[]>
    getKeys(): Promise<Uint8Array[]>
    getKeys(key: Uint8Array): Promise<Uint8Array[]>
    getKeysPaged(pageSize: number): AsyncIterable<Uint8Array[]>
    getKeysPaged(pageSize: number, key: Uint8Array): AsyncIterable<Uint8Array[]>
    getPairs(): Promise<[k: Uint8Array, v: v1502.Delegator][]>
    getPairs(key: Uint8Array): Promise<[k: Uint8Array, v: v1502.Delegator][]>
    getPairsPaged(pageSize: number): AsyncIterable<[k: Uint8Array, v: v1502.Delegator][]>
    getPairsPaged(pageSize: number, key: Uint8Array): AsyncIterable<[k: Uint8Array, v: v1502.Delegator][]>
}

export class ParachainStakingNominatorState2Storage extends StorageBase {
    protected getPrefix() {
        return 'ParachainStaking'
    }

    protected getName() {
        return 'NominatorState2'
    }

    /**
     *  Get nominator state associated with an account if account is nominating else None
     */
    get isV900(): boolean {
        return this.getTypeHash() === 'adc9b2765bcd5aa9c2ac9f93cd108b87d508a8d5494c318bf18ee6f4b599b8ed'
    }

    /**
     *  Get nominator state associated with an account if account is nominating else None
     */
    get asV900(): ParachainStakingNominatorState2StorageV900 {
        assert(this.isV900)
        return this as any
    }

    /**
     *  DEPRECATED in favor of DelegatorState
     *  Get nominator state associated with an account if account is nominating else None
     */
    get isV1001(): boolean {
        return this.getTypeHash() === 'c33bf4fdf125c8070ffd27253f9a811a9a2b244a0af652bf531999872325e904'
    }

    /**
     *  DEPRECATED in favor of DelegatorState
     *  Get nominator state associated with an account if account is nominating else None
     */
    get asV1001(): ParachainStakingNominatorState2StorageV1001 {
        assert(this.isV1001)
        return this as any
    }
}

/**
 *  Get nominator state associated with an account if account is nominating else None
 */
export interface ParachainStakingNominatorState2StorageV900 {
    get(key: Uint8Array): Promise<(v900.Nominator2 | undefined)>
    getAll(): Promise<v900.Nominator2[]>
    getMany(keys: Uint8Array[]): Promise<(v900.Nominator2 | undefined)[]>
    getKeys(): Promise<Uint8Array[]>
    getKeys(key: Uint8Array): Promise<Uint8Array[]>
    getKeysPaged(pageSize: number): AsyncIterable<Uint8Array[]>
    getKeysPaged(pageSize: number, key: Uint8Array): AsyncIterable<Uint8Array[]>
    getPairs(): Promise<[k: Uint8Array, v: v900.Nominator2][]>
    getPairs(key: Uint8Array): Promise<[k: Uint8Array, v: v900.Nominator2][]>
    getPairsPaged(pageSize: number): AsyncIterable<[k: Uint8Array, v: v900.Nominator2][]>
    getPairsPaged(pageSize: number, key: Uint8Array): AsyncIterable<[k: Uint8Array, v: v900.Nominator2][]>
}

/**
 *  DEPRECATED in favor of DelegatorState
 *  Get nominator state associated with an account if account is nominating else None
 */
export interface ParachainStakingNominatorState2StorageV1001 {
    get(key: Uint8Array): Promise<(v1001.Nominator2 | undefined)>
    getAll(): Promise<v1001.Nominator2[]>
    getMany(keys: Uint8Array[]): Promise<(v1001.Nominator2 | undefined)[]>
    getKeys(): Promise<Uint8Array[]>
    getKeys(key: Uint8Array): Promise<Uint8Array[]>
    getKeysPaged(pageSize: number): AsyncIterable<Uint8Array[]>
    getKeysPaged(pageSize: number, key: Uint8Array): AsyncIterable<Uint8Array[]>
    getPairs(): Promise<[k: Uint8Array, v: v1001.Nominator2][]>
    getPairs(key: Uint8Array): Promise<[k: Uint8Array, v: v1001.Nominator2][]>
    getPairsPaged(pageSize: number): AsyncIterable<[k: Uint8Array, v: v1001.Nominator2][]>
    getPairsPaged(pageSize: number, key: Uint8Array): AsyncIterable<[k: Uint8Array, v: v1001.Nominator2][]>
}

export class ParachainStakingRoundStorage extends StorageBase {
    protected getPrefix() {
        return 'ParachainStaking'
    }

    protected getName() {
        return 'Round'
    }

    /**
     *  Current round index and next round scheduled transition
     */
    get isV900(): boolean {
        return this.getTypeHash() === 'b5f3d49d6ba2e559d598977dc55516a649f67db6a4edb6de43b94edb90800928'
    }

    /**
     *  Current round index and next round scheduled transition
     */
    get asV900(): ParachainStakingRoundStorageV900 {
        assert(this.isV900)
        return this as any
    }
}

/**
 *  Current round index and next round scheduled transition
 */
export interface ParachainStakingRoundStorageV900 {
    get(): Promise<v900.RoundInfo>
}

export class ParachainStakingSelectedCandidatesStorage extends StorageBase {
    protected getPrefix() {
        return 'ParachainStaking'
    }

    protected getName() {
        return 'SelectedCandidates'
    }

    /**
     *  The collator candidates selected for the current round
     */
    get isV900(): boolean {
        return this.getTypeHash() === 'd14508def9da76532021b53d553e9048fd079e2e735d2393e6d531e6d1fd29ca'
    }

    /**
     *  The collator candidates selected for the current round
     */
    get asV900(): ParachainStakingSelectedCandidatesStorageV900 {
        assert(this.isV900)
        return this as any
    }
}

/**
 *  The collator candidates selected for the current round
 */
export interface ParachainStakingSelectedCandidatesStorageV900 {
    get(): Promise<Uint8Array[]>
}

export class ParachainStakingTopDelegationsStorage extends StorageBase {
    protected getPrefix() {
        return 'ParachainStaking'
    }

    protected getName() {
        return 'TopDelegations'
    }

    /**
     *  Top delegations for collator candidate
     */
    get isV1201(): boolean {
        return this.getTypeHash() === 'e681b7cbb9992622456e4ee66d20daa7968a64b6a52ef599f5992850855cc3ee'
    }

    /**
     *  Top delegations for collator candidate
     */
    get asV1201(): ParachainStakingTopDelegationsStorageV1201 {
        assert(this.isV1201)
        return this as any
    }
}

/**
 *  Top delegations for collator candidate
 */
export interface ParachainStakingTopDelegationsStorageV1201 {
    get(key: Uint8Array): Promise<(v1201.Delegations | undefined)>
    getAll(): Promise<v1201.Delegations[]>
    getMany(keys: Uint8Array[]): Promise<(v1201.Delegations | undefined)[]>
    getKeys(): Promise<Uint8Array[]>
    getKeys(key: Uint8Array): Promise<Uint8Array[]>
    getKeysPaged(pageSize: number): AsyncIterable<Uint8Array[]>
    getKeysPaged(pageSize: number, key: Uint8Array): AsyncIterable<Uint8Array[]>
    getPairs(): Promise<[k: Uint8Array, v: v1201.Delegations][]>
    getPairs(key: Uint8Array): Promise<[k: Uint8Array, v: v1201.Delegations][]>
    getPairsPaged(pageSize: number): AsyncIterable<[k: Uint8Array, v: v1201.Delegations][]>
    getPairsPaged(pageSize: number, key: Uint8Array): AsyncIterable<[k: Uint8Array, v: v1201.Delegations][]>
}
