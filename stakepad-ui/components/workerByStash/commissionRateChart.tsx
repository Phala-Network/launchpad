import { EChartsOption } from 'echarts'
import { useMemo } from 'react'
import { useQuery } from 'react-query'
import { getCommissionRateHistoryByStash } from '../../libs/apis/workers'
import { ChartWithDefaults } from './chart'
import styles from './chart.module.css'

const baseOptions: EChartsOption = {
    series: [
        {
            color: '#D1FF52',
            datasetId: 'commissionRate',
            dimensions: ['时间戳', '分润率'],
            encode: {
                tooltip: [1],
                x: [0],
                y: [1]
            },
            name: '分润率',
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
    ],

    yAxis: [{
        axisLabel: {
            formatter: '{value}%'
        },
        scale: true,
        splitLine: {
            lineStyle: {
                opacity: 0.25
            }
        },
        type: 'value'
    }]
}

export function CommissionRateChart({ stash }: { stash: string }): JSX.Element {
    const { data } = useQuery(
        ['api', 'getCommissionRateHistoryByStash', stash],
        async () => await getCommissionRateHistoryByStash(stash)
    )

    const dataset = useMemo(() => [
        {
            id: 'commissionRate',
            source: data?.map(point => [point.timestamp, point.value * 100]) ?? []
        },
        {
            id: 'round',
            source: data?.map(point => [point.timestamp, point.round]) ?? []
        }
    ], [data])

    return (
        <ChartWithDefaults className={styles.chart} dataset={dataset} options={baseOptions} />
    )
}
