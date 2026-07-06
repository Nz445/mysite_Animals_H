<template>
  <div class="pet-intro-page">
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
      <h2>宠物介绍</h2>
      <p>这里展示萌宠的真实照片，点击后也可扩展为更多介绍内容。</p>
    </div>

    <FloatingActionMenu :actions="fabActions" />
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Flip } from 'gsap/Flip'
import FloatingActionMenu from '../components/FloatingButton/FloatingActionMenu.vue'

import './PetIntroView.css'

gsap.registerPlugin(ScrollTrigger, Flip)

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

onMounted(() => {
  createTween()
  window.addEventListener('resize', createTween)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', createTween)
})
</script>
