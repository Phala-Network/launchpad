import { ApiPromise } from '@polkadot/api'
import { Decimal } from 'decimal.js'
import { useMemo } from 'react'
import { useApiPromise } from '../polkadot'

function getTokenDecimals(api?: ApiPromise): number | undefined {
    const tokenDecimals = api?.registry.getChainProperties()?.tokenDecimals.toJSON() as (number[] | undefined)
    return tokenDecimals?.[0]
}

export const useTokenDecimals = (): number | undefined => {
    const { api } = useApiPromise()
    return useMemo(() => getTokenDecimals(api), [api])
}

export const useDecimalJsTokenDecimalMultiplier = (): Decimal | undefined => {
    const decimals = useTokenDecimals()
    return decimals !== undefined ? new Decimal(10).pow(decimals) : undefined
}
