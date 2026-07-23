<template>
  <div class="page-shell">
    <PageIntro ref="loadingRef" :show="showIntro" @play="playSplit" />
    <MainNav :items="navItems" active="首页" @login="openAuthModal" />
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
    <main>
      <section ref="heroRef" class="hero glass-card">
        <div class="hero-left">
          <el-tag class="pill-tag pink">宠物综合服务主页</el-tag>
          <h1>这里有你喜欢的小毛球</h1>
          <p>发现可爱、了解性格、记录陪伴。让每一只宠物都被温柔看见，从档案、领养到社区互动，一站式认识它们的故事。</p>
          <div class="hero-actions">
            <el-button type="primary" class="btn-primary">立即查看宠物</el-button>
            <el-button class="btn-outline">了解领养信息</el-button>
          </div>
        </div>
        <div class="hero-art">
          <div class="hero-art-card">
            <div class="pet-illustration">
              <div class="pet-face cat"></div>
              <div class="pet-face dog"></div>
              <div class="pet-face rabbit"></div>
            </div>
          </div>
        </div>
      </section>

      <section class="section-title"><h2>宠物介绍</h2><p>每一只宠物都有自己的故事</p></section>
      <PetCardGrid :pets="pets" />
      
    </main>
    <SiteFooter />
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import gsap from 'gsap'
import './HomeView.css'
import PageIntro from '../components/Loading/LoadingIntro.vue'
import MainNav from '../components/common/MainNav.vue'
import AuthModal from '../components/common/AuthModal.vue'
import PetCardGrid from '../components/home/PetCardGrid.vue'
import SectionHighlights from '../components/home/SectionHighlights.vue'
import SiteFooter from '../components/common/SiteFooter.vue'
import { usePageIntro } from '../composables/usePageIntro.js'
import { useAuth } from '../composables/useAuth.js'
import { getHomeData } from '../api/home.js'

const navItems = ['首页', '宠物介绍', '小游戏', '社区']
const pets = ref([])
const highlights = ref([])

const { login: authLogin, register: authRegister, validateToken } = useAuth()
const authError = ref('')
const isRegisterMode = ref(false)
const showAuthModal = ref(false)
const authForm = ref({ username: '', password: '', confirmPassword: '' })

async function handleLogin() {
  authError.value = ''
  try {
    await authLogin({ username: authForm.value.username, password: authForm.value.password })
    showAuthModal.value = false
  } catch (error) {
    authError.value = error?.message || '登录失败'
  }
}

async function handleRegister() {
  authError.value = ''
  try {
    await authRegister({ username: authForm.value.username, password: authForm.value.password })
    showAuthModal.value = false
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

async function loadHomeData() {
  const data = await getHomeData()
  pets.value = data.pets || []
  highlights.value = data.highlights || []
}
const heroRef = ref(null)
const navRef = ref(null)
const loadingRef = ref(null)
const showIntro = ref(sessionStorage.getItem('home_intro_shown') !== '1')
let resizeHandler

const { playSplit, cleanup } = usePageIntro({ showIntro, loadingRef, navRef, heroRef })

onMounted(async () => {
  resizeHandler = () => {}
  window.addEventListener('resize', resizeHandler)
  try {
    await loadHomeData()
    await validateToken()
  } catch (error) {
    console.error('加载首页数据失败：', error)
  }
  if (showIntro.value) {
    sessionStorage.setItem('home_intro_shown', '1')
    playSplit()
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeHandler)
  cleanup()
})
</script>