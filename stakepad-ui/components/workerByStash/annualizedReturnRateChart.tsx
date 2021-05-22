import { DatasetComponentOption, EChartsOption } from 'echarts'
import React, { useMemo } from 'react'
import { useQuery } from 'react-query'
import { getAnnualizedReturnRateHistoryByStash } from '../../libs/apis/workers'
import { ChartWithDefaults } from './chart'
import styles from './chart.module.css'

const baseOptions: EChartsOption = {
    series: [{
        color: '#D1FF52',
        datasetId: 'annualizedReturnRate',
        dimensions: ['时间戳', '年化', ''],
        encode: {
            x: [0],
            y: [1],
            tooltip: [1]
        },
        name: '年化',
        smooth: 0.5,
        type: 'line'
    }, {
        color: '#FFFFFF',
        datasetId: 'annualizedReturnRate',
        dimensions: ['时间戳', '', '轮数'],
        encode: {
            x: [0],
            y: [],
            tooltip: [2]
        },
        name: '轮数',
        renderItem: () => ({ type: 'text' }),
        type: 'custom'
    }],

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

export function AnnualizedReturnRateChart({ stash }: { stash: string }): JSX.Element {
    const { data } = useQuery(
        ['api', 'getAnnualizedReturnRateHistoryByStash', stash],
        async () => await getAnnualizedReturnRateHistoryByStash(stash)
    )

    const dataset = useMemo<DatasetComponentOption[]>(() => [
        {
            source: data?.map(point => [point.timestamp, point.value * 100, point.round]) ?? [],
            id: 'annualizedReturnRate'
        }
    ], [data])

    return (
        <ChartWithDefaults className={styles.chart} dataset={dataset} options={baseOptions} />
    )
}
