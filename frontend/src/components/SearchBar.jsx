import { useState } from "react"
import '../style/SearchBar.css'

export default function TagBar({
  tags = [],
  activeTags = [],
  onToggle,
  searchInput,
  setSearchInput,
  onSearchSubmit,
  searchType
}) {
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleSuggestionClick = (tagName) => {
    setSearchInput("")
    setShowSuggestions(false)
    onToggle?.(tagName)
  }

  const handleRemoveTag = (tag) => {
    onToggle?.(tag)
  }

  return (
    <div className="tag-bar">
      {/* active tags only for tag search */}
      {searchType === "tag" && (
        <div className="active-tags">
          {activeTags.map(tag => (
            <span key={tag} className="tag-chip active">
              {tag} <span className="remove" onClick={() => handleRemoveTag(tag)}>×</span>
            </span>
          ))}
        </div>
      )}

      {/* 搜索输入 + 按钮 */}
      <div className="search-wrapper">
        <input
          type="text"
          placeholder={
            searchType === "tag" ? "Search tags..." :
            searchType === "username" ? "Search username..." :
            "Search by Image ID..."
          }
          value={searchInput}
          onChange={e => {
            setSearchInput(e.target.value)
            if (searchType === "tag") setShowSuggestions(e.target.value.length > 0)
          }}
          onFocus={() => setShowSuggestions(searchType === "tag" && searchInput.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        />
        <button onClick={onSearchSubmit}>Search</button>
      </div>

      {/* 下拉建议 only for tag search */}
      {showSuggestions && tags.length > 0 && searchType === "tag" && (
        <div className="suggestions">
          {tags.map(tag => (
            <div
              key={tag.name}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(tag.name)}
            >
              {tag.name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
