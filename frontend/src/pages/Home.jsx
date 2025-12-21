import { useNavigate } from 'react-router-dom'
import '../style/home.css' // 确保引入样式文件

export default function Home({ setToken }) {
  const navigate = useNavigate()
  const username = localStorage.getItem('username')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    setToken(null)
    navigate('/login')
  }

  return (
    <div className="home-container">
      <h2>Welcome, {username}!</h2>

      <div className="home-grid">
        <div className="home-card">
          <h3>Gallery</h3>
          <p>Browse all images uploaded by the community.</p>
          <button onClick={() => navigate('/gallery')}>Go to Gallery</button>
        </div>

        <div className="home-card">
          <h3>My Images</h3>
          <p>View and manage your uploaded images.</p>
          <button onClick={() => navigate('/user')}>My Images</button>
        </div>

        <div className="home-card">
          <h3>Logout</h3>
          <p>Sign out of your account safely.</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
  )
}
