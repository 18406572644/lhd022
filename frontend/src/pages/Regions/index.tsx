import { useState, useEffect } from 'react'
import { Card, Tree, Button, Space, Modal, Form, Input, InputNumber, Select, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import { getRegionList, createRegion, updateRegion, deleteRegion } from '../../api/region'
import type { Region } from '../../types'

interface TreeNode {
  key: string
  title: string
  children?: TreeNode[]
}

function buildTree(regions: Region[], parentId?: string): TreeNode[] {
  return regions
    .filter((r) => r.parentId === parentId)
    .sort((a, b) => a.sort - b.sort)
    .map((r) => ({
      key: r.id,
      title: r.name,
      children: buildTree(regions, r.id)
    }))
}

function Regions() {
  const [data, setData] = useState<Region[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Region | null>(null)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [form] = Form.useForm()

  const treeData = buildTree(data)

  const fetchData = async () => {
    setLoading(true)
    try {
      const result = await getRegionList()
      setData(result as unknown as Region[])
    } catch (error) {
      message.error('获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSelect = (selectedKeys: React.Key[]) => {
    setSelectedKey(selectedKeys[0] as string | null)
  }

  const handleAdd = (parentId?: string) => {
    setEditingItem(null)
    const parent = parentId ? data.find((r) => r.id === parentId) : null
    form.resetFields()
    form.setFieldsValue({
      parentId: parentId || undefined,
      level: parent ? parent.level + 1 : 1,
      sort: data.filter((r) => r.parentId === parentId).length + 1
    })
    setModalOpen(true)
  }

  const handleEdit = (record: Region) => {
    setEditingItem(record)
    form.setFieldsValue(record)
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    const hasChildren = data.some((r) => r.parentId === id)
    if (hasChildren) {
      message.error('该区域下存在子区域，无法删除')
      return
    }
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该区域吗？',
      onOk: async () => {
        try {
          await deleteRegion(id)
          message.success('删除成功')
          fetchData()
          if (selectedKey === id) setSelectedKey(null)
        } catch (error) {
          message.error('删除失败')
        }
      }
    })
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingItem) {
        await updateRegion(editingItem.id, values)
        message.success('更新成功')
      } else {
        await createRegion(values)
        message.success('创建成功')
      }
      setModalOpen(false)
      form.resetFields()
      setEditingItem(null)
      fetchData()
    } catch {
      message.error('请检查表单填写')
    }
  }

  const selectedRegion = selectedKey ? data.find((r) => r.id === selectedKey) : null

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">区域管理</h2>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
            刷新
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd()}>
            新增顶级区域
          </Button>
        </Space>
      </div>
      <Card bordered={false} loading={loading}>
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ width: 300, minHeight: 500, borderRight: '1px solid #E8E8E8', paddingRight: 24 }}>
            <Tree
              showLine
              defaultExpandAll
              treeData={treeData}
              selectedKeys={selectedKey ? [selectedKey] : []}
              onSelect={handleSelect}
              titleRender={(nodeData) => (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: 8 }}>
                  <span>{nodeData.title}</span>
                  <Space size={4}>
                    <Button
                      type="text"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={(e) => { e.stopPropagation(); handleAdd(nodeData.key as string) }}
                    />
                  </Space>
                </div>
              )}
            />
          </div>
          <div style={{ flex: 1 }}>
            {selectedRegion ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ margin: 0 }}>区域详情</h3>
                  <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(selectedRegion)}>编辑</Button>
                    <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(selectedRegion.id)}>删除</Button>
                  </Space>
                </div>
                <div style={{ lineHeight: 2.5 }}>
                  <p><strong>区域名称：</strong>{selectedRegion.name}</p>
                  <p><strong>区域编码：</strong>{selectedRegion.code}</p>
                  <p><strong>层级：</strong>第 {selectedRegion.level} 级</p>
                  <p><strong>排序：</strong>{selectedRegion.sort}</p>
                  <p><strong>上级区域：</strong>{selectedRegion.parentId ? data.find((r) => r.id === selectedRegion.parentId)?.name || '-' : '无'}</p>
                  <p><strong>创建时间：</strong>{selectedRegion.createdAt}</p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, color: '#999' }}>
                请选择左侧区域查看详情
              </div>
            )}
          </div>
        </div>
      </Card>
      <Modal
        title={editingItem ? '编辑区域' : '新增区域'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => { setModalOpen(false); form.resetFields(); setEditingItem(null) }}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="区域名称" rules={[{ required: true, message: '请输入区域名称' }]}>
            <Input placeholder="请输入区域名称" />
          </Form.Item>
          <Form.Item name="code" label="区域编码" rules={[{ required: true, message: '请输入区域编码' }]}>
            <Input placeholder="请输入区域编码" />
          </Form.Item>
          <Form.Item name="parentId" label="上级区域">
            <Select allowClear placeholder="请选择上级区域">
              {data.filter((r) => !editingItem || r.id !== editingItem.id).map((r) => (
                <Select.Option key={r.id} value={r.id}>{r.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="sort" label="排序" rules={[{ required: true, message: '请输入排序' }]}>
            <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入排序" />
          </Form.Item>
          <Form.Item name="level" label="层级" hidden>
            <InputNumber />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Regions
