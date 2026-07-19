<template>
  <div class="pet-intro-page">
    <MainNav :items="navItems" active="宠物介绍" @login="openAuthModal" />
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
    <div class="gallery-wrap">
      <div class="gallery gallery--bento gallery--switch" id="gallery-8">
        <div class="gallery__item"><img src="/png/肥菊/1.png" alt="" /></div>
        <div class="gallery__item"><img src="/png/肥菊/12.png" alt="" /></div>
        <div class="gallery__item"><img src="/png/肥菊/16.png" alt="" /></div>
        <div class="gallery__item"><img src="/png/肥菊/4.png" alt="" /></div>
        <div class="gallery__item"><img src="/png/肥菊/13.png" alt="" /></div>
        <div class="gallery__item"><img src="/png/肥菊/6.png" alt="" /></div>
        <div class="gallery__item"><img src="/png/肥菊/14.png" alt="" /></div>
        <div class="gallery__item"><img src="/png/肥菊/15.png" alt="" /></div>
      </div>
    </div>

    <div class="section">
      <h2>肥菊猫介绍</h2>
      <p>一、基础身份</p>
      <p>居宝是 UP 主肥菊猫（抖音同名：大肥居）的核心主角，一只公田园橘猫，全网人气网红胖橘，账号几乎所有视频都围绕它的日常拍摄。</p>
      <p>身世来历：居宝早年是小区流浪橘猫，被 UP 主（粉丝称"妈妈"）长期投喂后收养回家；流浪时期就体型偏胖，被小区其他流浪猫排挤，性格敏感又记仇，到家后彻底被宠成家里的"霸主"。</p>
      <p>二、外形特征</p>
      <p>标准大胖橘，浑身橘色虎斑，身形圆滚滚、体重偏大，跑起来肚子晃动，粉丝戏称"V8 发动机"；脸部肉多、眼神自带凶气，不开心时飞机耳、瞪眼，一脸不耐烦；吃饱后会瞬间变软萌；偏爱猫草、猫薄荷，闻到就完全卸下防备，反差极强。</p>
      <p>三、标志性性格（全网最大看点）</p>
      <p>1. 外凶内软，"恶霸橘猫"人设：对外人、小姨、上门喂养人极度警惕，会哈气、抬手挥人，看起来攻击性很强，但从不会真下重口抓人咬出血；只给主人面子，只黏 UP 主一人，其他人想摸基本都会被拒，独占欲极强；有记仇属性，视频常拍它和小姨闹矛盾、跟主人"冷战"、故意不理人，名场面《居宝不喜欢小姨》播放超 10 万。</p>
      <p>2. 反差萌核心：空腹或心情不好时是暴躁凶猫；吃饱、吃到爱吃零食、闻到猫薄荷时就会变成黏人小嗲精，主动贴贴、躺平撒娇，像换了一只猫，两级反转是视频经典笑点。</p>
      <p>3. 聪明小心机：分得清好坏、懂得讨食，会看人脸色，会故意闹脾气索要零食；UP 主专门发视频《其实我们居宝是只聪明小猫》记录它各种小心思行为。</p>
      <p>四、居家日常与生活环境</p>
      <p>家中独享豪华饲养配置，多猫砂盆、充足猫零食、猫草常备，居住环境干净无异味；日常主线干饭、睡觉、跟主人打闹、嫌弃来访亲友；互动名场面包括和主人"吵架"、饭后撒娇、抗拒洗澡、抢零食、对着镜头甩手示威。</p>
    </div>

    <FloatingActionMenu :actions="fabActions" />
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Flip } from 'gsap/Flip'
import MainNav from '../components/common/MainNav.vue'
import AuthModal from '../components/common/AuthModal.vue'
import FloatingActionMenu from '../components/FloatingButton/FloatingActionMenu.vue'
import { useAuth } from '../composables/useAuth.js'

import './PetIntroView.css'

gsap.registerPlugin(ScrollTrigger, Flip)

const navItems = ['首页', '宠物介绍', '小游戏', '社区']
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

let flipCtx

const createTween = () => {
  const galleryElement = document.querySelector('#gallery-8')
  const galleryItems = galleryElement.querySelectorAll('.gallery__item')

  flipCtx && flipCtx.revert()
  galleryElement.classList.remove('gallery--final')

  flipCtx = gsap.context(() => {
    galleryElement.classList.add('gallery--final')
    const flipState = Flip.getState(galleryItems)
    galleryElement.classList.remove('gallery--final')

    const flip = Flip.to(flipState, {
      simple: true,
      ease: 'expoScale(1, 5)',
    })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: galleryElement,
        start: 'center center',
        end: '+=100%',
        scrub: true,
        pin: galleryElement.parentNode,
      },
    })
    tl.add(flip)
    return () => gsap.set(galleryItems, { clearProps: 'all' })
  })
}

const sharePage = async () => {
  const data = { title: document.title, text: '看看这个宠物介绍页面', url: window.location.href }
  if (navigator.share) await navigator.share(data)
  else if (navigator.clipboard) await navigator.clipboard.writeText(window.location.href)
}

const downloadCurrentImage = () => {
  const img = document.querySelector('#gallery-8 .gallery__item img')
  if (!img) return
  const link = document.createElement('a')
  link.href = img.src
  link.download = 'pet-intro.jpg'
  link.click()
}

const fabActions = [
  { key: 'home', label: '返回首页', iconSrc: '/svg/fanhui_fanhui.svg', onClick: () => (window.location.href = '/') },
  { key: 'detail', label: '跳转详情', iconSrc: '/svg/tiaozhuan.svg', onClick: () => (window.location.href = '/pets') },
  { key: 'share', label: '分享', iconSrc: '/svg/fenxiang.svg', onClick: sharePage },
]

onMounted(async () => {
  createTween()
  try {
    await validateToken()
  } catch (error) {
    console.error('validate token failed:', error)
  }
  window.addEventListener('resize', createTween)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', createTween)
})
</script>