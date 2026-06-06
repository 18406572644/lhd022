import { useEffect, useState } from 'react'
import { Button, Modal, Form, Input, Select, Space, App, Drawer, Descriptions, Popconfirm } from 'antd'
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { FilterBar, DataTable, StatusTag } from '../../components'
import { getDeviceList, getDevice, createDevice, updateDevice, deleteDevice, importDevice, exportDevice, getPointList } from '../../api'
import type { Device, Point } from '../../types'

function Devices() {
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Device[]>([])
  const [total, setTotal] = useState(0)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [filters, setFilters] = useState<any>({})
  const [pointOptions, setPointOptions] = useState<{ label: string; value: string }[]>([])
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Device | null>(null)
  const [form] = Form.useForm()
  
  const [detailVisible, setDetailVisible] = useState(false)
  const [detailRecord, setDetailRecord] = useState<Device | null>(null)

  const statusOptions = [
    { label: '在线', value: 'online' },
    { label: '离线', value: 'offline' },
    { label: '故障', value: 'fault' }
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
      const res: any = await getDeviceList(params)
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
    setModalVisible(true)
  }

  const handleEdit = (record: Device) => {
    setEditingRecord(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleView = async (record: Device) => {
    const res = await getDevice(record.id)
    setDetailRecord(res as Device)
    setDetailVisible(true)
  }

  const handleDelete = async (id: string) => {
    await deleteDevice(id)
    message.success('删除成功')
    loadData()
  }

  const handleBatchDelete = async (ids: string[]) => {
    await Promise.all(ids.map(id => deleteDevice(id)))
    message.success(`成功删除 ${ids.length} 条数据`)
    setSelectedRowKeys([])
    loadData()
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingRecord) {
        await updateDevice(editingRecord.id, values)
        message.success('更新成功')
      } else {
        await createDevice(values)
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
        await importDevice(file)
        message.success('导入成功')
        loadData()
      }
    }
    input.click()
  }

  const handleExport = async () => {
    await exportDevice(filters)
    message.success('导出成功')
  }

  const columns: ColumnsType<Device> = [
    {
      title: 'SN码',
      dataIndex: 'code',
      key: 'code',
      width: 160
    },
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
      width: 150
    },
    {
      title: '设备型号',
      dataIndex: 'model',
      key: 'model',
      width: 120
    },
    {
      title: '所属点位',
      dataIndex: 'pointName',
      key: 'pointName',
      width: 150
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => <StatusTag status={status} type="device" />
    },
    {
      title: '最后心跳',
      dataIndex: 'lastHeartbeat',
      key: 'lastHeartbeat',
      width: 180
    },
    {
      title: '安装日期',
      dataIndex: 'installationDate',
      key: 'installationDate',
      width: 120
    },
    {
      title: '创建时间',
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
            title="确定要删除这个设备吗？"
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
        <h2 className="page-title">设备台账</h2>
      </div>

      <FilterBar
        showKeyword
        showStatus
        statusOptions={statusOptions}
        keywordPlaceholder="请输入设备名称/SN码"
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
        title={editingRecord ? '编辑设备' : '新增设备'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Form.Item
              name="name"
              label="设备名称"
              rules={[{ required: true, message: '请输入设备名称' }]}
              style={{ flex: 1, minWidth: 200 }}
            >
              <Input placeholder="请输入设备名称" />
            </Form.Item>
            <Form.Item
              name="code"
              label="SN码"
              rules={[{ required: true, message: '请输入SN码' }]}
              style={{ flex: 1, minWidth: 200 }}
            >
              <Input placeholder="请输入SN码" />
            </Form.Item>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Form.Item
              name="model"
              label="设备型号"
              rules={[{ required: true, message: '请输入设备型号' }]}
              style={{ flex: 1, minWidth: 200 }}
            >
              <Input placeholder="请输入设备型号" />
            </Form.Item>
            <Form.Item
              name="pointId"
              label="所属点位"
              rules={[{ required: true, message: '请选择所属点位' }]}
              style={{ flex: 1, minWidth: 200 }}
            >
              <Select placeholder="请选择所属点位" options={pointOptions} />
            </Form.Item>
          </div>
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
              name="installationDate"
              label="安装日期"
              rules={[{ required: true, message: '请选择安装日期' }]}
              style={{ flex: 1, minWidth: 200 }}
            >
              <Input type="date" />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Drawer
        title="设备详情"
        width={500}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        destroyOnClose
      >
        {detailRecord && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="SN码">{detailRecord.code}</Descriptions.Item>
            <Descriptions.Item label="设备名称">{detailRecord.name}</Descriptions.Item>
            <Descriptions.Item label="设备型号">{detailRecord.model}</Descriptions.Item>
            <Descriptions.Item label="所属点位">{detailRecord.pointName}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <StatusTag status={detailRecord.status} type="device" />
            </Descriptions.Item>
            <Descriptions.Item label="最后心跳">{detailRecord.lastHeartbeat}</Descriptions.Item>
            <Descriptions.Item label="安装日期">{detailRecord.installationDate}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{detailRecord.createdAt}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{detailRecord.updatedAt}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  )
}

export default Devices
