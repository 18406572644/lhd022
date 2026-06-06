import { useState } from 'react'
import { Form, Input, Button, App } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../../store/user'
import { login } from '../../api'
import type { User } from '../../types'

function Login() {
  const [loading, setLoading] = useState(false)
  const { message } = App.useApp()
  const navigate = useNavigate()
  const setUser = useUserStore((state) => state.setUser)

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      setLoading(true)
      
      if (values.username === 'admin' && values.password === 'admin123') {
        const mockUser: User = {
          id: '1',
          username: 'admin',
          name: '系统管理员',
          role: 'admin',
          token: 'mock-token-' + Date.now(),
          avatar: undefined
        }
        localStorage.setItem('token', mockUser.token)
        setUser(mockUser)
        message.success('登录成功')
        setLoading(false)
        navigate('/dashboard')
        return
      }

      const res = await login(values)
      localStorage.setItem('token', res.token)
      setUser(res.user)
      message.success('登录成功')
      navigate('/dashboard')
    } catch {
      message.error('登录失败，请检查用户名和密码')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">智能设备管理系统</h1>
        <p className="login-subtitle">欢迎回来，请登录您的账号</p>
        <Form name="login" onFinish={onFinish} autoComplete="off" size="large" initialValues={{ username: 'admin', password: 'admin123' }}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
          <p style={{ textAlign: 'center', color: '#999', fontSize: 12, margin: 0 }}>
            测试账号：admin / admin123
          </p>
        </Form>
      </div>
    </div>
  )
}

export default Login
