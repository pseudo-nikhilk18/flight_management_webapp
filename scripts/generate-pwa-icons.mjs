import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const outputDir = path.join(process.cwd(), "public", "icons");

await mkdir(outputDir, { recursive: true });

const background = { r: 37, g: 99, b: 235, alpha: 1 };

async function writeIcon(size, filename) {
  const iconSize = Math.round(size * 0.42);
  const planeSvg = `
    <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#ffffff" d="M10.18 10.82 2 8.5 3.5 2l7.46 4.12 4.54-2.12L21 2l-1.5 6.5-7.46 1.32-4.36 2.2L3 22l1.5-6.5 5.68-1.18 4.5 2.5L19 22l-1.32-7.68-7-3.5Z"/>
    </svg>
  `;

  const plane = await sharp(Buffer.from(planeSvg)).png().toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background,
    },
  })
    .composite([{ input: plane, gravity: "center" }])
    .png()
    .toFile(path.join(outputDir, filename));
}

await writeIcon(192, "icon-192.png");
await writeIcon(512, "icon-512.png");

console.log("Generated PWA icons in public/icons");
