import { FormControl } from 'baseui/form-control'
import { Option as SelectOption, Select } from 'baseui/select'
import { ReactElement, ReactNode, useEffect, useMemo, useState } from 'react'
import { useWeb3 } from '../../libs/polkadot'

export const InjectedAccountSelect = ({ caption: customCaption, defaultAddress, error: customError, label, onChange }: {
    caption?: ReactNode
    defaultAddress?: string
    error?: boolean // set to undefined to let the component verify against injected accounts
    label?: ReactNode
    onChange: (account?: string) => void
}): ReactElement => {
    const { accounts, readystate } = useWeb3()
    const addresses = useMemo(() => accounts?.map(account => account.address) ?? [], [accounts])
    const options = useMemo(() => addresses.map<SelectOption>(accountId => ({
        id: accountId,
        label: accountId
    })), [addresses])

    const [selectValue, setSelectValue] = useState<readonly SelectOption[]>([])

    const { caption, error } = useMemo(() => {
        const hasSelected = selectValue.length > 0
        return {
            caption: typeof customCaption !== 'undefined'
                // use if custom caption is provided
                ? customCaption
                // or prompt for required input
                : (hasSelected ? '选择一个账户' : undefined),
            error: typeof customError === 'boolean' ? customError : !hasSelected
        }
    }, [selectValue, customCaption, customError])

    useEffect(() => {
        if (typeof defaultAddress === 'string') {
            setSelectValue([...options.filter(option => option.id === defaultAddress) as readonly SelectOption[]])
        }
    }, [defaultAddress, options])

    useEffect(() => onChange(selectValue[0]?.id?.toString()), [onChange, selectValue])

    return (
        <FormControl caption={caption} label={label}>
            <Select
                error={error}
                isLoading={readystate !== 'ready'}
                onChange={({ value }) => setSelectValue(value)}
                options={options}
                value={selectValue}
            />
        </FormControl>
    )
}
