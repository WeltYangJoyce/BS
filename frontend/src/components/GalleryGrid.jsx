import ImageCard from './ImageCard'

export default function GalleryGrid({ images, onChange }) {
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
