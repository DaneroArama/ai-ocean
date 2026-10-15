import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { readFile } from "node:fs/promises";
import path from "node:path";

export async function createCertificate(input: {
  name: string;
  serial: string;
  demo: boolean;
  preview?: boolean;
  demoLabel?: string;
}) {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const nameFont = await pdf.embedFont(
    await readFile(
      path.join(process.cwd(), "public/fonts/NotoSansMyanmar-Regular.ttf"),
    ),
    { subset: true },
  );
  const latinNameFont = await pdf.embedFont(
    await readFile(
      path.join(process.cwd(), "public/fonts/NotoSans-Regular.ttf"),
    ),
    { subset: true },
  );
  const latinCharacters = new Set(latinNameFont.getCharacterSet());
  const myanmarCharacters = new Set(nameFont.getCharacterSet());
  const nameRuns: { text: string; font: typeof nameFont }[] = [];
  for (const character of input.name) {
    const code = character.codePointAt(0)!;
    const font = latinCharacters.has(code)
      ? latinNameFont
      : myanmarCharacters.has(code)
        ? nameFont
        : null;
    if (!font)
      throw new Error(
        "The participant name contains a character not supported by the certificate fonts. Contact the event team.",
      );
    const last = nameRuns[nameRuns.length - 1];
    if (last?.font === font) last.text += character;
    else nameRuns.push({ text: character, font });
  }
  const sans = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const serif = await pdf.embedFont(StandardFonts.TimesRoman);
  const page = pdf.addPage([842, 595]);
  const ink = rgb(0.035, 0.19, 0.22),
    teal = rgb(0.02, 0.49, 0.49),
    gold = rgb(0.75, 0.55, 0.28),
    cream = rgb(0.99, 0.975, 0.94);
  page.drawRectangle({ x: 0, y: 0, width: 842, height: 595, color: cream });
  page.drawRectangle({
    x: 20,
    y: 20,
    width: 802,
    height: 555,
    borderColor: teal,
    borderWidth: 1,
  });
  page.drawRectangle({
    x: 29,
    y: 29,
    width: 784,
    height: 537,
    borderColor: gold,
    borderWidth: 0.5,
  });
  for (let i = 0; i < 7; i++) {
    page.drawCircle({
      x: 810 + i * 7,
      y: 565 - i * 9,
      size: 80 + i * 8,
      borderColor: teal,
      borderWidth: 0.45,
      opacity: 0.13,
      borderOpacity: 0.18,
    });
    page.drawCircle({
      x: 10 - i * 8,
      y: 10 + i * 9,
      size: 80 + i * 8,
      borderColor: teal,
      borderWidth: 0.45,
      borderOpacity: 0.18,
    });
  }
  const centered = (
    text: string,
    y: number,
    size: number,
    font = sans,
    color = ink,
  ) =>
    page.drawText(text, {
      x: (842 - font.widthOfTextAtSize(text, size)) / 2,
      y,
      size,
      font,
      color,
    });
  centered("INTO THE AI OCEAN", 516, 17, bold, teal);
  centered("BUILDATHON 2026", 493, 9, sans, ink);
  page.drawLine({
    start: { x: 366, y: 471 },
    end: { x: 476, y: 471 },
    thickness: 1.3,
    color: gold,
  });
  centered("Certificate of Completion", 409, 38, serif);
  centered("THIS CERTIFICATE IS PROUDLY PRESENTED TO", 372, 9, sans);
  let size = 35;
  const nameWidth = (size: number) =>
    nameRuns.reduce(
      (width, run) => width + run.font.widthOfTextAtSize(run.text, size),
      0,
    );
  while (nameWidth(size) > 650 && size > 10) size--;
  if (nameWidth(size) > 650)
    throw new Error(
      "The participant name is too long for this certificate template. Contact the event team.",
    );
  let nameX = (842 - nameWidth(size)) / 2;
  for (const run of nameRuns) {
    page.drawText(run.text, {
      x: nameX,
      y: 307,
      size,
      font: run.font,
      color: teal,
    });
    nameX += run.font.widthOfTextAtSize(run.text, size);
  }
  page.drawLine({
    start: { x: 145, y: 288 },
    end: { x: 697, y: 288 },
    thickness: 0.6,
    color: gold,
  });
  centered(
    "For completing the AI Ocean Buildathon and contributing to a",
    251,
    12,
  );
  centered(
    "journey of learning, collaboration, and building with AI.",
    232,
    12,
  );
  centered("17 OCTOBER - 1 NOVEMBER 2026", 197, 10, bold);
  page.drawCircle({ x: 421, y: 122, size: 29, color: teal });
  page.drawCircle({
    x: 421,
    y: 122,
    size: 24,
    borderColor: gold,
    borderWidth: 1,
  });
  centered("AI", 120, 18, bold, cream);
  centered("OCEAN", 109, 6, bold, cream);
  page.drawLine({
    start: { x: 130, y: 122 },
    end: { x: 280, y: 122 },
    thickness: 0.6,
    color: gold,
  });
  page.drawText("EVENT ORGANIZING TEAM", {
    x: 138,
    y: 103,
    size: 8,
    font: sans,
    color: ink,
  });
  page.drawLine({
    start: { x: 560, y: 122 },
    end: { x: 710, y: 122 },
    thickness: 0.6,
    color: gold,
  });
  page.drawText("AI OCEAN BUILDATHON", {
    x: 579,
    y: 103,
    size: 8,
    font: sans,
    color: ink,
  });
  centered(input.serial, 56, 8, sans, teal);
  if (input.demo || input.preview) {
    page.drawText(
      input.preview ? "TEMPLATE PREVIEW" : input.demoLabel || "LOCAL DEMO",
      {
        x: 250,
        y: 165,
        size: 49,
        font: bold,
        color: teal,
        opacity: 0.1,
        rotate: degrees(24),
      },
    );
    centered(
      "SAMPLE TEMPLATE - NOT AN OFFICIAL CERTIFICATE",
      40,
      7,
      bold,
      teal,
    );
  }
  pdf.setTitle(`AI Ocean Certificate - ${input.name}`);
  pdf.setAuthor("AI Ocean Buildathon");
  return pdf.save();
}
