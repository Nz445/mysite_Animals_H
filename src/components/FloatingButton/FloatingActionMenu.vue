<template>
  <div v-if="hasActions" ref="wrapEl" class="fab-wrap">
    <button
      v-for="item in actionItems"
      :key="item.key"
      class="fab-item"
      type="button"
      :aria-label="item.label"
      @click="handleAction(item)"
    >
      <component :is="item.icon" v-if="item.icon" />
      <span v-else-if="item.iconSvg" v-html="item.iconSvg"></span>
    </button>

    <button
      ref="toggleEl"
      class="fab"
      type="button"
      :aria-expanded="isOpen"
      :aria-label="toggleLabel"
      @click="toggleMenu"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import './FloatingActionMenu.css'

const props = defineProps({
  actions: { type: Array, default: () => [] },
  toggleLabel: { type: String, default: '展开悬浮菜单' },
})

const isOpen = ref(false)
const wrapEl = ref(null)
const toggleEl = ref(null)
let tl

const actionItems = computed(() => props.actions.filter((item) => item?.label && item?.onClick))
const hasActions = computed(() => actionItems.value.length > 0)

const buildMenu = () => {
  if (tl) tl.kill()
  if (!hasActions.value) return

  const items = wrapEl.value?.querySelectorAll('.fab-item') || []
  gsap.set(items, { x: 0, y: 0, scale: 0, opacity: 0 })
  gsap.set(toggleEl.value, { rotation: 0 })

  tl = gsap.timeline({ paused: true })
  const radius = 110
  const angles = [270, 225, 180, 135, 90, 45]

  items.forEach((item, index) => {
    const angle = ((angles[index] ?? 180) * Math.PI) / 180
    tl.to(
      item,
      {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        scale: 1,
        opacity: 1,
        duration: 0.45,
        ease: 'elastic.out(1, 0.55)',
      },
      index * 0.05,
    )
  })

  tl.to(toggleEl.value?.querySelector('svg'), { rotation: 135, duration: 0.28, ease: 'back.out(1.7)' }, 0)
}

const toggleMenu = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) tl.play()
  else tl.reverse()
}

const handleAction = (item) => {
  item.onClick?.()
  if (item.closeOnClick !== false) {
    isOpen.value = false
    tl.reverse()
  }
}

onMounted(buildMenu)
onBeforeUnmount(() => tl?.kill())

defineExpose({ close: () => { isOpen.value = false; tl?.reverse() } })
</script>
