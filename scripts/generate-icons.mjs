/**
 * Regenerates all PWA icon variants from public/icon.png (1024x1024 source).
 * Requires Python 3 with Pillow: pip3 install Pillow
 * Usage: node scripts/generate-icons.mjs
 */
import { execSync } from 'child_process';
import { existsSync } from 'fs';

const SOURCE = 'public/icon.png';

if (!existsSync(SOURCE)) {
  console.error(`Source icon not found: ${SOURCE}`);
  process.exit(1);
}

const script = `
from PIL import Image
import os

src = Image.open("${SOURCE}").convert("RGBA")
sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512]
os.makedirs("public/icons", exist_ok=True)

for size in sizes:
    img = src.resize((size, size), Image.LANCZOS)
    img.save(f"public/icons/icon-{size}x{size}.png", optimize=True)
    print(f"  {size}x{size}")

# Maskable icon — icon centred with 10% safe-area padding on each side
pad = int(512 * 0.10)
bg = Image.new("RGBA", (512, 512), (6, 13, 27, 255))
icon_area = 512 - 2 * pad
bg.paste(src.resize((icon_area, icon_area), Image.LANCZOS), (pad, pad), src.resize((icon_area, icon_area), Image.LANCZOS))
bg.save("public/icons/icon-512x512-maskable.png", optimize=True)
print("  512x512-maskable")
print("Done.")
`;

try {
  execSync(`python3 -c '${script}'`, { stdio: 'inherit' });
} catch {
  console.error('Icon generation failed. Make sure Pillow is installed: pip3 install Pillow');
  process.exit(1);
}
