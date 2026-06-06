import { Tag } from 'antd'
import type { TagProps } from 'antd'

export interface StatusTagProps extends TagProps {
  status: string
  type?: 'point' | 'device' | 'repair' | 'order' | 'inventory'
}

const statusConfig: Record<string, Record<string, { color: string; text: string }>> = {
  point: {
    active: { color: 'success', text: '启用' },
    inactive: { color: 'default', text: '停用' }
  },
  device: {
    online: { color: 'success', text: '在线' },
    offline: { color: 'default', text: '离线' },
    fault: { color: 'error', text: '故障' }
  },
  repair: {
    pending: { color: 'warning', text: '待处理' },
    processing: { color: 'processing', text: '处理中' },
    completed: { color: 'success', text: '已完成' },
    cancelled: { color: 'default', text: '已取消' }
  },
  order: {
    completed: { color: 'success', text: '已完成' },
    refunded: { color: 'warning', text: '已退款' }
  },
  inventory: {
    draft: { color: 'default', text: '草稿' },
    confirmed: { color: 'success', text: '已确认' }
  }
}

function StatusTag({ status, type = 'point', ...props }: StatusTagProps) {
  const config = statusConfig[type]?.[status] || { color: 'default', text: status }
  
  return (
    <Tag color={config.color as TagProps['color']} {...props}>
      {config.text}
    </Tag>
  )
}

export default StatusTag
