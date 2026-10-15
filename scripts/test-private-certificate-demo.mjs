import assert from "node:assert/strict";
import { chromium } from "playwright-core";
import { mkdirSync, readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { ConvexHttpClient } from "convex/browser";
const base = process.argv[2] || "http://localhost:3000";
const local = parseEnv(readFileSync(".env.local", "utf8"));
assert.match(
  local.NEXT_PUBLIC_CONVEX_URL,
  /^http:\/\/(localhost|127\.0\.0\.1):/,
);
const client = new ConvexHttpClient(local.NEXT_PUBLIC_CONVEX_URL);
const login = await client.action("auth:signIn", {
  provider: "password",
  params: {
    flow: "signIn",
    email: "demo.admin@example.com",
    password: "OceanAdmin!2026",
  },
});
client.setAuth(login.tokens.token);
const before = await client.query("attendance:adminOverview", {});
const browser = await chromium.launch({
  executablePath:
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
});
mkdirSync(".convex/qa", { recursive: true });
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1050 },
    acceptDownloads: true,
  });
  const request = context.request;
  assert.equal(
    (await request.get(`${base}/api/certificate-demo`)).status(),
    401,
  );
  assert.equal(
    (
      await request.post(`${base}/api/certificate-demo`, {
        headers: { Origin: base },
        data: { email: "certificate.demo@aiocean.test", password: "wrong" },
      })
    ).status(),
    401,
  );
  assert.equal(
    (
      await request.post(`${base}/api/certificate-demo`, {
        headers: { Origin: "https://unrelated.example" },
        data: {
          email: "certificate.demo@aiocean.test",
          password: "OceanCertificate!2026",
        },
      })
    ).status(),
    403,
  );
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${base}/certificate-demo`, { waitUntil: "networkidle" });
  await page
    .getByLabel("Email", { exact: true })
    .fill("certificate.demo@aiocean.test");
  await page
    .getByLabel("Password", { exact: true })
    .fill("OceanCertificate!2026");
  await page.getByRole("button", { name: "Sign in to demo" }).click();
  await page.getByRole("heading", { name: "Dashboard", exact: true }).waitFor();
  await page.locator(".att-mascot").evaluate((img) => img.decode());
  assert.equal(await page.locator(".att-status-banner.present").count(), 7);
  assert.equal(await page.locator(".att-status-banner.absent").count(), 2);
  await page.screenshot({
    path: ".convex/qa/private-demo-desktop.png",
    fullPage: true,
  });
  const cookie = (await context.cookies()).find(
    (cookie) => cookie.name === "aiocean_certificate_demo",
  );
  assert.ok(cookie?.httpOnly);
  assert.equal(cookie.sameSite, "Strict");
  assert.equal(
    (await request.get(`${base}/api/certificate`)).status(),
    401,
    "A demo session must not authenticate real certificate requests",
  );
  const admin = await request.get(`${base}/admin`, { maxRedirects: 0 });
  assert.ok([302, 303, 307, 308].includes(admin.status()));
  assert.ok(admin.headers().location.includes("/auth/signin"));
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Try demo download" }).click();
  await page.getByRole("button", { name: "Skip to my certificate" }).click();
  await (await download).saveAs(".convex/qa/private-demo-certificate.pdf");
  assert.ok(
    readFileSync(".convex/qa/private-demo-certificate.pdf")
      .subarray(0, 5)
      .toString()
      .startsWith("%PDF-"),
  );
  await page.getByRole("button", { name: "Close celebration" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: ".convex/qa/private-demo-mobile.png",
    fullPage: true,
  });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  );
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await page
    .getByRole("heading", { name: "Certificate demo sign-in" })
    .waitFor();
  assert.equal(
    (await request.get(`${base}/api/certificate-demo`)).status(),
    401,
  );
  await context.addCookies([
    {
      name: "aiocean_certificate_demo",
      value:
        cookie.value.slice(0, -1) + (cookie.value.endsWith("a") ? "b" : "a"),
      url: base,
    },
  ]);
  assert.equal(
    (await request.get(`${base}/api/certificate-demo`)).status(),
    401,
  );
  const after = await client.query("attendance:adminOverview", {});
  assert.deepEqual(
    after.participants,
    before.participants,
    "Demo must not write participant or attendance records",
  );
  assert.deepEqual(after.config, before.config);
  assert.deepEqual(after.recent, before.recent);
  assert.ok(
    !after.participants.some(
      (p) => p.email === "certificate.demo@aiocean.test",
    ),
  );
  assert.deepEqual(errors, []);
  console.log(
    `PASS (${base}): private demo login, signed HttpOnly session, production-compatible PDF, sign-out, invalid/forged credential rejection, real access isolation, zero attendance/participant writes, obvious day statuses, desktop/mobile layouts.`,
  );
} finally {
  await browser.close();
}
