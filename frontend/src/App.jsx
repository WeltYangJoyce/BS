import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'

import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Gallery from './pages/Gallery'
import UserCenter from './pages/UserCenter'
import Upload from './pages/Upload'



export default function App() {
  const [token, setToken] = useState(
    localStorage.getItem('token')
  )

  return (
    <Routes>
      <Route
        path="/login"
        element={
          token
            ? <Navigate to="/home" />
            : <Login setToken={setToken} />
        }
      />

      <Route
        path="/register"
        element={
          token
            ? <Navigate to="/home" />
            : <Register />
        }
      />

      <Route
        path="/user/upload"
        element={
          token ? <Upload /> : <Navigate to="/login" />
        }
      />


      <Route
        path="/home"
        element={
          token
            ? <Home setToken={setToken} />
            : <Navigate to="/login" />
        }
      />

      <Route
        path="/gallery"
        element={
          token
            ? <Gallery />
            : <Navigate to="/login" />
        }
      />

      <Route
        path="/user"
        element={
          token
            ? <UserCenter />
            : <Navigate to="/login" />
        }
      />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}
