/**
 * Extract raw text from a PDF buffer using unpdf.
 * Works in Node.js (Next.js server-side) without any native binaries.
 */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  const { extractText } = await import("unpdf");
  const uint8 = new Uint8Array(buffer);
  const { text } = await extractText(uint8, { mergePages: true });
  return text ?? "";
}
