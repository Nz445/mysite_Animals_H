<template>
  <div class="page-shell">
    <PageIntro ref="loadingRef" :show="showIntro" @play="playSplit" />
    <MainNav :items="navItems" active="首页" />
    <main>
      <section ref="heroRef" class="hero glass-card">
        <div class="hero-left"><el-tag class="pill-tag pink">宠物综合服务主页</el-tag><h1>这里有你喜欢的小毛球</h1><p>发现可爱、了解性格、记录陪伴。让每一只宠物都被温柔看见，从档案、领养到社区互动，一站式认识它们的故事。</p><div class="hero-actions"><el-button type="primary" class="btn-primary">立即查看宠物</el-button><el-button class="btn-outline">了解领养信息</el-button><el-button class="btn-outline" @click="goGame1">小游戏 1</el-button><el-button class="btn-outline" @click="goGame2">小游戏 2</el-button></div></div>
        <div class="hero-art"><div class="hero-art-card"><div class="pet-illustration"><div class="pet-face cat"></div><div class="pet-face dog"></div><div class="pet-face rabbit"></div></div></div></div>
      </section>
      <section class="section-title"><h2>宠物介绍</h2><p>每一只宠物都有自己的故事</p></section>
      <PetCardGrid :pets="pets" />
      <SectionHighlights :items="highlights" />
      <section class="notice-grid"><article class="notice-card warm"><h3>领养小提醒</h3><ul><li>先了解宠物性格与生活习惯</li><li>领养前与家人充分沟通</li><li>每一份陪伴都值得认真对待</li></ul></article><article class="notice-card calm"><h3>健康状态说明</h3><ul><li>已完成基础体检</li><li>疫苗记录完整</li><li>适合进入新家庭</li></ul></article></section>
    </main>
    <SiteFooter />
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import './HomeView.css'
import PageIntro from '../components/Loading/LoadingIntro.vue'
import MainNav from '../components/common/MainNav.vue'
import PetCardGrid from '../components/home/PetCardGrid.vue'
import SectionHighlights from '../components/home/SectionHighlights.vue'
import SiteFooter from '../components/common/SiteFooter.vue'
import { usePageIntro } from '../composables/usePageIntro.js'
import { getHomeData } from '../api/home.js'

const navItems = ['首页', '宠物介绍', '领养信息', '社区', '联系我们']
const pets = ref([])
const highlights = ref([])

async function loadHomeData() {
  const data = await getHomeData()
  pets.value = data.pets || []
  highlights.value = data.highlights || []
}
const router = useRouter()
const heroRef = ref(null)
const navRef = ref(null)
const loadingRef = ref(null)
const showIntro = ref(sessionStorage.getItem('home_intro_shown') !== '1')
let resizeHandler

const { playSplit, cleanup } = usePageIntro({ showIntro, loadingRef, navRef, heroRef })

const goGame1 = () => router.push('/games/game2d')
const goGame2 = () => router.push('/games/game3d')

onMounted(async () => {
  resizeHandler = () => {}
  window.addEventListener('resize', resizeHandler)
  try {
    await loadHomeData()
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