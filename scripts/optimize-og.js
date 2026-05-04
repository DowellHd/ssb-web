const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../public/og-image.png');
const pngOut = path.join(__dirname, '../public/og-image.png');
const jpgOut = path.join(__dirname, '../public/og-image.jpg');

async function run() {
  const before = fs.statSync(inputPath).size;
  console.log(`Original: ${(before / 1024).toFixed(0)}KB @ 1734x907`);

  // Try PNG first — resize + max compression
  const pngBuf = await sharp(inputPath)
    .resize(1200, 630, { fit: 'cover', position: 'center' })
    .png({ compressionLevel: 9, effort: 10 })
    .toBuffer();

  console.log(`PNG compressed: ${(pngBuf.length / 1024).toFixed(0)}KB`);

  if (pngBuf.length <= 600 * 1024) {
    fs.writeFileSync(pngOut, pngBuf);
    console.log('✓ Saved as og-image.png');
    return 'png';
  }

  // PNG still too large — convert to JPEG
  const jpgBuf = await sharp(inputPath)
    .resize(1200, 630, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 85, progressive: true })
    .toBuffer();

  console.log(`JPEG compressed: ${(jpgBuf.length / 1024).toFixed(0)}KB`);
  fs.writeFileSync(jpgOut, jpgBuf);
  console.log('✓ Saved as og-image.jpg (update metadata reference)');
  return 'jpg';
}

run().then(fmt => {
  const file = fmt === 'png' ? pngOut : jpgOut;
  const stats = fs.statSync(file);
  console.log(`Final: ${(stats.size / 1024).toFixed(0)}KB as og-image.${fmt}`);
}).catch(console.error);
