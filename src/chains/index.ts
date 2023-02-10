import {assertNotNull} from '@subsquid/substrate-processor'
import * as moonriver from './moonriver'
// import * as moonbeam from './moonbeam'

type Chain = typeof moonriver

function getChain(): Chain {
    let chainName = assertNotNull(process.env.CHAIN, 'Missing env variable CHAIN')
    return require(`./${chainName}`)
}

export let chain = getChain()
