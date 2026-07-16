<template>
  <div class="main-tool-bar" :class="{ 'main-tool-bar--scrolled': scrolled }">
    <div class="toolbar-inner">
      <div class="brand">
        <div class="logo-badge">🐾</div>
        <div>
          <div class="brand-name">萌宠档案</div>
          <div class="brand-slogan">遇见更可爱的陪伴</div>
        </div>
      </div>

      <button class="nav-menu-btn" type="button" :aria-expanded="menuOpen" aria-label="打开菜单" @click="toggleMenu">
        <img src="/svg/菜单.svg" alt="菜单" class="nav-menu-icon" />
      </button>

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
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import './MainNav.css'

defineProps({
  items: { type: Array, default: () => [] },
  active: { type: String, default: '' },
})

const itemPaths = {
  首页: '/',
  宠物介绍: '/pets',
  社区: '/chat',
}

const scrolled = ref(false)
const menuOpen = ref(false)
let onScroll

const toggleMenu = () => { menuOpen.value = !menuOpen.value }
const closeMenu = () => { menuOpen.value = false }

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
