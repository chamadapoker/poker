// Script para gerar ícones PWA usando Sharp
// Execute com: node scripts/generate-icons-sharp.js

const sharp = require('sharp')
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

async function generatePWAIcons() {
  const iconsDir = path.join(__dirname, '..', 'public', 'icons')
  const logoPath = path.join(__dirname, '..', 'public', 'logo.png')
  
  console.log('🎨 Gerando ícones PWA com Sharp...')
  console.log('📁 Logo:', logoPath)
  console.log('📁 Diretório de ícones:', iconsDir)
  
  // Verificar se o logo existe
  if (!fs.existsSync(logoPath)) {
    console.error('❌ Logo não encontrado em:', logoPath)
    console.log('📝 Certifique-se de que a imagem está em public/logo.png')
    return
  }
  
  // Criar diretório se não existir
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true })
    console.log('📁 Diretório de ícones criado')
  }
  
  console.log('✅ Logo encontrado!')
  console.log('🔄 Gerando ícones...')
  
  try {
    // Gerar cada tamanho de ícone
    for (const { size, name } of iconSizes) {
      const outputPath = path.join(iconsDir, name)
      
      await sharp(logoPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 } // Fundo transparente
        })
        .png({
          quality: 100,
          compressionLevel: 9
        })
        .toFile(outputPath)
      
      console.log(`✅ Criado: ${name} (${size}x${size}px)`)
    }
    
    // Gerar favicon.ico
    const faviconPath = path.join(__dirname, '..', 'public', 'favicon.ico')
    await sharp(logoPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(faviconPath.replace('.ico', '.png'))
    
    console.log('✅ Criado: favicon.png (32x32px)')
    
    // Gerar apple-touch-icon
    const appleTouchIconPath = path.join(__dirname, '..', 'public', 'apple-touch-icon.png')
    await sharp(logoPath)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(appleTouchIconPath)
    
    console.log('✅ Criado: apple-touch-icon.png (180x180px)')
    
    console.log('')
    console.log('🎉 Todos os ícones PWA foram gerados com sucesso!')
    console.log('📱 O PWA agora está pronto para instalação')
    console.log('')
    console.log('📋 Ícones criados:')
    iconSizes.forEach(({ size, name }) => {
      console.log(`   - ${name} (${size}x${size}px)`)
    })
    console.log('   - favicon.png (32x32px)')
    console.log('   - apple-touch-icon.png (180x180px)')
    
  } catch (error) {
    console.error('❌ Erro ao gerar ícones:', error.message)
    console.log('')
    console.log('🔧 SOLUÇÃO ALTERNATIVA:')
    console.log('1. Use uma ferramenta online: https://realfavicongenerator.net/')
    console.log('2. Faça upload da imagem public/logo.png')
    console.log('3. Baixe os ícones gerados')
    console.log('4. Coloque na pasta public/icons/')
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  generatePWAIcons()
}

module.exports = { generatePWAIcons, iconSizes }
