<template>
  <div class="chat-page">
    <MainNav :items="navItems" active="社区" />

    <main class="chat-main">
      <header class="chat-header glass-card">
        <div class="chat-badge">Community Chat</div>
        <h1>社区聊天室</h1>
        <p>第一步：不登录、不数据库，所有人都能看到彼此发的消息。</p>
        <div class="chat-stats">
          <span>实时轮询</span>
          <span>全员可见</span>
          <span>轻量内存版</span>
        </div>
      </header>

      <section class="chat-panel glass-card">
        <div class="chat-messages" ref="messageListRef">
          <div v-for="item in messages" :key="item.id" class="chat-message">
            <span class="chat-meta">{{ item.time }}</span>
            <strong class="chat-name">{{ item.nickname }}</strong>
            <span class="chat-text">{{ item.text }}</span>
          </div>
        </div>

        <form class="chat-form" @submit.prevent="sendMessage">
          <input v-model="nickname" maxlength="12" placeholder="昵称（可选）" />
          <input v-model="text" maxlength="200" placeholder="输入消息..." />
          <button type="submit">发送</button>
        </form>
      </section>
    </main>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, nextTick } from 'vue'
import MainNav from '../components/common/MainNav.vue'
import './ChatRoomView.css'
import request from '../common/request.js'

const navItems = ['首页', '宠物介绍', '社区']
const nickname = ref('游客')
const text = ref('')
const messages = ref([])
const messageListRef = ref(null)
let timer

async function loadMessages() {
  const data = await request.get('/api/chat/messages')
  messages.value = data.messages || []
  await nextTick()
  messageListRef.value?.scrollTo({ top: messageListRef.value.scrollHeight, behavior: 'smooth' })
}

async function sendMessage() {
  if (!text.value.trim()) return
  await request.post('/api/chat/messages', { nickname: nickname.value || '游客', text: text.value.trim() })
  text.value = ''
  await loadMessages()
}

onMounted(async () => {
  await loadMessages()
  timer = setInterval(loadMessages, 2000)
})

onBeforeUnmount(() => clearInterval(timer))
</script>
