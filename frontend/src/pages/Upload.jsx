import { useState } from "react"
import { useNavigate } from "react-router-dom"

import UploadPanel from "../components/UploadPanel"
import TagSelector from "../components/TagSelector"
import { analyzeImage, uploadImage } from "../api/image"

export default function UploadPage() {
  const [file, setFile] = useState(null)
  const [tags, setTags] = useState("")
  const [exif, setExif] = useState(null)
  const [suggestedTags, setSuggestedTags] = useState([])
  const [analyzing, setAnalyzing] = useState(false)
  const [uploading, setUploading] = useState(false)

  const navigate = useNavigate()

  // Step 2：EXIF 预分析
  const handleAnalyze = async () => {
    if (!file) return

    try {
      setAnalyzing(true)
      const res = await analyzeImage(file)
      setExif(res.data.exif)
      setSuggestedTags(res.data.suggested_tags || [])
    } catch (err) {
      console.error(err)
      alert("EXIF analyze failed")
    } finally {
      setAnalyzing(false)
    }
  }

  // 推荐 Tag → 加入最终 Tag
  const addSuggestedTag = (tag) => {
    const current = tags ? tags.split(",") : []
    if (current.includes(tag)) return
    setTags([...current, tag].join(","))
  }

  // Step 3：最终上传
  const handleFinalUpload = async () => {
    if (!file) return

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

      {/* 1️⃣ 选择图片 */}
      <UploadPanel
        onSelect={(f) => {
          setFile(f)
          setExif(null)
          setSuggestedTags([])
          setTags("")
        }}
      />

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

          {/* Step 2：分析 EXIF */}
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            style={{ marginTop: 16 }}
          >
            {analyzing ? "Analyzing EXIF..." : "Analyze EXIF"}
          </button>

          {/* EXIF 信息 */}
          {exif && (
            <div style={{ marginTop: 16, fontSize: 14 }}>
              <p>📷 Resolution: {exif.width} × {exif.height}</p>
              {exif.time && <p>🕒 Time: {exif.time}</p>}
              {exif.location && <p>📍 Location: {exif.location}</p>}
            </div>
          )}

          {/* 推荐 Tag */}
          {suggestedTags.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h4>Suggested Tags</h4>
              {suggestedTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => addSuggestedTag(tag)}
                  style={{
                    marginRight: 6,
                    marginBottom: 6,
                    padding: "4px 8px",
                    borderRadius: 12,
                    background: "#ffe08a",
                    border: "1px solid #e0b800",
                    cursor: "pointer",
                  }}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* 最终 Tag 选择 */}
          <TagSelector value={tags} onChange={setTags} />

          {/* Step 3：最终上传 */}
          <div style={{ marginTop: 24 }}>
            <button
              onClick={handleFinalUpload}
              disabled={uploading}
              style={{
                padding: "8px 16px",
                fontSize: 16,
                cursor: uploading ? "not-allowed" : "pointer",
              }}
            >
              {uploading ? "Uploading..." : "Confirm & Upload"}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
