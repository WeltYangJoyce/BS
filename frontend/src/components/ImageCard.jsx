export default function ImageCard({ image, currentUserId, onDelete }) {
  const canDelete = image.owner_id === currentUserId;

  return (
    <div style={{ border: "1px solid #ccc", padding: 10 }}>
      <img
        src={`http://127.0.0.1:5000/uploads/${image.filename}`}
        alt=""
        style={{ width: 200 }}
      />
      <p>Image ID: {image.id}</p>
      {canDelete && (
        <button onClick={() => onDelete(image.id)}>Delete</button>
      )}
    </div>
  );
}