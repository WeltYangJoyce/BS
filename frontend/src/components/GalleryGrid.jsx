// components/GalleryGrid.jsx
import { useEffect, useState } from 'react'
import { fetchImages, toggleLike, viewImage } from '../api/image'
import ImageCard from './ImageCard'

export default function GalleryGrid() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)

  const loadImages = async () => {
    setLoading(true)
    const res = await fetchImages()
    setImages(res.data.images)
    setLoading(false)
  }

  useEffect(() => {
    loadImages()
  }, [])

  // ❤️ 点赞（本地一致性更新）
  const handleLike = async (id) => {
    const res = await toggleLike(id)
    const { liked, likes } = res.data

    setImages(images =>
      images.map(img =>
        img.id === id
          ? { ...img, liked, likes }
          : img
      )
    )
  }

  // 👀 浏览（只 +1，不 reload）
  const handleView = async (id) => {
    await viewImage(id)

    setImages(images =>
      images.map(img =>
        img.id === id
          ? { ...img, views: img.views + 1 }
          : img
      )
    )
  }

  if (loading) return <p>Loading images...</p>
  if (images.length === 0) return <p>No images yet.</p>

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, 200px)',
        gap: 20,
      }}
    >
      {images.map(img => (
        <ImageCard
          key={img.id}
          image={img}
          onLike={handleLike}
          onView={handleView}
        />
      ))}
    </div>
  )
}
