import ImageCard from './ImageCard'
import '../style/gallery-grid.css'

export default function GalleryGrid({ images, onChange }) {
  if (!images || images.length === 0)
    return <p style={{ textAlign: "center", marginTop: 20 }}>暂时没有对应的图片</p>

  return (
    <div className="gallery-grid">
      {images.map(img => (
        <ImageCard key={img.id} image={img} onChange={onChange} />
      ))}
    </div>
  )
}
