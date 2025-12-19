# 🧠 Usa Tus Sesos - Juego de Preguntas

## 🚀 Cómo ejecutar el juego

### Opción 1: Usando Python (Recomendado)
1. Haz doble clic en `server.bat`
2. Se abrirá automáticamente en tu navegador

### Opción 2: Comando manual
```bash
python server.py
```

### Opción 3: Usando Node.js (si tienes npx instalado)
```bash
npx http-server -p 8000 -c-1
```

## 🎮 Características del juego

- ✅ **3 tipos de preguntas**: Opción múltiple, Verdadero/Falso, y Lista
- ⭐ **3 niveles de dificultad**: Fácil, Medio, Difícil
- 📊 **Sistema de puntuación**: Puntos variables según dificultad
- 📈 **Estadísticas en tiempo real**: Progreso, aciertos, dificultad
- 🏆 **Resultados finales**: Desglose completo por dificultad
- 📱 **Diseño responsive**: Funciona en móviles y escritorio

## 🛠️ Estructura del proyecto

- `index.html` - Estructura principal
- `style.css` - Estilos y diseño
- `script.js` - Lógica del juego
- `preguntas.json` - Base de datos de preguntas
- `server.py` - Servidor local
- `server.bat` - Ejecutor automático

## 🔧 Requisitos

- Python 3.x (ya viene instalado en la mayoría de sistemas)
- Navegador web moderno

## 🎯 ¿Por qué necesitas un servidor?

Los navegadores bloquean el acceso a archivos locales por seguridad (CORS policy). El servidor local simula un entorno web real.