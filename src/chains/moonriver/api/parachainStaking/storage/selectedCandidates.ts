import {assertNotNull} from '@subsquid/substrate-processor'
import assert from 'assert'
import {UnknownVersionError} from '../../../../../utils/errors'
import {ParachainStakingSelectedCandidatesStorage} from '../../../types/storage'
import {Block, ChainContext} from '../../../types/support'
import {CandidateInfo} from './candidateState'

export const SelectedCandidates = {
    async get(ctx: ChainContext, block: Block): Promise<Uint8Array[] | undefined> {
        const psscs = new ParachainStakingSelectedCandidatesStorage(ctx, block)
        if (!psscs.isExists) return undefined

        if (psscs.isV49) {
            return await psscs.asV49.get()
        } else {
            throw new UnknownVersionError(psscs)
        }
    },
}
