import { useState } from "react"
import { useNavigate } from "react-router-dom"

import UploadPanel from "../components/UploadPanel"
import TagSelector from "../components/TagSelector"
import { uploadImage } from "../api/image"

export default function UploadPage() {
  const [file, setFile] = useState(null)
  const [tags, setTags] = useState("")
  const [uploading, setUploading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!file) {
      alert("Please select an image first")
      return
    }

    try {
      setUploading(true)
      await uploadImage(file, tags)
      alert("Upload success")
      navigate("/user")
    } catch (err) {
      console.error(err)
      alert("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ padding: 40, maxWidth: 600 }}>
      <h2>Upload Image</h2>

      {/* 1️⃣ 选择图片（Drag & Drop / Click） */}
      <UploadPanel onSelect={setFile} />

      {/* 2️⃣ 选中后显示 */}
      {file && (
        <>
          {/* 预览 */}
          <div style={{ marginTop: 20 }}>
            <img
              src={URL.createObjectURL(file)}
              alt="preview"
              style={{
                maxWidth: "100%",
                maxHeight: 300,
                borderRadius: 8,
                border: "1px solid #ddd",
              }}
            />
          </div>

          {/* Tag 选择 */}
          <TagSelector value={tags} onChange={setTags} />

          {/* 操作按钮 */}
          <div style={{ marginTop: 24 }}>
            <button
              onClick={handleSubmit}
              disabled={uploading}
              style={{
                padding: "8px 16px",
                fontSize: 16,
                cursor: uploading ? "not-allowed" : "pointer",
              }}
            >
              {uploading ? "Uploading..." : "Confirm Upload"}
            </button>

            <button
              onClick={() => {
                setFile(null)
                setTags("")
              }}
              disabled={uploading}
              style={{
                marginLeft: 12,
                padding: "8px 16px",
              }}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  )
}
