import { useState } from 'react'
import { login } from '../api/auth'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    const res = await login({ username, password })
    localStorage.setItem('token', res.data.access_token)
    window.location.reload()
  }

  return (
    <div>
      <h2>Login</h2>
      <input placeholder="username" onChange={e => setUsername(e.target.value)} />
      <br />
      <input type="password" placeholder="password" onChange={e => setPassword(e.target.value)} />
      <br />
      <button onClick={handleLogin}>Login</button>
    </div>
  )
}