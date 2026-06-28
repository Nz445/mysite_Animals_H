import { nextTick, watch } from 'vue'
import gsap from 'gsap'
import { initLoadingSplit } from '../components/Loading/loadingIntro.js'

export function usePageIntro({ showIntro, loadingRef, navRef, heroRef }) {
  let animation = null
  let introTimer = null

  const startHomeAnimations = async () => {
    await nextTick()
    if (navRef.value) gsap.fromTo(navRef.value, { y: -24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out' })
    if (heroRef.value) gsap.fromTo(heroRef.value, { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, delay: 0.1, ease: 'power3.out' })
    const petCards = document.querySelectorAll('.pet-card')
    if (petCards.length) gsap.fromTo(petCards, { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.12, duration: 0.7, delay: 0.2, ease: 'power2.out' })
    const highlightCards = document.querySelectorAll('.highlight-card, .notice-card')
    if (highlightCards.length) gsap.fromTo(highlightCards, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.1, duration: 0.6, delay: 0.35, ease: 'power2.out' })
  }

  const playSplit = () => {
    const el = loadingRef.value?.textRef?.value || loadingRef.value?.textRef
    if (!el) return

    const split = initLoadingSplit(el)
    if (animation?.kill) animation.kill()

    animation = gsap.from(split?.chars || [], {
      x: 150,
      opacity: 0,
      duration: 1.5,
      ease: 'power4',
      stagger: 0.04,
      onComplete: () => {
        introTimer = window.setTimeout(() => {
          showIntro.value = false
        }, 200)
      },
    })
  }

  watch(showIntro, (visible) => {
    document.body.style.overflow = visible ? 'hidden' : ''
    document.documentElement.style.overflow = visible ? 'hidden' : ''
    if (!visible) requestAnimationFrame(startHomeAnimations)
  }, { immediate: true })

  const cleanup = () => {
    document.body.style.overflow = ''
    document.documentElement.style.overflow = ''
    if (introTimer) clearTimeout(introTimer)
    if (animation?.kill) animation.kill()
  }

  return { playSplit, cleanup }
}
