import { useEffect, useState } from 'react'
import { Button, Modal, Form, Input, Select, Space, App, Drawer, Descriptions, Popconfirm, Table } from 'antd'
import { EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { FilterBar, DataTable } from '../../components'
import { getRestockList, getRestock, createRestock, updateRestock, deleteRestock, importRestock, exportRestock, getDeviceList } from '../../api'
import type { Restock, Device } from '../../types'

function Restocks() {
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Restock[]>([])
  const [total, setTotal] = useState(0)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [filters, setFilters] = useState<any>({})
  const [deviceOptions, setDeviceOptions] = useState<{ label: string; value: string }[]>([])
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Restock | null>(null)
  const [form] = Form.useForm()
  const [items, setItems] = useState<any[]>([{ productName: '', quantity: 10 }])
  
  const [detailVisible, setDetailVisible] = useState(false)
  const [detailRecord, setDetailRecord] = useState<Restock | null>(null)

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
      const res: any = await getRestockList(params)
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
    setItems([{ productName: '', quantity: 10 }])
    setModalVisible(true)
  }

  const handleEdit = (record: Restock) => {
    setEditingRecord(record)
    form.setFieldsValue(record)
    setItems(record.items.map(item => ({ ...item })))
    setModalVisible(true)
  }

  const handleView = async (record: Restock) => {
    const res = await getRestock(record.id)
    setDetailRecord(res as Restock)
    setDetailVisible(true)
  }

  const handleDelete = async (id: string) => {
    await deleteRestock(id)
    message.success('删除成功')
    loadData()
  }

  const handleBatchDelete = async (ids: string[]) => {
    await Promise.all(ids.map(id => deleteRestock(id)))
    message.success(`成功删除 ${ids.length} 条数据`)
    setSelectedRowKeys([])
    loadData()
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (items.some(item => !item.productName || item.quantity <= 0)) {
        message.error('请填写完整的补货商品信息')
        return
      }
      const submitData = {
        ...values,
        items,
        operator: '当前用户'
      }
      if (editingRecord) {
        await updateRestock(editingRecord.id, submitData)
        message.success('更新成功')
      } else {
        await createRestock(submitData)
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
        await importRestock(file)
        message.success('导入成功')
        loadData()
      }
    }
    input.click()
  }

  const handleExport = async () => {
    await exportRestock(filters)
    message.success('导出成功')
  }

  const addItem = () => {
    setItems([...items, { productName: '', quantity: 10 }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const columns: ColumnsType<Restock> = [
    {
      title: '补货单号',
      dataIndex: 'code',
      key: 'code',
      width: 120
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
      title: '补货商品',
      dataIndex: 'items',
      key: 'items',
      width: 200,
      render: (items) => items.map((i: any) => `${i.productName}×${i.quantity}`).join(', ')
    },
    {
      title: '补货数量',
      dataIndex: 'items',
      key: 'total',
      width: 100,
      render: (items) => items.reduce((sum: number, i: any) => sum + i.quantity, 0)
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 100
    },
    {
      title: '补货时间',
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
            title="确定要删除这条补货记录吗？"
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

  const itemColumns = [
    {
      title: '商品名称',
      dataIndex: 'productName',
      width: 150,
      render: (_: any, record: any, index: number) => (
        <Select
          value={record.productName}
          onChange={(value) => updateItem(index, 'productName', value)}
          options={products}
          style={{ width: '100%' }}
          placeholder="请选择商品"
        />
      )
    },
    {
      title: '补货数量',
      dataIndex: 'quantity',
      width: 150,
      render: (_: any, record: any, index: number) => (
        <Input
          type="number"
          min={1}
          value={record.quantity}
          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
          placeholder="请输入数量"
        />
      )
    },
    {
      title: '操作',
      width: 80,
      render: (_: any, __: any, index: number) => (
        <Button
          type="text"
          danger
          icon={<MinusOutlined />}
          onClick={() => removeItem(index)}
          disabled={items.length <= 1}
        />
      )
    }
  ]

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">补货记录</h2>
      </div>

      <FilterBar
        showKeyword
        showDateRange
        keywordPlaceholder="请输入补货单号"
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
        scroll={{ x: 1100 }}
      />

      <Modal
        title={editingRecord ? '编辑补货' : '新增补货'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="deviceId"
            label="设备"
            rules={[{ required: true, message: '请选择设备' }]}
          >
            <Select placeholder="请选择设备" options={deviceOptions} />
          </Form.Item>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontWeight: 500 }}>补货商品</span>
              <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={addItem}>
                添加商品
              </Button>
            </div>
            <Table
              dataSource={items}
              columns={itemColumns}
              pagination={false}
              rowKey={(_record, index) => String(index)}
              size="small"
            />
          </div>
        </Form>
      </Modal>

      <Drawer
        title="补货详情"
        width={500}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        destroyOnClose
      >
        {detailRecord && (
          <>
            <Descriptions column={1} bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="补货单号">{detailRecord.code}</Descriptions.Item>
              <Descriptions.Item label="设备名称">{detailRecord.deviceName}</Descriptions.Item>
              <Descriptions.Item label="所属点位">{detailRecord.pointName}</Descriptions.Item>
              <Descriptions.Item label="操作人">{detailRecord.operator}</Descriptions.Item>
              <Descriptions.Item label="补货时间">{detailRecord.createdAt}</Descriptions.Item>
            </Descriptions>
            <h4 style={{ marginBottom: 8 }}>补货明细</h4>
            <Table
              dataSource={detailRecord.items}
              columns={[
                { title: '商品名称', dataIndex: 'productName' },
                { title: '补货数量', dataIndex: 'quantity' }
              ]}
              pagination={false}
              size="small"
              rowKey="productId"
            />
          </>
        )}
      </Drawer>
    </div>
  )
}

export default Restocks
