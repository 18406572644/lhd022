import { useEffect, useState } from 'react'
import { Button, Modal, Form, Input, Select, Space, App, Drawer, Descriptions, Popconfirm } from 'antd'
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { FilterBar, DataTable, StatusTag, ImageUpload } from '../../components'
import { getPointList, getPoint, createPoint, updatePoint, deletePoint, importPoint, exportPoint, getRegionList } from '../../api'
import type { Point, Region } from '../../types'

function Points() {
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Point[]>([])
  const [total, setTotal] = useState(0)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [filters, setFilters] = useState<any>({})
  const [regionOptions, setRegionOptions] = useState<{ label: string; value: string }[]>([])
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Point | null>(null)
  const [form] = Form.useForm()
  
  const [detailVisible, setDetailVisible] = useState(false)
  const [detailRecord, setDetailRecord] = useState<Point | null>(null)

  const statusOptions = [
    { label: '启用', value: 'active' },
    { label: '停用', value: 'inactive' }
  ]

  const loadRegions = async () => {
    try {
      const res = await getRegionList()
      if (Array.isArray(res)) {
        setRegionOptions(res.map((r: Region) => ({ label: r.name, value: r.id })))
      }
    } catch (error) {
      console.error('Failed to load regions:', error)
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
      const res: any = await getPointList(params)
      setData(res.list || [])
      setTotal(res.total || 0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRegions()
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

  const handleEdit = (record: Point) => {
    setEditingRecord(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleView = async (record: Point) => {
    const res = await getPoint(record.id)
    setDetailRecord(res as Point)
    setDetailVisible(true)
  }

  const handleDelete = async (id: string) => {
    await deletePoint(id)
    message.success('删除成功')
    loadData()
  }

  const handleBatchDelete = async (ids: string[]) => {
    await Promise.all(ids.map(id => deletePoint(id)))
    message.success(`成功删除 ${ids.length} 条数据`)
    setSelectedRowKeys([])
    loadData()
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingRecord) {
        await updatePoint(editingRecord.id, values)
        message.success('更新成功')
      } else {
        await createPoint(values)
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
        await importPoint(file)
        message.success('导入成功')
        loadData()
      }
    }
    input.click()
  }

  const handleExport = async () => {
    await exportPoint(filters)
    message.success('导出成功')
  }

  const columns: ColumnsType<Point> = [
    {
      title: '点位编码',
      dataIndex: 'code',
      key: 'code',
      width: 120
    },
    {
      title: '点位名称',
      dataIndex: 'name',
      key: 'name',
      width: 150
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true
    },
    {
      title: '所属区域',
      dataIndex: 'regionName',
      key: 'regionName',
      width: 120
    },
    {
      title: '联系人',
      dataIndex: 'contact',
      key: 'contact',
      width: 100
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 130
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => <StatusTag status={status} type="point" />
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
            title="确定要删除这个点位吗？"
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
        <h2 className="page-title">点位档案</h2>
      </div>

      <FilterBar
        showKeyword
        showRegion
        showStatus
        regionOptions={regionOptions}
        statusOptions={statusOptions}
        keywordPlaceholder="请输入点位名称/编码"
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
        scroll={{ x: 1000 }}
      />

      <Modal
        title={editingRecord ? '编辑点位' : '新增点位'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <Form.Item name="image" label="点位图片" style={{ marginBottom: 0 }}>
              <ImageUpload />
            </Form.Item>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Form.Item
              name="name"
              label="点位名称"
              rules={[{ required: true, message: '请输入点位名称' }]}
              style={{ flex: 1, minWidth: 200 }}
            >
              <Input placeholder="请输入点位名称" />
            </Form.Item>
            <Form.Item
              name="code"
              label="点位编码"
              rules={[{ required: true, message: '请输入点位编码' }]}
              style={{ flex: 1, minWidth: 200 }}
            >
              <Input placeholder="请输入点位编码" />
            </Form.Item>
          </div>
          <Form.Item
            name="address"
            label="详细地址"
            rules={[{ required: true, message: '请输入详细地址' }]}
          >
            <Input placeholder="请输入详细地址" />
          </Form.Item>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Form.Item
              name="regionId"
              label="所属区域"
              rules={[{ required: true, message: '请选择所属区域' }]}
              style={{ flex: 1, minWidth: 200 }}
            >
              <Select placeholder="请选择所属区域" options={regionOptions} />
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
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Form.Item
              name="contact"
              label="联系人"
              rules={[{ required: true, message: '请输入联系人' }]}
              style={{ flex: 1, minWidth: 200 }}
            >
              <Input placeholder="请输入联系人" />
            </Form.Item>
            <Form.Item
              name="phone"
              label="联系电话"
              rules={[
                { required: true, message: '请输入联系电话' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
              ]}
              style={{ flex: 1, minWidth: 200 }}
            >
              <Input placeholder="请输入联系电话" />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Drawer
        title="点位详情"
        width={500}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        destroyOnClose
      >
        {detailRecord && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="点位编码">{detailRecord.code}</Descriptions.Item>
            <Descriptions.Item label="点位名称">{detailRecord.name}</Descriptions.Item>
            <Descriptions.Item label="详细地址">{detailRecord.address}</Descriptions.Item>
            <Descriptions.Item label="所属区域">{detailRecord.regionName}</Descriptions.Item>
            <Descriptions.Item label="联系人">{detailRecord.contact}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{detailRecord.phone}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <StatusTag status={detailRecord.status} type="point" />
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">{detailRecord.createdAt}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{detailRecord.updatedAt}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  )
}

export default Points
