import { AccountId, Balance } from '@polkadot/types/interfaces'
import { decodeAddress } from '@polkadot/util-crypto'
import { Button } from 'baseui/button'
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid'
import { KIND as NotificationKind, Notification } from 'baseui/notification'
import { StyledSpinnerNext } from 'baseui/spinner'
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import BN from 'bn.js'
import { Decimal } from 'decimal.js'
import React, { ReactElement, useCallback, useMemo, useState } from 'react'
import { stakeBatch } from '../../libs/extrinsics/stake'
import { useApiPromise } from '../../libs/polkadot'
import { ExtrinsicStatus } from '../../libs/polkadot/extrinsics'
import { useStakerPendingsQuery } from '../../libs/queries/usePendingStakeQuery'
import { useStakerPositionsQuery } from '../../libs/queries/useStakeQuery'
import { useStashInfoQuery } from '../../libs/queries/useStashInfoQuery'
import { useDecimalJsTokenDecimalMultiplier } from '../../libs/queries/useTokenDecimals'
import { bnToDecimal, decimalToBalance } from '../../libs/utils/balances'
import { isNonNullableTuple } from '../../libs/utils/isNonNullableTuple'
import { ExtrinsicStatusNotification } from '../extrinsics/ExtrinsicStatusNotification'
import { PositionInput } from './PositionInput'

const LoadingSpinner = (): ReactElement => <StyledSpinnerNext $as="span" />

const BNZero = new BN(0)
const DecimalZero = new Decimal(0)

const ClosingBalance = ({ closingBalance, floatingResult }: {
    closingBalance?: Decimal
    floatingResult?: Decimal
}): ReactElement => {
    return (<>
        {closingBalance !== undefined ? `${closingBalance.toString()} PHA` : <LoadingSpinner />}
        &nbsp;
        {floatingResult !== undefined && <>({floatingResult.isPositive() && '+'}{floatingResult.toString()})</>}
    </>)
}

const CommissionRateColumn = ({ address }: { address: string }): ReactElement => {
    const { data, isLoading } = useStashInfoQuery(decodeAddress(address) as AccountId)
    return (
        isLoading
            ? <LoadingSpinner />
            : data === undefined
                ? <>n/a</>
                : <>{data.payoutPrefs.commission}</>
    )
}

export const PositionTable = ({ miners, staker }: { miners?: string[], staker: string }): ReactElement => {
    const { api } = useApiPromise()
    const { data: currentPositions, refetch } = useStakerPositionsQuery(staker, api)
    const { data: currentPendings } = useStakerPendingsQuery(staker, api)
    const tokenDecimals = useDecimalJsTokenDecimalMultiplier()

    const [targetPositions, setTargetPositions] = useState<Record<string, Decimal | undefined>>({})

    const { adjustments, closingBalance, floatingResult } = useMemo(() => {
        if (currentPositions === undefined || currentPendings === undefined || tokenDecimals === undefined) {
            return {}
        }

        const currentBalance = Object.entries(currentPositions)
            .reduce((acc, [, balance]) => acc.add(balance), BNZero)

        const openingBalance = Object.entries(currentPendings)
            .reduce((acc, [, { balance }]) => acc.add(balance), bnToDecimal(currentBalance, tokenDecimals))

        const adjustments = Object.entries(targetPositions)
            .filter(isNonNullableTuple)
            .map(([miner, balance]): [string, Decimal] => {
                const current = bnToDecimal(currentPositions[miner] ?? BNZero, tokenDecimals)
                const pending = currentPendings[miner]?.balance ?? DecimalZero
                return [miner, balance?.sub(current).sub(pending)]
            })
            .filter(([, offset]) => !offset.isZero())

        const closingBalance = adjustments.reduce((acc, [, offset]) => acc.add(offset), openingBalance)

        const floatingResult = closingBalance.sub(openingBalance)

        return { adjustments, closingBalance, floatingResult, openingBalance }
    }, [currentPendings, currentPositions, targetPositions, tokenDecimals])

    const [extrinsicError, setExtrinsicError] = useState<string>()
    const [extrinsicStatus, setExtrinsicStatus] = useState<ExtrinsicStatus>()
    const inputDisabled = useMemo(() => {
        return extrinsicStatus !== undefined && extrinsicStatus !== 'finalized' && extrinsicStatus !== 'invalid'
    }, [extrinsicStatus])

    const handlePositionChange = useCallback((miner: string, newPosition?: Decimal): void => {
        const newTargetPositions = { ...targetPositions }
        newTargetPositions[miner] = newPosition
        setTargetPositions(newTargetPositions)
    }, [targetPositions])

    const handleSubmit = (): void => {
        if (adjustments === undefined || api === undefined || tokenDecimals === undefined) { return }

        setExtrinsicStatus(undefined)

        const batch = adjustments.map(([miner, offset]): [string, 'stake' | 'unstake', Balance] => {
            return [miner, offset.isPositive() ? 'stake' : 'unstake', decimalToBalance(offset.abs(), tokenDecimals, api)]
        })

        stakeBatch({
            api, batch, staker, statusCallback: (status) => setExtrinsicStatus(status)
        }).then(() => {
            setTargetPositions({})
            refetch({ cancelRefetch: true }).catch(() => { })
        }).catch(error => {
            setExtrinsicError((error as Error)?.message ?? error)
        })
    }

    const positionInputHeader = useMemo(() => {
        const zeroize = (): void => {
            setTargetPositions(Object.fromEntries(miners?.map(miner => [miner, DecimalZero]) ?? []))
        }

        return (<Button onClick={() => zeroize()} size="mini">Zeroize All</Button>)
    }, [miners])

    return (
        <>
            <TableBuilder
                data={miners ?? []}
                emptyMessage="No Data"
                isLoading={miners === undefined}
                loadingMessage="Loading"
            >
                <TableBuilderColumn header="Miner">
                    {miner => <>{miner}</>}
                </TableBuilderColumn>

                <TableBuilderColumn header="Commission">
                    {(miner: string) => <CommissionRateColumn address={miner} />}
                </TableBuilderColumn>

                <TableBuilderColumn header={positionInputHeader}>
                    {(miner: string) => (
                        <PositionInput
                            current={currentPositions?.[miner]}
                            disabled={inputDisabled}
                            onChange={newPosition => handlePositionChange(miner, newPosition)}
                            pending={currentPendings?.[miner]?.balance}
                            target={targetPositions[miner]}
                        />
                    )}
                </TableBuilderColumn>
            </TableBuilder>

            <FlexGrid flexDirection="row">
                <FlexGridItem>
                    <ClosingBalance closingBalance={closingBalance} floatingResult={floatingResult} />
                </FlexGridItem>
                <FlexGridItem alignSelf="flex-end">
                    <Button onClick={handleSubmit}>Submit</Button>
                    {typeof extrinsicError === 'string' && (
                        <Notification kind={NotificationKind.negative}>{extrinsicError}</Notification>
                    )}
                    <ExtrinsicStatusNotification status={extrinsicStatus} />
                </FlexGridItem>
            </FlexGrid>
        </>
    )
}
