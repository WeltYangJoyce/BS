import api from './api'

export const login = async (payload) => {
  const res = await api.post('/login', payload)
  return res.data
}

export const register = async (payload) => {
  const res = await api.post('/register', payload)
  return res.data
}
