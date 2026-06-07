import { useEffect, useState } from 'react'
import { Spin, message } from 'antd'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import { getRadar } from '../../api'

interface RadarChartProps {
  height?: number
}

function RadarChart({ height = 350 }: RadarChartProps) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<{ indicators: any[]; data: any[] }>({
    indicators: [],
    data: [],
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await getRadar()
      setData({
        indicators: (res as any).indicators || [],
        data: (res as any).data || [],
      })
    } catch (error) {
      message.error('加载雷达图数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const colors = ['#1890FF', '#52C41A', '#FAAD14', '#F5222D', '#722ED1', '#13C2C2']

  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      data: data.data.map((d) => d.name),
      bottom: 0,
    },
    radar: {
      indicator: data.indicators,
      shape: 'polygon',
      splitNumber: 5,
      axisName: {
        color: '#333',
        fontSize: 12,
      },
      splitLine: {
        lineStyle: {
          color: ['#e8e8e8', '#e8e8e8', '#e8e8e8', '#e8e8e8', '#e8e8e8'],
        },
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(24, 144, 255, 0.05)', 'rgba(24, 144, 255, 0.1)'],
        },
      },
      axisLine: {
        lineStyle: {
          color: '#d9d9d9',
        },
      },
    },
    series: [
      {
        type: 'radar',
        data: data.data.map((d, index) => ({
          ...d,
          value: d.value,
          areaStyle: {
            color: `${colors[index % colors.length]}33`,
          },
          lineStyle: {
            width: 2,
            color: colors[index % colors.length],
          },
          itemStyle: {
            color: colors[index % colors.length],
          },
        })),
      },
    ],
  }

  return (
    <Spin spinning={loading}>
      <ReactECharts option={option} style={{ height }} />
    </Spin>
  )
}

export default RadarChart
