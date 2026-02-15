# Usa Tus Sesos - Juego de Preguntas

## Despliegue en GitHub Pages

La aplicación se despliega automáticamente a GitHub Pages cuando haces push a `main`.

### Configuración inicial (una sola vez)

1. **Habilitar GitHub Pages:**
   - Ve a tu repositorio en GitHub
   - Settings > Pages
   - Source: selecciona "GitHub Actions"

2. **Hacer push a main:**
   - El workflow se ejecutará automáticamente
   - Tu sitio estará en: `https://tu-usuario.github.io/use-your-brains/`

## Cuestionarios

Los cuestionarios se cargan desde la carpeta `questionnaires/` del proyecto.

### Estructura de archivos

```
questionnaires/
├── manifest.json                    # Lista de cuestionarios disponibles
├── guyton-glomerular-filtration.json
├── guyton-glomerular-filtration.pdf
├── guyton-liquids-electrolites.json
├── guyton-liquids-electrolites.pdf
└── ...
```

### Formato del manifest.json

```json
{
  "version": "1.0",
  "lastUpdated": "2026-02-15",
  "questionnaires": [
    {
      "id": "mi-cuestionario",
      "jsonFile": "mi-cuestionario.json",
      "pdfFile": "mi-cuestionario.pdf"
    }
  ]
}
```

### Agregar nuevos cuestionarios

1. Crea el archivo JSON con las preguntas (ver formato abajo)
2. Opcionalmente, añade un PDF de referencia
3. Agrega la entrada en `questionnaires/manifest.json`
4. Haz commit y push a `main`

### Formato de cuestionario JSON

```json
{
  "id": "mi-cuestionario",
  "title": "Mi Cuestionario",
  "description": "Descripción del cuestionario",
  "read_time": 30,
  "created_at": "2026-02-15",
  "updated_at": "2026-02-15",
  "questions": [
    {
      "type": "multiple_selection",
      "question": "¿Cuál es la respuesta correcta?",
      "correct": "Respuesta correcta",
      "incorrect_1": "Respuesta incorrecta 1",
      "incorrect_2": "Respuesta incorrecta 2",
      "incorrect_3": "Respuesta incorrecta 3",
      "difficulty": "easy",
      "points": 10,
      "explanation": "Explicación de la respuesta"
    },
    {
      "type": "true_false",
      "question": "¿Esta afirmación es verdadera?",
      "correct": true,
      "difficulty": "medium",
      "points": 15,
      "explanation": "Explicación"
    }
  ]
}
```

## Desarrollo local

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

## Características del juego

- **3 tipos de preguntas**: Opción múltiple, Verdadero/Falso, y Lista
- **3 niveles de dificultad**: Fácil, Medio, Difícil
- **Sistema de puntuación**: Puntos variables según dificultad
- **Estadísticas en tiempo real**: Progreso, aciertos, dificultad
- **Resultados finales**: Desglose completo por dificultad
- **Diseño responsive**: Funciona en móviles y escritorio
- **Modo oscuro**: Tema claro/oscuro con persistencia

## Estructura del proyecto

```
├── index.html              # Página principal (landing)
├── quiz.html               # Página del juego
├── privacy.html            # Política de privacidad
├── questionnaires/         # Archivos de cuestionarios
│   ├── manifest.json
│   └── *.json, *.pdf
├── src/
│   ├── components/         # Componentes de la app
│   ├── services/           # Servicios (Storage, etc.)
│   ├── models/             # Modelos de datos
│   └── config/             # Configuración
├── styles/                 # Archivos CSS
├── assets/                 # Recursos (audio, imágenes)
├── .github/workflows/      # GitHub Actions para despliegue
└── server.py               # Servidor local para desarrollo
```

## Notas importantes

- Los cuestionarios se cachean localmente por 1 hora para mejor rendimiento
- Para forzar una recarga, los usuarios pueden limpiar el localStorage
- Todos los datos del usuario se almacenan localmente (ver política de privacidad)
