<template>
  <div class="chat-page">
    <MainNav :items="navItems" active="社区" @login="openAuthModal" />
    <AuthModal
      :show="showAuthModal"
      :is-register-mode="isRegisterMode"
      :form="authForm"
      :error-message="authError"
      @close="showAuthModal = false"
      @toggle-mode="toggleMode"
      @login="handleLogin"
      @register="handleRegister"
      @error="(msg) => (authError = msg)"
    />

    <main class="chat-main">
      <header class="chat-header glass-card">
        <h1>社区聊天室</h1>
      </header>

      <section class="chat-panel glass-card">
        <div class="chat-messages" ref="messageListRef">
          <template v-for="group in groupedMessages" :key="group.timeTitle + group.msgList[0].id">
            <div v-if="group.timeTitle" class="chat-time-divider">
              <span>{{ group.timeTitle }}</span>
            </div>
            <div
              v-for="item in group.msgList"
              :key="item.id"
              :class="['chat-row', item.type === 'system' ? 'system-row' : item.nickname === username ? 'mine' : 'other']"
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
          <input v-model="text" maxlength="200" placeholder="输入消息..." :disabled="!isAuthed" />
          <button type="submit" :disabled="!isAuthed">发送</button>
        </form>
      </section>
    </main>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, computed, nextTick, watch } from 'vue'
import MainNav from '../components/common/MainNav.vue'
import AuthModal from '../components/common/AuthModal.vue'
import { useAuth } from '../composables/useAuth.js'
import './ChatRoomView.css'

const { isAuthed, currentUser, username, login: authLogin, register: authRegister, validateToken, getToken, getApiBase, logout, clearAuth } = useAuth()

const navItems = ['首页', '宠物介绍', '小游戏', '社区']
const text = ref('')
const messages = ref([])
const typingUsers = ref([])
const messageListRef = ref(null)
const connectionStatus = ref('')
const authError = ref('')
const isRegisterMode = ref(false)
const showAuthModal = ref(false)
const authForm = ref({ username: '', password: '', confirmPassword: '' })
let socket
let historyPollTimer
let wsConnected = false

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

async function loadChatHistory() {
  try {
    const response = await fetch(`${getApiBase()}/api/chat/messages`, {
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

function startHistoryPolling() {
  if (historyPollTimer) return
  historyPollTimer = window.setInterval(() => {
    if (isAuthed.value) loadChatHistory()
  }, 5000)
}

function stopHistoryPolling() {
  if (historyPollTimer) {
    clearInterval(historyPollTimer)
    historyPollTimer = undefined
  }
}

let visibilityHandler = null
function startVisibilityWatch() {
  if (visibilityHandler) return
  visibilityHandler = () => {
    if (!document.hidden && isAuthed.value && socket?.readyState !== WebSocket.OPEN) {
      connectSocket()
    }
  }
  document.addEventListener('visibilitychange', visibilityHandler)
}

function stopVisibilityWatch() {
  if (visibilityHandler) {
    document.removeEventListener('visibilitychange', visibilityHandler)
    visibilityHandler = null
  }
}

async function handleLogin() {
  authError.value = ''
  try {
    await authLogin({ username: authForm.value.username, password: authForm.value.password })
    showAuthModal.value = false
    connectSocket()
    startHistoryPolling()
    startVisibilityWatch()
    await loadChatHistory()
  } catch (error) {
    authError.value = error?.message || '登录失败'
  }
}

async function handleRegister() {
  authError.value = ''
  try {
    await authRegister({ username: authForm.value.username, password: authForm.value.password })
    showAuthModal.value = false
    connectSocket()
    startHistoryPolling()
    startVisibilityWatch()
    await loadChatHistory()
  } catch (error) {
    authError.value = error?.message || '注册失败'
  }
}

function openAuthModal() {
  isRegisterMode.value = false
  authError.value = ''
  showAuthModal.value = true
}

function toggleMode() {
  isRegisterMode.value = !isRegisterMode.value
  authError.value = ''
}

function onTyping() {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'typing', nickname: username.value || '游客', typing: Boolean(text.value.trim()), token: getToken() }))
  }
}

async function sendMessage() {
  const payload = { nickname: username.value || '游客', text: text.value.trim(), token: getToken() }
  if (!payload.text) return

  try {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'message', ...payload }))
    } else {
      const response = await fetch(`${getApiBase()}/api/chat/messages`, {
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
  if (socket) {
    try { socket.close() } catch {}
  }
  const token = getToken()
  const wsUrl = (getApiBase() || '').replace(/^https?:\/\//, (m) => m.startsWith('https') ? 'wss://' : 'ws://') + '/ws/chat'
  try {
    socket = new WebSocket(`${wsUrl}?token=${encodeURIComponent(token)}`)
    socket.onopen = () => {
      connectionStatus.value = '已连接'
      wsConnected = true
    }
    socket.onclose = () => {
      connectionStatus.value = '已断开'
      wsConnected = false
    }
    socket.onerror = () => {
      connectionStatus.value = '连接错误'
      wsConnected = false
    }
    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'snapshot') {
        messages.value = (data.messages || []).map(normalizeMessage)
        scrollBottom()
        return
      }
      if (data.type === 'message' || data.type === 'system' || data.type === 'refresh') {
        await loadChatHistory()
        return
      }
      if (data.type === 'typing') {
        typingUsers.value = data.users || []
      }
      if (data.type === 'error') {
        connectionStatus.value = data.message || '发送失败'
      }
      scrollBottom()
    }
  } catch (err) {
    console.error('connect socket failed:', err)
  }
}

onMounted(async () => {
  const authed = await validateToken()
  if (authed) {
    await loadChatHistory()
    connectSocket()
    startHistoryPolling()
    startVisibilityWatch()
  } else {
    openAuthModal()
  }
})

watch(isAuthed, (authed) => {
  if (!authed) {
    stopHistoryPolling()
    stopVisibilityWatch()
    if (socket) {
      try { socket.close() } catch {}
      socket = null
    }
    messages.value = []
  }
})

onBeforeUnmount(() => {
  stopHistoryPolling()
  stopVisibilityWatch()
  if (socket) {
    try { socket.close() } catch {}
  }
})
</script>