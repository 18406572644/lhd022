import { useState, useEffect, useCallback } from 'react'
import {
  Card,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Switch,
  Select,
  message,
  Popconfirm,
  Dropdown,
  Tabs,
  Tag,
  Drawer,
  List,
  Tooltip,
} from 'antd'
import {
  Plus,
  Save,
  Settings,
  Trash2,
  LayoutDashboard,
  Eye,
  EyeOff,
  GripVertical,
  Maximize2,
  BarChart3,
  PieChart,
  LineChart,
  Thermometer,
  GitBranch,
  Target,
  Filter,
} from 'lucide-react'
import GridLayout from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import {
  getDashboards,
  getDashboard,
  createDashboard,
  updateDashboard,
  deleteDashboard,
  getDefaultWidgets,
  getOverview,
  getOrderTrend,
  getDeviceStatus,
  getRegionData,
  getHeatmap,
  getSankey,
  getRadar,
  getFunnel,
  type Dashboard,
  type WidgetConfig,
} from '../../api'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'

const { Responsive, WidthProvider } = GridLayout as any
const ResponsiveGridLayout = WidthProvider(Responsive)

interface LayoutItem {
  i: string
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
  static?: boolean
}

interface WidgetInstance extends WidgetConfig {
  instanceId: string
  data?: any
}

function CustomDashboard() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [currentDashboard, setCurrentDashboard] = useState<Dashboard | null>(null)
  const [widgets, setWidgets] = useState<WidgetConfig[]>([])
  const [layout, setLayout] = useState<LayoutItem[]>([])
  const [activeWidgets, setActiveWidgets] = useState<WidgetInstance[]>([])
  const [isEditMode, setIsEditMode] = useState(false)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [widgetDataLoading, setWidgetDataLoading] = useState<Record<string, boolean>>({})

  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [widgetDrawerVisible, setWidgetDrawerVisible] = useState(false)
  const [form] = Form.useForm()

  const loadDashboards = useCallback(async () => {
    try {
      const res = await getDashboards()
      setDashboards(Array.isArray(res) ? res : [])
    } catch (error) {
      message.error('加载仪表盘列表失败')
    }
  }, [])

  const loadWidgets = useCallback(async () => {
    try {
      const res = await getDefaultWidgets()
      setWidgets(Array.isArray(res) ? res : [])
    } catch (error) {
      message.error('加载组件列表失败')
    }
  }, [])

  const loadDashboard = useCallback(async (id: number) => {
    setDashboardLoading(true)
    try {
      const res = await getDashboard(id)
      setCurrentDashboard(res as Dashboard)

      if ((res as any).layout) {
        setLayout((res as any).layout || [])
      } else {
        setLayout([])
      }

      if ((res as any).widgets) {
        setActiveWidgets((res as any).widgets || [])
      } else {
        setActiveWidgets([])
      }

      await loadWidgetData((res as any).widgets || [])
    } catch (error) {
      message.error('加载仪表盘详情失败')
    } finally {
      setDashboardLoading(false)
    }
  }, [])

  const loadWidgetData = async (widgetList: WidgetInstance[]) => {
    const newLoading: Record<string, boolean> = {}
    const newData: Record<string, any> = {}

    for (const widget of widgetList) {
      newLoading[widget.instanceId] = true
      try {
        let data: any = null
        switch (widget.dataSource) {
          case 'overview':
            data = await getOverview()
            break
          case 'trend':
            data = await getOrderTrend()
            break
          case 'device-status':
            data = await getDeviceStatus()
            break
          case 'region-data':
            data = await getRegionData()
            break
          case 'heatmap':
            data = await getHeatmap()
            break
          case 'sankey':
            data = await getSankey()
            break
          case 'radar':
            data = await getRadar()
            break
          case 'funnel':
            data = await getFunnel()
            break
        }
        newData[widget.instanceId] = data
      } catch (error) {
        console.error(`加载组件 ${widget.title} 数据失败:`, error)
      } finally {
        newLoading[widget.instanceId] = false
      }
    }

    setWidgetDataLoading(newLoading)
    setActiveWidgets((prev) =>
      prev.map((w) => ({
        ...w,
        data: newData[w.instanceId] !== undefined ? newData[w.instanceId] : w.data,
      })),
    )
  }

  useEffect(() => {
    loadDashboards()
    loadWidgets()
  }, [loadDashboards, loadWidgets])

  useEffect(() => {
    if (dashboards.length > 0 && !currentDashboard) {
      loadDashboard(dashboards[0].id)
    }
  }, [dashboards, currentDashboard, loadDashboard])

  const handleCreateDashboard = async (values: any) => {
    try {
      const defaultLayout: LayoutItem[] = []
      const defaultWidgets: WidgetInstance[] = []

      if (values.template === 'operation') {
        defaultLayout.push(
          { i: 'op-1', x: 0, y: 0, w: 6, h: 2 },
          { i: 'op-2', x: 6, y: 0, w: 6, h: 2 },
          { i: 'op-3', x: 12, y: 0, w: 6, h: 2 },
          { i: 'op-4', x: 18, y: 0, w: 6, h: 2 },
          { i: 'op-5', x: 0, y: 2, w: 12, h: 5 },
          { i: 'op-6', x: 12, y: 2, w: 12, h: 5 },
          { i: 'op-7', x: 0, y: 7, w: 24, h: 5 },
        )
        defaultWidgets.push(
          { ...widgets[0], instanceId: 'op-1' },
          { ...widgets[1], instanceId: 'op-2' },
          { ...widgets[2], instanceId: 'op-3' },
          { ...widgets[3], instanceId: 'op-4' },
          { ...widgets[7], instanceId: 'op-5' },
          { ...widgets[8], instanceId: 'op-6' },
          { ...widgets[10], instanceId: 'op-7' },
        )
      } else if (values.template === 'maintenance') {
        defaultLayout.push(
          { i: 'mt-1', x: 0, y: 0, w: 6, h: 2 },
          { i: 'mt-2', x: 6, y: 0, w: 6, h: 2 },
          { i: 'mt-3', x: 12, y: 0, w: 6, h: 2 },
          { i: 'mt-4', x: 18, y: 0, w: 6, h: 2 },
          { i: 'mt-5', x: 0, y: 2, w: 12, h: 5 },
          { i: 'mt-6', x: 12, y: 2, w: 12, h: 5 },
          { i: 'mt-7', x: 0, y: 7, w: 12, h: 5 },
          { i: 'mt-8', x: 12, y: 7, w: 12, h: 5 },
        )
        defaultWidgets.push(
          { ...widgets[1], instanceId: 'mt-1' },
          { ...widgets[2], instanceId: 'mt-2' },
          { ...widgets[5], instanceId: 'mt-3' },
          { ...widgets[6], instanceId: 'mt-4' },
          { ...widgets[8], instanceId: 'mt-5' },
          { ...widgets[11], instanceId: 'mt-6' },
          { ...widgets[12], instanceId: 'mt-7' },
          { ...widgets[13], instanceId: 'mt-8' },
        )
      } else if (values.template === 'management') {
        defaultLayout.push(
          { i: 'mg-1', x: 0, y: 0, w: 4, h: 2 },
          { i: 'mg-2', x: 4, y: 0, w: 4, h: 2 },
          { i: 'mg-3', x: 8, y: 0, w: 4, h: 2 },
          { i: 'mg-4', x: 12, y: 0, w: 4, h: 2 },
          { i: 'mg-5', x: 16, y: 0, w: 4, h: 2 },
          { i: 'mg-6', x: 20, y: 0, w: 4, h: 2 },
          { i: 'mg-7', x: 0, y: 2, w: 14, h: 5 },
          { i: 'mg-8', x: 14, y: 2, w: 10, h: 5 },
          { i: 'mg-9', x: 0, y: 7, w: 12, h: 5 },
          { i: 'mg-10', x: 12, y: 7, w: 12, h: 5 },
        )
        defaultWidgets.push(
          { ...widgets[0], instanceId: 'mg-1' },
          { ...widgets[1], instanceId: 'mg-2' },
          { ...widgets[2], instanceId: 'mg-3' },
          { ...widgets[3], instanceId: 'mg-4' },
          { ...widgets[4], instanceId: 'mg-5' },
          { ...widgets[5], instanceId: 'mg-6' },
          { ...widgets[7], instanceId: 'mg-7' },
          { ...widgets[10], instanceId: 'mg-8' },
          { ...widgets[12], instanceId: 'mg-9' },
          { ...widgets[9], instanceId: 'mg-10' },
        )
      }

      const res = await createDashboard({
        name: values.name,
        description: values.description,
        isPublic: values.isPublic,
        layout: defaultLayout,
        widgets: defaultWidgets,
      })

      message.success('仪表盘创建成功')
      setCreateModalVisible(false)
      form.resetFields()
      loadDashboards()
      if (res) {
        loadDashboard((res as any).id)
      }
    } catch (error) {
      message.error('创建仪表盘失败')
    }
  }

  const handleSaveDashboard = async () => {
    if (!currentDashboard) return

    try {
      await updateDashboard(currentDashboard.id, {
        layout,
        widgets: activeWidgets,
      })
      message.success('仪表盘布局已保存')
      setIsEditMode(false)
    } catch (error) {
      message.error('保存仪表盘失败')
    }
  }

  const handleDeleteDashboard = async (id: number) => {
    try {
      await deleteDashboard(id)
      message.success('删除成功')
      loadDashboards()
      if (currentDashboard?.id === id) {
        setCurrentDashboard(null)
        setLayout([])
        setActiveWidgets([])
      }
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleAddWidget = (widget: WidgetConfig) => {
    const instanceId = `${widget.id}-${Date.now()}`
    const newWidget: WidgetInstance = {
      ...widget,
      instanceId,
    }

    const newLayoutItem: LayoutItem = {
      i: instanceId,
      x: 0,
      y: Infinity,
      w: widget.type === 'stat-card' ? 6 : 12,
      h: widget.type === 'stat-card' ? 2 : 5,
      minW: widget.type === 'stat-card' ? 4 : 6,
      minH: widget.type === 'stat-card' ? 2 : 4,
    }

    setActiveWidgets([...activeWidgets, newWidget])
    setLayout([...layout, newLayoutItem])
    loadWidgetData([newWidget])
    message.success(`已添加组件：${widget.title}`)
  }

  const handleRemoveWidget = (instanceId: string) => {
    setActiveWidgets(activeWidgets.filter((w) => w.instanceId !== instanceId))
    setLayout(layout.filter((l) => l.i !== instanceId))
    message.success('组件已移除')
  }

  const handleLayoutChange = (newLayout: LayoutItem[]) => {
    setLayout(newLayout)
  }

  const renderWidgetContent = (widget: WidgetInstance) => {
    const loading = widgetDataLoading[widget.instanceId]
    const data = widget.data

    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <div className="ant-spin ant-spin-spinning">
            <span className="ant-spin-dot">
              <i></i>
              <i></i>
              <i></i>
              <i></i>
            </span>
          </div>
        </div>
      )
    }

    if (widget.type === 'stat-card') {
      const value = data?.[widget.dataKey || ''] || 0
      return (
        <div
          style={{
            padding: '16px',
            borderRadius: '8px',
            background: `linear-gradient(135deg, ${widget.color}15 0%, ${widget.color}05 100%)`,
            borderLeft: `4px solid ${widget.color}`,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: widget.color }}>
            {widget.prefix || ''}{value}
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
            {widget.title}
          </div>
        </div>
      )
    }

    let option: EChartsOption = {}
    const height = widget.height || 350

    switch (widget.dataSource) {
      case 'trend':
        option = {
          tooltip: { trigger: 'axis' },
          legend: { data: ['订单数量', '订单金额'], top: 0 },
          grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: data?.dates || [],
          },
          yAxis: [
            { type: 'value', name: '数量' },
            { type: 'value', name: '金额(元)' },
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
                    { offset: 1, color: 'rgba(255, 122, 69, 0.05)' },
                  ],
                },
              },
              data: data?.counts || [],
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
                    { offset: 1, color: 'rgba(24, 144, 255, 0.05)' },
                  ],
                },
              },
              data: data?.amounts || [],
            },
          ],
        }
        break

      case 'device-status':
        option = {
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
                label: { show: true, fontSize: 16, fontWeight: 'bold' },
              },
              data: data?.map((item: any) => ({
                value: item.value,
                name: item.name,
                itemStyle: { color: item.color },
              })) || [],
            },
          ],
        }
        break

      case 'region-data':
        option = {
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
          legend: { data: ['点位数量', '设备数量', '订单数量'], top: 0 },
          grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
          xAxis: {
            type: 'category',
            data: data?.map((d: any) => d.name) || [],
          },
          yAxis: { type: 'value' },
          series: [
            {
              name: '点位数量',
              type: 'bar',
              itemStyle: { color: '#FF7A45', borderRadius: [4, 4, 0, 0] },
              data: data?.map((d: any) => d.points) || [],
            },
            {
              name: '设备数量',
              type: 'bar',
              itemStyle: { color: '#1890FF', borderRadius: [4, 4, 0, 0] },
              data: data?.map((d: any) => d.devices) || [],
            },
            {
              name: '订单数量',
              type: 'bar',
              itemStyle: { color: '#52C41A', borderRadius: [4, 4, 0, 0] },
              data: data?.map((d: any) => d.orders) || [],
            },
          ],
        }
        break

      case 'heatmap':
        option = {
          tooltip: {
            trigger: 'item',
            formatter: (params: any) => {
              const d = params.data
              if (d && d.name) {
                return `
                  <div style="font-weight: bold;">${d.name}</div>
                  <div>地址：${d.address || '-'}</div>
                  <div>订单数：${d.orderCount || 0}</div>
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
          },
          geo: {
            map: 'china',
            roam: true,
            zoom: 1.2,
            label: { show: true, fontSize: 10, color: '#333' },
            itemStyle: { borderColor: '#999', borderWidth: 1, areaColor: '#f5f5f5' },
          },
          series: [
            {
              name: '订单密度',
              type: 'effectScatter',
              coordinateSystem: 'geo',
              data: (Array.isArray(data) ? data : []).map((item: any) => ({
                ...item,
                value: item.value,
                symbolSize: Math.max(8, item.orderCount * 3),
              })),
              rippleEffect: { brushType: 'stroke', scale: 3 },
              label: { show: true, formatter: '{b}', position: 'right', fontSize: 10 },
              itemStyle: { color: '#FF7A45', shadowBlur: 10, shadowColor: '#FF7A45' },
            },
          ],
        }
        break

      case 'sankey':
        option = {
          tooltip: { trigger: 'item', triggerOn: 'mousemove' },
          series: [
            {
              type: 'sankey',
              data: data?.nodes || [],
              links: data?.links || [],
              lineStyle: { color: 'gradient', curveness: 0.5, opacity: 0.6 },
              label: { show: true, fontSize: 12, color: '#333' },
              nodeAlign: 'left',
              nodeWidth: 20,
              nodeGap: 15,
            },
          ],
        }
        break

      case 'radar':
        const colors = ['#1890FF', '#52C41A', '#FAAD14', '#F5222D', '#722ED1', '#13C2C2']
        option = {
          tooltip: { trigger: 'item' },
          legend: { data: data?.data?.map((d: any) => d.name) || [], bottom: 0 },
          radar: {
            indicator: data?.indicators || [],
            shape: 'polygon',
            splitNumber: 5,
          },
          series: [
            {
              type: 'radar',
              data: (data?.data || []).map((d: any, index: number) => ({
                ...d,
                value: d.value,
                areaStyle: { color: `${colors[index % colors.length]}33` },
                lineStyle: { width: 2, color: colors[index % colors.length] },
                itemStyle: { color: colors[index % colors.length] },
              })),
            },
          ],
        }
        break

      case 'funnel':
        const funnelColors = ['#1890FF', '#52C41A', '#FAAD14', '#F5222D', '#722ED1']
        option = {
          tooltip: { trigger: 'item' },
          legend: { data: (Array.isArray(data) ? data : []).map((d: any) => d.name), bottom: 0 },
          series: [
            {
              name: '报修处理漏斗',
              type: 'funnel',
              left: '10%',
              top: 20,
              bottom: 60,
              width: '80%',
              minSize: '0%',
              maxSize: '100%',
              sort: 'descending',
              gap: 2,
              label: {
                show: true,
                position: 'inside',
                formatter: (params: any) => `${params.data.name}\n${params.data.value}`,
                fontSize: 12,
                color: '#fff',
              },
              itemStyle: { borderColor: '#fff', borderWidth: 2 },
              data: (Array.isArray(data) ? data : []).map((d: any, index: number) => ({
                ...d,
                itemStyle: { color: funnelColors[index % funnelColors.length] },
              })),
            },
          ],
        }
        break
    }

    return <ReactECharts option={option} style={{ height: height - 20 }} />
  }

  const getWidgetIcon = (type: string) => {
    switch (type) {
      case 'stat-card':
        return <Thermometer size={16} />
      case 'line':
        return <LineChart size={16} />
      case 'pie':
        return <PieChart size={16} />
      case 'bar':
        return <BarChart3 size={16} />
      case 'heatmap':
        return <Thermometer size={16} />
      case 'sankey':
        return <GitBranch size={16} />
      case 'radar':
        return <Target size={16} />
      case 'funnel':
        return <Filter size={16} />
      default:
        return <BarChart3 size={16} />
    }
  }

  const defaultTemplates = [
    { value: 'operation', label: '运营视图', description: '展示订单、收入等运营核心指标' },
    { value: 'maintenance', label: '运维视图', description: '展示设备状态、故障处理等运维指标' },
    { value: 'management', label: '管理视图', description: '全方位展示各维度数据，供管理层使用' },
    { value: 'blank', label: '空白模板', description: '从零开始自定义布局' },
  ]

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="page-title">自定义仪表盘</h2>
          <p style={{ color: '#888', margin: 0 }}>拖拽添加组件，自由调整布局，保存多个视图</p>
        </div>
        <Space>
          <Button
            icon={isEditMode ? <Eye size={16} /> : <EyeOff size={16} />}
            onClick={() => setIsEditMode(!isEditMode)}
            type={isEditMode ? 'primary' : 'default'}
          >
            {isEditMode ? '预览模式' : '编辑模式'}
          </Button>
          <Button icon={<Plus size={16} />} onClick={() => setCreateModalVisible(true)}>
            新建仪表盘
          </Button>
          {isEditMode && (
            <Button icon={<Save size={16} />} type="primary" onClick={handleSaveDashboard}>
              保存布局
            </Button>
          )}
          <Button icon={<Settings size={16} />} onClick={() => setWidgetDrawerVisible(true)}>
            组件库
          </Button>
        </Space>
      </div>

      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Tabs
          activeKey={currentDashboard?.id?.toString()}
          onChange={(key) => loadDashboard(parseInt(key))}
          tabBarExtraContent={
            currentDashboard && (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'delete',
                      label: '删除仪表盘',
                      icon: <Trash2 size={14} />,
                      danger: true,
                      onClick: () => {
                        Modal.confirm({
                          title: '确认删除',
                          content: `确定要删除仪表盘「${currentDashboard.name}」吗？`,
                          onOk: () => handleDeleteDashboard(currentDashboard.id),
                        })
                      },
                    },
                  ],
                }}
                trigger={['click']}
              >
                <Button type="text" icon={<Settings size={14} />} size="small" />
              </Dropdown>
            )
          }
          items={dashboards.map((d) => ({
            key: d.id.toString(),
            label: (
              <Space>
                <LayoutDashboard size={14} />
                <span>{d.name}</span>
                {d.isPublic && <Tag color="blue" style={{ fontSize: 12 }}>公共</Tag>}
              </Space>
            ),
          }))}
        />
      </Card>

      <Card bordered={false} loading={dashboardLoading}>
        {currentDashboard ? (
          <div>
            <div style={{ marginBottom: 16, padding: '8px 12px', background: '#f5f5f5', borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 'bold' }}>{currentDashboard.name}</span>
                {currentDashboard.description && (
                  <span style={{ color: '#888', marginLeft: 12 }}>{currentDashboard.description}</span>
                )}
              </div>
              {isEditMode && (
                <Tag color="orange">编辑模式 - 拖拽调整位置，拖动右下角调整大小</Tag>
              )}
            </div>

            <ResponsiveGridLayout
              className="layout"
              layouts={{ lg: layout }}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: 24, md: 12, sm: 6, xs: 2, xxs: 2 }}
              rowHeight={50}
              isDraggable={isEditMode}
              isResizable={isEditMode}
              onLayoutChange={handleLayoutChange}
              compactType="vertical"
              draggableHandle=".drag-handle"
            >
              {layout.map((item) => {
                const widget = activeWidgets.find((w) => w.instanceId === item.i)
                if (!widget) return null

                return (
                  <div key={item.i}>
                    <Card
                      size="small"
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {isEditMode && (
                            <GripVertical size={14} className="drag-handle" style={{ cursor: 'move', color: '#999' }} />
                          )}
                          {getWidgetIcon(widget.type)}
                          <span>{widget.title}</span>
                        </div>
                      }
                      extra={
                        isEditMode ? (
                          <Space>
                            <Tooltip title="调整大小">
                              <Maximize2 size={14} style={{ cursor: 'se-resize' }} />
                            </Tooltip>
                            <Popconfirm
                              title="确认移除"
                              description={`确定要移除组件「${widget.title}」吗？`}
                              onConfirm={() => handleRemoveWidget(widget.instanceId)}
                            >
                              <Trash2 size={14} style={{ cursor: 'pointer', color: '#ff4d4f' }} />
                            </Popconfirm>
                          </Space>
                        ) : null
                      }
                      style={{ height: '100%' }}
                      bodyStyle={{ height: 'calc(100% - 40px)', padding: '8px' }}
                    >
                      {renderWidgetContent(widget)}
                    </Card>
                  </div>
                )
              })}
            </ResponsiveGridLayout>

            {activeWidgets.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#999',
                  border: '2px dashed #d9d9d9',
                  borderRadius: 8,
                }}
              >
                <LayoutDashboard size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
                <div style={{ fontSize: 16, marginBottom: 8 }}>仪表盘为空</div>
                <div style={{ marginBottom: 16 }}>点击右侧「组件库」添加图表组件</div>
                <Button type="primary" icon={<Plus size={16} />} onClick={() => setWidgetDrawerVisible(true)}>
                  添加组件
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 20px',
              color: '#999',
            }}
          >
            <LayoutDashboard size={64} style={{ marginBottom: 16, opacity: 0.5 }} />
            <div style={{ fontSize: 18, marginBottom: 8 }}>请选择或创建仪表盘</div>
            <Button type="primary" icon={<Plus size={16} />} onClick={() => setCreateModalVisible(true)}>
              创建仪表盘
            </Button>
          </div>
        )}
      </Card>

      <Modal
        title="新建仪表盘"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateDashboard}>
          <Form.Item
            name="name"
            label="仪表盘名称"
            rules={[{ required: true, message: '请输入仪表盘名称' }]}
          >
            <Input placeholder="例如：运营视图、运维视图" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="请输入仪表盘描述" />
          </Form.Item>
          <Form.Item
            name="template"
            label="选择模板"
            rules={[{ required: true, message: '请选择模板' }]}
          >
            <Select>
              {defaultTemplates.map((t) => (
                <Select.Option key={t.value} value={t.value}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{t.label}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>{t.description}</div>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="isPublic" label="设为公共仪表盘" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setCreateModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">创建</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="组件库"
        placement="right"
        width={360}
        open={widgetDrawerVisible}
        onClose={() => setWidgetDrawerVisible(false)}
      >
        <List
          dataSource={widgets}
          renderItem={(widget) => (
            <List.Item
              actions={[
                <Button
                  type="primary"
                  size="small"
                  icon={<Plus size={14} />}
                  onClick={() => handleAddWidget(widget)}
                  disabled={isEditMode === false}
                >
                  添加
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 6,
                      background: `${widget.color || '#1890FF'}15`,
                      color: widget.color || '#1890FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {getWidgetIcon(widget.type)}
                  </div>
                }
                title={widget.title}
                description={
                  <Space>
                    <Tag style={{ fontSize: 12 }}>
                      {widget.type === 'stat-card' ? '统计卡片' :
                       widget.type === 'line' ? '折线图' :
                       widget.type === 'pie' ? '饼图' :
                       widget.type === 'bar' ? '柱状图' :
                       widget.type === 'heatmap' ? '热力图' :
                       widget.type === 'sankey' ? '桑基图' :
                       widget.type === 'radar' ? '雷达图' :
                       widget.type === 'funnel' ? '漏斗图' : widget.type}
                    </Tag>
                    {widget.dataSource && <Tag color="blue" style={{ fontSize: 12 }}>{widget.dataSource}</Tag>}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
        {!isEditMode && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              background: '#fffbe6',
              border: '1px solid #ffe58f',
              borderRadius: 4,
              color: '#d48806',
            }}
          >
            请先切换到「编辑模式」再添加组件
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default CustomDashboard
