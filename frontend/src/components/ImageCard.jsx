// components/ImageCard.jsx
export default function ImageCard({ image, onLike, onView }) {
  const handleClick = () => {
    onView(image.id)
    window.open(
      `http://localhost:5000${image.url}`,
      '_blank'
    )
  }

  const handleLike = (e) => {
    e.stopPropagation()
    onLike(image.id)
  }

  return (
    <div style={{ position: 'relative' }}>
      <img
        src={`http://localhost:5000${image.thumbnail_url}`}
        alt=""
        style={{
          width: 200,
          height: 200,
          objectFit: 'cover',
          cursor: 'pointer',
        }}
        onClick={handleClick}
      />

      {/* 👀 浏览数 */}
      <div
        style={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          background: 'rgba(0,0,0,0.6)',
          color: '#fff',
          fontSize: 12,
          padding: '2px 6px',
          borderRadius: 4,
        }}
      >
        👀 {image.views}
      </div>

      {/* ❤️ 点赞 */}
      <div
        onClick={handleLike}
        style={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          cursor: 'pointer',
          background: 'rgba(0,0,0,0.6)',
          color: image.liked ? 'red' : '#fff',
          fontSize: 12,
          padding: '2px 6px',
          borderRadius: 4,
        }}
      >
        ❤️ {image.likes}
      </div>
    </div>
  )
}
