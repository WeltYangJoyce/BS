import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { fetchImages, fetchRecommendedImages } from "../api/image"
import { fetchTags } from "../api/tag"
import GalleryGrid from "../components/GalleryGrid"
import TagBar from "../components/SearchBar"
import BackToHomeButton from "../components/BackToHomeButton"
import ImageCarousel from "../components/ImageCarousel"
//import "../style/gallery.css"
import "../style/common.css"
export default function Gallery() {
  const [images, setImages] = useState([])
  const [carouselImages, setCarouselImages] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)

  const [searchInput, setSearchInput] = useState("")
  const [searchType, setSearchType] = useState("tag")
  const [sort, setSort] = useState("time")

  const [searchParams, setSearchParams] = useSearchParams()

  // URL 派生 activeTags
  const activeTags = useMemo(() => {
    const tag = searchParams.get("tag")
    return tag ? [tag] : []
  }, [searchParams])

  // 加载 tags
  useEffect(() => {
    fetchTags().then(res => setTags(res.data.tags))
  }, [])

  // 加载推荐轮播
  useEffect(() => {
    fetchRecommendedImages(5).then(res => {
      const list = res.data.images || []
      setCarouselImages(list.map(img => ({ id: img.id, url: img.url })))
    })
  }, [])

  // 加载 Gallery 图片
  useEffect(() => {
    setLoading(true)
    fetchImages({
      sort,
      tags: searchParams.get("tag") ? [searchParams.get("tag")] : [],
      username: searchParams.get("username") || undefined,
      image_id: searchParams.get("image_id") || undefined,
    })
      .then(res => setImages(res.data.images || []))
      .finally(() => setLoading(false))
  }, [searchParams, sort])

  // 搜索提交
  const handleSearchSubmit = () => {
    const value = searchInput.trim()
    if (!value) return

    if (searchType === "tag") setSearchParams({ tag: value })
    else if (searchType === "username") setSearchParams({ username: value })
    else setSearchParams({ image_id: value })

    setSearchInput("")
  }

  // Tag 操作
  const handleAddTag = tag => {
    setSearchType("tag")
    setSearchParams({ tag })
  }
  const handleRemoveTag = () => setSearchParams({})

  // Tag 下拉过滤
  const filteredTags = useMemo(() => {
    return tags.filter(t =>
      t.name.toLowerCase().includes(searchInput.toLowerCase())
    )
  }, [tags, searchInput])

  return (
    
    <div className="gallery-container">
      <h2 className="gallery-title">Gallery</h2>

      <BackToHomeButton />

      {/* 推荐轮播 */}
            {/* 推荐轮播 */}
      {carouselImages.length > 0 && (
        <div className="carousel-wrapper">
          <h3 className="carousel-title">推荐图片</h3>
          <ImageCarousel images={carouselImages} />
        </div>
      )}


      {/* 排序按钮 */}
      <div className="sort-buttons">
        <button
          onClick={() => setSort("time")}
          style={{ fontWeight: sort === "time" ? "bold" : "normal" }}
        >
          Time
        </button>
        <button
          onClick={() => setSort("hot")}
          style={{ fontWeight: sort === "hot" ? "bold" : "normal" }}
        >
          Hot
        </button>
      </div>

      {/* 搜索类型 */}
      {/* <select
        value={searchType}
        onChange={e => setSearchType(e.target.value)}
        className="search-type"
      >
        <option value="tag">Search by Tag</option>
        <option value="username">Search by Username</option>
        <option value="image_id">Search by Image ID</option>
      </select> */}

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
        setSearchType={setSearchType}
      />

      {/* Gallery */}
      {loading ? <p>Loading...</p> : <GalleryGrid images={images} />}
    </div>
  )
}
