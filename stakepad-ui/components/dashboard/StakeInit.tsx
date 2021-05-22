import { BlockProps } from 'baseui/block'
import { Button } from 'baseui/button'
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid'
import React from 'react'
import { FindWorkerFilters } from '../../libs/apis/workers'
import { FindFilterSwitches } from './ManualStake/FindFilterSwitches'
import { SearchByStashInput } from './ManualStake/SearchByStashInput'
import { RecommendationStakeInit } from './RecommendationInitInput'

const itemProps: BlockProps = {
    display: 'flex',
    overrides: {
        Block: { style: () => ({ flexGrow: 1 }) }
    }
}

const narrowItemProps = (width?: string): BlockProps => ({
    ...itemProps,
    overrides: {
        Block: { style: () => ({ flexGrow: 0, width }) }
    }
})

export const StakeInit = ({ currentFilters, onFilterChanged, onStashChanged }: {
    currentFilters: FindWorkerFilters
    onFilterChanged: (filters: FindWorkerFilters) => void
    onStashChanged: (stash: string) => void
}): JSX.Element => {
    return (
        <FlexGrid flexGridColumnCount={4} flexGridColumnGap="scale200">
            <FlexGridItem {...itemProps}>
                <SearchByStashInput onStashChanged={onStashChanged} />
            </FlexGridItem>

            <FlexGridItem {...narrowItemProps(undefined)}>
                <FindFilterSwitches currentFilters={currentFilters} onFilterChanged={onFilterChanged} />
            </FlexGridItem>

            <FlexGridItem {...narrowItemProps(undefined)}>
                <Button>自选抵押</Button>
            </FlexGridItem>

            <FlexGridItem {...narrowItemProps('20em')}>
                <RecommendationStakeInit />
            </FlexGridItem>
        </FlexGrid >
    )
}
