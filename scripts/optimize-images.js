import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '..', 'public');

async function optimizeImage(inputPath, outputName, maxWidth = 220, quality = 85) {
  const input = path.join(publicDir, inputPath);
  const outputWebP = path.join(publicDir, `${outputName}.webp`);
  const outputPNG = path.join(publicDir, `${outputName}-optimized.png`);

  if (!fs.existsSync(input)) {
    console.log(`⚠️  ${inputPath} not found, skipping...`);
    return;
  }

  try {
    const metadata = await sharp(input).metadata();
    console.log(`\n📸 Optimizing ${inputPath}...`);
    console.log(`   Original size: ${metadata.width}x${metadata.height}px`);
    console.log(`   Original file size: ${(fs.statSync(input).size / 1024).toFixed(2)} KB`);

    // Create WebP version
    await sharp(input)
      .resize(maxWidth, maxWidth, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality })
      .toFile(outputWebP);

    const webpSize = fs.statSync(outputWebP).size / 1024;
    console.log(`   ✅ WebP created: ${webpSize.toFixed(2)} KB (${((1 - webpSize / (fs.statSync(input).size / 1024)) * 100).toFixed(1)}% reduction)`);

    // Create optimized PNG version (fallback)
    await sharp(input)
      .resize(maxWidth, maxWidth, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .png({ 
        quality: 90,
        compressionLevel: 9,
        adaptiveFiltering: true,
      })
      .toFile(outputPNG);

    const pngSize = fs.statSync(outputPNG).size / 1024;
    console.log(`   ✅ PNG optimized: ${pngSize.toFixed(2)} KB (${((1 - pngSize / (fs.statSync(input).size / 1024)) * 100).toFixed(1)}% reduction)`);
  } catch (error) {
    console.error(`❌ Error optimizing ${inputPath}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Starting image optimization...\n');

  // Optimize tonneau.png (header logo - 110x110px displayed, use 220x220 for retina)
  await optimizeImage('tonneau.png', 'tonneau', 220, 85);

  // Optimize Logoaccueil.png (homepage logo - larger, use 320px max)
  await optimizeImage('Logoaccueil.png', 'Logoaccueil', 320, 85);

  console.log('\n✨ Image optimization complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. Update Layout.tsx to use <picture> with WebP fallback');
  console.log('   2. Update Home.tsx to use <picture> with WebP fallback');
  console.log('   3. Test the optimized images in the browser');
}

main().catch(console.error);

