import { Upload, App } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'

export interface ImageUploadProps {
  value?: string
  onChange?: (url: string) => void
  maxCount?: number
  listType?: 'picture-card' | 'picture' | 'text'
  accept?: string
  disabled?: boolean
}

function ImageUpload({
  value,
  onChange,
  maxCount = 1,
  listType = 'picture-card',
  accept = 'image/*',
  disabled = false
}: ImageUploadProps) {
  const { message } = App.useApp()

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    const isImage = file.type?.startsWith('image/')
    if (!isImage) {
      message.error('只能上传图片文件！')
      return Upload.LIST_IGNORE
    }
    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
      message.error('图片大小不能超过 5MB！')
      return Upload.LIST_IGNORE
    }
    return false
  }

  const handleChange: UploadProps['onChange'] = (info) => {
    if (info.file.status === 'removed') {
      onChange?.('')
      return
    }
    if (info.file.originFileObj) {
      const reader = new FileReader()
      reader.onload = (e) => {
        onChange?.(e.target?.result as string)
      }
      reader.readAsDataURL(info.file.originFileObj)
    }
  }

  const fileList = value
    ? [{
        uid: '-1',
        name: 'image.png',
        status: 'done' as const,
        url: value
      }]
    : []

  return (
    <Upload
      listType={listType}
      maxCount={maxCount}
      accept={accept}
      beforeUpload={beforeUpload}
      onChange={handleChange}
      fileList={fileList}
      disabled={disabled}
      multiple={false}
    >
      {!value && (
        <div>
          <PlusOutlined style={{ fontSize: 24, color: '#FF7A45' }} />
          <div style={{ marginTop: 8, color: '#666' }}>上传图片</div>
        </div>
      )}
    </Upload>
  )
}

export default ImageUpload
