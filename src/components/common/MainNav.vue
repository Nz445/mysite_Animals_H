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

      <nav class="nav-links">
        <router-link
          v-for="item in items"
          :key="item"
          :to="itemPaths[item] || '/'"
          :class="['nav-link', { active: item === active }]"
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
}

const scrolled = ref(false)
let onScroll

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
