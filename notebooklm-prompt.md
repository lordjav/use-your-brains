# Prompt 1: Generación de estructura JSON desde PDF

## Entrada
- Fuente: siempre un **PDF**. Trabaja solo sobre el contenido entregado.
- Salida: un único objeto JSON válido en UTF-8.
- Idioma: todo en **español**.

## Campos del documento

| Campo | Tipo | Reglas |
|-------|------|--------|
| `title` | string | Título real del doc. Si la primera página es portada/índice, usar el título de la segunda página. |
| `read_time` | number | `round((palabras / 100) + 2 × imágenes)` al múltiplo de 5 más cercano. Imágenes = figuras, gráficos, diagramas, fotos. |
| `bibliography` | array | Siempre `[]`. |
| `id` | string | Formato: `"guyton-"` + 2–3 palabras en inglés, minúsculas, separadas por guion. Ej.: `guyton-tubular-reabsorption`. |
| `questions` | array | 50 preguntas objetivo; mínimo 30; mínimo absoluto 20. |

## Contenido de las preguntas
- **Alcance:** Solo las páginas 1 a ⌊N/2⌋.
- **Dificultad:** ~1/3 `easy`, ~1/3 `medium`, ~1/3 `hard`.

## Estructura de cada pregunta (todos los campos son obligatorios)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | 4 caracteres alfanuméricos únicos dentro del documento. |
| `location` | number | Número de página real del PDF. |
| `type` | string | `"multiple_selection"`, `"list"` o `"true_false"`. |
| `question` | string | Enunciado en español. |
| `difficulty` | string | `"easy"`, `"medium"` o `"hard"`. |
| `points` | number | easy=1, medium=2, hard=3. |
| `explanation` | string | Justificación breve (1–3 oraciones) basada en el documento. |

**Campos adicionales por tipo:**
- `multiple_selection`: `correct` (string) + `incorrect_1`, `incorrect_2`, `incorrect_3` (strings).
- `list`: `answer_1`, `answer_2`, `answer_3`, … (tantos como ítems).
- `true_false`: `correct` (boolean) + `incorrect` (boolean). Uno `true`, otro `false`.

## Ejemplo de salida
\```json
{
  "title": "Reabsorción y secreción tubular renal",
  "read_time": 164,
  "bibliography": [],
  "id": "guyton-tubular-reabsorption",
  "questions": [
    {
      "id": "a1b2", "location": 12, "type": "multiple_selection",
      "question": "¿Cuál es la operación urgente más común en el mundo?",
      "correct": "Apendicectomía.",
      "incorrect_1": "Colecistectomía.", "incorrect_2": "Hernioplastia.", "incorrect_3": "Resección de colon.",
      "points": 1, "difficulty": "easy",
      "explanation": "La apendicectomía es la operación urgente más frecuente en el mundo."
    },
    {
      "id": "c4d5", "location": 14, "type": "list",
      "question": "¿Qué acciones incluye el examen abdominal en la exploración física?",
      "answer_1": "Inspección", "answer_2": "Palpación", "answer_3": "Percusión", "answer_4": "Auscultación",
      "points": 2, "difficulty": "medium",
      "explanation": "El examen abdominal incluye inspección, palpación, percusión y auscultación."
    },
    {
      "id": "e6f7", "location": 18, "type": "true_false",
      "question": "Un ácido láctico normal descarta isquemia mesentérica activa.",
      "correct": false, "incorrect": true,
      "points": 3, "difficulty": "hard",
      "explanation": "El documento indica que un ácido láctico normal no excluye isquemia mesentérica activa."
    }
  ]
}
\```

---

# Prompt 2: Preguntas de la segunda mitad del documento

## Entrada
- Misma fuente PDF del Prompt 1.
- Genera **exactamente la misma cantidad** de preguntas que en el Prompt 1 (se indicará el número).
- Salida: **solo un array JSON** de preguntas (sin `title`, `read_time`, `bibliography` ni `id`).
- Idioma: todo en **español**.

## Reglas
- **Alcance:** Solo páginas ⌊N/2⌋+1 hasta N.
- Misma estructura, tipos, distribución de dificultad y reglas de `id` que en el Prompt 1.

## Ejemplo de salida
\```json
[
  {
    "id": "f8g9", "location": 32, "type": "multiple_selection",
    "question": "¿…?",
    "correct": "…", "incorrect_1": "…", "incorrect_2": "…", "incorrect_3": "…",
    "points": 1, "difficulty": "easy", "explanation": "…"
  },
  {
    "id": "h0j1", "location": 35, "type": "true_false",
    "question": "¿…?",
    "correct": true, "incorrect": false,
    "points": 2, "difficulty": "medium", "explanation": "…"
  }
]
\```