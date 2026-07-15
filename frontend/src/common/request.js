import axios from 'axios'

// 统一请求封装：配置后端地址、超时、错误处理。
const API_BASE = import.meta.env.VITE_API_BASE || 'http://152.136.232.134:3000'

const request = axios.create({
  baseURL: API_BASE,
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
