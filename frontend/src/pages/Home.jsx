import { useNavigate } from 'react-router-dom'
import '../style/home.css'
import {
  FaImages,
  FaUser,
  FaArrowRightFromBracket,
  FaCircleInfo,
  FaStar,
  FaUsers
} from 'react-icons/fa6'

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
          <FaImages size={40} style={{ marginBottom: '10px' }} />
          <h3>Gallery</h3>
          <p>Browse all images uploaded by the community.</p>
          <button onClick={() => navigate('/gallery')}>Go to Gallery</button>
        </div>

        <div className="home-card">
          <FaUser size={40} style={{ marginBottom: '10px' }} />
          <h3>My Images</h3>
          <p>View and manage your uploaded images.</p>
          <button onClick={() => navigate('/user')}>My Images</button>
        </div>

        <div className="home-card">
          <FaArrowRightFromBracket size={40} style={{ marginBottom: '10px' }} />
          <h3>Logout</h3>
          <p>Sign out of your account safely.</p>
          <button onClick={handleLogout}>Logout</button>
        </div>

        <div className="home-card">
          <FaCircleInfo size={40} style={{ marginBottom: '10px' }} />
          <h3>About Us</h3>
          <p>
            Our website allows users to share and explore amazing images from
            around the world. Join our community and get inspired!
          </p>
        </div>

        <div className="home-card">
          <FaStar size={40} style={{ marginBottom: '10px' }} />
          <h3>Featured Images</h3>
          <p>
            Check out the top-rated images curated by our community. Discover
            trending artworks every day!
          </p>
        </div>

        <div className="home-card">
          <FaUsers size={40} style={{ marginBottom: '10px' }} />
          <h3>Community Highlights</h3>
          <p>
            See what’s trending among our community members and get inspired by
            the most popular posts and interactions!
          </p>
        </div>
      </div>
    </div>
  )
}
