import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../api/auth'

const ASCII_NUM_REGEX = /^[\x20-\x7E]+$/
const EMAIL_REGEX = /^[\w.-]+@[\w.-]+\.\w+$/

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({ username: '', email: '', password: '', server: '' })
  const navigate = useNavigate()

  // 实时校验
  useEffect(() => {
    const newErrors = { username: '', email: '', password: '', server: '' }

    if (username && username.length < 5) newErrors.username = 'Username must be at least 5 characters'
    else if (username && !ASCII_NUM_REGEX.test(username)) newErrors.username = 'Username must contain only ASCII characters'

    if (password && password.length < 5) newErrors.password = 'Password must be at least 5 characters'
    else if (password && !ASCII_NUM_REGEX.test(password)) newErrors.password = 'Password must contain only ASCII characters'

    if (email && !EMAIL_REGEX.test(email)) newErrors.email = 'Invalid email format'

    setErrors(prev => ({ ...prev, ...newErrors }))
  }, [username, email, password])

  const handleRegister = async () => {
    setErrors(prev => ({ ...prev, server: '' }))

    // 最终提交前校验
    if (errors.username || errors.password || errors.email) return

    if (!username || !email || !password) {
      setErrors(prev => ({ ...prev, server: 'Please fill in all fields' }))
      return
    }

    try {
      await register({ username, email, password })
      alert('Register success')
      navigate('/login')
    } catch (err) {
      setErrors(prev => ({ ...prev, server: err.response?.data?.error || 'Register failed' }))
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Register</h2>
      <div>
        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        {errors.username && <p style={{ color: 'red', margin: 0 }}>{errors.username}</p>}
      </div>
      <div>
        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        {errors.email && <p style={{ color: 'red', margin: 0 }}>{errors.email}</p>}
      </div>
      <div>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {errors.password && <p style={{ color: 'red', margin: 0 }}>{errors.password}</p>}
      </div>
      <button onClick={handleRegister} style={{ marginTop: 10 }}>Register</button>
      {errors.server && <p style={{ color: 'red' }}>{errors.server}</p>}
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  )
}
