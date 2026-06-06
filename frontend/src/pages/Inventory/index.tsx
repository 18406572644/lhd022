import { useEffect, useState } from 'react'
import { Button, Modal, Form, Input, Select, Space, App, Drawer, Descriptions, Popconfirm, Table, Tag } from 'antd'
import { EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { FilterBar, DataTable, StatusTag } from '../../components'
import { getInventoryList, getInventory, createInventory, updateInventory, deleteInventory, importInventory, exportInventory, getPointList } from '../../api'
import type { Inventory, Point } from '../../types'

function InventoryPage() {
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Inventory[]>([])
  const [total, setTotal] = useState(0)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [filters, setFilters] = useState<any>({})
  const [pointOptions, setPointOptions] = useState<{ label: string; value: string }[]>([])
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Inventory | null>(null)
  const [form] = Form.useForm()
  const [items, setItems] = useState<any[]>([{ productName: '', expectedQuantity: 10, actualQuantity: 10 }])
  
  const [detailVisible, setDetailVisible] = useState(false)
  const [detailRecord, setDetailRecord] = useState<Inventory | null>(null)

  const statusOptions = [
    { label: '草稿', value: 'draft' },
    { label: '已确认', value: 'confirmed' }
  ]

  const products = [
    { label: '充电宝', value: '充电宝' },
    { label: '雨伞', value: '雨伞' },
    { label: '数据线', value: '数据线' },
    { label: '耳机', value: '耳机' },
    { label: '充电器', value: '充电器' }
  ]

  const loadPoints = async () => {
    try {
      const res: any = await getPointList({ page: 1, pageSize: 1000 })
      if (res.list) {
        setPointOptions(res.list.map((p: Point) => ({ label: p.name, value: p.id })))
      }
    } catch (error) {
      console.error('Failed to load points:', error)
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
      const res: any = await getInventoryList(params)
      setData(res.list || [])
      setTotal(res.total || 0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPoints()
  }, [])

  useEffect(() => {
    loadData()
  }, [pagination.current, pagination.pageSize, filters])

  const handleSearch = (values: any) => {
    setFilters(values)
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const handleReset = () => {
    setFilters({})
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  const handleAdd = () => {
    setEditingRecord(null)
    form.resetFields()
    setItems([{ productName: '', expectedQuantity: 10, actualQuantity: 10 }])
    setModalVisible(true)
  }

  const handleEdit = (record: Inventory) => {
    setEditingRecord(record)
    form.setFieldsValue(record)
    setItems(record.items.map(item => ({ 
      ...item, 
      difference: item.actualQuantity - item.expectedQuantity 
    })))
    setModalVisible(true)
  }

  const handleView = async (record: Inventory) => {
    const res = await getInventory(record.id)
    setDetailRecord(res as Inventory)
    setDetailVisible(true)
  }

  const handleDelete = async (id: string) => {
    await deleteInventory(id)
    message.success('删除成功')
    loadData()
  }

  const handleBatchDelete = async (ids: string[]) => {
    await Promise.all(ids.map(id => deleteInventory(id)))
    message.success(`成功删除 ${ids.length} 条数据`)
    setSelectedRowKeys([])
    loadData()
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (items.some(item => !item.productName || item.expectedQuantity < 0 || item.actualQuantity < 0)) {
        message.error('请填写完整的盘点商品信息')
        return
      }
      const submitItems = items.map(item => ({
        ...item,
        difference: item.actualQuantity - item.expectedQuantity
      }))
      const submitData = {
        ...values,
        items: submitItems,
        operator: '当前用户'
      }
      if (editingRecord) {
        await updateInventory(editingRecord.id, submitData)
        message.success('更新成功')
      } else {
        await createInventory(submitData)
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
        await importInventory(file)
        message.success('导入成功')
        loadData()
      }
    }
    input.click()
  }

  const handleExport = async () => {
    await exportInventory(filters)
    message.success('导出成功')
  }

  const addItem = () => {
    setItems([...items, { productName: '', expectedQuantity: 10, actualQuantity: 10 }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { 
      ...newItems[index], 
      [field]: value,
      difference: field === 'expectedQuantity' || field === 'actualQuantity' 
        ? (field === 'actualQuantity' ? value : newItems[index].actualQuantity) - 
          (field === 'expectedQuantity' ? value : newItems[index].expectedQuantity)
        : newItems[index].difference
    }
    setItems(newItems)
  }

  const getDifferenceTag = (diff: number) => {
    if (diff > 0) return <Tag color="success">+{diff}</Tag>
    if (diff < 0) return <Tag color="error">{diff}</Tag>
    return <Tag>0</Tag>
  }

  const columns: ColumnsType<Inventory> = [
    {
      title: '盘点单号',
      dataIndex: 'code',
      key: 'code',
      width: 120
    },
    {
      title: '所属点位',
      dataIndex: 'pointName',
      key: 'pointName',
      width: 150
    },
    {
      title: '盘点商品',
      dataIndex: 'items',
      key: 'items',
      width: 200,
      render: (items) => items.map((i: any) => i.productName).join(', ')
    },
    {
      title: '损耗数量',
      dataIndex: 'items',
      key: 'loss',
      width: 100,
      render: (items) => {
        const loss = items.filter((i: any) => i.difference < 0).reduce((sum: number, i: any) => sum + Math.abs(i.difference), 0)
        return loss > 0 ? <span style={{ color: '#F5222D', fontWeight: 600 }}>{loss}</span> : 0
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => <StatusTag status={status} type="inventory" />
    },
    {
      title: '盘点人',
      dataIndex: 'operator',
      key: 'operator',
      width: 100
    },
    {
      title: '盘点时间',
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
            title="确定要删除这条盘点记录吗？"
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
      title: '账面数量',
      dataIndex: 'expectedQuantity',
      width: 120,
      render: (_: any, record: any, index: number) => (
        <Input
          type="number"
          min={0}
          value={record.expectedQuantity}
          onChange={(e) => updateItem(index, 'expectedQuantity', parseInt(e.target.value) || 0)}
          placeholder="账面数量"
        />
      )
    },
    {
      title: '实际数量',
      dataIndex: 'actualQuantity',
      width: 120,
      render: (_: any, record: any, index: number) => (
        <Input
          type="number"
          min={0}
          value={record.actualQuantity}
          onChange={(e) => updateItem(index, 'actualQuantity', parseInt(e.target.value) || 0)}
          placeholder="实际数量"
        />
      )
    },
    {
      title: '差异',
      dataIndex: 'difference',
      width: 80,
      render: (_: any, record: any) => getDifferenceTag(record.actualQuantity - record.expectedQuantity)
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
        <h2 className="page-title">损耗盘点</h2>
      </div>

      <FilterBar
        showKeyword
        showStatus
        statusOptions={statusOptions}
        keywordPlaceholder="请输入盘点单号"
        onSearch={handleSearch}
        onReset={handleReset}
      >
        <Form.Item name="pointId" label="所属点位" style={{ marginBottom: 0 }}>
          <Select placeholder="请选择点位" allowClear options={pointOptions} style={{ width: 150 }} />
        </Form.Item>
      </FilterBar>

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
        title={editingRecord ? '编辑盘点' : '新增盘点'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={750}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Form.Item
              name="pointId"
              label="所属点位"
              rules={[{ required: true, message: '请选择点位' }]}
              style={{ flex: 1, minWidth: 200 }}
            >
              <Select placeholder="请选择点位" options={pointOptions} />
            </Form.Item>
            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
              style={{ flex: 1, minWidth: 200 }}
            >
              <Select placeholder="请选择状态" options={statusOptions} />
            </Form.Item>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontWeight: 500 }}>盘点商品</span>
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
        title="盘点详情"
        width={550}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        destroyOnClose
      >
        {detailRecord && (
          <>
            <Descriptions column={1} bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="盘点单号">{detailRecord.code}</Descriptions.Item>
              <Descriptions.Item label="所属点位">{detailRecord.pointName}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <StatusTag status={detailRecord.status} type="inventory" />
              </Descriptions.Item>
              <Descriptions.Item label="盘点人">{detailRecord.operator}</Descriptions.Item>
              <Descriptions.Item label="盘点时间">{detailRecord.createdAt}</Descriptions.Item>
            </Descriptions>
            <h4 style={{ marginBottom: 8 }}>盘点明细</h4>
            <Table
              dataSource={detailRecord.items}
              columns={[
                { title: '商品名称', dataIndex: 'productName' },
                { title: '账面数量', dataIndex: 'expectedQuantity' },
                { title: '实际数量', dataIndex: 'actualQuantity' },
                { 
                  title: '差异', 
                  dataIndex: 'difference',
                  render: (diff) => getDifferenceTag(diff)
                }
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

export default InventoryPage
