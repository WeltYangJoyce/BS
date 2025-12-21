import { useEffect, useState } from 'react'
import { fetchMyImages } from '../api/image'
import MyImageCard from '../components/MyImageCard'
import { useNavigate } from 'react-router-dom'
import BackToHomeButton from '../components/BackToHomeButton'
import "../style/user-center.css"
export default function UserCenter() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadMyImages()
  }, [])

  const loadMyImages = async () => {
    setLoading(true)
    try {
      const res = await fetchMyImages()
      setImages(res.data.images)
    } catch (err) {
      alert('Failed to load images')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleted = (id) => {
    // ✅ 本地同步删除，不 reload
    setImages(prev => prev.filter(img => img.id !== id))
  }

  return (
    <div className="user-center-container">
  <h2>我的图片</h2>
  <div className="upload-section">
    <BackToHomeButton />
    <button onClick={() => navigate('/user/upload')}>上传新图片</button>
  </div>
  {loading ? (
    <p>Loading...</p>
  ) : images.length === 0 ? (
    <p>你还没有上传任何图片</p>
  ) : (
    <div className="my-images-grid">
      {images.map(img => (
        <MyImageCard key={img.id} image={img} onDeleted={handleDeleted} />
      ))}
    </div>
  )}
</div>

  )
}
