import ImageCard from './ImageCard'

export default function GalleryGrid({ images, onChange }) {
  if (!images || images.length === 0) {
    return <p style={{ textAlign: "center", marginTop: 20 }}>暂时没有对应的图片</p>
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, 200px)',
        gap: 16,
      }}
    >
      {images.map(img => (
        <ImageCard
          key={img.id}
          image={img}
          onChange={onChange}
        />
      ))}
    </div>
  )
}
