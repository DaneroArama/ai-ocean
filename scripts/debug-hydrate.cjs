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
    console.log(`CONSOLE [${msg.type()}]:`, msg.text())
  })
  page.on('requestfailed', (req) =>
    console.log('REQ FAIL:', req.url(), req.failure()?.errorText),
  )

  await page.goto('http://localhost:3000/comic', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3000)

  const info = await page.evaluate(() => {
    const track = document.querySelector('.comic-track')
    const title = document.querySelector('.intro-title-wrap')
    const intro = document.querySelector('.scene-intro')
    return {
      readyState: document.readyState,
      hasNextRoot: !!document.querySelector('#__next'),
      hasReactRoot: !!document.querySelector('[data-reactroot]') || !!document.querySelector('#__next'),
      bodyChildren: [...document.body.children].map((c) => c.tagName + '#' + c.id),
      trackH: track?.style.height ?? null,
      trackClass: track?.className,
      titleStyle: title?.getAttribute('style'),
      introStyle: intro?.getAttribute('style'),
      pathname: location.pathname,
      titleText: document.title,
    }
  })
  console.log(JSON.stringify(info, null, 2))

  await browser.close()
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
