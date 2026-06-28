import gsap from 'gsap'

let split = null
let animation = null
let resizeHandler = null

function clearAnimation() {
  if (animation) {
    animation.kill()
    animation = null
  }
}

function splitText(el) {
  if (!el) return null
  const text = el.textContent || ''
  const chars = []
  const words = []
  const lines = []

  el.innerHTML = ''
  const lineWrap = document.createElement('span')
  lineWrap.className = 'split-line'
  el.appendChild(lineWrap)

  const wordsList = text.trim().split(/\s+/)
  wordsList.forEach((word, idx) => {
    const wordSpan = document.createElement('span')
    wordSpan.className = 'split-word'
    wordSpan.style.display = 'inline-block'

    ;[...word].forEach((ch) => {
      const charSpan = document.createElement('span')
      charSpan.className = 'split-char'
      charSpan.textContent = ch
      charSpan.style.display = 'inline-block'
      wordSpan.appendChild(charSpan)
      chars.push(charSpan)
    })

    words.push(wordSpan)
    wordSpan.style.display = 'inline-block'
    lineWrap.appendChild(wordSpan)
    if (idx < wordsList.length - 1) lineWrap.appendChild(document.createTextNode(' '))
  })

  lines.push(lineWrap)
  return { chars, words, lines }
}

function bindButtons() {
  const charsBtn = document.querySelector('#chars')
  const wordsBtn = document.querySelector('#words')
  const linesBtn = document.querySelector('#lines')

  charsBtn?.addEventListener('click', () => {
    clearAnimation()
    animation = gsap.from(split?.chars || [], { x: 150, opacity: 0, duration: 0.7, ease: 'power4', stagger: 0.04 })
  })

  wordsBtn?.addEventListener('click', () => {
    clearAnimation()
    animation = gsap.from(split?.words || [], { y: -100, opacity: 0, rotation: 'random(-80, 80)', duration: 0.7, ease: 'back', stagger: 0.15 })
  })

  linesBtn?.addEventListener('click', () => {
    clearAnimation()
    animation = gsap.from(split?.lines || [], { rotationX: -100, transformOrigin: '50% 50% -160px', opacity: 0, duration: 0.8, ease: 'power3', stagger: 0.25 })
  })
}

export function initLoadingSplit(el) {
  const target = el || document.querySelector('.text')
  if (!target) return null
  split = splitText(target)
  return split
}

export function setupLoadingIntro(el) {
  const target = el || document.querySelector('.text')
  if (!target) return
  split = splitText(target)
  bindButtons()
  clearAnimation()
  resizeHandler && window.removeEventListener('resize', resizeHandler)
  resizeHandler = () => {
    const current = document.querySelector('.text')
    if (current) split = splitText(current)
  }
  window.addEventListener('resize', resizeHandler)
}
