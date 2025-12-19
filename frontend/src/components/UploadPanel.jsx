import { useState, useCallback } from "react"

export default function UploadPanel({ onSelect }) {
  const [dragging, setDragging] = useState(false)

  const handleFile = (file) => {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed")
      return
    }
    onSelect(file)
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)

    const file = e.dataTransfer.files[0]
    handleFile(file)
  }, [])

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      style={{
        border: "2px dashed #aaa",
        borderRadius: 8,
        padding: 40,
        textAlign: "center",
        background: dragging ? "#f0f8ff" : "#fafafa",
        cursor: "pointer",
      }}
      onClick={() => document.getElementById("fileInput").click()}
    >
      <input
        id="fileInput"
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files[0])}
      />

      <p style={{ margin: 0, fontSize: 16 }}>
        {dragging
          ? "Drop image here"
          : "Click or Drag image here to select"}
      </p>
    </div>
  )
}
