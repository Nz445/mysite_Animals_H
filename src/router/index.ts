import { createRouter, createWebHistory } from 'vue-router'
import PetIntroView from '../views/PetIntroView.vue'

const routes = [
  { path: '/', component: () => import('../views/HomeView.vue') },
  { path: '/pets', component: PetIntroView },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
