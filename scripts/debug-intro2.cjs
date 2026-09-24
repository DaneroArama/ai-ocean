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

  await page.goto('http://localhost:3000/comic', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2500)

  const info = await page.evaluate(() => {
    const title = document.querySelector('.intro-title-wrap')
    const mascot = document.querySelector('.intro-mascot')
    const sts = window.ScrollTrigger
      ? window.ScrollTrigger.getAll().map((t) => ({
          start: t.start,
          end: t.end,
          progress: +t.progress.toFixed(3),
          scroll: t.scroll(),
        }))
      : 'no ScrollTrigger global'

    // Find gsap timelines via _gsap on elements
    const tData = (el) => {
      if (!el || !el._gsap) return null
      const g = el._gsap
      return {
        opacity: g.opacity,
        visibility: g.visibility,
        xPercent: g.xPercent,
        yPercent: g.yPercent,
        y: g.y,
        scale: g.scale,
      }
    }

    return {
      scrollY: window.scrollY,
      titleStyle: title ? title.getAttribute('style') : null,
      titleComputed: title ? getComputedStyle(title).opacity : null,
      mascotStyle: mascot ? mascot.getAttribute('style') : null,
      mascotComputed: mascot ? getComputedStyle(mascot).opacity : null,
      titleGsap: tData(title),
      mascotGsap: tData(mascot),
      sts,
      gsapVersion: window.gsap?.version,
    }
  })
  console.log(JSON.stringify(info, null, 2))

  await browser.close()
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
