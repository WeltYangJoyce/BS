import { useEffect, useState } from 'react'
import { fetchMyImages } from '../api/image'
import MyImageCard from '../components/MyImageCard'

export default function UserCenter() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)

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
    <div style={{ padding: 40 }}>
      <h2>我的图片</h2>

      {loading ? (
        <p>Loading...</p>
      ) : images.length === 0 ? (
        <p>你还没有上传任何图片</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, 200px)',
            gap: 20,
          }}
        >
          {images.map(img => (
            <MyImageCard
              key={img.id}
              image={img}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}
    </div>
  )
}
