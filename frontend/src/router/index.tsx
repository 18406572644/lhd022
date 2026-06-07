import Dashboard from '../pages/Dashboard'
import AdvancedAnalytics from '../pages/AdvancedAnalytics'
import CustomDashboard from '../pages/CustomDashboard'
import AlertCenter from '../pages/AlertCenter'
import Points from '../pages/Points'
import Devices from '../pages/Devices'
import Repairs from '../pages/Repairs'
import Restocks from '../pages/Restocks'
import Orders from '../pages/Orders'
import Inventory from '../pages/Inventory'
import Regions from '../pages/Regions'
import { LayoutDashboard, BarChart3, LayoutGrid, Bell, MapPin, Monitor, Wrench, Package, ShoppingCart, ClipboardList, Layers } from 'lucide-react'

export interface RouteConfig {
  path: string
  element: React.ReactNode
  label: string
  icon?: React.ReactNode
}

const routes: RouteConfig[] = [
  {
    path: '/dashboard',
    element: <Dashboard />,
    label: '基础看板',
    icon: <LayoutDashboard size={18} />
  },
  {
    path: '/advanced-analytics',
    element: <AdvancedAnalytics />,
    label: '高级分析',
    icon: <BarChart3 size={18} />
  },
  {
    path: '/custom-dashboard',
    element: <CustomDashboard />,
    label: '自定义仪表盘',
    icon: <LayoutGrid size={18} />
  },
  {
    path: '/alert-center',
    element: <AlertCenter />,
    label: '预警中心',
    icon: <Bell size={18} />
  },
  {
    path: '/points',
    element: <Points />,
    label: '点位档案',
    icon: <MapPin size={18} />
  },
  {
    path: '/devices',
    element: <Devices />,
    label: '设备台账',
    icon: <Monitor size={18} />
  },
  {
    path: '/repairs',
    element: <Repairs />,
    label: '故障报修',
    icon: <Wrench size={18} />
  },
  {
    path: '/restocks',
    element: <Restocks />,
    label: '补货记录',
    icon: <Package size={18} />
  },
  {
    path: '/orders',
    element: <Orders />,
    label: '租借流水',
    icon: <ShoppingCart size={18} />
  },
  {
    path: '/inventory',
    element: <Inventory />,
    label: '损耗盘点',
    icon: <ClipboardList size={18} />
  },
  {
    path: '/regions',
    element: <Regions />,
    label: '区域管理',
    icon: <Layers size={18} />
  }
]

export const menuRoutes = routes.filter(r => r.icon)

export default routes
