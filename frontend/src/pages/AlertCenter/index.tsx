import { useState, useEffect, useCallback } from 'react'
import {
  Row,
  Col,
  Card,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  InputNumber,
  message,
  Popconfirm,
  Tabs,
  Tag,
  Table,
  Drawer,
  Statistic,
  Divider,
  Badge,
  Tooltip,
  Alert,
} from 'antd'
import {
  Plus,
  Bell,
  Settings,
  Trash2,
  Play,
  Mail,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Eye,
  MessageSquare,
} from 'lucide-react'
import type { ColumnsType } from 'antd/es/table'
import {
  getAlertSummary,
  getAlertConfigs,
  getAlertRecords,
  getAvailableMetrics,
  createAlertConfig,
  updateAlertConfig,
  deleteAlertConfig,
  handleAlertRecord,
  checkAlerts,
  type AlertConfig,
  type AlertRecord,
  type MetricInfo,
} from '../../api'

const { Option } = Select
const { TextArea } = Input

function AlertCenter() {
  const [activeTab, setActiveTab] = useState('records')
  const [summary, setSummary] = useState<any>(null)
  const [configs, setConfigs] = useState<AlertConfig[]>([])
  const [records, setRecords] = useState<AlertRecord[]>([])
  const [recordsTotal, setRecordsTotal] = useState(0)
  const [metrics, setMetrics] = useState<MetricInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [checkLoading, setCheckLoading] = useState(false)

  const [configModalVisible, setConfigModalVisible] = useState(false)
  const [recordDrawerVisible, setRecordDrawerVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState<AlertRecord | null>(null)
  const [editingConfig, setEditingConfig] = useState<AlertConfig | null>(null)
  const [configForm] = Form.useForm()
  const [handleForm] = Form.useForm()

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
  })
  const [filters, setFilters] = useState({
    status: undefined as string | undefined,
    level: undefined as string | undefined,
    metricType: undefined as string | undefined,
  })

  const loadSummary = useCallback(async () => {
    try {
      const res = await getAlertSummary()
      setSummary(res)
    } catch (error) {
      console.error('加载预警概览失败:', error)
    }
  }, [])

  const loadConfigs = useCallback(async () => {
    try {
      const res = await getAlertConfigs()
      setConfigs(Array.isArray(res) ? res : [])
    } catch (error) {
      message.error('加载预警配置失败')
    }
  }, [])

  const loadRecords = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAlertRecords({
        ...filters,
        page: pagination.page,
        pageSize: pagination.pageSize,
      })
      const result = res as any
      setRecords(result?.data || [])
      setRecordsTotal(result?.total || 0)
    } catch (error) {
      message.error('加载预警记录失败')
    } finally {
      setLoading(false)
    }
  }, [filters, pagination])

  const loadMetrics = useCallback(async () => {
    try {
      const res = await getAvailableMetrics()
      setMetrics(Array.isArray(res) ? res : [])
    } catch (error) {
      console.error('加载指标列表失败:', error)
    }
  }, [])

  useEffect(() => {
    loadSummary()
    loadConfigs()
    loadRecords()
    loadMetrics()
  }, [loadSummary, loadConfigs, loadRecords, loadMetrics])

  useEffect(() => {
    if (activeTab === 'records') {
      loadRecords()
    } else if (activeTab === 'configs') {
      loadConfigs()
    }
  }, [activeTab, loadRecords, loadConfigs])

  const handleCreateConfig = () => {
    setEditingConfig(null)
    configForm.resetFields()
    configForm.setFieldsValue({
      level: 'medium',
      operator: 'lt',
      checkInterval: 60,
      silenceDuration: 120,
      isEnabled: true,
      notifyChannels: ['system'],
    })
    setConfigModalVisible(true)
  }

  const handleEditConfig = (config: AlertConfig) => {
    setEditingConfig(config)
    configForm.setFieldsValue({
      name: config.name,
      metricType: config.metricType,
      operator: config.operator,
      threshold: config.threshold,
      level: config.level,
      notifyChannels: config.notifyChannels,
      receivers: config.receivers,
      checkInterval: config.checkInterval,
      silenceDuration: config.silenceDuration,
      isEnabled: config.isEnabled,
    })
    setConfigModalVisible(true)
  }

  const handleSaveConfig = async (values: any) => {
    try {
      if (editingConfig) {
        await updateAlertConfig(editingConfig.id, values)
        message.success('更新成功')
      } else {
        await createAlertConfig(values)
        message.success('创建成功')
      }
      setConfigModalVisible(false)
      loadConfigs()
      loadSummary()
    } catch (error) {
      message.error('保存失败')
    }
  }

  const handleDeleteConfig = async (id: number) => {
    try {
      await deleteAlertConfig(id)
      message.success('删除成功')
      loadConfigs()
      loadSummary()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleToggleConfig = async (config: AlertConfig) => {
    try {
      await updateAlertConfig(config.id, { isEnabled: !config.isEnabled })
      message.success(config.isEnabled ? '已禁用' : '已启用')
      loadConfigs()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleCheckAlerts = async () => {
    setCheckLoading(true)
    try {
      const res = await checkAlerts()
      const result = res as any
      message.success(`检测完成，发现 ${result.alerted} 个预警`)
      loadSummary()
      loadRecords()
    } catch (error) {
      message.error('检测失败')
    } finally {
      setCheckLoading(false)
    }
  }

  const handleViewRecord = (record: AlertRecord) => {
    setCurrentRecord(record)
    handleForm.resetFields()
    setRecordDrawerVisible(true)
  }

  const handleProcessRecord = async (values: any) => {
    if (!currentRecord) return
    try {
      await handleAlertRecord(currentRecord.id, values)
      message.success('处理完成')
      setRecordDrawerVisible(false)
      loadRecords()
      loadSummary()
    } catch (error) {
      message.error('处理失败')
    }
  }

  const getLevelTag = (level: string) => {
    const levelMap: Record<string, { color: string; text: string }> = {
      low: { color: 'blue', text: '低' },
      medium: { color: 'gold', text: '中' },
      high: { color: 'orange', text: '高' },
      urgent: { color: 'red', text: '紧急' },
    }
    const conf = levelMap[level] || { color: 'default', text: level }
    return <Tag color={conf.color}>{conf.text}</Tag>
  }

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string; icon: any }> = {
      pending: { color: 'processing', text: '待处理', icon: <Clock size={14} /> },
      processing: { color: 'blue', text: '处理中', icon: <Settings size={14} /> },
      resolved: { color: 'success', text: '已解决', icon: <CheckCircle size={14} /> },
      ignored: { color: 'default', text: '已忽略', icon: <XCircle size={14} /> },
    }
    const conf = statusMap[status] || { color: 'default', text: status, icon: null }
    return (
      <Tag color={conf.color}>
        <Space size={4}>
          {conf.icon}
          {conf.text}
        </Space>
      </Tag>
    )
  }

  const getOperatorLabel = (operator: string) => {
    const operatorMap: Record<string, string> = {
      gt: '>',
      gte: '≥',
      lt: '<',
      lte: '≤',
      eq: '=',
      ne: '≠',
    }
    return operatorMap[operator] || operator
  }

  const getMetricLabel = (metricType: string) => {
    const metric = metrics.find((m) => m.value === metricType)
    return metric?.label || metricType
  }

  const getMetricUnit = (metricType: string) => {
    const metric = metrics.find((m) => m.value === metricType)
    return metric?.unit || ''
  }

  const recordColumns: ColumnsType<AlertRecord> = [
    {
      title: '预警级别',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level) => getLevelTag(level),
    },
    {
      title: '预警名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
    },
    {
      title: '指标类型',
      dataIndex: 'metricType',
      key: 'metricType',
      width: 160,
      render: (metricType) => getMetricLabel(metricType),
    },
    {
      title: '当前值/阈值',
      key: 'value',
      width: 160,
      render: (_, record) => (
        <span>
          <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>{record.currentValue}</span>
          <span style={{ margin: '0 4px' }}>{getOperatorLabel(record.operator)}</span>
          <span>{record.threshold}</span>
          <span style={{ color: '#999', marginLeft: 4 }}>{getMetricUnit(record.metricType)}</span>
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => getStatusTag(status),
    },
    {
      title: '预警时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
    },
    {
      title: '处理人',
      dataIndex: 'handler',
      key: 'handler',
      width: 100,
      render: (handler) => handler || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<Eye size={14} />} onClick={() => handleViewRecord(record)}>
            详情
          </Button>
        </Space>
      ),
    },
  ]

  const configColumns: ColumnsType<AlertConfig> = [
    {
      title: '预警名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
    },
    {
      title: '指标类型',
      dataIndex: 'metricType',
      key: 'metricType',
      width: 160,
      render: (metricType) => getMetricLabel(metricType),
    },
    {
      title: '预警条件',
      key: 'condition',
      width: 200,
      render: (_, record) => (
        <span>
          {getMetricLabel(record.metricType)}
          <span style={{ margin: '0 4px', color: '#1890FF', fontWeight: 'bold' }}>
            {getOperatorLabel(record.operator)}
          </span>
          <span style={{ fontWeight: 'bold' }}>{record.threshold}</span>
          <span style={{ color: '#999', marginLeft: 4 }}>{getMetricUnit(record.metricType)}</span>
        </span>
      ),
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (level) => getLevelTag(level),
    },
    {
      title: '检测周期',
      dataIndex: 'checkInterval',
      key: 'checkInterval',
      width: 100,
      render: (val) => `${val}分钟`,
    },
    {
      title: '通知方式',
      dataIndex: 'notifyChannels',
      key: 'notifyChannels',
      width: 140,
      render: (channels) => (
        <Space size={4}>
          {channels?.includes('system') && (
            <Tooltip title="系统通知">
              <Bell size={16} color="#1890FF" />
            </Tooltip>
          )}
          {channels?.includes('email') && (
            <Tooltip title="邮件">
              <Mail size={16} color="#52C41A" />
            </Tooltip>
          )}
          {channels?.includes('sms') && (
            <Tooltip title="短信">
              <Smartphone size={16} color="#FAAD14" />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: '最近检测',
      dataIndex: 'lastCheckTime',
      key: 'lastCheckTime',
      width: 180,
      render: (time) => time ? new Date(time).toLocaleString() : '-',
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_, record) => (
        <Switch
          checked={record.isEnabled}
          onChange={() => handleToggleConfig(record)}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<Edit size={14} />} onClick={() => handleEditConfig(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description={`确定要删除预警配置「${record.name}」吗？`}
            onConfirm={() => handleDeleteConfig(record.id)}
          >
            <Button type="link" size="small" danger icon={<Trash2 size={14} />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="page-title">数据预警中心</h2>
          <p style={{ color: '#888', margin: 0 }}>关键指标阈值设置、预警消息推送、预警记录追踪处理</p>
        </div>
        <Space>
          <Button
            icon={<Play size={16} />}
            onClick={handleCheckAlerts}
            loading={checkLoading}
          >
            立即检测
          </Button>
          <Button type="primary" icon={<Plus size={16} />} onClick={handleCreateConfig}>
            新建预警配置
          </Button>
        </Space>
      </div>

      {summary && (
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card>
              <Statistic
                title={<Space><Bell size={16} /> 预警总数</Space>}
                value={summary.total}
                valueStyle={{ color: '#1890FF' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card>
              <Statistic
                title={<Space><Clock size={16} /> 待处理</Space>}
                value={summary.pending}
                valueStyle={{ color: '#FF7A45' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card>
              <Statistic
                title={<Space><Settings size={16} /> 处理中</Space>}
                value={summary.processing}
                valueStyle={{ color: '#1890FF' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card>
              <Statistic
                title={<Space><CheckCircle size={16} /> 已解决</Space>}
                value={summary.resolved}
                valueStyle={{ color: '#52C41A' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card>
              <Statistic
                title={<Space><XCircle size={16} /> 已忽略</Space>}
                value={summary.ignored}
                valueStyle={{ color: '#999' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card>
              <Statistic
                title={<Space><AlertTriangle size={16} /> 紧急预警</Space>}
                value={summary.levelStats?.urgent || 0}
                valueStyle={{ color: '#F5222D' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {summary?.pending && summary.pending > 0 && (
        <Alert
          message={`当前有 ${summary.pending} 条待处理预警`}
          type="warning"
          showIcon
          action={
            <Button size="small" type="primary" onClick={() => setActiveTab('records')}>
              立即处理
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      )}

      <Card bordered={false}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'records',
              label: (
                <Space>
                  <Badge count={summary?.pending} size="small">
                    <Bell size={16} />
                  </Badge>
                  预警记录
                </Space>
              ),
              children: (
                <div>
                  <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <Select
                      placeholder="筛选状态"
                      style={{ width: 140 }}
                      allowClear
                      value={filters.status}
                      onChange={(val) => setFilters({ ...filters, status: val })}
                    >
                      <Option value="pending">待处理</Option>
                      <Option value="processing">处理中</Option>
                      <Option value="resolved">已解决</Option>
                      <Option value="ignored">已忽略</Option>
                    </Select>
                    <Select
                      placeholder="筛选级别"
                      style={{ width: 140 }}
                      allowClear
                      value={filters.level}
                      onChange={(val) => setFilters({ ...filters, level: val })}
                    >
                      <Option value="low">低</Option>
                      <Option value="medium">中</Option>
                      <Option value="high">高</Option>
                      <Option value="urgent">紧急</Option>
                    </Select>
                    <Select
                      placeholder="筛选指标"
                      style={{ width: 180 }}
                      allowClear
                      value={filters.metricType}
                      onChange={(val) => setFilters({ ...filters, metricType: val })}
                    >
                      {metrics.map((m) => (
                        <Option key={m.value} value={m.value}>{m.label}</Option>
                      ))}
                    </Select>
                  </div>
                  <Table
                    columns={recordColumns}
                    dataSource={records}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                      ...pagination,
                      total: recordsTotal,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total) => `共 ${total} 条记录`,
                      onChange: (page, pageSize) => setPagination({ page, pageSize }),
                    }}
                    rowClassName={(record) =>
                      record.status === 'pending' ? 'table-row-warning' : ''
                    }
                  />
                </div>
              ),
            },
            {
              key: 'configs',
              label: (
                <Space>
                  <Settings size={16} />
                  预警配置
                </Space>
              ),
              children: (
                <Table
                  columns={configColumns}
                  dataSource={configs}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={editingConfig ? '编辑预警配置' : '新建预警配置'}
        open={configModalVisible}
        onCancel={() => setConfigModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form form={configForm} layout="vertical" onFinish={handleSaveConfig}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="预警名称"
                rules={[{ required: true, message: '请输入预警名称' }]}
              >
                <Input placeholder="例如：设备在线率预警" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="metricType"
                label="预警指标"
                rules={[{ required: true, message: '请选择预警指标' }]}
              >
                <Select placeholder="请选择">
                  {metrics.map((m) => (
                    <Option key={m.value} value={m.value}>
                      {m.label} ({m.unit})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="level"
                label="预警级别"
                rules={[{ required: true, message: '请选择预警级别' }]}
              >
                <Select placeholder="请选择">
                  <Option value="low">低</Option>
                  <Option value="medium">中</Option>
                  <Option value="high">高</Option>
                  <Option value="urgent">紧急</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="operator"
                label="比较运算符"
                rules={[{ required: true, message: '请选择' }]}
              >
                <Select>
                  <Option value="gt">大于 {'(>)'}</Option>
                  <Option value="gte">大于等于 {'(≥)'}</Option>
                  <Option value="lt">小于 {'(<)'}</Option>
                  <Option value="lte">小于等于 {'(≤)'}</Option>
                  <Option value="eq">等于 (=)</Option>
                  <Option value="ne">不等于 (≠)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="threshold"
                label="阈值"
                rules={[{ required: true, message: '请输入阈值' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="请输入" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="isEnabled"
                label="立即启用"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="checkInterval"
                label="检测周期（分钟）"
                rules={[{ required: true, message: '请输入检测周期' }]}
              >
                <InputNumber style={{ width: '100%' }} min={1} placeholder="例如：60" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="silenceDuration"
                label="静默时间（分钟）"
                tooltip="避免重复预警，同一问题在此期间内只预警一次"
                rules={[{ required: true, message: '请输入静默时间' }]}
              >
                <InputNumber style={{ width: '100%' }} min={1} placeholder="例如：120" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="notifyChannels"
                label="通知方式"
                rules={[{ required: true, message: '请至少选择一种通知方式' }]}
              >
                <Select mode="multiple" placeholder="请选择通知方式">
                  <Option value="system">
                    <Space><Bell size={14} /> 系统通知</Space>
                  </Option>
                  <Option value="email">
                    <Space><Mail size={14} /> 邮件通知</Space>
                  </Option>
                  <Option value="sms">
                    <Space><Smartphone size={14} /> 短信通知</Space>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                <Space>
                  <Button onClick={() => setConfigModalVisible(false)}>取消</Button>
                  <Button type="primary" htmlType="submit">
                    {editingConfig ? '更新' : '创建'}
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Drawer
        title={
          <Space>
            {currentRecord && getLevelTag(currentRecord.level)}
            <span>预警详情</span>
          </Space>
        }
        placement="right"
        width={560}
        open={recordDrawerVisible}
        onClose={() => setRecordDrawerVisible(false)}
      >
        {currentRecord && (
          <div>
            <Alert
              message={currentRecord.message}
              type={currentRecord.level === 'urgent' || currentRecord.level === 'high' ? 'error' : 'warning'}
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Card size="small" title="预警信息" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ color: '#999', fontSize: 12, marginBottom: 4 }}>预警名称</div>
                  <div style={{ fontWeight: 'bold' }}>{currentRecord.name}</div>
                </Col>
                <Col span={12}>
                  <div style={{ color: '#999', fontSize: 12, marginBottom: 4 }}>指标类型</div>
                  <div>{getMetricLabel(currentRecord.metricType)}</div>
                </Col>
              </Row>
              <Divider style={{ margin: '12px 0' }} />
              <Row gutter={16}>
                <Col span={8}>
                  <div style={{ color: '#999', fontSize: 12, marginBottom: 4 }}>当前值</div>
                  <div style={{ color: '#ff4d4f', fontWeight: 'bold', fontSize: 18 }}>
                    {currentRecord.currentValue} {getMetricUnit(currentRecord.metricType)}
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ color: '#999', fontSize: 12, marginBottom: 4 }}>运算符</div>
                  <div style={{ fontSize: 18 }}>{getOperatorLabel(currentRecord.operator)}</div>
                </Col>
                <Col span={8}>
                  <div style={{ color: '#999', fontSize: 12, marginBottom: 4 }}>阈值</div>
                  <div style={{ fontSize: 18 }}>
                    {currentRecord.threshold} {getMetricUnit(currentRecord.metricType)}
                  </div>
                </Col>
              </Row>
            </Card>

            <Card size="small" title="处理信息" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ color: '#999', fontSize: 12, marginBottom: 4 }}>当前状态</div>
                  <div>{getStatusTag(currentRecord.status)}</div>
                </Col>
                <Col span={12}>
                  <div style={{ color: '#999', fontSize: 12, marginBottom: 4 }}>预警时间</div>
                  <div>{new Date(currentRecord.createdAt).toLocaleString()}</div>
                </Col>
              </Row>
              {currentRecord.handler && (
                <>
                  <Divider style={{ margin: '12px 0' }} />
                  <Row gutter={16}>
                    <Col span={12}>
                      <div style={{ color: '#999', fontSize: 12, marginBottom: 4 }}>处理人</div>
                      <div>{currentRecord.handler}</div>
                    </Col>
                    <Col span={12}>
                      <div style={{ color: '#999', fontSize: 12, marginBottom: 4 }}>处理时间</div>
                      <div>{currentRecord.handleTime ? new Date(currentRecord.handleTime).toLocaleString() : '-'}</div>
                    </Col>
                  </Row>
                </>
              )}
              {currentRecord.handleRemark && (
                <>
                  <Divider style={{ margin: '12px 0' }} />
                  <div style={{ color: '#999', fontSize: 12, marginBottom: 4 }}>处理备注</div>
                  <div>{currentRecord.handleRemark}</div>
                </>
              )}
            </Card>

            <Card size="small" title="通知信息">
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ color: '#999', fontSize: 12, marginBottom: 4 }}>通知状态</div>
                  <div>
                    {currentRecord.notifyStatus === 'sent' ? (
                      <Tag color="success">已发送</Tag>
                    ) : currentRecord.notifyStatus === 'failed' ? (
                      <Tag color="error">发送失败</Tag>
                    ) : (
                      <Tag color="default">待发送</Tag>
                    )}
                  </div>
                </Col>
              </Row>
              {currentRecord.notifyResult && (
                <>
                  <Divider style={{ margin: '12px 0' }} />
                  <div style={{ color: '#999', fontSize: 12, marginBottom: 4 }}>通知结果</div>
                  <div style={{ fontSize: 12, background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
                    {currentRecord.notifyResult}
                  </div>
                </>
              )}
            </Card>

            {currentRecord.status === 'pending' || currentRecord.status === 'processing' ? (
              <div style={{ marginTop: 24 }}>
                <Divider />
                <h4 style={{ marginBottom: 16 }}>
                  <Space>
                    <MessageSquare size={16} />
                    处理预警
                  </Space>
                </h4>
                <Form form={handleForm} layout="vertical" onFinish={handleProcessRecord}>
                  <Form.Item
                    name="status"
                    label="处理状态"
                    rules={[{ required: true, message: '请选择处理状态' }]}
                  >
                    <Select placeholder="请选择">
                      <Option value="processing">标记为处理中</Option>
                      <Option value="resolved">标记为已解决</Option>
                      <Option value="ignored">标记为已忽略</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name="handleRemark" label="处理备注">
                    <TextArea rows={3} placeholder="请输入处理备注（可选）" />
                  </Form.Item>
                  <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                    <Button type="primary" htmlType="submit">
                      提交处理
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            ) : null}
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default AlertCenter
