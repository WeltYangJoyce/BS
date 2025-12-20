import api from './api'

// 获取图片列表（支持排序）

export const fetchImages = ({ sort = "time", tags = [], username, image_id }) => {
  const params = new URLSearchParams()
  params.append("sort", sort)

  if (tags && tags.length > 0) {
    params.append("tag", tags.join(","))
  }

  if (username) {
    params.append("username", username)
  }

  if (image_id) {
    params.append("image_id", image_id)
  }

  return api.get(`/images?${params.toString()}`)
}




// 上传图片
// ✅ 直接接收 FormData
export const uploadImage = (file, tags = "") => {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("tags", tags)

  return api.post("/images", formData)
}

// EXIF 预分析（不上传）
export const analyzeImage = (file) => {
  const formData = new FormData()
  formData.append("file", file)

  return api.post("/images/analyze", formData)
}



// 删除图片
export const deleteImage = (id) => {
  return api.delete(`/images/${id}`)
}

// 记录浏览量
export const viewImage = (id) => {
  return api.post(`/images/${id}/view`)
}

// 点赞 / 取消点赞
export const toggleLike = (id) => {
  return api.post(`/images/${id}/like`)
}

// 当前用户图片
export const fetchMyImages = () => {
  return api.get('/images/mine')
}

export const fetchTags = () => {
  return api.get('/tags')
}

// 轮播专用接口
export const fetchRecommendedImages = (limit = 5) => {
  return api.get(`/images/recommend?limit=${limit}`)
}
