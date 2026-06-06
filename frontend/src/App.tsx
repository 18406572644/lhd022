import { Routes, Route, Navigate } from 'react-router-dom'
import routes from './router'
import Login from './pages/Login'
import { Layout } from './components'
import AuthGuard from './router/AuthGuard'

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <AuthGuard requireAuth={false}>
            <Login />
          </AuthGuard>
        }
      />
      <Route
        element={
          <AuthGuard requireAuth={true}>
            <Layout />
          </AuthGuard>
        }
      >
        {routes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}

export default App
