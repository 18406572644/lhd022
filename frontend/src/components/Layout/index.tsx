import { Layout, Menu, Dropdown, Avatar, Space, Button } from 'antd'
import { UserOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useUserStore } from '../../store/user'
import { menuRoutes } from '../../router'

const { Header, Sider, Content } = Layout

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const user = useUserStore((state) => state.user)
  const logout = useUserStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        theme="light"
        width={220}
        collapsed={collapsed}
        style={{ borderRight: '1px solid #E8E8E8' }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #E8E8E8',
          overflow: 'hidden'
        }}>
          <h2 style={{
            color: '#FF7A45',
            margin: 0,
            fontSize: collapsed ? 16 : 18,
            fontWeight: 700,
            whiteSpace: 'nowrap'
          }}>
            {collapsed ? '设备' : '设备管理系统'}
          </h2>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ borderRight: 'none', height: '100%' }}
          items={menuRoutes.map((route) => ({
            key: route.path,
            icon: route.icon,
            label: route.label,
            onClick: () => navigate(route.path)
          }))}
        />
      </Sider>
      <Layout>
        <Header style={{
          background: '#fff',
          borderBottom: '1px solid #E8E8E8',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#FF7A45' }} />
              <span>{user?.name}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ padding: 24, background: '#F5F5F5' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AppLayout
