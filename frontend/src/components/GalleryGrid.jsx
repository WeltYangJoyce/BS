import ImageCard from './ImageCard'

export default function GalleryGrid({ images, onOpen }) {
  if (!images || images.length === 0) {
    return <p>No images yet.</p>
  }

  return (
    <div
      className="gallery-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, 200px)',
        gap: 20,
      }}
    >
      {images.map(image => (
        <ImageCard
          key={image.id}
          image={image}
          onOpen={onOpen}
        />
      ))}
    </div>
  )
}
