# 🚀 Guía de Deployment - Planifi

## Preparación para Play Store

### 1. Generar Keystore (Solo la primera vez)

```bash
cd android/app
keytool -genkey -v -keystore planifi-release-key.keystore -alias planifi-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

**Información requerida:**
- Contraseña del keystore: `planifi123`
- Contraseña de la clave: `planifi123`
- Nombre: `Planifi`
- Organización: `Planifi`
- Ciudad: `Tu Ciudad`
- Estado: `Tu Estado`
- País: `CO`

### 2. Build Automático

```bash
# Hacer ejecutable el script
chmod +x build-release.sh

# Ejecutar build completo
./build-release.sh
```

### 3. Build Manual

```bash
# 1. Limpiar y construir web app
npm run build

# 2. Sincronizar con Capacitor
npx cap sync android

# 3. Construir APK
cd android
./gradlew assembleRelease

# 4. Construir AAB (recomendado)
./gradlew bundleRelease
```

## 📱 Archivos Generados

- **APK:** `android/app/build/outputs/apk/release/app-release.apk`
- **AAB:** `android/app/build/outputs/bundle/release/app-release.aab`

## 🎯 Información para Play Store

### Metadatos de la App
- **Nombre:** Planifi
- **Paquete:** com.planifi.add
- **Versión:** 1.0.1 (versionCode: 2)
- **Categoría:** Finanzas
- **Edad:** 3+
- **Descripción:** Gestiona tus finanzas personales de manera inteligente

### Descripción Corta (80 caracteres)
```
Gestiona tus finanzas personales. Controla gastos, ahorra y mantén presupuesto.
```

### Descripción Completa
```
Planifi es tu compañero ideal para el control financiero personal. Con esta aplicación podrás:

💰 GESTIONAR TRANSACCIONES
• Registra ingresos y gastos fácilmente
• Categoriza tus movimientos financieros
• Exporta datos en formato CSV

📊 SEGUIMIENTO DE PRESUPUESTOS
• Establece límites por categoría
• Monitorea tu progreso en tiempo real
• Recibe alertas cuando te acerques al límite

🎯 METAS FINANCIERAS
• Define objetivos de ahorro
• Visualiza tu progreso con gráficos
• Mantén la motivación para alcanzar tus metas

📈 REPORTES DETALLADOS
• Análisis visual de tus finanzas
• Tendencias de gastos e ingresos
• Estadísticas mensuales y anuales

🔒 PRIVACIDAD TOTAL
• Todos los datos se almacenan localmente
• Sin conexión a internet requerida
• Tu información financiera permanece privada

Características principales:
✅ Interfaz intuitiva y fácil de usar
✅ Diseño moderno y responsivo
✅ Modo oscuro incluido
✅ Sin anuncios ni compras in-app
✅ Completamente gratuito

¡Toma el control de tus finanzas hoy mismo con Planifi!
```

### Palabras Clave
```
finanzas personales, presupuesto, ahorro, gastos, ingresos, control financiero, metas financieras, dinero, economía personal
```

## 🖼️ Assets Requeridos

### Iconos
- **App Icon:** 512x512px (PNG)
- **Feature Graphic:** 1024x500px (PNG)
- **Screenshots:** Mínimo 2, máximo 8 por dispositivo

### Screenshots Sugeridos
1. **Dashboard principal** - Vista general de finanzas
2. **Lista de transacciones** - Gestión de movimientos
3. **Formulario nueva transacción** - Facilidad de uso
4. **Metas financieras** - Seguimiento de objetivos
5. **Reportes** - Análisis visual
6. **Configuración** - Personalización

## 🔗 Enlaces Requeridos

### Política de Privacidad
- **URL:** https://github.com/samueluribe27/planifi/blob/main/PRIVACY_POLICY.md
- **Contenido:** Política completa incluida en el repositorio

### Soporte
- **Email:** soporte@planifi.app
- **GitHub:** https://github.com/samueluribe27/planifi

## ✅ Checklist Pre-Subida

- [ ] App funciona sin crashes
- [ ] Todos los formularios funcionan correctamente
- [ ] Exportación CSV funciona
- [ ] Modo oscuro/claro funciona
- [ ] Navegación entre pantallas fluida
- [ ] Tamaño de APK < 100MB
- [ ] Sin errores de JavaScript en consola
- [ ] Iconos en todas las resoluciones
- [ ] Screenshots de todas las pantallas
- [ ] Descripción y metadatos completos
- [ ] Política de privacidad accesible
- [ ] AAB firmado correctamente

## 🚨 Problemas Comunes y Soluciones

### Error: "App not optimized"
- **Solución:** Verificar que `minifyEnabled = true` en build.gradle

### Error: "Missing privacy policy"
- **Solución:** Agregar URL de política de privacidad en Play Console

### Error: "App crashes on startup"
- **Solución:** Verificar que todas las dependencias estén actualizadas

### Error: "Target SDK too old"
- **Solución:** Actualizar `targetSdkVersion` a 35 en variables.gradle

## 📞 Soporte

Si encuentras problemas durante el deployment:
1. Revisa los logs de build
2. Verifica la configuración de Capacitor
3. Consulta la documentación oficial
4. Contacta al equipo de desarrollo

---

**¡Planifi está listo para conquistar la Play Store! 🎉**
