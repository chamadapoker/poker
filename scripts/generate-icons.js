// Script para gerar ícones PWA em diferentes tamanhos
// Execute com: node scripts/generate-icons.js

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

// SVG base para gerar os ícones
const svgTemplate = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="text" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="512" height="512" rx="80" fill="url(#bg)"/>
  
  <!-- Shield Icon -->
  <g transform="translate(128, 96)">
    <path d="M128 0L256 32L256 192C256 256 192 320 128 384C64 320 0 256 0 192L0 32Z" 
          fill="url(#text)" 
          opacity="0.9"/>
    
    <!-- POKER Text -->
    <text x="128" y="140" 
          font-family="Arial, sans-serif" 
          font-size="32" 
          font-weight="bold" 
          text-anchor="middle" 
          fill="url(#bg)">POKER</text>
    
    <!-- 360 Text -->
    <text x="128" y="180" 
          font-family="Arial, sans-serif" 
          font-size="24" 
          font-weight="bold" 
          text-anchor="middle" 
          fill="url(#bg)">360</text>
  </g>
  
  <!-- Decorative elements -->
  <circle cx="80" cy="80" r="8" fill="url(#text)" opacity="0.3"/>
  <circle cx="432" cy="80" r="8" fill="url(#text)" opacity="0.3"/>
  <circle cx="80" cy="432" r="8" fill="url(#text)" opacity="0.3"/>
  <circle cx="432" cy="432" r="8" fill="url(#text)" opacity="0.3"/>
</svg>
`

// Função para criar ícones SVG
function generateIcons() {
  const iconsDir = path.join(__dirname, '..', 'public', 'icons')
  
  // Criar diretório se não existir
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true })
  }
  
  console.log('🎨 Gerando ícones PWA...')
  
  iconSizes.forEach(({ size, name }) => {
    const svgContent = svgTemplate(size)
    const filePath = path.join(iconsDir, name.replace('.png', '.svg'))
    
    fs.writeFileSync(filePath, svgContent)
    console.log(`✅ Criado: ${name.replace('.png', '.svg')} (${size}x${size})`)
  })
  
  console.log('🎉 Ícones SVG gerados com sucesso!')
  console.log('📝 Nota: Para converter para PNG, use uma ferramenta online ou ImageMagick')
  console.log('🔗 Recomendado: https://convertio.co/svg-png/')
}

// Executar se chamado diretamente
if (require.main === module) {
  generateIcons()
}

module.exports = { generateIcons, iconSizes }
