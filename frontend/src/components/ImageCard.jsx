export default function ImageCard({ image, onOpen }) {
  return (
    <div
      className="image-card"
      style={{
        width: 200,
        cursor: 'pointer',
      }}
      onClick={() => onOpen(image)}
    >
      <img
        src={`http://localhost:5000${image.thumbnail_url}`}
        alt=""
        style={{
          width: '100%',
          height: 200,
          objectFit: 'cover',
          borderRadius: 4,
        }}
      />
    </div>
  )
}
