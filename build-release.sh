#!/bin/bash

# Script para build de release de Planifi
echo "🚀 Iniciando build de release para Planifi..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi

# Paso 1: Limpiar builds anteriores
print_status "Limpiando builds anteriores..."
rm -rf dist/
rm -rf android/app/build/

# Paso 2: Instalar dependencias
print_status "Instalando dependencias..."
npm install

# Paso 3: Build de la aplicación web
print_status "Construyendo aplicación web..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Falló el build de la aplicación web"
    exit 1
fi

# Paso 4: Sincronizar con Capacitor
print_status "Sincronizando con Capacitor..."
npx cap sync android

if [ $? -ne 0 ]; then
    print_error "Falló la sincronización con Capacitor"
    exit 1
fi

# Paso 5: Verificar que existe el keystore
if [ ! -f "android/app/planifi-release-key.keystore" ]; then
    print_warning "No se encontró el keystore. Generando uno nuevo..."
    cd android/app
    keytool -genkey -v -keystore planifi-release-key.keystore -alias planifi-key-alias -keyalg RSA -keysize 2048 -validity 10000 -storepass planifi123 -keypass planifi123 -dname "CN=Planifi, OU=Development, O=Planifi, L=City, S=State, C=CO"
    cd ../..
fi

# Paso 6: Build del APK
print_status "Construyendo APK de release..."
cd android
./gradlew assembleRelease

if [ $? -ne 0 ]; then
    print_error "Falló el build del APK"
    exit 1
fi

# Paso 7: Build del AAB (recomendado para Play Store)
print_status "Construyendo AAB para Play Store..."
./gradlew bundleRelease

if [ $? -ne 0 ]; then
    print_error "Falló el build del AAB"
    exit 1
fi

cd ..

# Paso 8: Mostrar ubicación de los archivos
print_status "✅ Build completado exitosamente!"
echo ""
echo "📱 Archivos generados:"
echo "   APK: android/app/build/outputs/apk/release/app-release.apk"
echo "   AAB: android/app/build/outputs/bundle/release/app-release.aab"
echo ""
echo "📊 Información del build:"
echo "   Versión: 1.0.1 (versionCode: 2)"
echo "   Tamaño estimado: $(du -h android/app/build/outputs/apk/release/app-release.apk 2>/dev/null | cut -f1 || echo 'N/A')"
echo ""
echo "🎯 Próximos pasos:"
echo "   1. Subir el archivo .aab a Google Play Console"
echo "   2. Completar la información de la aplicación"
echo "   3. Agregar screenshots y descripción"
echo "   4. Configurar política de privacidad"
echo ""
print_status "¡Listo para subir a Play Store! 🚀"
