import sharp from "sharp";
import { writeFileSync, mkdirSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, "..", "public", "icons");
const svgPath = join(iconsDir, "icon.svg");

async function generateIcon(size) {
  const svg = readFileSync(svgPath);
  return sharp(svg).resize(size, size).png().toBuffer();
}

mkdirSync(iconsDir, { recursive: true });

const icon192 = await generateIcon(192);
const icon512 = await generateIcon(512);

writeFileSync(join(iconsDir, "icon-192x192.png"), icon192);
writeFileSync(join(iconsDir, "icon-512x512.png"), icon512);

console.log("Icons generated successfully.");
