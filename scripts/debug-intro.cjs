/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require('playwright-core')

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

async function snap(page) {
  return page.evaluate(() => {
    const mascots = [...document.querySelectorAll('.intro-mascot')].map((el) => {
      const s = getComputedStyle(el)
      const r = el.getBoundingClientRect()
      return {
        op: +(+s.opacity).toFixed(2),
        x: Math.round(r.x),
        y: Math.round(r.y),
        inView:
          r.right > 0 && r.left < innerWidth && r.bottom > 0 && r.top < innerHeight,
      }
    })
    const info = (sel) => {
      const el = document.querySelector(sel)
      if (!el) return null
      const s = getComputedStyle(el)
      return {
        op: +(+s.opacity).toFixed(2),
        vis: s.visibility !== 'hidden',
      }
    }
    return {
      scrollY: Math.round(scrollY),
      intro: info('.scene-intro'),
      title: info('.intro-title-wrap'),
      indicator: info('.scroll-indicator'),
      skip: info('.intro-skip'),
      mascots,
    }
  })
}

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

  const samples = []
  for (const t of [0, 200, 500, 900, 1400, 2000, 2600, 3500]) {
    if (t > 0) await page.waitForTimeout(t - (samples.at(-1)?.t ?? 0))
    const s = await snap(page)
    samples.push({ t, ...s })
    console.log(
      `t=${t}ms intro=${s.intro?.op} title=${s.title?.op} ind=${s.indicator?.op} skip=${s.skip?.op} mascots=[${s.mascots
        .map((m) => `${m.op}@${m.x},${m.y}`)
        .join(' ')}]`,
    )
  }

  const first = samples[1]
  const last = samples[samples.length - 1]
  const mascotMoved =
    first.mascots.some((m, i) => {
      const l = last.mascots[i]
      return l && (Math.abs(m.x - l.x) > 5 || Math.abs(m.y - l.y) > 5 || Math.abs(m.op - l.op) > 0.1)
    })
  const titleFadedIn = first.title.op < 0.5 && last.title.op > 0.9
  console.log('\nRESULT:')
  console.log('  mascots animated (moved/faded):', mascotMoved)
  console.log('  title faded in:', titleFadedIn)
  console.log(
    '  all visible at end:',
    last.mascots.every((m) => m.op > 0.9) && last.title.op > 0.9 && last.indicator.op > 0.9 && last.skip.op > 0.9,
  )

  // scroll exit
  await page.evaluate(() => window.scrollTo(0, 400))
  await page.waitForTimeout(700)
  const s400 = await snap(page)
  console.log(
    `\nscroll 400: title=${s400.title?.op} ind=${s400.indicator?.op} mascots=[${s400.mascots
      .map((m) => m.op)
      .join(',')}]`,
  )

  await page.evaluate(() => window.scrollTo(0, 1000))
  await page.waitForTimeout(700)
  const s1000 = await snap(page)
  console.log(
    `scroll 1000: title=${s1000.title?.op} ind=${s1000.indicator?.op} intro=${s1000.intro?.op} mascots=[${s1000.mascots
      .map((m) => m.op)
      .join(',')}]`,
  )

  await page.evaluate(() => window.scrollTo(0, 1750))
  await page.waitForTimeout(700)
  const s1750 = await snap(page)
  const scene1 = await page.evaluate(() => {
    const el = document.querySelector('.scene1')
    if (!el) return null
    const s = getComputedStyle(el)
    return { op: +(+s.opacity).toFixed(2), vis: s.visibility !== 'hidden' }
  })
  console.log(
    `scroll 1750: intro=${s1750.intro?.op} scene1=${scene1?.op} vis=${scene1?.vis}`,
  )

  await browser.close()
  console.log('\nDONE')
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
