<template>
  <div class="games-page">
    <MainNav :items="navItems" active="小游戏" @login="openAuthModal" />
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

    <main class="games-main">
      <header class="games-header glass-card">
        <h1>🎮 精彩小游戏</h1>
        <p>选择你喜欢的游戏，享受片刻轻松与刺激</p>
      </header>

      <section class="game-grid">
        <article
          class="game-card game-card--dart glass-card"
          @click="goGame2d"
        >
          <div class="game-card__visual">
            <div class="dartboard">
              <div class="ring ring-1"></div>
              <div class="ring ring-2"></div>
              <div class="ring ring-3"></div>
              <div class="ring ring-4"></div>
              <div class="bullseye"></div>
              <div class="dart dart-1">🎯</div>
            </div>
            <div class="game-card__badge badge-2d">2D</div>
          </div>
          <div class="game-card__content">
            <h3 class="game-card__title">🎯 飞镖游戏</h3>
            <p class="game-card__desc">瞄准靶心，挑战你的精准度。经典飞镖玩法，一镖定乾坤！</p>
            <div class="game-card__tags">
              <span class="chip chip-pink">休闲</span>
              <span class="chip chip-blue">2D</span>
              <span class="chip chip-green">单人</span>
            </div>
            <button class="game-card__button" type="button">
              <span>开始游戏</span>
              <span class="arrow">→</span>
            </button>
          </div>
        </article>

        <article
          class="game-card game-card--racing glass-card"
          @click="goGame3d"
        >
          <div class="game-card__visual">
            <div class="racing-scene">
              <div class="road">
                <div class="lane-line"></div>
                <div class="lane-line"></div>
                <div class="lane-line"></div>
              </div>
              <div class="car">🚗</div>
              <div class="sparkle sparkle-1">✨</div>
              <div class="sparkle sparkle-2">💨</div>
              <div class="sparkle sparkle-3">🏁</div>
            </div>
            <div class="game-card__badge badge-3d">3D</div>
          </div>
          <div class="game-card__content">
            <h3 class="game-card__title">🏎️ 赛车游戏</h3>
            <p class="game-card__desc">极速飞驰，沉浸式 3D 赛道体验。踩下油门，超越极限！</p>
            <div class="game-card__tags">
              <span class="chip chip-orange">竞速</span>
              <span class="chip chip-purple">3D</span>
              <span class="chip chip-blue">刺激</span>
            </div>
            <button class="game-card__button button-racing" type="button">
              <span>开始游戏</span>
              <span class="arrow">→</span>
            </button>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import MainNav from '../components/common/MainNav.vue'
import AuthModal from '../components/common/AuthModal.vue'
import { useAuth } from '../composables/useAuth.js'
import './GamesView.css'

const navItems = ['首页', '宠物介绍', '小游戏', '社区']
const router = useRouter()

const { login: authLogin, register: authRegister } = useAuth()
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

const goGame2d = () => router.push('/games/game2d')
const goGame3d = () => router.push('/games/game3d')
</script>