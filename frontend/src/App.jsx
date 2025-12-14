import { useState } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'

export default function App() {
  const [page, setPage] = useState('login')
  const token = localStorage.getItem('token')

  if (token) {
    return <Home />
  }

  return (
    <div style={{ padding: 40 }}>
      {page === 'login' ? (
        <Login />
      ) : (
        <Register setPage={setPage} />
      )}

      <br />

      <button onClick={() => setPage(page === 'login' ? 'register' : 'login')}>
        Switch to {page === 'login' ? 'Register' : 'Login'}
      </button>
    </div>
  )
}
