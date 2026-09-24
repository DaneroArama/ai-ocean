/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require('playwright-core')

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

;(async () => {
  const browser = await chromium.launch({ executablePath: EDGE, headless: true })
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'no-preference',
  })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message))
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text())
  })

  await page.goto('http://localhost:3000/comic', { waitUntil: 'domcontentloaded' })

  for (const t of [0, 400, 900, 1500, 2500]) {
    if (t > 0) await page.waitForTimeout(t === 0 ? 0 : 400)
    const info = await page.evaluate(() => {
      const title = document.querySelector('.intro-title-wrap')
      const ind = document.querySelector('.scroll-indicator')
      const gsapExists = typeof window.gsap !== 'undefined'
      const stCount =
        window.ScrollTrigger?.getAll?.().length ??
        document.querySelectorAll('.gsap-marker-start').length
      // try to find active tweens via _gsap cache
      const dump = (el, name) => {
        if (!el) return { name, missing: true }
        const s = getComputedStyle(el)
        return {
          name,
          op: +(+s.opacity).toFixed(2),
          vis: s.visibility,
          inline: el.getAttribute('style'),
          gsap: el._gsap
            ? {
                opacity: el._gsap.opacity,
                y: el._gsap.y,
                scaleY: el._gsap.scaleY,
              }
            : null,
        }
      }
      return {
        scrollY: Math.round(scrollY),
        title: dump(title, 'title'),
        ind: dump(ind, 'ind'),
        gsapExists,
        stCount,
        trackH: document.querySelector('.comic-track')?.style.height,
      }
    })
    console.log(`t~${t}ms`, JSON.stringify(info, null, 0))
  }

  // Check if ST exists and its progress
  const stInfo = await page.evaluate(() => {
    if (!window.ScrollTrigger?.getAll) return { note: 'no ST global' }
    return window.ScrollTrigger.getAll().map((st) => ({
      start: st.start,
      end: st.end,
      progress: +st.progress.toFixed(3),
      hasAnim: !!st.animation,
      animProgress: st.animation ? +st.animation.progress().toFixed(3) : null,
      animDur: st.animation ? st.animation.duration() : null,
    }))
  })
  console.log('STs:', JSON.stringify(stInfo))

  await browser.close()
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
