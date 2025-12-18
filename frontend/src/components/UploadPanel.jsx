export default function UploadPanel({ onUpload, uploading }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <input
        type="file"
        accept="image/*"
        onChange={e => {
          const file = e.target.files[0]
          if (file) onUpload(file)
          e.target.value = ''
        }}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
    </div>
  )
}
