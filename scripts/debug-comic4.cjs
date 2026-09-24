/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require('playwright-core')

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

async function styles(page) {
  return page.evaluate(() => {
    const vis = (sel) => {
      const el = document.querySelector(sel)
      if (!el) return null
      const s = getComputedStyle(el)
      return s.visibility !== 'hidden' && parseFloat(s.opacity) > 0.05
    }
    const track = document.querySelector('.comic-track')
    return {
      scrollY: Math.round(window.scrollY),
      reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
      intro: vis('.scene-intro'),
      scene1: vis('.scene1'),
      scene2: vis('.scene2'),
      scene3: vis('.scene3'),
      scene7: vis('.scene7'),
      trackH: track ? track.offsetHeight : null,
      scrollRestoration: history.scrollRestoration,
    }
  })
}

async function wheelThrough(page, label, n = 8) {
  console.log(label, await styles(page))
  for (let i = 1; i <= n; i++) {
    await page.mouse.move(720, 450)
    await page.mouse.wheel(0, 900)
    await page.waitForTimeout(350)
    console.log(`${label} wheel x${i}`, await styles(page))
  }
}

;(async () => {
  const browser = await chromium.launch({ executablePath: EDGE, headless: true })

  // T1: reduced motion — intro must show, scenes must advance
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce',
    })
    const page = await ctx.newPage()
    await page.goto('http://localhost:3000/comic', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)
    console.log('\n=== T1: reduced motion, initial ===')
    console.log(await styles(page))
    await wheelThrough(page, 'reduced', 10)
    await ctx.close()
  }

  // T2: no-preference — baseline must still work
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'no-preference',
    })
    const page = await ctx.newPage()
    await page.goto('http://localhost:3000/comic', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)
    console.log('\n=== T2: no-preference, initial ===')
    console.log(await styles(page))
    await wheelThrough(page, 'normal', 6)
    await ctx.close()
  }

  // T3: reload from mid-comic
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'no-preference',
    })
    const page = await ctx.newPage()
    await page.goto('http://localhost:3000/comic', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)
    await page.evaluate(() => window.scrollTo(0, 4000))
    await page.waitForTimeout(400)
    console.log('\n=== T3: before reload ===', await styles(page))
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)
    console.log('=== T3: after reload ===', await styles(page))
    await ctx.close()
  }

  await browser.close()
  console.log('\nDONE')
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
