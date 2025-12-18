import { useEffect, useState } from 'react'
import { fetchImages, uploadImage } from '../api/image'
import GalleryGrid from '../components/GalleryGrid'

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
      loadImages()
    } catch (err) {
      alert('Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const openImage = (image) => {
    window.open(
      `http://localhost:5000${image.url}`,
      '_blank'
    )
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

      {/* 图片展示 */}
      {loading ? (
        <p>Loading images...</p>
      ) : (
        <GalleryGrid
          images={images}
          onOpen={openImage}
        />
      )}
    </div>
  )
}
