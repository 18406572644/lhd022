import { useEffect, useState } from 'react'
import { Spin, message } from 'antd'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import { getHeatmap, getDrillDown } from '../../api'
import { useNavigate } from 'react-router-dom'

interface HeatmapChartProps {
  height?: number
  onDrillDown?: (data: any) => void
}

function HeatmapChart({ height = 400, onDrillDown }: HeatmapChartProps) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any[]>([])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await getHeatmap()
      setData(Array.isArray(res) ? res : [])
    } catch (error) {
      message.error('加载热力图数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleClick = async (params: any) => {
    if (params.data && params.data.id) {
      if (onDrillDown) {
        const detailData = await getDrillDown({
          dimension: 'orders',
          pointId: params.data.id,
        })
        onDrillDown({
          type: 'heatmap',
          pointId: params.data.id,
          pointName: params.data.name,
          data: detailData,
        })
      } else {
        navigate(`/orders?pointId=${params.data.id}`)
      }
    }
  }

  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const d = params.data
        if (d && d.name) {
          return `
            <div style="font-weight: bold;">${d.name}</div>
            <div>地址：${d.address || '-'}</div>
            <div>订单数：${d.orderCount || 0}</div>
            <div style="color: #1890FF; cursor: pointer;">点击查看详情 →</div>
          `
        }
        return ''
      },
    },
    visualMap: {
      min: 0,
      max: 1,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '10px',
      inRange: {
        color: ['#e0f7fa', '#80deea', '#26c6da', '#00acc1', '#00838f', '#006064'],
      },
      text: ['高', '低'],
      textStyle: {
        color: '#666',
      },
    },
    geo: {
      map: 'china',
      roam: true,
      zoom: 1.2,
      label: {
        show: true,
        fontSize: 10,
        color: '#333',
      },
      itemStyle: {
        borderColor: '#999',
        borderWidth: 1,
        areaColor: '#f5f5f5',
      },
      emphasis: {
        itemStyle: {
          areaColor: '#e6f7ff',
          borderColor: '#1890FF',
          borderWidth: 2,
        },
        label: {
          show: true,
          color: '#1890FF',
        },
      },
    },
    series: [
      {
        name: '订单密度',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: data.map((item) => ({
          ...item,
          value: item.value,
          symbolSize: Math.max(8, item.orderCount * 3),
        })),
        rippleEffect: {
          brushType: 'stroke',
          scale: 3,
        },
        label: {
          show: true,
          formatter: '{b}',
          position: 'right',
          fontSize: 10,
        },
        itemStyle: {
          color: '#FF7A45',
          shadowBlur: 10,
          shadowColor: '#FF7A45',
        },
      },
    ],
  }

  return (
    <Spin spinning={loading}>
      <ReactECharts
        option={option}
        style={{ height }}
        onEvents={{
          click: handleClick,
        }}
      />
    </Spin>
  )
}

export default HeatmapChart
