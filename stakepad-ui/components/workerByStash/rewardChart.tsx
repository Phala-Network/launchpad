import { DatasetComponentOption, EChartsOption } from 'echarts'
import React, { useMemo } from 'react'
import { useQuery } from 'react-query'
import { GlobalRewardHistoryPoint, WorkerRewardHistoryPoint } from '../../libs/apis'
import { getRewardHistoryByStash } from '../../libs/apis/workers'
import { ChartWithDefaults } from './chart'
import styles from './chart.module.css'

const baseOptions: EChartsOption = {
    series: [
        {
            color: '#64EEAC',
            datasetId: 'global',
            dimensions: ['时间戳', '全局平均收益'],
            encode: {
                tooltip: [1],
                x: [0],
                y: [1]
            },
            name: '全局平均收益',
            smooth: true,
            type: 'line'
        }, {
            color: '#EB5757',
            datasetId: 'worker',
            dimensions: ['时间戳', '矿机奖励'],
            encode: {
                tooltip: [1],
                x: [0],
                y: [1]
            },
            name: '矿机收益',
            smooth: true,
            type: 'line'
        }, {
            color: '#D1FF52',
            datasetId: 'worker',
            dimensions: ['时间戳', '', '矿机惩罚'],
            encode: {
                tooltip: [2],
                x: [0],
                y: [2]
            },
            name: '矿机惩罚',
            smooth: true,
            type: 'line'
        }, {
            color: '#FFFFFF',
            datasetId: 'round',
            dimensions: ['时间戳', '轮数'],
            encode: {
                tooltip: [2],
                x: [0],
                y: []
            },
            name: '轮数',
            renderItem: () => ({ type: 'text' }),
            type: 'custom'
        }
    ]
}

export function RewardChart({ stash }: { stash: string }): JSX.Element {
    const { data: workerData } = useQuery<WorkerRewardHistoryPoint[]>(
        ['api', 'getRewardHistoryByStash', stash],
        async () => typeof stash === 'string' ? await getRewardHistoryByStash(stash) : []
    )

    // TODO: fetch global history
    const dataset = useMemo<DatasetComponentOption[]>(() => [
        {
            id: 'global',
            source: ([] as GlobalRewardHistoryPoint[]).map(point => [point.timestamp, point.reward])
        }, {
            id: 'worker',
            source: workerData?.map(point => [point.timestamp, point.reward, point.penalty]) ?? []
        }, {
            id: 'round',
            source: ([] as GlobalRewardHistoryPoint[]).map(point => [point.timestamp, point.round])
        }
    ], [workerData])

    return (
        <ChartWithDefaults className={styles.chart} dataset={dataset} options={baseOptions} />
    )
}
