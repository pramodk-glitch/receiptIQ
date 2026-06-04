/**
 * Convert a PDF buffer to an array of JPEG image buffers using pdftoppm
 * (from poppler-utils, installed in the Docker image).
 *
 * For very tall single-page PDFs (like Target digital receipts rendered
 * from HTML), we crop the output image into 3000px-tall sections so
 * Claude Vision can read each section clearly.
 */
import { execSync } from "child_process";
import { writeFileSync, readFileSync, readdirSync, mkdtempSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

const MAX_SECTION_HEIGHT = 3500; // px — safe for Claude Vision

export async function pdfToImages(pdfBuffer: Buffer): Promise<Buffer[]> {
  const tmpDir = mkdtempSync(join(tmpdir(), "riq-pdf-"));
  const pdfPath = join(tmpDir, "in.pdf");

  try {
    writeFileSync(pdfPath, pdfBuffer);

    // Convert all pages to JPEG at 150 DPI
    execSync(`pdftoppm -jpeg -r 150 "${pdfPath}" "${join(tmpDir, "p")}"`, {
      timeout: 60_000,
    });

    const pages = readdirSync(tmpDir)
      .filter((f) => f.startsWith("p") && f.endsWith(".jpg"))
      .sort()
      .map((f) => readFileSync(join(tmpDir, f)));

    if (pages.length === 0) throw new Error("pdftoppm produced no output");

    // If any single page is very tall, split it into sections using ImageMagick
    // (available via apk add imagemagick, fallback: return as-is)
    const results: Buffer[] = [];
    for (const page of pages) {
      const sections = await splitTallImage(page, tmpDir);
      results.push(...sections);
    }

    return results;
  } finally {
    try { execSync(`rm -rf "${tmpDir}"`); } catch { /* ignore */ }
  }
}

async function splitTallImage(imageBuffer: Buffer, tmpDir: string): Promise<Buffer[]> {
  // Try to get image dimensions using identify (ImageMagick) or just return as-is
  const imgPath = join(tmpDir, `img_${Date.now()}.jpg`);
  writeFileSync(imgPath, imageBuffer);

  try {
    const out = execSync(`identify -format "%wx%h" "${imgPath}"`, { timeout: 10_000 })
      .toString()
      .trim();
    const [w, h] = out.split("x").map(Number);

    if (h <= MAX_SECTION_HEIGHT) {
      return [imageBuffer]; // fits in one section
    }

    // Crop into sections
    const sections: Buffer[] = [];
    let y = 0;
    let idx = 0;
    while (y < h) {
      const sectionH = Math.min(MAX_SECTION_HEIGHT, h - y);
      const outPath = join(tmpDir, `section_${idx++}.jpg`);
      execSync(
        `convert "${imgPath}" -crop ${w}x${sectionH}+0+${y} +repage "${outPath}"`,
        { timeout: 15_000 }
      );
      sections.push(readFileSync(outPath));
      y += sectionH;
    }
    return sections;
  } catch {
    // ImageMagick not available — return image as-is
    return [imageBuffer];
  }
}
