import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { fetchImages, fetchRecommendedImages } from "../api/image"
import { fetchTags } from "../api/tag"
import GalleryGrid from "../components/GalleryGrid"
import TagBar from "../components/SearchBar"
import BackToHomeButton from "../components/BackToHomeButton"
import ImageCarousel from "../components/ImageCarousel"
import "../style/gallery.css"

export default function Gallery() {
  /* =============================
     基础状态
  ============================= */
  const [images, setImages] = useState([])
  const [carouselImages, setCarouselImages] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)

  const [searchInput, setSearchInput] = useState("")
  const [searchType, setSearchType] = useState("tag")
  const [sort, setSort] = useState("time")

  const [searchParams, setSearchParams] = useSearchParams()

  /* =============================
     从 URL 派生搜索状态
  ============================= */
  const activeTags = useMemo(() => {
    const tag = searchParams.get("tag")
    return tag ? [tag] : []
  }, [searchParams])

  /* =============================
     加载 Tags（一次）
  ============================= */
  useEffect(() => {
    fetchTags().then(res => setTags(res.data.tags))
  }, [])

  /* =============================
     加载推荐轮播（一次）
     👉 与搜索完全解耦
  ============================= */
  useEffect(() => {
    fetchRecommendedImages(5).then(res => {
      const list = res.data.images || []
      console.log(res.data.images)
      setCarouselImages(
        list.map(img => ({
          id: img.id,
          url: img.url, // 注意这里和 ImageCarousel 对应
        }))
      )
    })
  }, [])

  /* =============================
     加载 Gallery 图片（由 URL 决定）
  ============================= */
  useEffect(() => {
    setLoading(true)

    fetchImages({
      sort,
      tags: searchParams.get("tag")
        ? [searchParams.get("tag")]
        : [],
      username: searchParams.get("username") || undefined,
      image_id: searchParams.get("image_id") || undefined,
    })
      .then(res => setImages(res.data.images || []))
      .finally(() => setLoading(false))
  }, [searchParams, sort])

  /* =============================
     搜索提交
  ============================= */
  const handleSearchSubmit = () => {
    const value = searchInput.trim()
    if (!value) return

    if (searchType === "tag") {
      setSearchParams({ tag: value })
    } else if (searchType === "username") {
      setSearchParams({ username: value })
    } else {
      setSearchParams({ image_id: value })
    }

    setSearchInput("")
  }

  /* =============================
     Tag 操作
  ============================= */
  const handleAddTag = (tag) => {
    setSearchType("tag")
    setSearchParams({ tag })
  }

  const handleRemoveTag = () => {
    setSearchParams({})
  }

  /* =============================
     Tag 下拉过滤
  ============================= */
  const filteredTags = useMemo(() => {
    return tags.filter(t =>
      t.name.toLowerCase().includes(searchInput.toLowerCase())
    )
  }, [tags, searchInput])

  /* =============================
     UI
  ============================= */
  return (
    <div style={{ padding: 40 }}>
      <h2>Gallery</h2>
      <BackToHomeButton />

      {/* 推荐轮播（始终显示） */}
      {carouselImages.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <ImageCarousel images={carouselImages} />
        </div>
      )}

      {/* 排序 */}
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => setSort("time")}
          style={{ fontWeight: sort === "time" ? "bold" : "normal" }}
        >
          Time
        </button>
        <button
          onClick={() => setSort("hot")}
          style={{
            marginLeft: 10,
            fontWeight: sort === "hot" ? "bold" : "normal",
          }}
        >
          Hot
        </button>
      </div>

      {/* 搜索类型 */}
      <select
        value={searchType}
        onChange={e => setSearchType(e.target.value)}
        style={{ marginBottom: 12 }}
      >
        <option value="tag">Search by Tag</option>
        <option value="username">Search by Username</option>
        <option value="image_id">Search by Image ID</option>
      </select>

      {/* SearchBar */}
      <TagBar
        tags={filteredTags}
        activeTags={activeTags}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onSearchSubmit={handleSearchSubmit}
        searchType={searchType}
      />

      {/* Gallery */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <GalleryGrid images={images} />
      )}
    </div>
  )
}
