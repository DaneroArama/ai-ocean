import { expect, it } from "vitest";
import { mkdir, writeFile } from "node:fs/promises";
import { PDFDocument } from "pdf-lib";
import { createCertificate } from "./certificate";
it("generates an A4 landscape PDF with an embedded Myanmar name font", async () => {
  const bytes = await createCertificate({
    name: "မေသက်ထား",
    serial: "AIO-2026-UNICODE-DEMO",
    demo: true,
  });
  const pdf = await PDFDocument.load(bytes);
  expect(pdf.getPageCount()).toBe(1);
  expect(pdf.getPages()[0].getSize()).toEqual({ width: 842, height: 595 });
  expect(pdf.getTitle()).toContain("မေသက်ထား");
  await mkdir(".convex/qa", { recursive: true });
  await writeFile(".convex/qa/myanmar-certificate.pdf", bytes);
  await writeFile(
    ".convex/qa/latin-certificate.pdf",
    await createCertificate({
      name: "Demo Participant",
      serial: "AIO-LATIN-DEMO",
      demo: true,
    }),
  );
  await writeFile(
    ".convex/qa/mixed-certificate.pdf",
    await createCertificate({
      name: "မေသက်ထား May Thet Htar",
      serial: "AIO-MIXED-DEMO",
      demo: true,
    }),
  );
});
