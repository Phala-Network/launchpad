import { validateAddress } from '@polkadot/util-crypto'
import { useRouter } from 'next/router'
import React, { ReactElement, useMemo, useState } from 'react'
import { InjectedAccountSelect } from '../../../components/accounts/AccountSelect'
import { PositionTable } from '../../../components/stakes/PositionTable'
import { useApiPromise } from '../../../libs/polkadot'
import { useStakerPositionsQuery } from '../../../libs/queries/useStakeQuery'

const StakedPage = (): ReactElement => {
    const [address, setAddress] = useState<string>()

    const { api } = useApiPromise()
    const { data } = useStakerPositionsQuery(address, api)

    const miners = data === undefined ? undefined : Object.keys(data)

    const { query: { address: urlAddress } } = useRouter()
    const defaultAddress = useMemo(() => {
        try {
            return typeof urlAddress === 'string' && validateAddress(urlAddress) ? urlAddress : undefined
        } catch {
            console.error('[StakePage] Invalid address in URL param:', urlAddress)
            return undefined
        }
    }, [urlAddress])

    return (<>
        <InjectedAccountSelect defaultAddress={defaultAddress} onChange={setAddress} />

        {address !== undefined && <PositionTable miners={miners} staker={address} />}
    </>)
}

export default StakedPage
