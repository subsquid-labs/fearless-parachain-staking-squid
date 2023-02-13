import {UnknownVersionError} from '../../../../../utils/errors'
import {ParachainStakingSelectedCandidatesStorage} from '../../../types/storage'
import {Block, ChainContext} from '../../../types/support'

export const SelectedCandidates = {
    async get(ctx: ChainContext, block: Block): Promise<Uint8Array[] | undefined> {
        const psscs = new ParachainStakingSelectedCandidatesStorage(ctx, block)
        if (!psscs.isExists) return undefined

        if (psscs.isV900) {
            return await psscs.asV900.get()
        } else {
            throw new UnknownVersionError(psscs)
        }
    },
}
