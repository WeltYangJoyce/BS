import { useEffect, useState, useCallback } from 'react'
import { fetchImages, uploadImage } from '../api/image'
import GalleryGrid from '../components/GalleryGrid'

export default function Gallery() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  // 🔥 排序状态是“一等公民”
  const [sort, setSort] = useState('time') // 'time' | 'hot'

  // ✅ 所有加载图片，都只走这里
  const loadImages = useCallback(() => {
    setLoading(true)
    fetchImages(sort)
      .then(res => {
        setImages(res.data.images)
      })
      .finally(() => setLoading(false))
  }, [sort])

  // 初次加载 & sort 改变
  useEffect(() => {
    loadImages()
  }, [loadImages])

  // 上传
  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setUploading(true)
      await uploadImage(file)
      loadImages() // ✅ 仍然遵循当前 sort
    } catch {
      alert('Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Gallery</h2>

      {/* ⬆️ 上传 */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
        />
        {uploading && <p>Uploading...</p>}
      </div>

      {/* 🔀 排序控制 */}
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => setSort('time')}
          disabled={sort === 'time'}
        >
          🕒 最新
        </button>

        <button
          onClick={() => setSort('hot')}
          disabled={sort === 'hot'}
          style={{ marginLeft: 8 }}
        >
          🔥 热度
        </button>
      </div>

      

      {/* 🖼️ 列表 */}
      {loading ? (
        <p>Loading images...</p>
      ) : images.length === 0 ? (
        <p>No images yet.</p>
      ) : (
        <GalleryGrid
          images={images}
          onChange={loadImages} 
          // 👆 给 ImageCard 用（点赞 / 浏览后）
        />
      )}
    </div>
  )
}
