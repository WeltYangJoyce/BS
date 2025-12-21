import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../api/auth'
import "../style/login-register.css"
export default function Login({setToken}) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = async () => {
    try {
      const data = await login({ username, password })
      console.log('LOGIN RESPONSE:', data)
      console.log(data.access_token)
      localStorage.setItem('token', data.access_token)
      console.log("set localStorage=",data.access_token)
      localStorage.setItem('username', data.user.username)
      setToken(data.access_token)
      console.log("set Token = ",data.access_token)
      navigate('/home')
      console.log("to home")
    } catch {
      alert('Login failed')
    }
  }

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <input
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
      <p>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>

  )
}
