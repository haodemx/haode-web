# HAODE México Android App v1

Android WebView app independiente para abrir la HAODE App pública.

No modifica el código del sitio `haode-web` ni el proyecto iOS. La app Android solo carga esta URL pública:

`https://haodemx.github.io/haode-web/app/?v=ui-v2`

## Datos principales

- App name: `HAODE México`
- Package / Application ID: `com.haodemx.app`
- Tipo: Android WebView App
- Version: `1.0`
- Version code: `1`
- Min SDK: `23`
- Target SDK: `35`
- Compile SDK: `35`
- Lenguaje: Java
- Proyecto: `C:\HAODE\haode-web\android\haode-android-app`

## APK debug

Ruta del APK generado:

```text
C:\HAODE\haode-web\android\haode-android-app\app\build\outputs\apk\debug\app-debug.apk
```

Ruta relativa desde este proyecto:

```text
app\build\outputs\apk\debug\app-debug.apk
```

## Build debug APK

En Windows, desde el proyecto Android:

```powershell
cd C:\HAODE\haode-web\android\haode-android-app
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
.\gradlew.bat clean assembleDebug
```

Si `JAVA_HOME` ya está configurado en Windows, también se puede ejecutar directamente:

```powershell
.\gradlew.bat clean assembleDebug
```

## Prueba en emulador

1. Abrir Android Studio.
2. Iniciar un emulador, por ejemplo `Pixel 7 API 35`.
3. Confirmar que adb ve el emulador:

```powershell
adb devices
```

4. Instalar el APK debug:

```powershell
adb install -r app\build\outputs\apk\debug\app-debug.apk
```

5. Abrir la app:

```powershell
adb shell am start -n com.haodemx.app/.MainActivity
```

También se puede instalar y ejecutar desde Android Studio usando la configuración `app`.

## Instalación en teléfono Android

1. Conectar el teléfono por USB.
2. Activar `Developer options` y `USB debugging`.
3. Confirmar que adb detecta el teléfono:

```powershell
adb devices
```

4. Instalar o actualizar la app:

```powershell
adb install -r app\build\outputs\apk\debug\app-debug.apk
```

## Comportamiento v1

- Carga directa de `https://haodemx.github.io/haode-web/app/?v=ui-v2`.
- Navegación interna dentro de `haodemx.github.io/haode-web/app`.
- Compatible con rutas hash como `#producto`, `#carrito`, `#lista`.
- Barra nativa superior con regreso, título y refrescar.
- WebView con JavaScript y DOM Storage habilitados.
- Splash simple con marca HAODE.
- Manejo de status bar / safe area con `WindowInsets` para evitar que el contenido quede pegado al área de cámara o barra superior.
- Links externos se abren fuera del WebView:
  - WhatsApp
  - `tel:`
  - `mailto:`
  - Sitios externos

## Archivos principales

```text
settings.gradle.kts
build.gradle.kts
gradle.properties
app\build.gradle.kts
app\src\main\AndroidManifest.xml
app\src\main\java\com\haodemx\app\MainActivity.java
app\src\main\res\values\strings.xml
app\src\main\res\values\styles.xml
```

## Checklist QA

- App instala sin error en emulador o teléfono.
- App abre sin crash.
- Carga `https://haodemx.github.io/haode-web/app/?v=ui-v2`.
- El título superior `HAODE México` no queda pegado al status bar ni al área de cámara.
- Botón regresar funciona.
- Botón refrescar funciona.
- Carrito, Inicio, Categorías y Contacto funcionan dentro del WebView.
- WhatsApp abre app o navegador externo.
- `tel:` abre marcador.
- `mailto:` abre app de correo.
- Links externos abren navegador.
- Error de red muestra `No se pudo conectar`.
- Botón `Reintentar` vuelve a cargar.

## Publicación Google Play

Pendiente para producción:

- Cuenta Google Play Console.
- Política de privacidad pública.
- App icon final.
- Screenshots Android.
- Ficha de Play Store en español.
- Firma de app / upload key.
- Build release firmado.

No hacer upload hasta completar QA en emulador y teléfono real.