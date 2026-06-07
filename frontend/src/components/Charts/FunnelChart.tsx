import { useEffect, useState } from 'react'
import { Spin, message } from 'antd'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import { getFunnel } from '../../api'

interface FunnelChartProps {
  height?: number
}

function FunnelChart({ height = 350 }: FunnelChartProps) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any[]>([])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await getFunnel()
      setData(Array.isArray(res) ? res : [])
    } catch (error) {
      message.error('加载漏斗图数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const colors = ['#1890FF', '#52C41A', '#FAAD14', '#F5222D', '#722ED1']

  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const d = params.data
        return `
          <div style="font-weight: bold;">${d.name}</div>
          <div>数量：${d.value}</div>
          <div>转化率：${d.conversionRate || '-'}</div>
        `
      },
    },
    legend: {
      data: data.map((d) => d.name),
      bottom: 0,
    },
    series: [
      {
        name: '报修处理漏斗',
        type: 'funnel',
        left: '10%',
        top: 20,
        bottom: 60,
        width: '80%',
        min: 0,
        max: data.length > 0 ? Math.max(...data.map((d) => d.value)) : 100,
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: {
          show: true,
          position: 'inside',
          formatter: (params: any) => {
            return `${params.data.name}\n${params.data.value}\n${params.data.conversionRate || ''}`
          },
          fontSize: 12,
          color: '#fff',
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: 'solid',
          },
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2,
        },
        emphasis: {
          label: {
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        data: data.map((d, index) => ({
          ...d,
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

export default FunnelChart
