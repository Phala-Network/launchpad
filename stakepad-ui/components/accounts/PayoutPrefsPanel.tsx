import { decodeAddress, encodeAddress } from '@polkadot/keyring'
import { AccountId } from '@polkadot/types/interfaces'
import { Button } from 'baseui/button'
import { FormControl } from 'baseui/form-control'
import { Alert as AlertIcon, Check as CheckIcon } from 'baseui/icon'
import { Input } from 'baseui/input'
import { KIND as NotificationKind, Notification } from 'baseui/notification'
import { Radio, RadioGroup } from 'baseui/radio'
import React, { ReactElement, useEffect, useMemo, useState } from 'react'
import { setPayoutPrefs } from '../../libs/extrinsics/payoutPrefs'
import { useApiPromise } from '../../libs/polkadot'
import { ExtrinsicStatus } from '../../libs/polkadot/extrinsics'
import { useStashInfoQuery } from '../../libs/queries/useStashInfoQuery'
import { ExtrinsicStatusNotification } from '../extrinsics/ExtrinsicStatusNotification'
import { ValidatedAccountInput } from './AccountInput'
import { InjectedAccountSelect } from './AccountSelect'

export const PayoutPrefsPanel = ({ defaultAddress }: { defaultAddress?: string }): ReactElement => {
    const { api } = useApiPromise()

    const [account, setAccount] = useState<string | undefined>(defaultAddress) // selected stash account

    /* current on-chain states */

    const accountId = useMemo(() => account === undefined ? undefined : decodeAddress(account) as AccountId, [account])
    const { data: stashInfo } = useStashInfoQuery(accountId, api)
    const currentPayoutTarget = useMemo(() => stashInfo === undefined ? undefined : encodeAddress(stashInfo.payoutPrefs.target), [stashInfo])

    /* target on-chain states */

    const [mode, setMode] = useState<'keep' | 'stash' | 'select' | 'input'>('keep')

    const [newPayoutTarget, setNewPayoutTarget] = useState<string>()
    const [newCommissionRate, setNewCommissionRate] = useState<number>()

    /* current component states */

    const [extrinsicStatus, setExtrinsicStatus] = useState<ExtrinsicStatus | undefined>()
    const extrinsicStatusNotification = useMemo(() => <ExtrinsicStatusNotification status={extrinsicStatus} />, [extrinsicStatus])

    const [lastError, setLastError] = useState<string | undefined>()
    const lastErrorNotification = useMemo(() => {
        return lastError === undefined ? <></> : <Notification kind={NotificationKind.negative}><AlertIcon />{lastError}</Notification>
    }, [lastError])

    /* handlers */

    useEffect(() => {
        /* update target payout target */

        if (mode === 'keep') {
            setNewPayoutTarget(currentPayoutTarget === undefined ? undefined : currentPayoutTarget)
        }

        if (mode === 'stash') {
            setNewPayoutTarget(account)
        }

        // NOTE: 'select' and 'input' will update target state on their owns
    }, [account, currentPayoutTarget, mode, stashInfo])

    useEffect(() => {
        if (stashInfo !== undefined && newCommissionRate === undefined) {
            setNewCommissionRate(stashInfo.payoutPrefs.commission.toNumber())
        }
    }, [newCommissionRate, stashInfo])

    const handleCommissionRateChange = (value: string): void => {
        const parsedValue = parseInt(value)
        setNewCommissionRate((parsedValue >= 0 && parsedValue <= 100) ? parsedValue : 0)
    }

    const handleModeChange = (value: string): void => { setMode(value as any) }

    const handleSubmit = (): void => {
        if (account === undefined || api === undefined || newCommissionRate === undefined || newPayoutTarget === undefined) {
            return
        }

        setPayoutPrefs({
            account,
            api,
            commissionRate: newCommissionRate,
            statusCallback: (status: ExtrinsicStatus) => setExtrinsicStatus(status),
            target: decodeAddress(newPayoutTarget) as AccountId
        }).catch(error => {
            setExtrinsicStatus('invalid')
            setLastError((error as Error)?.message ?? error)
        })
    }

    return (
        <>
            <InjectedAccountSelect
                defaultAddress={defaultAddress}
                label="Stash Account"
                onChange={account => setAccount(account)}
            />

            <FormControl label="收益地址">
                <RadioGroup onChange={e => handleModeChange(e.target.value)} value={mode}>
                    <Radio
                        description={account === undefined ? undefined : currentPayoutTarget ?? 'Loading...'}
                        value="keep"
                    >保持不变</Radio>
                    <Radio description={account} value="stash">使用 Stash 账户</Radio>
                    <Radio value="select">选择一个已添加的账户</Radio>
                    <Radio value="input">使用一个指定的地址</Radio>
                </RadioGroup>
            </FormControl>

            {mode === 'select' && (
                <InjectedAccountSelect
                    defaultAddress={account}
                    error={newPayoutTarget === undefined}
                    onChange={account => setNewPayoutTarget(account)}
                />
            )}

            {mode === 'input' && (
                <ValidatedAccountInput
                    disabled={extrinsicStatus !== undefined}
                    onChange={account => setNewPayoutTarget(account)}
                />
            )}

            <FormControl label="分润率">
                <Input
                    disabled={extrinsicStatus !== undefined}
                    error={newCommissionRate === undefined}
                    onChange={e => handleCommissionRateChange(e.currentTarget.value)}
                    value={newCommissionRate}
                />
            </FormControl>

            <Button
                disabled={account === undefined || api === undefined || extrinsicStatus !== undefined || newCommissionRate === undefined || newPayoutTarget === undefined}
                onClick={handleSubmit}
                startEnhancer={<CheckIcon />}
            >Submit</Button>

            {extrinsicStatusNotification}
            {lastErrorNotification}
        </>
    )
}
