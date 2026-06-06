import { useEffect, useState } from 'react'
import { Row, Col, Card, Spin } from 'antd'
import {
  EnvironmentOutlined,
  MonitorOutlined,
  ShoppingOutlined,
  WarningOutlined,
  DollarOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { getOverview, getOrderTrend, getDeviceStatus, getRegionData } from '../../api'
import type { EChartsOption } from 'echarts'

function Dashboard() {
  const [loading, setLoading] = useState(false)
  const [overview, setOverview] = useState<any>({})
  const [orderTrend, setOrderTrend] = useState<any>({})
  const [deviceStatus, setDeviceStatus] = useState<any[]>([])
  const [regionData, setRegionData] = useState<any[]>([])

  const loadData = async () => {
    setLoading(true)
    try {
      const [overviewRes, trendRes, statusRes, regionRes] = await Promise.all([
        getOverview(),
        getOrderTrend(),
        getDeviceStatus(),
        getRegionData()
      ])
      setOverview(overviewRes)
      setOrderTrend(trendRes)
      setDeviceStatus(Array.isArray(statusRes) ? statusRes : [])
      setRegionData(Array.isArray(regionRes) ? regionRes : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const lineChartOption: EChartsOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['订单数量', '订单金额'], top: 0 },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: orderTrend?.dates || []
    },
    yAxis: [
      { type: 'value', name: '数量' },
      { type: 'value', name: '金额(元)' }
    ],
    series: [
      {
        name: '订单数量',
        type: 'line',
        smooth: true,
        itemStyle: { color: '#FF7A45' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255, 122, 69, 0.4)' },
              { offset: 1, color: 'rgba(255, 122, 69, 0.05)' }
            ]
          }
        },
        data: orderTrend?.counts || []
      },
      {
        name: '订单金额',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        itemStyle: { color: '#1890FF' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
            ]
          }
        },
        data: orderTrend?.amounts || []
      }
    ]
  }

  const pieChartOption: EChartsOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: '5%', left: 'center' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 16, fontWeight: 'bold' }
        },
        data: deviceStatus.map((item: any) => ({
          value: item.value,
          name: item.name,
          itemStyle: { color: item.color }
        }))
      }
    ]
  }

  const barChartOption: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['点位数量', '设备数量', '订单数量'], top: 0 },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: regionData?.map((d: any) => d.name) || []
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '点位数量',
        type: 'bar',
        itemStyle: { color: '#FF7A45', borderRadius: [4, 4, 0, 0] },
        data: regionData?.map((d: any) => d.points) || []
      },
      {
        name: '设备数量',
        type: 'bar',
        itemStyle: { color: '#1890FF', borderRadius: [4, 4, 0, 0] },
        data: regionData?.map((d: any) => d.devices) || []
      },
      {
        name: '订单数量',
        type: 'bar',
        itemStyle: { color: '#52C41A', borderRadius: [4, 4, 0, 0] },
        data: regionData?.map((d: any) => d.orders) || []
      }
    ]
  }

  const statCards = [
    {
      title: '点位总数',
      value: overview?.totalPoints || 0,
      icon: <EnvironmentOutlined />,
      className: 'stat-card'
    },
    {
      title: '设备总数',
      value: overview?.totalDevices || 0,
      icon: <MonitorOutlined />,
      className: 'stat-card-secondary'
    },
    {
      title: '在线设备',
      value: overview?.onlineDevices || 0,
      icon: <MonitorOutlined />,
      className: 'stat-card-success'
    },
    {
      title: '今日订单',
      value: overview?.todayOrders || 0,
      icon: <ShoppingOutlined />,
      className: 'stat-card'
    },
    {
      title: '今日收入',
      value: overview?.todayAmount || 0,
      prefix: '¥',
      icon: <DollarOutlined />,
      className: 'stat-card-warning'
    },
    {
      title: '待处理报修',
      value: overview?.pendingRepairs || 0,
      icon: <WarningOutlined />,
      className: 'stat-card-error'
    },
    {
      title: '低库存预警',
      value: overview?.lowStockDevices || 0,
      icon: <WarningOutlined />,
      className: 'stat-card-error'
    }
  ]

  return (
    <Spin spinning={loading}>
      <div>
        <div className="page-header">
          <h2 className="page-title">数据概览</h2>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          {statCards.map((card, index) => (
            <Col xs={24} sm={12} lg={8} xl={4} key={index}>
              <div className={card.className} style={{ position: 'relative' }}>
                <div className="stat-value">{card.prefix}{card.value}</div>
                <div className="stat-label">{card.title}</div>
                <div className="stat-icon">{card.icon}</div>
              </div>
            </Col>
          ))}
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} lg={14}>
            <Card title="近7日订单趋势" bordered={false}>
              <ReactECharts option={lineChartOption} style={{ height: 350 }} />
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card title="设备状态分布" bordered={false}>
              <ReactECharts option={pieChartOption} style={{ height: 350 }} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card title="区域数据对比" bordered={false}>
              <ReactECharts option={barChartOption} style={{ height: 350 }} />
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  )
}

export default Dashboard
