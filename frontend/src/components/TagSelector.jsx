import { useEffect, useState } from "react"
import { fetchTags } from "../api/tag"

export default function TagSelector({ value, onChange }) {
  const [allTags, setAllTags] = useState([])
  const [input, setInput] = useState("")

  useEffect(() => {
    fetchTags().then(res => {
      setAllTags(res.data.tags.map(t => t.name))
    })
  }, [])

  const selected = value ? value.split(",").filter(Boolean) : []

  const addTag = (tag) => {
    if (selected.includes(tag)) return
    onChange([...selected, tag].join(","))
  }

  const removeTag = (tag) => {
    onChange(selected.filter(t => t !== tag).join(","))
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault()
      addTag(input.trim())
      setInput("")
    }
  }

  return (
    <div style={{ marginTop: 20 }}>
      {/* 已选 Tag */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {selected.map(tag => (
          <span
            key={tag}
            style={{
              background: "#333",
              color: "#fff",
              padding: "4px 8px",
              borderRadius: 12,
              cursor: "pointer",
            }}
            onClick={() => removeTag(tag)}
          >
            #{tag} ✕
          </span>
        ))}
      </div>

      {/* 输入 */}
      <input
        placeholder="Add tag and press Enter"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{ marginTop: 10, width: "100%" }}
      />

      {/* 已有 Tag */}
      <div style={{ marginTop: 10 }}>
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => addTag(tag)}
            disabled={selected.includes(tag)}
            style={{
              marginRight: 6,
              marginBottom: 6,
              padding: "4px 8px",
              borderRadius: 12,
              cursor: "pointer",
            }}
          >
            #{tag}
          </button>
        ))}
      </div>
    </div>
  )
}
