import { useEffect, useState } from 'react'
import { fetchImages, uploadImage } from '../api/image'

export default function Gallery() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const loadImages = () => {
    setLoading(true)
    fetchImages()
      .then(res => {
        setImages(res.data.images)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadImages()
  }, [])

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setUploading(true)
      await uploadImage(file)
      loadImages() // 上传成功后刷新
    } catch (err) {
      alert('Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Gallery</h2>

      {/* 上传区域 */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
        />
        {uploading && <p>Uploading...</p>}
      </div>

      {/* 图片列表 */}
      {loading ? (
        <p>Loading images...</p>
      ) : images.length === 0 ? (
        <p>No images yet.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, 200px)',
            gap: 20,
          }}
        >
          {images.map(img => (
            <div key={img.id}>
              <img
                src={`http://localhost:5000${img.thumbnail_url}`}
                alt=""
                style={{
                  width: 200,
                  height: 200,
                  objectFit: 'cover',
                  cursor: 'pointer',
                }}
                onClick={() =>
                  window.open(
                    `http://localhost:5000${img.url}`,
                    '_blank'
                  )
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
