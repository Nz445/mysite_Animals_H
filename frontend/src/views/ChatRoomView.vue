<template>
  <div class="chat-page">
    <MainNav :items="navItems" active="社区" />

    <main class="chat-main">
      <header class="chat-header glass-card">
        <div class="chat-badge">Community Chat</div>
        <h1>社区聊天室</h1>
        <p>在线人数实时更新，系统消息和输入提示都会显示。</p>
        <div class="chat-stats">
          <span>在线：{{ onlineCount }}</span>
          <span>系统消息：{{ systemCount }}</span>
          <span>输入中：{{ typingText }}</span>
          <span>连接：{{ connectionStatus }}</span>
          <span>账号：{{ currentUser?.username || '未登录' }}</span>
        </div>
      </header>

      <section class="chat-panel glass-card">
        <div v-if="!isAuthed" class="auth-mask">
          <div class="auth-card">
            <h2>{{ isRegisterMode ? '注册' : '登录' }}</h2>
            <form @submit.prevent="isRegisterMode ? handleRegister() : handleLogin()">
              <input v-model="authForm.username" maxlength="32" placeholder="名称" />
              <input v-model="authForm.password" type="password" placeholder="密码" />
              <input v-if="isRegisterMode" v-model="authForm.confirmPassword" type="password" placeholder="确认密码" />
              <button type="submit">{{ isRegisterMode ? '注册' : '登录' }}</button>
            </form>
            <button class="auth-switch" type="button" @click="toggleMode">
              {{ isRegisterMode ? '去登录' : '注册' }}
            </button>
            <p class="auth-tip">{{ authError }}</p>
          </div>
        </div>

        <div class="chat-messages" ref="messageListRef">
          <div v-for="item in messages" :key="item.id" :class="['chat-message', item.type]">
            <span class="chat-meta">{{ item.time || '' }}</span>
            <strong class="chat-name" v-if="item.type !== 'system'">{{ item.nickname }}</strong>
            <span class="chat-text">{{ item.text }}</span>
          </div>
        </div>

        <form class="chat-form" @submit.prevent="sendMessage">
          <input v-model="nickname" maxlength="12" placeholder="昵称（可选）" :disabled="!isAuthed" />
          <input v-model="text" maxlength="200" placeholder="输入消息..." @input="onTyping" :disabled="!isAuthed" />
          <button type="submit" :disabled="!isAuthed">发送</button>
        </form>
      </section>
    </main>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, computed, nextTick } from 'vue'
import MainNav from '../components/common/MainNav.vue'
import './ChatRoomView.css'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.wsnz44.top'
const wsUrl = import.meta.env.VITE_WS_URL || 'wss://api.wsnz44.top/ws/chat'
const navItems = ['首页', '宠物介绍', '社区']
const nickname = ref('游客')
const text = ref('')
const messages = ref([])
const onlineCount = ref(0)
const typingUsers = ref([])
const messageListRef = ref(null)
const connectionStatus = ref('连接中')
const authError = ref('')
const isAuthed = ref(false)
const isRegisterMode = ref(false)
const currentUser = ref(null)
const authForm = ref({ username: '', password: '', confirmPassword: '' })
let socket

const systemCount = computed(() => messages.value.filter(item => item.type === 'system').length)
const typingText = computed(() => typingUsers.value.length ? typingUsers.value.join('、') + ' 正在输入' : '无人')

function normalizeMessage(message) {
  const time = message.time || message.created_at || ''
  return { ...message, time }
}

function scrollBottom() {
  nextTick(() => {
    messageListRef.value?.scrollTo({ top: messageListRef.value.scrollHeight, behavior: 'smooth' })
  })
}

function getToken() {
  return localStorage.getItem('chat_token') || ''
}

function setToken(token) {
  localStorage.setItem('chat_token', token)
}

function clearAuth() {
  localStorage.removeItem('chat_token')
  currentUser.value = null
  isAuthed.value = false
}

async function validateToken() {
  const token = getToken()
  if (!token) {
    isAuthed.value = false
    return false
  }

  try {
    const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data?.message || '未登录')
    currentUser.value = data.user
    isAuthed.value = true
    nickname.value = data.user?.username || '游客'
    return true
  } catch {
    clearAuth()
    return false
  }
}
// 登录
async function handleLogin() {
  authError.value = ''
  try {
    const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authForm.value),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data?.message || '登录失败')
    // 登录成功后保存 token
    setToken(data.user.token)
    currentUser.value = data.user
    nickname.value = data.user.username
    isAuthed.value = true
    // 连接 WebSocket 服务器
    connectSocket()
  } catch (error) {
    authError.value = error?.message || '登录失败'
  }
}

async function handleRegister() {
  authError.value = ''
  try {
    const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authForm.value),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data?.message || '注册失败')
    // 注册成功后保存 token
    setToken(data.user.token)
    currentUser.value = data.user
    nickname.value = data.user.username
    isAuthed.value = true
    connectSocket()
  } catch (error) {
    authError.value = error?.message || '注册失败'
  }
}

function toggleMode() {
  isRegisterMode.value = !isRegisterMode.value
  authError.value = ''
}

function onTyping() {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'typing', nickname: nickname.value || '游客', typing: Boolean(text.value.trim()), token: getToken() }))
  }
}

async function sendMessage() {
  const payload = { nickname: nickname.value || '游客', text: text.value.trim(), token: getToken() }
  if (!payload.text) return

  try {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'message', ...payload }))
    } else {
      const response = await fetch(`${apiBaseUrl}/api/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${payload.token}` },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.message || '发送失败')
      messages.value.push(normalizeMessage(data.message))
    }
    text.value = ''
    connectionStatus.value = '已发送'
    scrollBottom()
  } catch (error) {
    connectionStatus.value = error?.message || '发送失败'
  }
}

function connectSocket() {
  if (socket) socket.close()
  const token = getToken()
  // token 放到 ws URL 里，后端 upgrade 时可读取
  socket = new WebSocket(`${wsUrl}?token=${encodeURIComponent(token)}`)
  socket.onopen = () => {
    connectionStatus.value = '已连接'
  }
  socket.onclose = () => {
    connectionStatus.value = '已断开'
  }
  socket.onerror = () => {
    connectionStatus.value = '连接错误'
  }
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.type === 'snapshot') {
      messages.value = (data.messages || []).map(normalizeMessage)
      onlineCount.value = data.onlineCount || 0
    }
    if (data.type === 'message') {
      messages.value.push(normalizeMessage(data.message))
      onlineCount.value = data.onlineCount || onlineCount.value
    }
    if (data.type === 'system') {
      messages.value.push(normalizeMessage({ id: Date.now(), type: 'system', text: data.text, time: data.time }))
      onlineCount.value = data.onlineCount || onlineCount.value
    }
    if (data.type === 'typing') {
      typingUsers.value = data.users || []
    }
    if (data.type === 'error') {
      connectionStatus.value = data.message || '发送失败'
    }
    scrollBottom()
  }
}

onMounted(async () => {
  const authed = await validateToken()
  if (authed) connectSocket()
})

onBeforeUnmount(() => socket?.close())
</script>
