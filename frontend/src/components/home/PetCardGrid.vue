<template>
  <section class="pet-grid">
    <article v-for="pet in pets" :key="pet.name" class="pet-card glass-card">
      <img class="pet-photo" :class="pet.type" :src="pet.image" :alt="pet.name" />
      <h3>{{ pet.name }}</h3>
      <div class="meta">{{ pet.breed }} · {{ pet.age }}</div>
      <div class="tags">
        <span v-for="tag in pet.tags" :key="tag.text" :class="['pill-tag', tag.color]">{{ tag.text }}</span>
      </div>
      <div class="status" :class="pet.status.color">{{ pet.status.text }}</div>
    </article>
  </section>
</template>

<script setup>
defineProps({ pets: Array })
</script>
