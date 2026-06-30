<template>
  <div class="page-shell">
    <PageIntro ref="loadingRef" :show="showIntro" @play="playSplit" />
    <MainNav :items="navItems" active="首页" />
    <main>
      <section ref="heroRef" class="hero glass-card">
        <div class="hero-left"><el-tag class="pill-tag pink">宠物综合服务主页</el-tag><h1>这里有你喜欢的小毛球</h1><p>发现可爱、了解性格、记录陪伴。让每一只宠物都被温柔看见，从档案、领养到社区互动，一站式认识它们的故事。</p><div class="hero-actions"><el-button type="primary" class="btn-primary">立即查看宠物</el-button><el-button class="btn-outline">了解领养信息</el-button></div></div>
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
import gsap from 'gsap'
import './HomeView.css'
import PageIntro from '../components/Loading/LoadingIntro.vue'
import MainNav from '../components/common/MainNav.vue'
import PetCardGrid from '../components/home/PetCardGrid.vue'
import SectionHighlights from '../components/home/SectionHighlights.vue'
import SiteFooter from '../components/common/SiteFooter.vue'
import { usePageIntro } from '../composables/usePageIntro.js'

const navItems = ['首页', '宠物介绍', '领养信息', '社区', '联系我们']
const pets = [
  { name: '奶糖', breed: '布偶猫', age: '2岁', emoji: '🐱', type: 'cat', image: '/png/cat/10001 (1).png', tags: [{ text: '温顺', color: 'blue' }, { text: '黏人', color: 'pink' }, { text: '爱撒娇', color: 'pink' }], status: { text: '健康良好', color: 'green' } },
  { name: '团子', breed: '柯基', age: '1岁半', emoji: '🐶', type: 'dog', image: '/png/dog/10002.png', tags: [{ text: '活泼', color: 'pink' }, { text: '亲人', color: 'blue' }, { text: '爱玩耍', color: 'blue' }], status: { text: '已免疫', color: 'green' } },
  { name: '棉花', breed: '垂耳兔', age: '8个月', emoji: '🐰', type: 'cat', image: '/png/cat/10003 (2).png', tags: [{ text: '安静', color: 'blue' }, { text: '好奇', color: 'orange' }, { text: '待领养', color: 'orange' }], status: { text: '待领养', color: 'orange' } },
]
const highlights = [
  { icon: '♡', title: '性格温柔', desc: '性格温柔，喜欢安静地陪伴你' },
  { icon: '✓', title: '健康状态', desc: '健康检查通过，状态良好，活力满满' },
  { icon: '◔', title: '互动习惯', desc: '喜欢互动，也愿意慢慢熟悉新朋友' },
  { icon: '☘', title: '喜爱食物', desc: '最爱的零食是鸡肉条和小鱼干' },
]
const heroRef = ref(null)
const navRef = ref(null)
const loadingRef = ref(null)
const showIntro = ref(true)
let resizeHandler

const { playSplit, cleanup } = usePageIntro({ showIntro, loadingRef, navRef, heroRef })

onMounted(() => {
  resizeHandler = () => {}
  window.addEventListener('resize', resizeHandler)
  playSplit()
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeHandler)
  cleanup()
})
</script>