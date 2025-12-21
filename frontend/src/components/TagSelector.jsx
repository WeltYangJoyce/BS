import { useEffect, useMemo, useState } from "react"
import { fetchTags } from "../api/tag"

export default function TagSelector({
  value,
  onChange,
  suggested = [], // ✅ EXIF 推荐 Tag
}) {
  const [allTags, setAllTags] = useState([])
  const [input, setInput] = useState("")

  /* =============================
     获取所有 Tag（含使用量）
  ============================= */

  useEffect(() => {
    fetchTags().then(res => {
      // 期望结构：[{ name, count }]
      setAllTags(res.data.tags || [])
    })
  }, [])

  /* =============================
     已选 Tag
  ============================= */

  const selected = useMemo(
    () => (value ? value.split(",").filter(Boolean) : []),
    [value]
  )

  const selectedSet = useMemo(
    () => new Set(selected),
    [selected]
  )

  /* =============================
     EXIF 推荐 Tag（去重 + 排序）
  ============================= */

  const suggestedFiltered = useMemo(() => {
    return Array.from(
      new Set(
        suggested.filter(tag => !selectedSet.has(tag))
      )
    ).sort()
  }, [suggested, selectedSet])

  /* =============================
     Top 10 Existing Tags（按使用量）
  ============================= */

  const topExistingTags = useMemo(() => {
    return [...allTags]
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, 10)
      .map(t => t.name)
  }, [allTags])

  /* =============================
     最终可选 Existing Tags
  ============================= */

  const existingFiltered = useMemo(() => {
    return topExistingTags
      .filter(
        tag =>
          !selectedSet.has(tag) &&
          !suggestedFiltered.includes(tag)
      )
      .sort()
  }, [topExistingTags, selectedSet, suggestedFiltered])

  /* =============================
     操作函数
  ============================= */

  const addTag = (tag) => {
    if (selectedSet.has(tag)) return
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

  /* =============================
     UI
  ============================= */

  return (
    <div style={{ marginTop: 20 }}>
      {/* 已选 Tag */}
      {selected.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {selected.map(tag => (
            <span
              key={tag}
              onClick={() => removeTag(tag)}
              style={{
                background: "#333",
                color: "#fff",
                padding: "4px 8px",
                borderRadius: 12,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              #{tag} ✕
            </span>
          ))}
        </div>
      )}

      {/* 输入框 */}
      <input
        placeholder="Add tag and press Enter"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          marginTop: 10,
          width: "100%",
          padding: 6,
          boxSizing: "border-box",
        }}
      />

      {/* EXIF 推荐 Tag */}
      {suggestedFiltered.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 13, color: "#666", marginBottom: 6 }}>
            ⭐ Suggested by EXIF
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {suggestedFiltered.map(tag => (
              <span
                key={tag}
                onClick={() => addTag(tag)}
                style={{
                  background: "#eee",
                  color: "#333",
                  padding: "4px 8px",
                  borderRadius: 12,
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                + #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Existing Tags（Top 10） */}
      {existingFiltered.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 13, color: "#666", marginBottom: 6 }}>
            Popular Tags
          </div>
          <div>
            {existingFiltered.map(tag => (
              <button
                key={tag}
                onClick={() => addTag(tag)}
                style={{
                  marginRight: 6,
                  marginBottom: 6,
                  padding: "4px 8px",
                  borderRadius: 12,
                  cursor: "pointer",
                  border: "1px solid #ccc",
                  color:"black",
                  background: "#fff",
                  fontSize: 13,
                }}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
