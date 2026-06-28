<template>
  <transition name="fade">
    <div v-if="show" class="intro-mask">
      <div class="container">
        <div class="button-wrapper"></div>
        <div ref="textRef" class="text">遇见更可爱的陪伴，开始认识这些毛朋友吧。</div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import '../../assets/styles.css'
import './loadingIntro.css'
import { setupLoadingIntro } from './loadingIntro.js'

const props = defineProps({ show: Boolean })
defineEmits(['play'])
const textRef = ref(null)
defineExpose({ textRef })

onMounted(() => {
  setupLoadingIntro(textRef.value)
})
</script>
