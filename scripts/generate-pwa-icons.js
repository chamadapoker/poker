// Script para gerar ícones PWA a partir da imagem logo.png
// Execute com: node scripts/generate-pwa-icons.js

const fs = require('fs')
const path = require('path')

// Tamanhos de ícones necessários para PWA
const iconSizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' }
]

// Função para criar ícones usando HTML5 Canvas (simulação)
function generatePWAIconInstructions() {
  const iconsDir = path.join(__dirname, '..', 'public', 'icons')
  const logoPath = path.join(__dirname, '..', 'public', 'logo.png')
  
  console.log('🎨 Gerando instruções para ícones PWA...')
  console.log('📁 Logo encontrado:', logoPath)
  console.log('📁 Diretório de ícones:', iconsDir)
  
  // Verificar se o logo existe
  if (!fs.existsSync(logoPath)) {
    console.error('❌ Logo não encontrado em:', logoPath)
    console.log('📝 Certifique-se de que a imagem está em public/logo.png')
    return
  }
  
  console.log('✅ Logo encontrado!')
  console.log('')
  console.log('📋 INSTRUÇÕES PARA GERAR ÍCONES:')
  console.log('=====================================')
  console.log('')
  console.log('1. 🌐 Use uma ferramenta online:')
  console.log('   - https://realfavicongenerator.net/')
  console.log('   - https://www.favicon-generator.org/')
  console.log('   - https://favicon.io/favicon-converter/')
  console.log('')
  console.log('2. 📱 Ou use o comando ImageMagick (se instalado):')
  console.log('   imagemagick public/logo.png -resize 72x72 public/icons/icon-72x72.png')
  console.log('   imagemagick public/logo.png -resize 96x96 public/icons/icon-96x96.png')
  console.log('   imagemagick public/logo.png -resize 128x128 public/icons/icon-128x128.png')
  console.log('   imagemagick public/logo.png -resize 144x144 public/icons/icon-144x144.png')
  console.log('   imagemagick public/logo.png -resize 152x152 public/icons/icon-152x152.png')
  console.log('   imagemagick public/logo.png -resize 192x192 public/icons/icon-192x192.png')
  console.log('   imagemagick public/logo.png -resize 384x384 public/icons/icon-384x384.png')
  console.log('   imagemagick public/logo.png -resize 512x512 public/icons/icon-512x512.png')
  console.log('')
  console.log('3. 📋 Tamanhos necessários:')
  iconSizes.forEach(({ size, name }) => {
    console.log(`   - ${name} (${size}x${size}px)`)
  })
  console.log('')
  console.log('4. 🎯 Após gerar os ícones:')
  console.log('   - Coloque todos os PNGs na pasta public/icons/')
  console.log('   - O manifest.json já está configurado')
  console.log('   - O PWA funcionará automaticamente')
  console.log('')
  console.log('💡 DICA: Use o RealFaviconGenerator para gerar todos os tamanhos de uma vez!')
}

// Função para criar um favicon.ico básico
function createBasicFavicon() {
  const faviconPath = path.join(__dirname, '..', 'public', 'favicon.ico')
  const logoPath = path.join(__dirname, '..', 'public', 'logo.png')
  
  if (fs.existsSync(logoPath)) {
    console.log('📝 Criando favicon.ico básico...')
    // Copiar logo como favicon temporário
    fs.copyFileSync(logoPath, faviconPath)
    console.log('✅ favicon.ico criado (temporário)')
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  generatePWAIconInstructions()
  createBasicFavicon()
}

module.exports = { generatePWAIconInstructions, iconSizes }
