import { useNavigate } from 'react-router-dom'
import '../style/home.css' // 确保引入样式文件
import { FaImages, FaUser, FaSignOutAlt, FaInfoCircle, FaStar, FaUsers } from 'react-icons/fa'

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
        {/* Gallery 卡片 */}
        <div className="home-card">
          <FaImages size={40} style={{ marginBottom: '10px' }} />
          <h3>Gallery</h3>
          <p>Browse all images uploaded by the community.</p>
          <button onClick={() => navigate('/gallery')}>Go to Gallery</button>
        </div>

        {/* My Images 卡片 */}
        <div className="home-card">
          <FaUser size={40} style={{ marginBottom: '10px' }} />
          <h3>My Images</h3>
          <p>View and manage your uploaded images.</p>
          <button onClick={() => navigate('/user')}>My Images</button>
        </div>

        {/* Logout 卡片 */}
        <div className="home-card">
          <FaSignOutAlt size={40} style={{ marginBottom: '10px' }} />
          <h3>Logout</h3>
          <p>Sign out of your account safely.</p>
          <button onClick={handleLogout}>Logout</button>
        </div>

        {/* 网站介绍卡片 */}
        <div className="home-card">
          <FaInfoCircle size={40} style={{ marginBottom: '10px' }} />
          <h3>About Us</h3>
          <p>Our website allows users to share and explore amazing images from around the world. Join our community and get inspired!</p>
        </div>

        {/* 特色功能卡片 */}
        <div className="home-card">
          <FaStar size={40} style={{ marginBottom: '10px' }} />
          <h3>Featured Images</h3>
          <p>Check out the top-rated images curated by our community. Discover trending artworks every day!</p>
        </div>

        {/* 新增特色卡片 */}
        <div className="home-card">
          <FaUsers size={40} style={{ marginBottom: '10px' }} />
          <h3>Community Highlights</h3>
          <p>See what’s trending among our community members and get inspired by the most popular posts and interactions!</p>
        </div>
      </div>
    </div>
  )
}
