import { Form, Input, Select, DatePicker, Button, Space, Row, Col } from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ReactNode } from 'react'

const { RangePicker } = DatePicker

export interface FilterBarProps {
  children?: ReactNode
  onSearch?: (values: any) => void
  onReset?: () => void
  showKeyword?: boolean
  showRegion?: boolean
  showStatus?: boolean
  showDateRange?: boolean
  regionOptions?: { label: string; value: string }[]
  statusOptions?: { label: string; value: string }[]
  keywordPlaceholder?: string
}

function FilterBar({
  children,
  onSearch,
  onReset,
  showKeyword = true,
  showRegion = false,
  showStatus = false,
  showDateRange = false,
  regionOptions = [],
  statusOptions = [],
  keywordPlaceholder = '请输入关键词搜索'
}: FilterBarProps) {
  const [form] = Form.useForm()

  const handleSearch = () => {
    const values = form.getFieldsValue()
    onSearch?.(values)
  }

  const handleReset = () => {
    form.resetFields()
    onReset?.()
  }

  return (
    <div style={{
      background: '#fff',
      padding: '20px 24px',
      borderRadius: 8,
      marginBottom: 16,
      border: '1px solid #F0F0F0'
    }}>
      <Form form={form} layout="vertical">
        <Row gutter={16} align="bottom">
          {showKeyword && (
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="keyword" label="关键词" style={{ marginBottom: 0 }}>
                <Input placeholder={keywordPlaceholder} allowClear />
              </Form.Item>
            </Col>
          )}
          {showRegion && (
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="regionId" label="区域" style={{ marginBottom: 0 }}>
                <Select placeholder="请选择区域" allowClear options={regionOptions} />
              </Form.Item>
            </Col>
          )}
          {showStatus && (
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="status" label="状态" style={{ marginBottom: 0 }}>
                <Select placeholder="请选择状态" allowClear options={statusOptions} />
              </Form.Item>
            </Col>
          )}
          {showDateRange && (
            <Col xs={24} sm={12} md={8} lg={8}>
              <Form.Item name="dateRange" label="日期范围" style={{ marginBottom: 0 }}>
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          )}
          {children}
          <Col xs={24} sm={12} md={8} lg={6} style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </div>
  )
}

export default FilterBar
