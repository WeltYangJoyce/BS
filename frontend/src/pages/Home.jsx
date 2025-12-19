import { useNavigate } from 'react-router-dom'

export default function Home({ setToken }) {
  console.log('⚠️ Home rendered')
  const navigate = useNavigate()
  const username = localStorage.getItem('username')
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    setToken(null)
    navigate('/login')
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Home</h2>
      <div style={{ marginBottom: 20 }}>
        Welcome, <strong>{username}</strong>
      </div>
      <button onClick={() => navigate('/gallery')}>
        Go to Gallery
      </button>

      <br /><br />
      <button onClick={() => navigate('/user')}>
        My Images
      </button>
      <br/><br/>
      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  )
}
