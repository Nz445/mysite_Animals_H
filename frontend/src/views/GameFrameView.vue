<template>
  <div class="game-frame-page">
    <iframe :src="src" class="game-frame" title="Cocos Game" frameborder="0"></iframe>
  </div>
</template>

<script setup>
import './GameFrameView.css'

defineProps({
  src: { type: String, required: true },
})
</script>
