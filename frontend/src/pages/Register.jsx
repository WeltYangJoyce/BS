import { useState } from 'react'
import { register } from '../api/auth'

export default function Register({ setPage }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleRegister = async () => {
    try {
      await register({ username, email, password })
      alert('Register success, please login')
      setPage('login')   // ✅ 核心：注册成功后跳转
    } catch (err) {
      alert('Register failed')
    }
  }

  return (
    <div>
      <h2>Register</h2>

      <input
        placeholder="username"
        onChange={e => setUsername(e.target.value)}
      />
      <br />

      <input
        placeholder="email"
        onChange={e => setEmail(e.target.value)}
      />
      <br />

      <input
        type="password"
        placeholder="password"
        onChange={e => setPassword(e.target.value)}
      />
      <br />

      <button onClick={handleRegister}>Register</button>
    </div>
  )
}
