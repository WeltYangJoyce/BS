import { useNavigate } from 'react-router-dom'

export default function Home({ setToken }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
    navigate('/login')
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Home</h2>

      <button onClick={() => navigate('/gallery')}>
        Go to Gallery
      </button>

      <br /><br />

      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  )
}
