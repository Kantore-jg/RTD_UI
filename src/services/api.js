import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  const token = authStore.token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const authStore = useAuthStore()

    if (error.response?.status === 401) {
      authStore.clearAuth()
      router.push('/login')
    }

    if (error.response?.status === 403 && error.response?.data?.suspended) {
      authStore.clearAuth()
      router.push({ path: '/login', query: { suspended: '1' } })
    }

    return Promise.reject(error)
  }
)

export default api
