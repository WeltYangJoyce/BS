import { useState } from "react"
import "../style/SearchBar.css"

export default function TagBar({
  tags = [],
  activeTags = [],
  onAddTag,
  onRemoveTag,
  searchInput,
  setSearchInput,
  onSearchSubmit,
  searchType,
}) {
  const [showSuggestions, setShowSuggestions] = useState(false)

  return (
    <div className="tag-bar">
      {/* Active Tags */}
      {searchType === "tag" && (
        <div className="active-tags">
          {activeTags.map(tag => (
            <span key={tag} className="tag-chip active">
              {tag}
              <span className="remove" onClick={onRemoveTag}>
                ×
              </span>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="search-wrapper">
        <input
          value={searchInput}
          placeholder={
            searchType === "tag"
              ? "Search tags..."
              : searchType === "username"
              ? "Search username..."
              : "Search by Image ID..."
          }
          onChange={e => {
            setSearchInput(e.target.value)
            setShowSuggestions(
              searchType === "tag" && e.target.value.length > 0
            )
          }}
          onFocus={() =>
            setShowSuggestions(searchType === "tag" && searchInput.length > 0)
          }
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        />
        <button onClick={onSearchSubmit}>Search</button>
      </div>

      {/* Suggestions */}
      {showSuggestions && searchType === "tag" && (
        <div className="suggestions">
          {tags.map(tag => (
            <div
              key={tag.name}
              className="suggestion-item"
              onClick={() => {
                onAddTag(tag.name)
                setSearchInput("")
                setShowSuggestions(false)
              }}
            >
              {tag.name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
