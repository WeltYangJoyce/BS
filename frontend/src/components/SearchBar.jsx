import { useState } from "react"
import '../style/SearchBar.css'

export default function TagBar({
  tags = [],              // 所有可用 tag
  activeTags = [],        // 当前已选择的 tag
  onToggle,               // 点击 active tag 或主 tag
  search = "",            // 搜索输入（控制输入框）
  onSearch,               // 更新输入框内容
  searchInput,            // 用户输入的搜索文字
  setSearchInput,         // 更新搜索输入
  onSearchSubmit          // 搜索按钮点击事件
}) {
  const [showSuggestions, setShowSuggestions] = useState(false)

  // 点击下拉提示
  const handleSuggestionClick = (tagName) => {
    setSearchInput("")
    setShowSuggestions(false)
    onToggle?.(tagName)
  }

  // 点击删除 active tag
  const handleRemoveTag = (tag) => {
    onToggle?.(tag)
  }

  return (
    <div className="tag-bar">
      {/* 已选择的 active tag */}
      <div className="active-tags">
        {activeTags.map(tag => (
          <span key={tag} className="tag-chip active">
            {tag} <span className="remove" onClick={() => handleRemoveTag(tag)}>×</span>
          </span>
        ))}
      </div>

      {/* 搜索输入 + 按钮 */}
      <div className="search-wrapper">
        <input
          type="text"
          placeholder="Search tags..."
          value={searchInput}
          onChange={e => {
            setSearchInput(e.target.value)
            setShowSuggestions(e.target.value.length > 0)
          }}
          onFocus={() => setShowSuggestions(searchInput.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)} // 延迟关闭，避免点击失效
        />
        <button onClick={onSearchSubmit}>Search</button>
      </div>

      {/* 下拉建议 */}
      {showSuggestions && tags.length > 0 && (
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
