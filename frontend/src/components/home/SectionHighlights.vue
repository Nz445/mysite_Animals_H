<template>
  <section class="highlights">
    <article v-for="item in items" :key="item.title" class="highlight-card glass-card">
      <div class="icon-wrap">{{ item.icon }}</div>
      <h3>{{ item.title }}</h3>
      <p>{{ item.desc }}</p>
    </article>
  </section>
</template>

<script setup>
defineProps({ items: Array })
</script>
