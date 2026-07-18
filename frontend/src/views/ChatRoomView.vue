<template>
  <div class="chat-page">
    <MainNav :items="navItems" active="社区" />

    <main class="chat-main">
      <header class="chat-header glass-card">
   
        <h1>社区聊天室</h1>

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
          <template v-for="group in groupedMessages" :key="group.timeTitle + group.msgList[0].id">
            <div v-if="group.timeTitle" class="chat-time-divider">
              <span>{{ group.timeTitle }}</span>
            </div>
            <div
              v-for="item in group.msgList"
              :key="item.id"
              :class="['chat-row', item.type === 'system' ? 'system-row' : item.nickname === currentUser?.username ? 'mine' : 'other']"
            >
              <template v-if="item.type === 'system'">
                <div class="system-bubble">{{ item.text }}</div>
              </template>
              <template v-else>
                <div class="bubble-wrap">
                  <div class="bubble-name">{{ item.nickname }}</div>
                  <div class="chat-bubble">
                    <span class="chat-text">{{ item.text }}</span>
                  </div>
                </div>
              </template>
            </div>
          </template>
        </div>

        <form class="chat-form" @submit.prevent="sendMessage">
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
const groupedMessages = computed(() => groupChatMessage(messages.value))
const TEN_MINUTE = 10 * 60 * 1000

function parseChatTime(message) {
  const source = message.created_at || message.time || ''
  const date = new Date(source)
  return Number.isNaN(date.getTime()) ? new Date() : date
}

function formatTime(date) {
  const now = new Date()
  const diffDay = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  if (diffDay === 0) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (diffDay === 1) {
    return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (diffDay <= 3) {
    return date.toLocaleDateString('zh-CN', { weekday: 'long' }) + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function groupChatMessage(list) {
  const groups = []
  if (!list.length) return groups
  const sorted = [...list].sort((a, b) => parseChatTime(a) - parseChatTime(b))
  let currentGroup = { timeTitle: '', msgList: [sorted[0]] }
  groups.push(currentGroup)
  let prevTime = parseChatTime(sorted[0])

  for (let i = 1; i < sorted.length; i++) {
    const curr = sorted[i]
    const currTime = parseChatTime(curr)
    const isDiffDay = prevTime.toDateString() !== currTime.toDateString()
    const diffMs = currTime - prevTime
    const needSplit = isDiffDay || diffMs > TEN_MINUTE

    if (needSplit) {
      currentGroup.timeTitle = formatTime(prevTime)
      currentGroup = { timeTitle: '', msgList: [] }
      groups.push(currentGroup)
    }
    currentGroup.msgList.push(curr)
    prevTime = currTime
  }

  groups[groups.length - 1].timeTitle = formatTime(parseChatTime(groups.at(-1).msgList[0]))
  return groups
}

function normalizeMessage(message) {
  const time = message.time || message.created_at || ''
  return { ...message, time, _date: parseChatTime(message) }
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

async function loadChatHistory() {
  try {
    const response = await fetch(`${apiBaseUrl}/api/chat/messages`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data?.message || '加载历史失败')
    messages.value = (data.messages || []).map(normalizeMessage)
    scrollBottom()
  } catch (error) {
    console.error('loadChatHistory failed:', error)
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
      const nextMessages = [...messages.value.flatMap(group => group.msgList), normalizeMessage(data.message)]
      messages.value = groupChatMessage(nextMessages)
      onlineCount.value = data.onlineCount || onlineCount.value
    }
    if (data.type === 'system') {
      const nextMessages = [...messages.value.flatMap(group => group.msgList), normalizeMessage({ id: Date.now(), type: 'system', text: data.text, time: data.time })]
      messages.value = groupChatMessage(nextMessages)
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
  if (authed) {
    await loadChatHistory()
    connectSocket()
  }
})

onBeforeUnmount(() => socket?.close())
</script>
