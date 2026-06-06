import { useEffect, useState } from 'react'
import { Button, Modal, Form, Input, Select, Space, App, Drawer, Descriptions, Popconfirm, Tag } from 'antd'
import { EditOutlined, DeleteOutlined, EyeOutlined, PlayCircleOutlined, CheckCircleOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { FilterBar, DataTable, StatusTag } from '../../components'
import { getRepairList, getRepair, createRepair, updateRepair, deleteRepair, importRepair, exportRepair, getDeviceList } from '../../api'
import type { Repair, Device } from '../../types'

function Repairs() {
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Repair[]>([])
  const [total, setTotal] = useState(0)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [filters, setFilters] = useState<any>({})
  const [deviceOptions, setDeviceOptions] = useState<{ label: string; value: string }[]>([])
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Repair | null>(null)
  const [form] = Form.useForm()
  
  const [detailVisible, setDetailVisible] = useState(false)
  const [detailRecord, setDetailRecord] = useState<Repair | null>(null)

  const statusOptions = [
    { label: '待处理', value: 'pending' },
    { label: '处理中', value: 'processing' },
    { label: '已完成', value: 'completed' },
    { label: '已取消', value: 'cancelled' }
  ]

  const typeOptions = [
    { label: '硬件故障', value: '硬件故障' },
    { label: '软件故障', value: '软件故障' },
    { label: '网络故障', value: '网络故障' },
    { label: '其他', value: '其他' }
  ]

  const priorityColors: Record<string, string> = {
    '硬件故障': 'red',
    '软件故障': 'orange',
    '网络故障': 'blue',
    '其他': 'default'
  }

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
      const res: any = await getRepairList(params)
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
    setModalVisible(true)
  }

  const handleEdit = (record: Repair) => {
    setEditingRecord(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleView = async (record: Repair) => {
    const res = await getRepair(record.id)
    setDetailRecord(res as Repair)
    setDetailVisible(true)
  }

  const handleDelete = async (id: string) => {
    await deleteRepair(id)
    message.success('删除成功')
    loadData()
  }

  const handleBatchDelete = async (ids: string[]) => {
    await Promise.all(ids.map(id => deleteRepair(id)))
    message.success(`成功删除 ${ids.length} 条数据`)
    setSelectedRowKeys([])
    loadData()
  }

  const handleStatusChange = async (record: Repair, newStatus: string) => {
    await updateRepair(record.id, { status: newStatus as any, handler: '当前用户' })
    message.success('状态更新成功')
    loadData()
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingRecord) {
        await updateRepair(editingRecord.id, values)
        message.success('更新成功')
      } else {
        await createRepair({ ...values, reporter: '当前用户' })
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
        await importRepair(file)
        message.success('导入成功')
        loadData()
      }
    }
    input.click()
  }

  const handleExport = async () => {
    await exportRepair(filters)
    message.success('导出成功')
  }

  const columns: ColumnsType<Repair> = [
    {
      title: '报修单号',
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
      title: '故障类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => <Tag color={priorityColors[type] || 'default'}>{type}</Tag>
    },
    {
      title: '故障描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => <StatusTag status={status} type="repair" />
    },
    {
      title: '报修人',
      dataIndex: 'reporter',
      key: 'reporter',
      width: 100
    },
    {
      title: '处理人',
      dataIndex: 'handler',
      key: 'handler',
      width: 100,
      render: (handler) => handler || '-'
    },
    {
      title: '报修时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4} wrap>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            查看
          </Button>
          {record.status === 'pending' && (
            <Button
              type="link"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleStatusChange(record, 'processing')}
            >
              开始处理
            </Button>
          )}
          {record.status === 'processing' && (
            <Button
              type="link"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleStatusChange(record, 'completed')}
            >
              完成
            </Button>
          )}
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这条报修记录吗？"
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
        <h2 className="page-title">故障报修</h2>
      </div>

      <FilterBar
        showKeyword
        showStatus
        statusOptions={statusOptions}
        keywordPlaceholder="请输入报修单号/描述"
        onSearch={handleSearch}
        onReset={handleReset}
      >
        <Form.Item name="type" label="故障类型" style={{ marginBottom: 0 }}>
          <Select placeholder="请选择故障类型" allowClear options={typeOptions} style={{ width: 150 }} />
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
        scroll={{ x: 1300 }}
      />

      <Modal
        title={editingRecord ? '编辑报修' : '新增报修'}
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
              name="type"
              label="故障类型"
              rules={[{ required: true, message: '请选择故障类型' }]}
              style={{ flex: 1, minWidth: 200 }}
            >
              <Select placeholder="请选择故障类型" options={typeOptions} />
            </Form.Item>
          </div>
          <Form.Item
            name="description"
            label="故障描述"
            rules={[{ required: true, message: '请输入故障描述' }]}
          >
            <Input.TextArea rows={4} placeholder="请详细描述故障情况" />
          </Form.Item>
          {editingRecord && (
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
                style={{ flex: 1, minWidth: 200 }}
              >
                <Select placeholder="请选择状态" options={statusOptions} />
              </Form.Item>
              <Form.Item
                name="handler"
                label="处理人"
                style={{ flex: 1, minWidth: 200 }}
              >
                <Input placeholder="请输入处理人" />
              </Form.Item>
            </div>
          )}
        </Form>
      </Modal>

      <Drawer
        title="报修详情"
        width={500}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        destroyOnClose
      >
        {detailRecord && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="报修单号">{detailRecord.code}</Descriptions.Item>
            <Descriptions.Item label="设备名称">{detailRecord.deviceName}</Descriptions.Item>
            <Descriptions.Item label="所属点位">{detailRecord.pointName}</Descriptions.Item>
            <Descriptions.Item label="故障类型">
              <Tag color={priorityColors[detailRecord.type] || 'default'}>{detailRecord.type}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="故障描述">{detailRecord.description}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <StatusTag status={detailRecord.status} type="repair" />
            </Descriptions.Item>
            <Descriptions.Item label="报修人">{detailRecord.reporter}</Descriptions.Item>
            <Descriptions.Item label="处理人">{detailRecord.handler || '-'}</Descriptions.Item>
            <Descriptions.Item label="报修时间">{detailRecord.createdAt}</Descriptions.Item>
            <Descriptions.Item label="完成时间">{detailRecord.completedAt || '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  )
}

export default Repairs
