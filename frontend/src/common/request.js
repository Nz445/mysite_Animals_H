import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || 'https://api.wsnz44.top'

const request = axios.create({
  baseURL: API_BASE.endsWith('/api') ? API_BASE.slice(0, -4) : API_BASE,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
})

request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error?.response?.data?.message || error.message || '请求失败'
    console.error('[request error]', message)
    return Promise.reject(error)
  }
)

export default request