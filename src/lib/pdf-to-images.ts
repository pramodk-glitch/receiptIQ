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

const MAX_SECTION_HEIGHT = 4000; // px — Claude Vision max is 8000px per dimension

export async function pdfToImages(pdfBuffer: Buffer): Promise<Buffer[]> {
  const tmpDir = mkdtempSync(join(tmpdir(), "riq-pdf-"));
  const pdfPath = join(tmpDir, "in.pdf");

  try {
    writeFileSync(pdfPath, pdfBuffer);

    // Convert all pages to JPEG — scale width to 1200px max (keeps aspect ratio).
    // Lower resolution is intentional: Claude Vision doesn't need high DPI,
    // and the Target receipt PDF is one very tall page that times out at 150 DPI.
    let stderr = "";
    try {
      const result = execSync(
        `pdftoppm -jpeg -scale-to-x 1200 -scale-to-y -1 "${pdfPath}" "${join(tmpDir, "p")}" 2>&1`,
        { timeout: 120_000, encoding: "buffer" }
      );
      stderr = result.toString();
    } catch (e: unknown) {
      const err = e as { stderr?: Buffer; stdout?: Buffer; message?: string };
      stderr = (err.stderr ?? err.stdout ?? Buffer.alloc(0)).toString();
      throw new Error(`pdftoppm failed: ${err.message ?? ""} | stderr: ${stderr.substring(0, 300)}`);
    }
    if (stderr) console.log(`[pdftoppm] output: ${stderr.substring(0, 200)}`);

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
  } catch (e) {
    // ImageMagick not available or failed — log and re-throw so caller knows
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[splitTallImage] failed (ImageMagick required): ${msg}`);
    throw new Error(`Image splitting failed — imagemagick may not be installed: ${msg}`);
  }
}
