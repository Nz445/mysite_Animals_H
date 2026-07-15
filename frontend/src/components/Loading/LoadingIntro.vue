<template>
  <transition name="fade">
    <div v-if="show" class="intro-mask">
      <div class="container">
        <div id="lottie-cat" class="lottie-cat"></div>
        <div class="button-wrapper"></div>
        <div ref="textRef" class="text">遇见更可爱的陪伴，开始认识这些毛朋友吧。</div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import lottie from 'lottie-web'
import '../../assets/styles.css'
import './loadingIntro.css'
import { setupLoadingIntro } from './loadingIntro.js'

const props = defineProps({ show: Boolean })
defineEmits(['play'])
const textRef = ref(null)
defineExpose({ textRef })

onMounted(() => {
  setupLoadingIntro(textRef.value)
  const animation = lottie.loadAnimation({
    container: document.getElementById('lottie-cat'),
    renderer: 'svg',
    loop: false,
    autoplay: true,
    path: '/svg/data1.json',
  })
  animation.setSpeed(1.5)
})
</script>
