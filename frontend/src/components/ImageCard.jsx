import { useState } from 'react'
import { toggleLike, viewImage } from '../api/image'

export default function ImageCard({ image, onChange }) {
  const [liked, setLiked] = useState(image.liked)
  const [likes, setLikes] = useState(image.likes)
  const [views, setViews] = useState(image.views)

  const handleView = async () => {
    const res = await viewImage(image.id)
    setViews(res.data.views)
    onChange?.()
  }

  const handleLike = async (e) => {
    e.stopPropagation()
    const res = await toggleLike(image.id)
    setLiked(res.data.liked)
    setLikes(res.data.likes)
    onChange?.()
  }

  return (
    <div style={{ position: 'relative' }}>
      <img
        src={`http://localhost:5000${image.thumbnail_url}`}
        alt=""
        style={{ width: 200, height: 200, objectFit: 'cover' }}
        onClick={() => {
          handleView()
          window.open(
            `http://localhost:5000${image.url}`,
            '_blank'
          )
        }}
      />

      <div style={{ position: 'absolute', bottom: 8, left: 8 }}>
        👀 {views}
      </div>

      <div
        onClick={handleLike}
        style={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          cursor: 'pointer',
          color: liked ? 'red' : '#fff',
        }}
      >
        ❤️ {likes}
      </div>
    </div>
  )
}
