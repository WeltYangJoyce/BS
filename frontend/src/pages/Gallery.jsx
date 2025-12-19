import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { fetchImages } from "../api/image"
import { fetchTags } from "../api/tag"
import GalleryGrid from "../components/GalleryGrid"
import TagBar from "../components/SearchBar"
import BackToHomeButton from "../components/BackToHomeButton"
import '../style/gallery.css'

export default function Gallery() {
  const [images, setImages] = useState([])
  const [tags, setTags] = useState([])
  const [activeTags, setActiveTags] = useState([])
  const [sort, setSort] = useState("time")
  const [searchInput, setSearchInput] = useState("")
  const [searchType, setSearchType] = useState("tag") // "tag" | "username" | "image_id"
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()

  // 初始化 activeTags 或 searchType 从 URL
  useEffect(() => {
    const tagFromUrl = searchParams.get("tag")
    const usernameFromUrl = searchParams.get("username")
    const imageIdFromUrl = searchParams.get("image_id")

    if (tagFromUrl) {
      setActiveTags([tagFromUrl])
      setSearchType("tag")
    } else if (usernameFromUrl) {
      setActiveTags([])
      setSearchType("username")
    } else if (imageIdFromUrl) {
      setActiveTags([])
      setSearchType("image_id")
    }
  }, [searchParams])

  // 加载所有 tag
  useEffect(() => {
    fetchTags().then(res => setTags(res.data.tags))
  }, [])

  // 加载图片
  const loadImages = () => {
    setLoading(true)
    const params = {
      sort,
      tags: searchType === "tag" ? activeTags : [],
      username: searchType === "username" ? searchParams.get("username") : undefined,
      image_id: searchType === "image_id" ? searchParams.get("image_id") : undefined
    }

    fetchImages(params)
      .then(res => setImages(res.data.images))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadImages()
  }, [sort, activeTags, searchParams, searchType])

  // 点击 tag 切换
  const toggleTag = (name) => {
    let newActiveTags
    if (activeTags.includes(name)) {
      newActiveTags = activeTags.filter(t => t !== name)
    } else {
      newActiveTags = [name]
    }
    setActiveTags(newActiveTags)
    setSearchParams({ tag: newActiveTags[0] || "" })
    setSearchType("tag")
  }

  // 搜索提交
  const handleSearchSubmit = () => {
    if (!searchInput.trim()) return

    if (searchType === "tag") {
      setActiveTags([searchInput.trim()])
      setSearchParams({ tag: searchInput.trim() })
    } else if (searchType === "username") {
      setActiveTags([])
      setSearchParams({ username: searchInput.trim() })
    } else if (searchType === "image_id") {
      setActiveTags([])
      setSearchParams({ image_id: searchInput.trim() })
    }
    setSearchInput("")
  }

  // tag 下拉建议过滤
  const filteredTags = tags.filter(t =>
    t.name.toLowerCase().includes(searchInput.toLowerCase())
  )

  return (
    <div style={{ padding: 40 }}>
      <h2>Gallery</h2>
      <BackToHomeButton />

      {/* 排序 */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => setSort("time")}
          style={{
            marginRight: 10,
            fontWeight: sort === "time" ? "bold" : "normal",
          }}
        >
          Time
        </button>
        <button
          onClick={() => setSort("hot")}
          style={{
            fontWeight: sort === "hot" ? "bold" : "normal",
          }}
        >
          Hot
        </button>
      </div>

      {/* 搜索类型选择 */}
      <div style={{ marginBottom: 10 }}>
        <label>
          <select
            value={searchType}
            onChange={e => setSearchType(e.target.value)}
          >
            <option value="tag">Search by Tag</option>
            <option value="username">Search by Username</option>
            <option value="image_id">Search by Image ID</option>
          </select>
        </label>
      </div>

      {/* 搜索栏 */}
      <TagBar
        tags={filteredTags}
        activeTags={activeTags}
        onToggle={toggleTag}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onSearchSubmit={handleSearchSubmit}
        searchType={searchType}
      />

      {/* 图片 */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <GalleryGrid images={images} />
      )}
    </div>
  )
}
