import axios from 'axios'
import { Capacitor } from '@capacitor/core'

const localApiUrl = 'http://127.0.0.1:8000/api'
const productionApiUrl = 'https://techsolutions-backend.onrender.com/api'
const baseURL = import.meta.env.VITE_API_URL || (Capacitor.isNativePlatform() ? productionApiUrl : localApiUrl)

const api = axios.create({
  baseURL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
