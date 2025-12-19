import api from './api'

// 获取图片列表（支持排序）

export const fetchImages = ({ sort = "time", tags = [] }) => {
  const params = new URLSearchParams()
  params.append("sort", sort)

  if (tags.length > 0) {
    params.append("tag", tags.join(","))
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
