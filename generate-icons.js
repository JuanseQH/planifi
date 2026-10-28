// Script para generar iconos de aplicación
// Requiere: npm install -g @capacitor/assets

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎨 Generando iconos para Planifi...');

// Crear directorio de assets si no existe
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

// Crear icono base (SVG simple)
const iconSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#22c55e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#16a34a;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Fondo circular -->
  <circle cx="256" cy="256" r="240" fill="url(#grad1)" stroke="#ffffff" stroke-width="8"/>
  
  <!-- Icono de moneda/cofre -->
  <g transform="translate(256, 256)">
    <!-- Cofre -->
    <rect x="-60" y="-20" width="120" height="80" rx="8" fill="#ffffff" opacity="0.9"/>
    <rect x="-50" y="-10" width="100" height="60" rx="4" fill="#22c55e" opacity="0.8"/>
    
    <!-- Monedas -->
    <circle cx="-30" cy="10" r="8" fill="#ffffff"/>
    <circle cx="0" cy="10" r="8" fill="#ffffff"/>
    <circle cx="30" cy="10" r="8" fill="#ffffff"/>
    
    <!-- Símbolo de peso/dólar -->
    <text x="0" y="15" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff">$</text>
    
    <!-- Hojas (representando crecimiento) -->
    <path d="M-40,-30 Q-30,-40 -20,-30 Q-30,-20 -40,-30" fill="#ffffff" opacity="0.7"/>
    <path d="M40,-30 Q30,-40 20,-30 Q30,-20 40,-30" fill="#ffffff" opacity="0.7"/>
  </g>
  
  <!-- Texto "P" -->
  <text x="256" y="350" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#ffffff">P</text>
</svg>
`;

// Guardar SVG
const iconPath = path.join(assetsDir, 'icon.svg');
fs.writeFileSync(iconPath, iconSvg);

console.log('✅ Icono SVG creado en:', iconPath);
console.log('');
console.log('📋 Próximos pasos:');
console.log('1. Instala @capacitor/assets: npm install -g @capacitor/assets');
console.log('2. Ejecuta: npx @capacitor/assets generate');
console.log('3. O usa una herramienta online como: https://capacitor-assets.vercel.app/');
console.log('');
console.log('🎯 El icono debe ser:');
console.log('- 512x512 píxeles mínimo');
console.log('- Formato PNG con fondo transparente');
console.log('- Diseño simple y reconocible');
console.log('- Colores: Verde (#22c55e) y blanco');
