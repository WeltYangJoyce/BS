import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toggleLike, viewImage } from '../api/image'
import '../style/image-card.css'

export default function ImageCard({ image, onChange }) {
  const [hovered, setHovered] = useState(false)
  const [liked, setLiked] = useState(image.liked)
  const [likes, setLikes] = useState(image.likes)
  const [views, setViews] = useState(image.views)
  const navigate = useNavigate()

  const handleView = async () => {
    const res = await viewImage(image.id)
    setViews(res.data.views)
    onChange?.()
  }

  const handleLike = async e => {
    e.stopPropagation()
    const res = await toggleLike(image.id)
    setLiked(res.data.liked)
    setLikes(res.data.likes)
    onChange?.()
  }

  return (
    <div
      className={`image-card ${hovered ? 'hovered' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        handleView()
        window.open(`http://localhost:5000${image.url}`, '_blank')
      }}
    >
      <img src={`http://localhost:5000${image.thumbnail_url}`} alt="" className="card-img" />

      {/* 主 Tag */}
      <div
        className="primary-tag"
        onClick={e => {
          e.stopPropagation()
          navigate(`/gallery?tag=${image.primary_tag}`)
        }}
      >
        #{image.primary_tag}
      </div>

      {/* hover tags overlay */}
      <div className="tag-overlay">
        {image.tags.map(tag => (
          <span key={tag} className="tag-chip">
            #{tag}
          </span>
        ))}
      </div>

      {/* 底部信息 */}
      <div className="views">👀 {views}</div>
      <div className={`likes ${liked ? 'liked' : ''}`} onClick={handleLike}>
        ❤️ {likes}
      </div>
    </div>
  )
}
