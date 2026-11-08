/**
 * Genera los placeholders PNG de producto usados por `next/image`.
 *
 * La API del e-commerce expone `image_url` como `null` en su seeder, por lo que
 * el frontend resuelve una imagen local determinista por producto. Se generan
 * como PNG (raster) para que el pipeline de optimizacion de `next/image`
 * (AVIF/WebP + resize) tenga trabajo real que hacer.
 *
 * Uso:
 *   node scripts/generate-product-placeholders.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const OUTPUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "products");
const SIZE = 800;

const PALETTES = [
  ["#4f46e5", "#a855f7"],
  ["#0ea5e9", "#22d3ee"],
  ["#f97316", "#facc15"],
  ["#10b981", "#84cc16"],
  ["#ef4444", "#f472b6"],
  ["#6366f1", "#38bdf8"],
  ["#14b8a6", "#0ea5e9"],
  ["#8b5cf6", "#ec4899"],
];

function svg({ from, to, label }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#g)"/>
  <g fill="#ffffff" fill-opacity="0.16">
    <circle cx="640" cy="160" r="220"/>
    <circle cx="140" cy="660" r="260"/>
  </g>
  <g fill="none" stroke="#ffffff" stroke-opacity="0.55" stroke-width="18" stroke-linejoin="round" stroke-linecap="round">
    <path d="M250 330 L550 330 L520 560 L280 560 Z"/>
    <path d="M300 330 L330 240 L470 240 L500 330"/>
  </g>
  <text x="${SIZE / 2}" y="680" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="54" font-weight="700" fill="#ffffff" fill-opacity="0.9">${label}</text>
</svg>`;
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  await Promise.all(
    PALETTES.map(async ([from, to], index) => {
      const png = await sharp(Buffer.from(svg({ from, to, label: `#${index + 1}` })))
        .png({ compressionLevel: 9 })
        .toBuffer();

      await writeFile(join(OUTPUT_DIR, `placeholder-${index + 1}.png`), png);
    }),
  );

  console.log(`Generados ${PALETTES.length} placeholders en public/products/`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
