import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider, App as AntApp } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App'
import './styles/global.css'
import './styles/theme.less'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#FF7A45',
          colorInfo: '#FF7A45',
          colorSuccess: '#52C41A',
          colorWarning: '#FAAD14',
          colorError: '#F5222D',
          borderRadius: 6,
          colorPrimaryBg: '#FFF2E8',
          colorPrimaryBgHover: '#FFE0CC',
          colorPrimaryBorder: '#FFB088',
          colorPrimaryHover: '#FF9A6E',
          colorPrimaryActive: '#E65D2B',
          colorPrimaryText: '#FF7A45',
          colorPrimaryTextHover: '#FF9A6E'
        }
      }}
    >
      <AntApp>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  </React.StrictMode>
)
