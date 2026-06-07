import { useEffect, useState } from 'react'
import { Spin, message } from 'antd'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import { getSankey } from '../../api'

interface SankeyChartProps {
  height?: number
}

function SankeyChart({ height = 400 }: SankeyChartProps) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<{ nodes: any[]; links: any[] }>({
    nodes: [],
    links: [],
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await getSankey()
      setData({
        nodes: (res as any).nodes || [],
        links: (res as any).links || [],
      })
    } catch (error) {
      message.error('加载桑基图数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      formatter: (params: any) => {
        if (params.dataType === 'edge') {
          return `
            <div style="font-weight: bold;">${params.data.source} → ${params.data.target}</div>
            <div>数量：${params.data.value}</div>
          `
        }
        return `<div style="font-weight: bold;">${params.name}</div>`
      },
    },
    series: [
      {
        type: 'sankey',
        emphasis: {
          focus: 'adjacency' as const,
        },
        data: data.nodes,
        links: data.links,
        lineStyle: {
          color: 'gradient',
          curveness: 0.5,
          opacity: 0.6,
        },
        label: {
          show: true,
          fontSize: 12,
          color: '#333',
        },
        nodeAlign: 'left',
        nodeWidth: 20,
        nodeGap: 15,
        layoutIterations: 32,
        draggable: false,
      },
    ],
  }

  return (
    <Spin spinning={loading}>
      <ReactECharts option={option} style={{ height }} />
    </Spin>
  )
}

export default SankeyChart
