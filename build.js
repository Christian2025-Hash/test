const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname);
const distDir = path.join(__dirname, 'dist');

// Crée dist/ s'il n'existe pas
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Fonction pour lire fichier, retourne '' si absent
function safeReadFile(filepath) {
  try {
    return fs.readFileSync(filepath, 'utf-8');
  } catch {
    console.warn(`⚠️ Fichier non trouvé : ${filepath}`);
    return '';
  }
}

// Charge les composants HTML depuis pages/
const headContent = `
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Taxi Étoile Verte</title>
  <link rel="stylesheet" href="css/style.css">
</head>
`;

const headerContent = safeReadFile(path.join(srcDir, 'pages/header.html'));
const mainContent = safeReadFile(path.join(srcDir, 'pages/index.html'));
const footerContent = safeReadFile(path.join(srcDir, 'pages/footer.html'));

// Génère la page complète
const fullHtml = `
<!DOCTYPE html>
<html lang="fr">
${headContent}
<body>
${headerContent}
${mainContent}
${footerContent}
<script src="js/script.js"></script>
</body>
</html>
`;

// Écrit index.html dans dist/
fs.writeFileSync(path.join(distDir, 'index.html'), fullHtml, 'utf-8');
console.log('✅ index.html généré.');

// Copie un dossier récursivement
function copyFolderRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`⚠️ Dossier source introuvable : ${src}`);
    return;
  }
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  fs.readdirSync(src).forEach(item => {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      copyFolderRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

// Dossiers à copier vers dist/
const foldersToCopy = ['js', 'css', 'pages'];

// Copie dossiers
foldersToCopy.forEach(folder => {
  copyFolderRecursive(path.join(srcDir, folder), path.join(distDir, folder));
});

// Copie images à part
const imagesSrc = path.join(srcDir, 'images');
const imagesDest = path.join(distDir, 'images');
copyFolderRecursive(imagesSrc, imagesDest);

console.log('🖼️ Dossier images copié.');
console.log('🚀 Build terminé avec succès.');
