import {assertNotNull} from '@subsquid/substrate-processor'
import assert from 'assert'
import {UnknownVersionError} from '../../../../../utils/errors'
import {ParachainStakingSelectedCandidatesStorage} from '../../../types/storage'
import {Block, ChainContext} from '../../../types/support'
import {CandidateInfo} from './candidateState'

export const SelectedCandidates = {
    async get(ctx: ChainContext, block: Block): Promise<ParachainStaking.Candidate[] | undefined> {
        const psscs = new ParachainStakingSelectedCandidatesStorage(ctx, block)
        if (!psscs.isExists) return undefined

        let candidateIds: Uint8Array[]
        if (psscs.isV49) {
            candidateIds = await psscs.asV49.get()
        } else {
            throw new UnknownVersionError(psscs)
        }

        let candidateStates = await CandidateInfo.getMany(ctx, block, candidateIds)
        assert(candidateStates != null)

        let candidates: ParachainStaking.Candidate[] = []
        for (let i = 0; i < candidateIds.length; i++) {
            let id = candidateIds[i]
            let state = assertNotNull(candidateStates[i])

            candidates.push({
                id,
                state,
            })
        }

        return candidates
    },
}
