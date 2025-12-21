import { useState } from 'react';
import { deleteImage } from '../api/image';
import { useNavigate } from 'react-router-dom';
import '../style/my-image-card.css';

export default function MyImageCard({ image, onDeleted }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async (e) => {
    e.stopPropagation(); // ✅ 阻止事件冒泡，避免打开图片
    if (!window.confirm('确定要删除这张图片吗？')) return;
    try {
      await deleteImage(image.id);
      onDeleted(image.id);
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation(); // ✅ 阻止事件冒泡
    navigate(`/user/edit/${image.id}`);
  };

  return (
    <div
      className={`image-card ${hovered ? 'hovered' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() =>
        window.open(`http://localhost:5000${image.url}`, '_blank')
      }
    >
      <img
        src={`http://localhost:5000${image.thumbnail_url}`}
        alt=""
      />

      {/* hover tags overlay */}
      {hovered && image.tags && image.tags.length > 0 && (
        <div className="tag-overlay">
          {image.tags.map(tag => (
            <span key={tag} className="tag-chip">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 删除按钮 */}
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
          zIndex: 2
        }}
      >
        删除
      </button>

      {/* 编辑按钮 */}
      <button
        onClick={handleEdit}
        style={{
          position: 'absolute',
          top: 6,
          left: 6,
          background: 'rgba(0,0,0,0.7)',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          fontSize: 12,
          padding: '4px 6px',
          cursor: 'pointer',
          zIndex: 2
        }}
      >
        编辑
      </button>
    </div>
  );
}
