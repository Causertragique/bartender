import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '..', 'public');

// Sizes required for iOS
const iconSizes = [
  { name: 'icon-1024x1024.png', size: 1024 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'apple-touch-icon-180x180.png', size: 180 },
  { name: 'apple-touch-icon-152x152.png', size: 152 },
  { name: 'apple-touch-icon-120x120.png', size: 120 },
];

async function generateIcons() {
  console.log('🎨 Génération des icônes iOS...\n');

  // Try to use tonneau.png or Logoaccueil.png as source
  const sourceFiles = ['tonneau.png', 'Logoaccueil.png'];
  let sourceFile = null;

  for (const file of sourceFiles) {
    const filePath = path.join(publicDir, file);
    if (fs.existsSync(filePath)) {
      sourceFile = filePath;
      console.log(`📸 Source trouvée: ${file}\n`);
      break;
    }
  }

  if (!sourceFile) {
    console.error('❌ Aucun fichier source trouvé (tonneau.png ou Logoaccueil.png)');
    console.log('\n💡 Placez tonneau.png ou Logoaccueil.png dans le dossier public/');
    process.exit(1);
  }

  for (const icon of iconSizes) {
    try {
      const outputPath = path.join(publicDir, icon.name);
      
      // Create square icon with white background
      await sharp(sourceFile)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .extend({
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      console.log(`✅ ${icon.name} créé (${icon.size}x${icon.size}px, ${(stats.size / 1024).toFixed(2)} KB)`);
    } catch (error) {
      console.error(`❌ Erreur lors de la création de ${icon.name}:`, error.message);
    }
  }

  console.log('\n✨ Génération des icônes terminée !');
  console.log('\n📝 Prochaines étapes :');
  console.log('   1. Vérifiez les icônes dans public/');
  console.log('   2. Testez-les sur un appareil iOS');
  console.log('   3. Ajustez si nécessaire (couleur de fond, taille, etc.)');
}

generateIcons().catch(console.error);

