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
        </div>
      </header>

      <section class="chat-panel glass-card">
        <div class="chat-messages" ref="messageListRef">
          <div v-for="item in messages" :key="item.id" :class="['chat-message', item.type]">
            <span class="chat-meta">{{ item.time || '' }}</span>
            <strong class="chat-name" v-if="item.type !== 'system'">{{ item.nickname }}</strong>
            <span class="chat-text">{{ item.text }}</span>
          </div>
        </div>

        <form class="chat-form" @submit.prevent="sendMessage">
          <input v-model="nickname" maxlength="12" placeholder="昵称（可选）" />
          <input v-model="text" maxlength="200" placeholder="输入消息..." @input="onTyping" />
          <button type="submit">发送</button>
        </form>
      </section>
    </main>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, computed, nextTick } from 'vue'
import MainNav from '../components/common/MainNav.vue'
import './ChatRoomView.css'

const wsUrl = import.meta.env.VITE_WS_URL || 'ws://152.136.232.134:3000/ws/chat'
const navItems = ['首页', '宠物介绍', '社区']
const nickname = ref('游客')
const text = ref('')
const messages = ref([])
const onlineCount = ref(0)
const typingUsers = ref([])
const messageListRef = ref(null)
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

function onTyping() {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'typing', nickname: nickname.value || '游客', typing: Boolean(text.value.trim()) }))
  }
}

function sendMessage() {
  if (!text.value.trim() || socket?.readyState !== WebSocket.OPEN) return
  socket.send(JSON.stringify({ type: 'message', nickname: nickname.value || '游客', text: text.value.trim() }))
  text.value = ''
}

onMounted(() => {
  socket = new WebSocket(wsUrl)
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
    scrollBottom()
  }
})

onBeforeUnmount(() => socket?.close())
</script>
