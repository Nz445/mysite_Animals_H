import { createRouter, createWebHistory } from 'vue-router'
import PetIntroView from '../views/PetIntroView.vue'
import GameFrameView from '../views/GameFrameView.vue'

const routes = [
  { path: '/', component: () => import('../views/HomeView.vue') },
  { path: '/pets', component: PetIntroView },
  { path: '/games/game2d', component: GameFrameView, props: { src: '/games/game2d/web-mobile/index.html' } },
  { path: '/games/game3d', component: GameFrameView, props: { src: '/games/game3d/web-mobile/index.html' } },
  { path: '/games/game2d/web-mobile/index.html', redirect: '/games/game2d' },
  { path: '/games/game3d/web-mobile/index.html', redirect: '/games/game3d' },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
