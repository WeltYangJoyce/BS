import { useState, useRef, useEffect } from "react"
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
  setSearchType,
}) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const [dropdownHeight, setDropdownHeight] = useState(0)

  const searchTypes = [
    { value: "tag", label: "Tag" },
    { value: "username", label: "Username" },
    { value: "image_id", label: "Image ID" },
  ]

  useEffect(() => {
    if (dropdownRef.current) {
      setDropdownHeight(showTypeDropdown ? dropdownRef.current.scrollHeight : 0)
    }
  }, [showTypeDropdown])

  return (
    <div className="tag-bar">
      {/* Active Tags */}
      {searchType === "tag" && activeTags.length > 0 && (
        <div className="active-tags">
          {activeTags.map(tag => (
            <span key={tag} className="tag-chip active">
              {tag}
              <span className="remove" onClick={() => onRemoveTag(tag)}>×</span>
            </span>
          ))}
        </div>
      )}

      {/* Search Bar */}
      <div className="search-wrapper">
        {/* 自定义下拉 */}
        <div
          className="search-type-dropdown"
          onClick={() => setShowTypeDropdown(!showTypeDropdown)}
        >
          {searchTypes.find(t => t.value === searchType)?.label}
          <span className={`arrow ${showTypeDropdown ? "up" : "down"}`}>▼</span>
          <div
            ref={dropdownRef}
            className="dropdown-menu"
            style={{ maxHeight: `${dropdownHeight}px` }}
          >
            {searchTypes.map(t => (
              <div
                key={t.value}
                className="dropdown-item"
                onClick={() => {
                  setSearchType(t.value)
                  setShowTypeDropdown(false)
                }}
              >
                {t.label}
              </div>
            ))}
          </div>
        </div>

        {/* 输入框 */}
        <input
          value={searchInput}
          placeholder={
            searchType === "tag"
              ? "Type a tag..."
              : searchType === "username"
              ? "Type a username..."
              : "Type an Image ID..."
          }
          onChange={e => {
            setSearchInput(e.target.value)
            setShowSuggestions(searchType === "tag" && e.target.value.length > 0)
          }}
          onFocus={() =>
            setShowSuggestions(searchType === "tag" && searchInput.length > 0)
          }
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        />

        {/* 搜索按钮 */}
        <button onClick={onSearchSubmit}>Search</button>
      </div>

      {/* Tag Suggestions */}
      {showSuggestions && searchType === "tag" && tags.length > 0 && (
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
