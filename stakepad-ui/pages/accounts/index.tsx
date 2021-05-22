import { decodeAddress, encodeAddress } from '@polkadot/keyring'
import { AccountId } from '@polkadot/types/interfaces'
import { Button, KIND as ButtonKind, SIZE as ButtonSize } from 'baseui/button'
import { Overflow as OverflowIcon } from 'baseui/icon'
import { ItemT, StatefulMenu } from 'baseui/menu'
import { StatefulPopover } from 'baseui/popover'
import { SIZE as SpinnerSize, StyledSpinnerNext } from 'baseui/spinner'
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import { useRouter } from 'next/router'
import React, { PropsWithChildren, ReactElement, useMemo } from 'react'
import { useApiPromise, useWeb3 } from '../../libs/polkadot'
import { useAccountQuery } from '../../libs/queries/useAccountQuery'
import { useDepositQuery } from '../../libs/queries/useBalanceQuery'
import { useStashInfoQuery } from '../../libs/queries/useStashInfoQuery'

const LoadingSpinner = (): ReactElement => <StyledSpinnerNext $size={SpinnerSize.small} />

const LoadingColumn = ({ children }: PropsWithChildren<{}>): ReactElement => {
    if (children === undefined) {
        return (<LoadingSpinner />)
    }

    if (children === null) {
        return (<>n/a</>)
    }

    return <>{children}</>
}

const PayoutAddressColumn = ({ accountId }: { accountId: AccountId }): ReactElement => {
    const { api } = useApiPromise()
    const { data } = useStashInfoQuery(accountId, api)
    const target = data?.payoutPrefs.target
    if (target !== undefined) {
        return (<LoadingColumn>{encodeAddress(target)}</LoadingColumn>)
    } else {
        return (<LoadingColumn />)
    }
}

const AccountBalanceColumn = ({ accountId }: { accountId: AccountId }): ReactElement => {
    const { data: account } = useAccountQuery(accountId)
    return (<LoadingColumn>{account?.data.free.toHuman()}</LoadingColumn>)
}

const DepositBalanceColumn = ({ accountId }: { accountId: AccountId }): ReactElement => {
    const { data } = useDepositQuery(accountId)
    return (<LoadingColumn>{data?.toHuman()}</LoadingColumn>)
}

interface OperationItemMenuItem {
    action: () => void
    label: string
}

const OperationMenu = ({ address }: { address: string }): ReactElement => {
    const { push } = useRouter()

    const items: ItemT[] = [{
        action: () => { push(`/debug/panels/deposit?address=${address}`).catch(() => { }) },
        label: '储值'
    }, {
        action: () => { push(`/debug/panels/withdraw?address=${address}`).catch(() => { }) },
        label: '提取'
    }, {
        action: () => { push(`/debug/panels/payoutPrefs?address=${address}`).catch(() => { }) },
        label: '收益偏好'
    }, {
        action: () => { push(`/accounts/${address}/stakes`).catch(() => { }) },
        label: '抵押列表'
    }]

    const handleItemSelect = (item: OperationItemMenuItem, close: () => void): void => {
        item.action()
        close()
    }

    return (
        <StatefulPopover content={({ close }) => (
            <StatefulMenu items={items} onItemSelect={({ item }) => handleItemSelect(item as unknown as OperationItemMenuItem, close)} />
        )} placement="auto" >
            <Button kind={ButtonKind.minimal} size={ButtonSize.mini} startEnhancer={<OverflowIcon />} />
        </StatefulPopover >
    )
}

const Accounts = (): ReactElement => {
    const { accounts, readystate: web3Readystate } = useWeb3()

    const accountIds = useMemo(() => accounts?.map(account => decodeAddress(account.address)) ?? [], [accounts])

    return (
        <>
            <TableBuilder
                data={accountIds}
                emptyMessage="没有账号"
                isLoading={web3Readystate !== 'ready'}
                loadingMessage="正在等待 polkadot{.js} 浏览器扩展"
            >
                <TableBuilderColumn header="账户">
                    {(accountId: AccountId) => encodeAddress(accountId)}
                </TableBuilderColumn>

                <TableBuilderColumn header="收益地址">
                    {(accountId: AccountId) => <PayoutAddressColumn accountId={accountId} />}
                </TableBuilderColumn>

                <TableBuilderColumn header="账户钱包余额">
                    {(accountId: AccountId) => <AccountBalanceColumn accountId={accountId} />}
                </TableBuilderColumn>

                <TableBuilderColumn header="挖矿储值余额">
                    {(accountId: AccountId) => <DepositBalanceColumn accountId={accountId} />}
                </TableBuilderColumn>

                <TableBuilderColumn header="抵押总额">
                    {() => <LoadingSpinner />}
                </TableBuilderColumn>

                <TableBuilderColumn header="抵押机器数量">
                    {() => <LoadingSpinner />}
                </TableBuilderColumn>

                <TableBuilderColumn>
                    {(accountId: AccountId) => <OperationMenu address={encodeAddress(accountId)} />}
                </TableBuilderColumn>
            </TableBuilder>
        </>
    )
}

export default Accounts
