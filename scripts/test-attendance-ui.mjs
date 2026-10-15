import { chromium } from "playwright-core";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";
import * as XLSX from "xlsx";
const directory = ".convex/qa";
mkdirSync(directory, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
});
const errors = [];
async function login(context, email, password, destination) {
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("http://localhost:3000/auth/signin", {
    waitUntil: "domcontentloaded",
    timeout: 120000,
  });
  await page.getByPlaceholder("your@email.com").fill(email);
  await page.getByPlaceholder("Your password", { exact: true }).fill(password);
  await page
    .getByRole("button", { name: "Sign in with Email & Password" })
    .click();
  await page.waitForURL(destination, { timeout: 120000 });
  await page.waitForLoadState("networkidle");
  return page;
}
try {
  const adminContext = await browser.newContext({
    viewport: { width: 1440, height: 1080 },
    acceptDownloads: true,
  });
  const admin = await login(
    adminContext,
    "demo.admin@example.com",
    "OceanAdmin!2026",
    "**/admin",
  );
  await admin.goto("http://localhost:3000/admin/attendance", {
    waitUntil: "networkidle",
  });
  await admin.getByText("Demo Participant", { exact: true }).waitFor();
  await admin.screenshot({
    path: `${directory}/admin-desktop.png`,
    fullPage: true,
  });
  const downloadPromise = admin.waitForEvent("download");
  await admin.getByRole("button", { name: "Export day .xlsx" }).click();
  const exported = await downloadPromise;
  await exported.saveAs(`${directory}/attendance-original.xlsx`);
  const workbook = XLSX.read(
    readFileSync(`${directory}/attendance-original.xlsx`),
    { type: "buffer" },
  );
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets.Attendance);
  assert.equal(rows.length, 4);
  assert.ok(rows.every((row) => row["Session Date"] === "2026-10-17"));
  const modified = XLSX.utils.book_new();
  const demo = rows.find((row) => row.Email === "demo.participant@example.com");
  XLSX.utils.book_append_sheet(
    modified,
    XLSX.utils.json_to_sheet([
      { ...demo, Status: "pending", Note: "Browser import overwrite test" },
    ]),
    "Attendance",
  );
  writeFileSync(
    `${directory}/attendance-change.xlsx`,
    XLSX.write(modified, { type: "buffer", bookType: "xlsx" }),
  );
  await admin.getByRole("button", { name: "Import attendance" }).click();
  await admin
    .getByLabel("Attendance file")
    .setInputFiles(`${directory}/attendance-change.xlsx`);
  await admin
    .getByRole("button", { name: "Confirm overwrite · 1 rows" })
    .waitFor();
  await admin.screenshot({
    path: `${directory}/import-preview.png`,
    fullPage: true,
  });
  await admin
    .getByRole("button", { name: "Confirm overwrite · 1 rows" })
    .click();
  await admin
    .getByRole("status")
    .filter({ hasText: "1 attendance records imported" })
    .waitFor();
  await admin
    .getByRole("button", {
      name: "Edit Demo Participant · Training day 1",
      exact: true,
    })
    .filter({ hasText: "Pending verification" })
    .waitFor();
  await admin.getByRole("button", { name: "Import attendance" }).click();
  await admin
    .getByLabel("Attendance file")
    .setInputFiles(`${directory}/attendance-original.xlsx`);
  await admin
    .getByRole("button", { name: "Confirm overwrite · 4 rows" })
    .click();
  await admin
    .getByRole("status")
    .filter({ hasText: "4 attendance records imported" })
    .waitFor();
  await admin
    .getByRole("button", {
      name: "Edit Demo Participant · Training day 1",
      exact: true,
    })
    .click();
  await admin
    .getByLabel("Attendance status", { exact: true })
    .selectOption("present");
  await admin
    .getByLabel("Reason for this change")
    .fill("Verified manually in the local UI test");
  await admin
    .getByRole("button", { name: "Save attendance", exact: true })
    .click();
  await admin
    .getByRole("status")
    .filter({ hasText: "Attendance saved" })
    .waitFor();
  await admin.setViewportSize({ width: 390, height: 844 });
  await admin.screenshot({
    path: `${directory}/admin-mobile.png`,
    fullPage: true,
  });
  assert.ok(
    await admin.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    "Admin page overflows mobile viewport",
  );
  const participantContext = await browser.newContext({
    viewport: { width: 1440, height: 1050 },
    acceptDownloads: true,
  });
  const participant = await login(
    participantContext,
    "demo.participant@example.com",
    "OceanDemo!2026",
    "**/dashboard",
  );
  await participant.goto("http://localhost:3000/dashboard/attendance", {
    waitUntil: "networkidle",
  });
  await participant
    .getByText("75% milestone reached", { exact: true })
    .waitFor();
  await participant.locator(".att-mascot").evaluate((image) => image.decode());
  assert.ok(
    await participant
      .getByRole("button", { name: "Download certificate", exact: true })
      .isDisabled(),
  );
  await participant.screenshot({
    path: `${directory}/participant-desktop.png`,
    fullPage: true,
  });
  assert.equal(
    await participant.getByRole("button", { name: /preview/i }).count(),
    0,
  );
  await participant
    .getByRole("heading", { name: "Dashboard", exact: true })
    .waitFor();
  await participant
    .getByRole("button", { name: "Sign out", exact: true })
    .waitFor();
  assert.equal(await participant.locator('[lang="my"]').count(), 0);
  await participant.goto("http://localhost:3000/dashboard/attendance/demo", {
    waitUntil: "networkidle",
  });
  const pdfPromise = participant.waitForEvent("download");
  const celebrationStarted = Date.now();
  await participant.getByRole("button", { name: "Try demo download" }).click();
  await participant
    .getByRole("dialog", { name: "Your buildathon achievement" })
    .waitFor();
  await participant.getByRole("heading", { name: /You did it/ }).waitFor();
  for (const image of await participant
    .locator(".att-achievement-crew img")
    .all())
    await image.evaluate((img) => img.decode());
  await participant.screenshot({
    path: `${directory}/celebration-reveal.png`,
    fullPage: true,
  });
  const pdf = await pdfPromise;
  assert.ok(
    Date.now() - celebrationStarted >= 8000,
    "The full celebration should play before the automatic download",
  );
  await pdf.saveAs(`${directory}/demo-certificate.pdf`);
  assert.ok(
    readFileSync(`${directory}/demo-certificate.pdf`)
      .subarray(0, 5)
      .toString()
      .startsWith("%PDF-"),
  );
  await participant
    .getByRole("button", { name: "Save certificate again" })
    .waitFor();
  await participant.screenshot({
    path: `${directory}/celebration-desktop.png`,
    fullPage: true,
  });
  await participant.setViewportSize({ width: 390, height: 844 });
  await participant.screenshot({
    path: `${directory}/celebration-mobile.png`,
    fullPage: true,
  });
  await participant.getByRole("button", { name: "Close celebration" }).click();
  await participant.screenshot({
    path: `${directory}/participant-mobile.png`,
    fullPage: true,
  });
  assert.ok(
    await participant.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    "Participant page overflows mobile viewport",
  );
  const skippedDownload = participant.waitForEvent("download");
  await participant.getByRole("button", { name: "Try demo download" }).click();
  await participant
    .getByRole("button", { name: "Skip to my certificate" })
    .click();
  await skippedDownload;
  await participant.getByRole("button", { name: "Close celebration" }).click();
  await participant.emulateMedia({ reducedMotion: "reduce" });
  const reducedDownload = participant.waitForEvent("download");
  await participant.getByRole("button", { name: "Try demo download" }).click();
  await reducedDownload;
  await participant
    .getByRole("button", { name: "Save certificate again" })
    .waitFor();
  assert.equal(
    await participant
      .getByRole("button", { name: "Skip to my certificate" })
      .count(),
    0,
  );
  await participant.getByRole("button", { name: "Close celebration" }).click();
  const anonymous = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const publicPage = await anonymous.newPage();
  await publicPage.goto("http://localhost:3000/attendance", {
    waitUntil: "networkidle",
  });
  await publicPage.getByLabel("Search participant or team").fill("Ocean");
  await publicPage.getByText("Demo Participant", { exact: true }).waitFor();
  assert.equal(
    await publicPage
      .getByText("demo.participant@example.com", { exact: true })
      .count(),
    0,
  );
  await publicPage.screenshot({
    path: `${directory}/public-mobile.png`,
    fullPage: true,
  });
  const denied = await anonymous.request.get(
    "http://localhost:3000/api/certificate",
  );
  assert.equal(denied.status(), 401);
  assert.equal(
    await publicPage.getByRole("link", { name: /preview/i }).count(),
    0,
  );
  await participant
    .getByRole("button", { name: "Sign out", exact: true })
    .click();
  await participant.waitForURL("**/auth/signin**");
  const sample = await anonymous.request.get(
    "http://localhost:3000/api/certificate?preview=1",
  );
  assert.equal(sample.status(), 200);
  mkdirSync("public/certificates", { recursive: true });
  writeFileSync(
    "public/certificates/ai-ocean-template.pdf",
    await sample.body(),
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: admin sign-in, Excel export/import preview and overwrite, manual edit, mobile layout, participant release lock, personalized demo PDF, celebration, public privacy, anonymous download denial.",
  );
} finally {
  await browser.close();
}
