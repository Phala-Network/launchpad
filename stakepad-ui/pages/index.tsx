import React, { useState } from 'react'
import { StakeInit } from '../components/dashboard/StakeInit'
import { WorkerTable } from '../components/dashboard/WorkerTable'
import { FindWorkerFilters } from '../libs/apis/workers'

const DashboardPage: React.FC = () => {
    const [filters, setFilters] = useState<FindWorkerFilters>({
        commissionRateLessThan20: true,
        mining: false,
        stakePending: false
    })
    const [stashFilter, setStashFilter] = useState<string | undefined>(undefined)

    return (
        <>
            {/* <GlobalTelemetry /> */}
            <StakeInit
                currentFilters={filters}
                onFilterChanged={setFilters}
                onStashChanged={stash => setStashFilter(typeof stash === 'string' && stash.length > 0 ? stash : undefined)}
            />
            <WorkerTable filters={filters} stash={stashFilter} />
        </>
    )
}

export default DashboardPage
