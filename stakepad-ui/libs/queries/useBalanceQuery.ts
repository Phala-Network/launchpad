import { ApiPromise } from '@polkadot/api'
import { AccountId, BalanceOf } from '@polkadot/types/interfaces'
import { useQueries, useQuery, UseQueryOptions, UseQueryResult } from 'react-query'
import { v4 as uuidv4 } from 'uuid'
import { useApiPromise } from '../polkadot'

interface DepositQueryResult {
    accountId: AccountId
    wallet?: BalanceOf
}

const queryKey = uuidv4()

export function useDepositQuery(accountId?: AccountId): UseQueryResult<BalanceOf> {
    const { api } = useApiPromise()
    return useQuery(
        [queryKey, accountId, api],
        async () => accountId !== undefined ? (await api?.query.miningStaking.wallet(accountId))?.unwrapOrDefault() : undefined
    )
}

export function useDepositQueries(accounts: AccountId[], api?: ApiPromise): Array<UseQueryResult<DepositQueryResult>> {
    return useQueries(accounts.map<UseQueryOptions<DepositQueryResult>>(accountId => ({
        queryFn: async () => ({
            accountId,
            wallet: (await api?.query.miningStaking.wallet(accountId))?.unwrapOr(undefined)
        }),
        queryKey: [queryKey, accountId, api]
    })) as UseQueryOptions[]) as Array<UseQueryResult<DepositQueryResult>>
}
