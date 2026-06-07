import { useState } from 'react'
import { Row, Col, Card, Drawer, Table, Tag, Button, Space, Tooltip, Modal } from 'antd'
import { ZoomIn, ZoomOut, Slice, BarChart3, Layers, ArrowDownRight } from 'lucide-react'
import { HeatmapChart, SankeyChart, RadarChart, FunnelChart } from '../../components'
import { getOLAP } from '../../api'
import type { ColumnsType } from 'antd/es/table'

interface DrillDownData {
  type: string
  pointId?: number
  pointName?: string
  data: any
}

function AdvancedAnalytics() {
  const [drillDownVisible, setDrillDownVisible] = useState(false)
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(null)
  const [olapModalVisible, setOlapModalVisible] = useState(false)
  const [olapData, setOlapData] = useState<any>(null)
  const [olapLoading, setOlapLoading] = useState(false)

  const handleDrillDown = (data: DrillDownData) => {
    setDrillDownData(data)
    setDrillDownVisible(true)
  }

  const getDrillDownColumns = (): ColumnsType<any> => {
    const dimension = drillDownData?.data?.dimension
    const baseColumns: ColumnsType<any> = [
      { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    ]

    switch (dimension) {
      case 'orders':
        return [
          ...baseColumns,
          { title: '订单号', dataIndex: 'orderNo', key: 'orderNo' },
          { title: '类型', dataIndex: 'type', key: 'type', render: (t: string) => (
            <Tag color={t === 'umbrella' ? 'blue' : 'orange'}>
              {t === 'umbrella' ? '雨伞' : '充电宝'}
            </Tag>
          )},
          { title: '金额(元)', dataIndex: 'amount', key: 'amount' },
          { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => {
            const statusMap: Record<string, { color: string; text: string }> = {
              renting: { color: 'processing', text: '租借中' },
              returned: { color: 'success', text: '已归还' },
              overdue: { color: 'warning', text: '逾期' },
              lost: { color: 'error', text: '丢失' },
            }
            const conf = statusMap[s] || { color: 'default', text: s }
            return <Tag color={conf.color}>{conf.text}</Tag>
          }},
          { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
        ]
      case 'repairs':
        return [
          ...baseColumns,
          { title: '报修单号', dataIndex: 'repairNo', key: 'repairNo' },
          { title: '故障类型', dataIndex: 'faultType', key: 'faultType' },
          { title: '优先级', dataIndex: 'priority', key: 'priority', render: (p: string) => {
            const priorityMap: Record<string, { color: string; text: string }> = {
              low: { color: 'blue', text: '低' },
              medium: { color: 'gold', text: '中' },
              high: { color: 'orange', text: '高' },
              urgent: { color: 'red', text: '紧急' },
            }
            const conf = priorityMap[p] || { color: 'default', text: p }
            return <Tag color={conf.color}>{conf.text}</Tag>
          }},
          { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => {
            const statusMap: Record<string, { color: string; text: string }> = {
              pending: { color: 'processing', text: '待处理' },
              processing: { color: 'blue', text: '处理中' },
              resolved: { color: 'success', text: '已解决' },
              closed: { color: 'default', text: '已关闭' },
            }
            const conf = statusMap[s] || { color: 'default', text: s }
            return <Tag color={conf.color}>{conf.text}</Tag>
          }},
          { title: '上报人', dataIndex: 'reporter', key: 'reporter' },
          { title: '上报时间', dataIndex: 'reportTime', key: 'reportTime' },
        ]
      default:
        return baseColumns
    }
  }

  const handleOLAP = async (operation: string) => {
    setOlapLoading(true)
    try {
      const params: any = {
        cube: 'orders',
        dimensions: ['type', 'status'],
        measures: ['amount'],
      }

      switch (operation) {
        case 'slice':
          params.slice = { dimension: 'type', value: 'umbrella' }
          break
        case 'dice':
          params.dice = { dimension: 'status', values: ['returned', 'renting'] }
          break
        case 'rollup':
          params.dimensions = ['type']
          params.rollUp = 'status'
          break
        case 'drilldown':
          params.dimensions = ['type', 'status', 'pointId']
          params.drillDown = 'pointId'
          break
      }

      const res = await getOLAP(params)
      setOlapData(res)
      setOlapModalVisible(true)
    } catch (error) {
      console.error('OLAP error:', error)
    } finally {
      setOlapLoading(false)
    }
  }

  const getOLAPColumns = (): ColumnsType<any> => {
    if (!olapData?.data?.length) return []
    const firstItem = olapData.data[0]
    const columns: ColumnsType<any> = []

    Object.keys(firstItem).forEach((key) => {
      if (key !== '_count') {
        columns.push({
          title: key,
          dataIndex: key,
          key,
        })
      }
    })

    columns.push({
      title: '记录数',
      dataIndex: '_count',
      key: '_count',
      width: 100,
    })

    return columns
  }

  const chartCards = [
    {
      title: '点位订单热力图',
      content: <HeatmapChart onDrillDown={handleDrillDown} />,
      xs: 24,
      lg: 14,
      extra: (
        <Tooltip title="点击点位可下钻查看订单明细">
              <ArrowDownRight size={16} style={{ color: '#1890FF' }} />
            </Tooltip>
      ),
    },
    {
      title: '故障流转桑基图',
      content: <SankeyChart />,
      xs: 24,
      lg: 10,
    },
    {
      title: '区域运维KPI雷达图',
      content: <RadarChart />,
      xs: 24,
      lg: 12,
    },
    {
      title: '报修处理漏斗图',
      content: <FunnelChart />,
      xs: 24,
      lg: 12,
    },
  ]

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="page-title">高级数据分析</h2>
          <p style={{ color: '#888', margin: 0 }}>热力图、桑基图、雷达图、漏斗图，支持OLAP多维分析</p>
        </div>
        <Space>
          <Tooltip title="切片：按雨伞类型筛选">
            <Button icon={<Slice size={16} />} onClick={() => handleOLAP('slice')} loading={olapLoading}>
              切片
            </Button>
          </Tooltip>
          <Tooltip title="切块：按状态筛选已归还和租借中">
            <Button icon={<Layers size={16} />} onClick={() => handleOLAP('dice')} loading={olapLoading}>
              切块
            </Button>
          </Tooltip>
          <Tooltip title="上卷：按类型汇总">
            <Button icon={<ZoomOut size={16} />} onClick={() => handleOLAP('rollup')} loading={olapLoading}>
              上卷
            </Button>
          </Tooltip>
          <Tooltip title="下钻：按点位细化">
            <Button type="primary" icon={<ZoomIn size={16} />} onClick={() => handleOLAP('drilldown')} loading={olapLoading}>
              下钻
            </Button>
          </Tooltip>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {chartCards.map((card, index) => (
          <Col xs={card.xs} lg={card.lg} key={index}>
            <Card
              title={card.title}
              bordered={false}
              extra={card.extra}
            >
              {card.content}
            </Card>
          </Col>
        ))}
      </Row>

      <Drawer
        title={
          <Space>
            <ArrowDownRight size={18} />
            <span>数据钻取 - {drillDownData?.pointName || '详情'}</span>
          </Space>
        }
        placement="right"
        width={800}
        onClose={() => setDrillDownVisible(false)}
        open={drillDownVisible}
      >
        {drillDownData?.data && (
          <div>
            <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 8 }}>查询条件</div>
              <div>维度：{drillDownData.data.dimension}</div>
              {drillDownData.pointId && <div>点位ID：{drillDownData.pointId}</div>}
              <div>记录数：{drillDownData.data.total}</div>
            </div>
            <Table
              columns={getDrillDownColumns()}
              dataSource={drillDownData.data.data || []}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 800 }}
            />
          </div>
        )}
      </Drawer>

      <Modal
        title={
          <Space>
            <BarChart3 size={18} />
            <span>OLAP多维分析结果</span>
          </Space>
        }
        open={olapModalVisible}
        onCancel={() => setOlapModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setOlapModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={900}
      >
        {olapData && (
          <div>
            <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 8 }}>分析参数</div>
              <div>数据立方体：{olapData.cube}</div>
              <div>维度：{olapData.dimensions?.join(', ')}</div>
              <div>度量：{olapData.measures?.join(', ')}</div>
              {olapData.slice && <div>切片：{olapData.slice.dimension} = {olapData.slice.value}</div>}
              {olapData.dice && <div>切块：{olapData.dice.dimension} in [{olapData.dice.values.join(', ')}]</div>}
              {olapData.drillDown && <div>下钻维度：{olapData.drillDown}</div>}
              {olapData.rollUp && <div>上卷维度：{olapData.rollUp}</div>}
              <div style={{ marginTop: 8, fontWeight: 'bold' }}>结果记录数：{olapData.total}</div>
            </div>
            <Table
              columns={getOLAPColumns()}
              dataSource={olapData.data || []}
              rowKey={(_, index) => index?.toString() || ''}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 800 }}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AdvancedAnalytics
