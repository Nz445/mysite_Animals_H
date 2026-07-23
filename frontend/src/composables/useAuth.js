import { ref, computed } from 'vue'

const rawApiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || 'https://api.wsnz44.top'
const apiBaseUrl = rawApiBase.endsWith('/api') ? rawApiBase.slice(0, -4) : rawApiBase

const TOKEN_KEY = 'chat_token'
const USER_KEY = 'chat_user'

const isAuthed = ref(false)
const currentUser = ref(null)
let initialized = false

function loadCachedUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (raw) currentUser.value = JSON.parse(raw)
  } catch {
    currentUser.value = null
  }
}

function setAuth(user, token) {
  currentUser.value = user
  isAuthed.value = !!(user && token)
  if (token) localStorage.setItem(TOKEN_KEY, token)
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
}

function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  currentUser.value = null
  isAuthed.value = false
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

function getApiBase() {
  return apiBaseUrl
}

async function validateToken() {
  const token = getToken()
  if (!token) {
    clearAuth()
    return false
  }
  try {
    const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data?.message || '未登录')
    setAuth(data.user, token)
    return true
  } catch {
    clearAuth()
    return false
  }
}

async function login({ username, password }) {
  const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data?.message || '登录失败')
  setAuth(data.user, data.user?.token || data.token)
  return data
}

async function register({ username, password }) {
  const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data?.message || '注册失败')
  setAuth(data.user, data.user?.token || data.token)
  return data
}

function logout() {
  clearAuth()
}

export function useAuth() {
  if (!initialized) {
    loadCachedUser()
    isAuthed.value = !!(currentUser.value && getToken())
    initialized = true
  }
  const username = computed(() => currentUser.value?.username || '')
  return {
    isAuthed,
    currentUser,
    username,
    getToken,
    getApiBase,
    validateToken,
    login,
    register,
    logout,
    clearAuth,
    setAuth,
  }
}

export { apiBaseUrl as authApiBaseUrl }