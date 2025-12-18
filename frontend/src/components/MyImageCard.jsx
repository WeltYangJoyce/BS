import { deleteImage } from '../api/image'

export default function MyImageCard({ image, onDeleted }) {
  const handleDelete = async (e) => {
    e.stopPropagation()

    if (!window.confirm('确定要删除这张图片吗？')) return

    try {
      await deleteImage(image.id)
      onDeleted(image.id) // ✅ 通知父组件同步 state
    } catch (err) {
      alert('Delete failed')
    }
  }

  return (
    <div
      style={{
        position: 'relative',
        width: 200,
        height: 200,
        borderRadius: 6,
        overflow: 'hidden',
      }}
    >
      <img
        src={`http://localhost:5000${image.thumbnail_url}`}
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          cursor: 'pointer',
        }}
        onClick={() =>
          window.open(
            `http://localhost:5000${image.url}`,
            '_blank'
          )
        }
      />

      {/* 🗑 删除按钮 */}
      <button
        onClick={handleDelete}
        style={{
          position: 'absolute',
          top: 6,
          right: 6,
          background: 'rgba(0,0,0,0.7)',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          fontSize: 12,
          padding: '4px 6px',
          cursor: 'pointer',
        }}
      >
        删除
      </button>

      {/* 🔧 未来扩展位（现在不启用） */}
      {/*
      <div style={{
        position: 'absolute',
        bottom: 6,
        left: 6,
        display: 'flex',
        gap: 6
      }}>
        <button>编辑</button>
        <button>Tag</button>
      </div>
      */}
    </div>
  )
}
