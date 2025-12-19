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
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()

  // 🔹 初始化 activeTags 从 URL
  useEffect(() => {
    const tagFromUrl = searchParams.get("tag")
    if (tagFromUrl) {
      setActiveTags([tagFromUrl])
    }
  }, [searchParams])

  // 🔹 加载所有 tag
  useEffect(() => {
    fetchTags().then(res => setTags(res.data.tags))
  }, [])

  // 🔹 加载图片
  const loadImages = () => {
    setLoading(true)
    fetchImages({
      sort,
      tags: activeTags,
    })
      .then(res => setImages(res.data.images))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadImages()
  }, [sort, activeTags])

  // 🔹 点击 tag 切换
  const toggleTag = (name) => {
    let newActiveTags
    if (activeTags.includes(name)) {
      newActiveTags = activeTags.filter(t => t !== name)
    } else {
      newActiveTags = [name] // 单 tag 筛选
    }
    setActiveTags(newActiveTags)
    // 同步 URL
    setSearchParams({ tag: newActiveTags[0] || "" })
  }

  // 🔹 搜索按钮点击
  const handleSearchSubmit = () => {
    if (searchInput.trim()) {
      setActiveTags([searchInput.trim()])
      setSearchParams({ tag: searchInput.trim() })
      setSearchInput("")
    }
  }

  // 🔹 过滤 tag 下拉建议
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

      {/* Tag 搜索栏 */}
      <TagBar
        tags={filteredTags}
        activeTags={activeTags}
        onToggle={toggleTag}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onSearchSubmit={handleSearchSubmit}
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
