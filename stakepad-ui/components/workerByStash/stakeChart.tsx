import { DatasetComponentOption, EChartsOption } from 'echarts'
import React, { useMemo } from 'react'
import { useQuery } from 'react-query'
import { GlobalStakeHistoryPoint, WorkerStakeHistoryPoint } from '../../libs/apis'
import { getStakeHistoryByStash } from '../../libs/apis/workers'
import { ChartWithDefaults } from './chart'
import styles from './chart.module.css'

const baseOptions: EChartsOption = {
    series: [
        {
            color: '#64EEAC',
            datasetId: 'global',
            dimensions: ['时间戳', '全局平均总抵押量'],
            encode: {
                x: [0],
                y: [1],
                tooltip: [1]
            },
            name: '全局平均总抵押量',
            smooth: 0.5,
            type: 'line'
        },
        {
            color: '#EB5757',
            datasetId: 'worker',
            dimensions: ['时间戳', '矿机总抵押量'],
            encode: {
                x: [0],
                y: [1],
                tooltip: [1]
            },
            name: '矿机总抵押量',
            smooth: 0.5,
            type: 'line'
        },
        {
            color: '#D1FF52',
            datasetId: 'worker',
            dimensions: ['时间戳', '', '矿机自带抵押量'],
            encode: {
                x: [0],
                y: [2],
                tooltip: [2]
            },
            name: '矿机自带抵押量',
            smooth: 0.5,
            type: 'line'
        },
        {
            color: '#FFFFFF',
            datasetId: 'global',
            dimensions: ['时间戳', '', '轮数'],
            encode: {
                x: [0],
                y: [],
                tooltip: [2]
            },
            name: '轮数',
            renderItem: () => ({ type: 'text' }),
            type: 'custom'
        }
    ]
}

export function StakeChart({ stash }: { stash: string }): JSX.Element {
    const { data } = useQuery<WorkerStakeHistoryPoint[]>(
        ['api', 'getStakeHistoryByStash', stash],
        async () => await getStakeHistoryByStash(stash)
    )

    // TODO: fetch global history
    const dataset = useMemo<DatasetComponentOption[]>(() => [
        {
            source: ([] as GlobalStakeHistoryPoint[]).map((point) => [point.timestamp, point.stake, point.round]),
            id: 'global'
        },
        {
            source: data?.map((point) => [point.timestamp, point.totalStake, point.ownerStake]) ?? [],
            id: 'worker'
        }
    ], [data])

    return (<ChartWithDefaults className={styles.chart} dataset={dataset} options={baseOptions} />)
}
