import { useEffect, useState } from 'react'
import { Button, Modal, Form, Input, Select, Space, App, Drawer, Descriptions, Popconfirm, Statistic, Row, Col, Card } from 'antd'
import { EditOutlined, DeleteOutlined, EyeOutlined, DollarOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { FilterBar, DataTable, StatusTag } from '../../components'
import { getOrderList, getOrder, createOrder, updateOrder, deleteOrder, importOrder, exportOrder, getDeviceList } from '../../api'
import type { Order, Device } from '../../types'

function Orders() {
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [filters, setFilters] = useState<any>({})
  const [deviceOptions, setDeviceOptions] = useState<{ label: string; value: string }[]>([])
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Order | null>(null)
  const [form] = Form.useForm()
  
  const [detailVisible, setDetailVisible] = useState(false)
  const [detailRecord, setDetailRecord] = useState<Order | null>(null)

  const statusOptions = [
    { label: '已完成', value: 'completed' },
    { label: '已退款', value: 'refunded' }
  ]

  const paymentOptions = [
    { label: '微信支付', value: '微信支付' },
    { label: '支付宝', value: '支付宝' },
    { label: '银行卡', value: '银行卡' }
  ]

  const products = [
    { label: '充电宝', value: '充电宝' },
    { label: '雨伞', value: '雨伞' },
    { label: '数据线', value: '数据线' },
    { label: '耳机', value: '耳机' },
    { label: '充电器', value: '充电器' }
  ]

  const loadDevices = async () => {
    try {
      const res: any = await getDeviceList({ page: 1, pageSize: 1000 })
      if (res.list) {
        setDeviceOptions(res.list.map((d: Device) => ({ label: d.name, value: d.id })))
      }
    } catch (error) {
      console.error('Failed to load devices:', error)
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...filters
      }
      const res: any = await getOrderList(params)
      setData(res.list || [])
      setTotal(res.total || 0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDevices()
  }, [])

  useEffect(() => {
    loadData()
  }, [pagination.current, pagination.pageSize, filters])

  const handleSearch = (values: any) => {
    const newFilters: any = {}
    if (values.keyword) newFilters.keyword = values.keyword
    if (values.status) newFilters.status = values.status
    if (values.dateRange) {
      newFilters.startDate = values.dateRange[0]?.format('YYYY-MM-DD')
      newFilters.endDate = values.dateRange[1]?.format('YYYY-MM-DD')
    }
    setFilters(newFilters)
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const handleReset = () => {
    setFilters({})
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const handleAdd = () => {
    setEditingRecord(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record: Order) => {
    setEditingRecord(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleView = async (record: Order) => {
    const res = await getOrder(record.id)
    setDetailRecord(res as Order)
    setDetailVisible(true)
  }

  const handleDelete = async (id: string) => {
    await deleteOrder(id)
    message.success('删除成功')
    loadData()
  }

  const handleBatchDelete = async (ids: string[]) => {
    await Promise.all(ids.map(id => deleteOrder(id)))
    message.success(`成功删除 ${ids.length} 条数据`)
    setSelectedRowKeys([])
    loadData()
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingRecord) {
        await updateOrder(editingRecord.id, values)
        message.success('更新成功')
      } else {
        await createOrder(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadData()
    } catch (error) {
      console.error('Form validation failed:', error)
    }
  }

  const handleImport = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.xlsx,.xls'
    input.onchange = async (e: any) => {
      const file = e.target.files[0]
      if (file) {
        await importOrder(file)
        message.success('导入成功')
        loadData()
      }
    }
    input.click()
  }

  const handleExport = async () => {
    await exportOrder(filters)
    message.success('导出成功')
  }

  const totalAmount = data.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.amount, 0)
  const completedCount = data.filter(o => o.status === 'completed').length
  const refundedCount = data.filter(o => o.status === 'refunded').length

  const columns: ColumnsType<Order> = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 180
    },
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
      width: 150
    },
    {
      title: '所属点位',
      dataIndex: 'pointName',
      key: 'pointName',
      width: 150
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 120
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
      render: (amount) => <span style={{ color: '#FF7A45', fontWeight: 600 }}>¥{amount}</span>
    },
    {
      title: '支付方式',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 100
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => <StatusTag status={status} type="order" />
    },
    {
      title: '交易时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            查看
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这条订单记录吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">租借流水</h2>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic
              title="交易总额"
              value={totalAmount}
              prefix={<DollarOutlined style={{ color: '#FF7A45' }} />}
              precision={2}
              valueStyle={{ color: '#FF7A45' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic
              title="已完成订单"
              value={completedCount}
              valueStyle={{ color: '#52C41A' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic
              title="已退款订单"
              value={refundedCount}
              valueStyle={{ color: '#FAAD14' }}
            />
          </Card>
        </Col>
      </Row>

      <FilterBar
        showKeyword
        showStatus
        showDateRange
        statusOptions={statusOptions}
        keywordPlaceholder="请输入订单号/商品名称"
        onSearch={handleSearch}
        onReset={handleReset}
      />

      <DataTable
        loading={loading}
        dataSource={data}
        columns={columns}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total,
          onChange: (page, pageSize) => setPagination({ current: page, pageSize })
        }}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys
        }}
        onAdd={handleAdd}
        onImport={handleImport}
        onExport={handleExport}
        onBatchDelete={handleBatchDelete}
        showBatchDelete
        scroll={{ x: 1200 }}
      />

      <Modal
        title={editingRecord ? '编辑订单' : '新增订单'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Form.Item
              name="deviceId"
              label="设备"
              rules={[{ required: true, message: '请选择设备' }]}
              style={{ flex: 1, minWidth: 200 }}
            >
              <Select placeholder="请选择设备" options={deviceOptions} />
            </Form.Item>
            <Form.Item
              name="productName"
              label="商品名称"
              rules={[{ required: true, message: '请选择商品' }]}
              style={{ flex: 1, minWidth: 200 }}
            >
              <Select placeholder="请选择商品" options={products} />
            </Form.Item>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Form.Item
              name="amount"
              label="金额"
              rules={[{ required: true, message: '请输入金额' }]}
              style={{ flex: 1, minWidth: 200 }}
            >
              <Input type="number" min={0} step={0.01} placeholder="请输入金额" prefix="¥" />
            </Form.Item>
            <Form.Item
              name="paymentMethod"
              label="支付方式"
              rules={[{ required: true, message: '请选择支付方式' }]}
              style={{ flex: 1, minWidth: 200 }}
            >
              <Select placeholder="请选择支付方式" options={paymentOptions} />
            </Form.Item>
          </div>
          {editingRecord && (
            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Select placeholder="请选择状态" options={statusOptions} />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Drawer
        title="订单详情"
        width={500}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        destroyOnClose
      >
        {detailRecord && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="订单号">{detailRecord.orderNo}</Descriptions.Item>
            <Descriptions.Item label="设备名称">{detailRecord.deviceName}</Descriptions.Item>
            <Descriptions.Item label="所属点位">{detailRecord.pointName}</Descriptions.Item>
            <Descriptions.Item label="商品名称">{detailRecord.productName}</Descriptions.Item>
            <Descriptions.Item label="金额">
              <span style={{ color: '#FF7A45', fontWeight: 600, fontSize: 18 }}>¥{detailRecord.amount}</span>
            </Descriptions.Item>
            <Descriptions.Item label="支付方式">{detailRecord.paymentMethod}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <StatusTag status={detailRecord.status} type="order" />
            </Descriptions.Item>
            <Descriptions.Item label="交易时间">{detailRecord.createdAt}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  )
}

export default Orders
