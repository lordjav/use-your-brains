# 🧠 Usa Tus Sesos - Juego de Preguntas

## 🚀 Despliegue en GitHub Pages

La aplicación se despliega automáticamente a GitHub Pages cuando haces push a `main`.

### Configuración inicial (una sola vez)

1. **Habilitar GitHub Pages:**
   - Ve a tu repositorio en GitHub
   - Settings > Pages
   - Source: selecciona "GitHub Actions"

2. **Configurar el Secret:**
   - Ve a Settings > Secrets and variables > Actions
   - Click en "New repository secret"
   - Name: `MANIFEST_FILE_ID`
   - Value: el ID de tu archivo manifest.json en Google Drive

3. **Hacer push a main:**
   - El workflow se ejecutará automáticamente
   - Tu sitio estará en: `https://tu-usuario.github.io/use-your-brains/`

## 📁 Configuración de Google Drive

Los cuestionarios se cargan desde una carpeta pública de Google Drive usando un archivo **manifest**.

### Paso 1: Subir archivos a Google Drive

1. Crea una carpeta en Google Drive y hazla pública (Compartir > Cualquier persona con el enlace)
2. Sube tus archivos JSON y PDF de cuestionarios
3. Cada archivo tendrá un ID único (visible en la URL cuando abres el archivo)

### Paso 2: Crear el archivo manifest.json

Crea un archivo `manifest.json` con la siguiente estructura:

```json
{
  "version": "1.0",
  "lastUpdated": "2026-02-14",
  "questionnaires": [
    {
      "id": "guyton-glomerular-filtration",
      "jsonFileId": "ID_DEL_ARCHIVO_JSON",
      "pdfFileId": "ID_DEL_ARCHIVO_PDF"
    },
    {
      "id": "guyton-liquids-electrolites",
      "jsonFileId": "ID_DEL_ARCHIVO_JSON",
      "pdfFileId": "ID_DEL_ARCHIVO_PDF"
    }
  ]
}
```

### Paso 3: Obtener IDs de archivos

Para cada archivo en Google Drive:
1. Haz clic derecho en el archivo
2. Selecciona "Obtener enlace" o "Compartir"
3. El ID está en la URL: `https://drive.google.com/file/d/ESTE_ES_EL_ID/view`

### Paso 4: Subir el manifest

1. Sube el `manifest.json` a tu carpeta de Google Drive
2. Obtén el ID del archivo manifest
3. Configúralo como GitHub Secret (ver sección de despliegue)

### Agregar nuevos cuestionarios

Cuando subas un nuevo cuestionario:
1. Sube el archivo JSON y PDF a Google Drive
2. Obtén los IDs de ambos archivos
3. Agrega una nueva entrada en `manifest.json`:
```json
{
  "id": "nuevo-cuestionario",
  "jsonFileId": "ID_JSON",
  "pdfFileId": "ID_PDF"
}
```
4. Reemplaza el archivo `manifest.json` en Google Drive

## 💻 Desarrollo local

### Opción 1: Usando el script automático
**Windows:**
```bash
server.bat
```

**macOS/Linux:**
```bash
./server.sh
```

### Opción 2: Comando manual
```bash
python3 server.py
```

### Opción 3: Usando Node.js
```bash
npx http-server -p 8000 -c-1
```

**Nota:** Para desarrollo local, edita temporalmente `src/config/config.js` y reemplaza `__MANIFEST_FILE_ID__` con tu ID real. No hagas commit de este cambio.

## 🎮 Características del juego

- ✅ **3 tipos de preguntas**: Opción múltiple, Verdadero/Falso, y Lista
- ⭐ **3 niveles de dificultad**: Fácil, Medio, Difícil
- 📊 **Sistema de puntuación**: Puntos variables según dificultad
- 📈 **Estadísticas en tiempo real**: Progreso, aciertos, dificultad
- 🏆 **Resultados finales**: Desglose completo por dificultad
- 📱 **Diseño responsive**: Funciona en móviles y escritorio
- 🌙 **Modo oscuro**: Tema claro/oscuro con persistencia

## 🛠️ Estructura del proyecto

```
├── index.html              # Página principal (landing)
├── quiz.html               # Página del juego
├── privacy.html            # Política de privacidad
├── src/
│   ├── components/         # Componentes de la app
│   ├── services/           # Servicios (GoogleDrive, Storage, etc.)
│   ├── models/             # Modelos de datos
│   └── config/             # Configuración
├── styles/                 # Archivos CSS
├── assets/                 # Recursos (audio, imágenes)
├── .github/workflows/      # GitHub Actions para despliegue
└── server.py               # Servidor local para desarrollo
```

## 📝 Notas importantes

- Los cuestionarios se cachean localmente por 1 hora para mejor rendimiento
- Para forzar una recarga, los usuarios pueden limpiar el localStorage
- Todos los datos del usuario se almacenan localmente (ver política de privacidad)
