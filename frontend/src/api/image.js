import api from './api'

// 获取图片列表（支持排序）
export const fetchImages = (sort = 'time') => {
  return api.get('/images', {
    params: { sort },
  })
}

// 上传图片
export const uploadImage = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/images', formData)
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
