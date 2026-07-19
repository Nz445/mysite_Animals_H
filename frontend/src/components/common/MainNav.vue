<template>
  <div class="main-tool-bar" :class="{ 'main-tool-bar--scrolled': scrolled }">
    <div class="toolbar-inner">
      <div class="brand">
        <div class="logo-badge">🐾</div>
        <div>
          <div class="brand-name">宠物档案</div>
          <div class="brand-slogan">遇见更可爱的陪伴</div>
        </div>
      </div>

      <nav class="nav-links" :class="{ 'nav-links--open': menuOpen }">
        <router-link
          v-for="item in items"
          :key="item"
          :to="itemPaths[item] || '/'"
          :class="['nav-link', { active: item === active }]"
          @click="closeMenu"
        >
          {{ item }}
        </router-link>
      </nav>

      <template v-if="isAuthed && username">
        <el-dropdown trigger="click" @command="handleUserCommand" class="user-dropdown">
          <span class="nav-link nav-user-link" type="button">
            <span class="user-avatar">{{ avatarText }}</span>
            <span class="user-name">{{ username }}</span>
            <span class="caret">▾</span>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item command="switch-account">更换账户</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
      <template v-else>
        <button class="nav-link nav-login-link" type="button" @click="$emit('login')">
          登录
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useAuth } from '../../composables/useAuth.js'
import './MainNav.css'

defineProps({
  items: { type: Array, default: () => [] },
  active: { type: String, default: '' },
})
defineEmits(['login', 'switch-account', 'logout', 'user-menu'])

const { isAuthed, username, logout } = useAuth()

const avatarText = computed(() => (username.value ? username.value.slice(0, 1).toUpperCase() : '🐾'))

const itemPaths = {
  首页: '/',
  宠物介绍: '/pets',
  小游戏: '/games',
  社区: '/chat',
}

const scrolled = ref(false)
const menuOpen = ref(false)
let onScroll

const toggleMenu = () => { menuOpen.value = !menuOpen.value }
const closeMenu = () => { menuOpen.value = false }

const handleUserCommand = (command) => {
  if (command === 'logout') {
    logout()
  } else if (command === 'switch-account') {
    logout()
  }
}

onMounted(() => {
  onScroll = () => {
    scrolled.value = window.scrollY > 10
  }
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>