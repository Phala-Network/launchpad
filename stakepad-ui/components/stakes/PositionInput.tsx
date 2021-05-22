import { Balance } from '@polkadot/types/interfaces'
import { Input } from 'baseui/input'
import { Decimal } from 'decimal.js'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import { useDecimalJsTokenDecimalMultiplier } from '../../libs/queries/useTokenDecimals'
import { bnToDecimal } from '../../libs/utils/balances'

const validFloat = /^\d+(\.(\d+)?)?$/

export const PositionInput = ({ current: balanceCurrent, disabled, onChange, pending, target }: {
    current?: Balance // on-chian stake position
    pending?: Decimal // on-chain pending stake/unstake
    target?: Decimal

    disabled?: boolean
    onChange: (newPosition?: Decimal) => void
}): ReactElement => {
    const tokenDecimals = useDecimalJsTokenDecimalMultiplier()

    const current = useMemo(() => {
        return balanceCurrent === undefined || tokenDecimals === undefined
            ? undefined
            : bnToDecimal(balanceCurrent, tokenDecimals)
    }, [balanceCurrent, tokenDecimals])

    const [error, setError] = useState<boolean>(false)
    const [value, setValue] = useState<string>('')

    const handleInputChange = useCallback((newValue: string): void => {
        setValue(newValue)

        if (newValue.length === 0) {
            setError(false)
            onChange(undefined)
        } else {
            const validation = validFloat.test(newValue)
            setError(!validation)
            onChange(validation ? new Decimal(newValue) : undefined)
        }
    }, [onChange])

    const placeholder = useMemo(() => {
        if (current !== undefined) {
            if (pending !== undefined) {
                const sign = pending.isPositive() ? '+' : ''
                return `${current.toString()} (${sign}${pending.toString()} pending)`
            } else {
                return `${current.toString()}`
            }
        } else {
            return 'Loading...'
        }
    }, [current, pending])

    useEffect(() => {
        if (target === undefined) {
            setValue('')
        }

        if (target?.isZero() === true) {
            setValue('0')
        }
    }, [target])

    return (
        <Input
            disabled={disabled === true}
            endEnhancer={'PHA'}
            error={error}
            placeholder={placeholder}
            onChange={e => handleInputChange(e.currentTarget.value)}
            value={value}
        />
    )
}
