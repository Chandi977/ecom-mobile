const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const ICON_SRC = path.join(ROOT, 'assets', 'icon.png');
const ADAPTIVE_SRC = path.join(ROOT, 'assets', 'adaptive-icon.png');
const RES_DIR = path.join(ROOT, 'android', 'app', 'src', 'main', 'res');

const LAUNCHER_SIZES = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

const FOREGROUND_SIZES = {
  'mipmap-mdpi': 108,
  'mipmap-hdpi': 162,
  'mipmap-xhdpi': 216,
  'mipmap-xxhdpi': 324,
  'mipmap-xxxhdpi': 432,
};

async function renderSquare(srcPath, size, outPath) {
  await sharp(srcPath)
    .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .webp({ quality: 95 })
    .toFile(outPath);
}

async function renderRound(srcPath, size, outPath) {
  const circleSvg = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`
  );
  const base = await sharp(srcPath)
    .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png()
    .toBuffer();
  await sharp(base)
    .composite([{ input: circleSvg, blend: 'dest-in' }])
    .webp({ quality: 95 })
    .toFile(outPath);
}

async function renderForeground(srcPath, size, outPath) {
  const inner = Math.round(size * (66 / 108));
  const layer = await sharp(srcPath)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: layer, gravity: 'center' }])
    .webp({ quality: 95, alphaQuality: 100 })
    .toFile(outPath);
}

(async () => {
  for (const [dir, size] of Object.entries(LAUNCHER_SIZES)) {
    const target = path.join(RES_DIR, dir);
    if (!fs.existsSync(target)) {
      console.warn(`skip (missing): ${target}`);
      continue;
    }
    await renderSquare(ICON_SRC, size, path.join(target, 'ic_launcher.webp'));
    await renderRound(ICON_SRC, size, path.join(target, 'ic_launcher_round.webp'));
    console.log(`legacy ${dir} ${size}x${size}: ok`);
  }
  for (const [dir, size] of Object.entries(FOREGROUND_SIZES)) {
    const target = path.join(RES_DIR, dir);
    if (!fs.existsSync(target)) continue;
    await renderForeground(ADAPTIVE_SRC, size, path.join(target, 'ic_launcher_foreground.webp'));
    console.log(`foreground ${dir} ${size}x${size}: ok`);
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
