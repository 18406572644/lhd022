import { Table, Button, App, Popconfirm } from 'antd'
import { PlusOutlined, ImportOutlined, ExportOutlined, DeleteOutlined } from '@ant-design/icons'
import type { TableProps } from 'antd'
import type { ReactNode } from 'react'

export interface DataTableProps<T> extends Omit<TableProps<T>, 'title'> {
  tableTitle?: string
  onAdd?: () => void
  onImport?: () => void
  onExport?: () => void
  onBatchDelete?: (ids: string[]) => void
  showAdd?: boolean
  showImport?: boolean
  showExport?: boolean
  showBatchDelete?: boolean
  extraButtons?: ReactNode
  rowKey?: string
}

function DataTable<T extends { id?: string }>({
  tableTitle,
  onAdd,
  onImport,
  onExport,
  onBatchDelete,
  showAdd = true,
  showImport = true,
  showExport = true,
  showBatchDelete = false,
  extraButtons,
  rowKey = 'id',
  ...tableProps
}: DataTableProps<T>) {
  const { message } = App.useApp()
  const { selectedRowKeys } = tableProps.rowSelection
    ? { selectedRowKeys: [] as React.Key[] }
    : { selectedRowKeys: [] as React.Key[] }

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的数据')
      return
    }
    onBatchDelete?.(selectedRowKeys as string[])
  }

  const toolbar = (
    <div style={{
      marginBottom: 16,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 12
    }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {showAdd && (
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
            新增
          </Button>
        )}
        {showImport && (
          <Button icon={<ImportOutlined />} onClick={onImport}>
            导入
          </Button>
        )}
        {showExport && (
          <Button icon={<ExportOutlined />} onClick={onExport}>
            导出
          </Button>
        )}
        {showBatchDelete && (
          <Popconfirm
            title="确定要批量删除选中的数据吗？"
            description="删除后无法恢复"
            onConfirm={handleBatchDelete}
            okText="确定"
            cancelText="取消"
          >
            <Button danger icon={<DeleteOutlined />}>
              批量删除
            </Button>
          </Popconfirm>
        )}
        {extraButtons}
      </div>
      {selectedRowKeys.length > 0 && (
        <span style={{ color: '#666' }}>
          已选择 <strong style={{ color: '#FF7A45' }}>{selectedRowKeys.length}</strong> 项
        </span>
      )}
    </div>
  )

  return (
    <div style={{
      background: '#fff',
      padding: 24,
      borderRadius: 8,
      border: '1px solid #F0F0F0'
    }}>
      {tableTitle && <h3 style={{ marginBottom: 16, color: '#262626' }}>{tableTitle}</h3>}
      {toolbar}
      <Table
        rowKey={rowKey}
        {...tableProps}
        pagination={{
          ...tableProps.pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条数据`,
          pageSizeOptions: ['10', '20', '50', '100']
        }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  )
}

export default DataTable
