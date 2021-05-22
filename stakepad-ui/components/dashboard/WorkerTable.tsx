import { StyledLink } from 'baseui/link'
import { Pagination } from 'baseui/pagination'
import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic'
import React, { ReactElement, useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import { Worker } from '../../libs/apis'
import { findWorkersByStash } from '../../libs/apis/workers'

const defaultPageSize = 10

interface FindWorkerFilters {
    // TODO: maybe should be put under @/libs/apis/
    commissionRateLessThan20: boolean
    mining: boolean
    stakePending: boolean
}

export const WorkerTable = ({ filters, stash }: {
    filters: FindWorkerFilters
    stash?: string
}): ReactElement => {
    const [currentPage, setCurrentPage] = useState(1)

    const { data, isFetched } = useQuery([
        'api', 'findWorkersByStash', filters, currentPage, defaultPageSize, stash
    ], async () => {
        return await findWorkersByStash(filters, currentPage, defaultPageSize, stash)
    })

    const totalPages = useMemo(() => Math.ceil((data?.total ?? 0) / defaultPageSize), [data])

    const workers = data?.workers ?? []

    return (
        <>
            <TableBuilder
                data={workers}
                emptyMessage="没有数据"
                isLoading={!isFetched}
                loadingMessage="读取中"
            >
                <TableBuilderColumn header="账户">
                    {(worker: Worker) => <StyledLink href={`workers/${worker.stash}`}>{worker.stash}</StyledLink>}
                </TableBuilderColumn>
                <TableBuilderColumn header="月收益">{(worker: Worker) => worker.monthlyPayout}</TableBuilderColumn>
                <TableBuilderColumn header="年化收益率">{(worker: Worker) => worker.annualizedReturnRate}</TableBuilderColumn>
                <TableBuilderColumn header="抵押额">{(worker: Worker) => worker.totalStake}</TableBuilderColumn>
                <TableBuilderColumn header="分润率">{(worker: Worker) => worker.commissionRate}</TableBuilderColumn>
                <TableBuilderColumn header="任务分">{(worker: Worker) => worker.taskScore}</TableBuilderColumn>
                <TableBuilderColumn header="机器分">{(worker: Worker) => worker.minerScore}</TableBuilderColumn>
                <TableBuilderColumn>
                    {(worker: Worker) => <StyledLink href={`workers/${worker.stash}`}>详情</StyledLink>}
                </TableBuilderColumn>
            </TableBuilder>

            <Pagination
                currentPage={currentPage}
                numPages={totalPages}
                onPageChange={({ nextPage }) => setCurrentPage(Math.min(Math.max(nextPage, 1), totalPages))}
            />
        </>
    )
}
