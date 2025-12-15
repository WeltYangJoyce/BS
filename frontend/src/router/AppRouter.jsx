import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Home from '../pages/Home'

export default function AppRouter() {
  const token = localStorage.getItem('token')

  return (
    <Routes>
      {/* 默认入口 */}
      <Route
        path="/"
        element={token ? <Navigate to="/home" /> : <Navigate to="/login" />}
      />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 受保护页面 */}
      <Route
        path="/home"
        element={token ? <Home /> : <Navigate to="/login" />}
      />
    </Routes>
  )
}
