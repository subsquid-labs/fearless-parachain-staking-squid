import {toHex, decodeHex} from '@subsquid/substrate-processor'

export * as ParachainStaking from './parachainStaking'

export function encodeAddress(address: Uint8Array) {
    return toHex(address)
}

export function decodeAddress(address: string) {
    return Uint8Array.from(decodeHex(address))
}
