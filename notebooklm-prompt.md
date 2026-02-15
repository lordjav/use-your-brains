# Prompt: Generación de estructura de datos a partir de un documento

## Entrada

- **Documento fuente:** El documento será siempre un **PDF**. Trabaja solo sobre el contenido que se te entregue; no asumas contenido de otro documento.
- **Formato de la salida:** Un único objeto JSON válido, en UTF-8, con la estructura descrita abajo.
- **Idioma:** Todo lo que generes (título, preguntas, respuestas, explicaciones) debe estar **siempre en español**.

---

## Estructura a generar

Debes generar un objeto JSON con exactamente estos campos de primer nivel:

### Campos del documento

| Campo | Tipo | Descripción y reglas |
|-------|------|----------------------|
| `title` | string | Título del documento. Origen: si la primera página es portada o índice, usar el título de la **segunda** página; en caso contrario, usar el título de la **primera** página. No inventar títulos. |
| `read_time` | number (entero) | Tiempo estimado de lectura del documento **en minutos**. Fórmula: `(total de palabras del documento) / 100` + `2 × (número de imágenes del documento)`. Cuentan como imagen: **figuras, gráficos, diagramas y fotos**. Redondear al entero más próximo. La constante 100 = palabras por minuto asumidas. Redondear al múltiplo de 5 más cercano. |
| `bibliography` | array | Siempre un array vacío: `[]`. |
| `id` | string | Identificador del capítulo. Formato obligatorio: el prefijo `"guyton-"` seguido de un nombre breve del capítulo en **inglés**, 2–3 palabras, en **minúsculas** y separadas por **un solo guion** (ej.: `guyton-tubular-reabsorption`). Sin espacios ni otros caracteres. |
| `questions` | array | Lista de preguntas (ver sección siguiente). **Cantidad:** Objetivo 50 preguntas. Si no hay contenido suficiente, generar **al menos 30**; si tampoco hay para 30, el **mínimo absoluto es 20**. |

### Contenido y distribución de las preguntas

- **Alcance del contenido:** Las preguntas deben generarse **solo a partir de la primera mitad del documento**. Si el documento tiene N páginas, usar únicamente las páginas 1 a N/2 (redondear N/2 hacia abajo si es impar). No usar contenido de la segunda mitad.
- **Distribución por dificultad:** De las preguntas generadas, aproximadamente un tercio deben ser `easy`, un tercio `medium` y un tercio `hard`. Repartir de forma equilibrada si el total no es divisible por 3 (ej. con 50: 17 easy, 17 medium, 16 hard).

---

## Estructura de cada elemento en `questions`

Cada elemento del array `questions` es un objeto con los siguientes campos. **Todos son obligatorios** salvo que se indique lo contrario.

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `location` | number (entero) | Sí | Número de página del documento de donde se extrae la información. Debe ser el **número de página real** (p. ej. en un PDF de 50 páginas, valores entre 1 y 50). No usar numeración interna impresa en la página si difiere. |
| `id` | string | Sí | Identificador de la pregunta. Exactamente **4 caracteres** alfanuméricos (por ejemplo: `a1b2`, `x9k3`). Debe ser único **solo dentro de este documento** (no es necesario que sea único respecto a otros documentos). |
| `type` | string | Sí | Tipo de pregunta. Valores permitidos (y únicos): `"multiple_selection"`, `"list"`, `"true_false"`. Ver abajo la estructura de cada tipo. |
| `question` | string | Sí | Enunciado de la pregunta. Redactado a partir del contenido del documento, en español. |
| `points` | number (entero) | Sí | Puntos que vale la pregunta según dificultad: `easy` = 1, `medium` = 2, `hard` = 3. |
| `difficulty` | string | Sí | Nivel de dificultad. Valores permitidos (y únicos): `"easy"`, `"medium"`, `"hard"`. |
| `explanation` | string | Sí | Justificación **breve** de la respuesta correcta (o respuestas correctas), basada en el texto. **Entre 1 y 3 oraciones.** No inventar información que no esté en el documento. |

### Campos adicionales según `type`

- **`type: "multiple_selection"`**  
  Incluir exactamente: `correct` (string), `incorrect_1` (string), `incorrect_2` (string), `incorrect_3` (string). Una respuesta correcta y tres incorrectas.

- **`type: "list"`**  
  Incluir tantas claves como ítems tenga la respuesta ordenada: `answer_1`, `answer_2`, `answer_3`, … (strings). No usar `correct` ni `incorrect_*`.

- **`type: "true_false"`**  
  Incluir exactamente: `correct` (boolean) y `incorrect` (boolean). Uno debe ser `true` y el otro `false`.

**Idioma:** Todas las cadenas de texto (pregunta, respuestas, explicación) deben estar **en español**.

---

## Ejemplo de estructura (solo referencia de formato)

El siguiente JSON es un **ejemplo de formato**. Los valores de contenido (p. ej. “Apendicectomía”) son ilustrativos; en tu salida el contenido debe corresponder al documento que te hayan dado (p. ej. reabsorción tubular si ese es el tema).

```json
{
  "title": "Reabsorción y secreción tubular renal",
  "read_time": 164,
  "bibliography": [],
  "id": "guyton-tubular-reabsorption",
  "questions": [
    {
      "id": "a1b2",
      "location": 12,
      "type": "multiple_selection",
      "question": "¿Cuál es la operación urgente que se realiza más comúnmente en todo el mundo?",
      "incorrect_1": "Colecistectomía.",
      "incorrect_2": "Hernioplastia.",
      "incorrect_3": "Resección de colon.",
      "correct": "Apendicectomía.",
      "points": 1,
      "difficulty": "easy",
      "explanation": "La apendicectomía es la operación urgente que se realiza más comúnmente en todo el mundo."
    },
    {
      "id": "c4d5",
      "location": 14,
      "type": "list",
      "question": "El examen del abdomen, como parte de la exploración física para el dolor abdominal agudo, incluye diversas acciones fundamentales. ¿Cuáles son estas acciones?",
      "answer_1": "Inspección",
      "answer_2": "Palpación",
      "answer_3": "Percusión",
      "answer_4": "Auscultación",
      "points": 2,
      "difficulty": "medium",
      "explanation": "El examen del abdomen incluye inspección, palpación, percusión y auscultación."
    },
    {
      "id": "e6f7",
      "location": 18,
      "type": "true_false",
      "question": "Un nivel normal de ácido láctico sérico, junto con un examen general de orina también normal, son suficientes para descartar, respectivamente, isquemia mesentérica activa y nefrolitiasis en el contexto de dolor abdominal agudo.",
      "incorrect": true,
      "correct": false,
      "points": 3,
      "difficulty": "hard",
      "explanation": "El documento establece que un ácido láctico sérico normal no excluye isquemia mesentérica activa, y un resultado normal en el examen general de orina no excluye nefrolitiasis."
    }
  ]
}
```

---

# Prompt 2: Preguntas de la segunda mitad del documento

## Entrada

- **Documento fuente:** El mismo PDF usado en el primer prompt.
- **Cantidad de preguntas:** Genera **exactamente la misma cantidad** de preguntas que se generaron en el primer prompt (se te indicará ese número: p. ej. 50, 30 o 20).
- **Formato de la salida:** Un único **array JSON** de preguntas. No incluyas los campos del documento (`title`, `read_time`, `bibliography`, `id`). Solo el array de objetos de preguntas.
- **Idioma:** Todo en **español**, igual que en el primer prompt.

## Alcance del contenido

- Las preguntas deben generarse **solo a partir de la segunda mitad del documento**.
- Si el documento tiene N páginas, usar únicamente las páginas desde **(N/2)+1** hasta **N** (redondear N/2 hacia abajo para el límite inferior). No usar contenido de la primera mitad.

## Estructura de cada pregunta

Cada elemento del array es un objeto con la **misma estructura** que en el primer prompt:

- `location`, `id`, `type`, `question`, `points`, `difficulty`, `explanation`
- Según `type`: para `multiple_selection` → `correct`, `incorrect_1`, `incorrect_2`, `incorrect_3`; para `list` → `answer_1`, `answer_2`, …; para `true_false` → `correct`, `incorrect`

Mismas reglas: `id` de 4 caracteres único dentro de este conjunto de preguntas; `location` = número de página real; distribución aproximada por dificultad (un tercio easy, un tercio medium, un tercio hard); `explanation` breve (1–3 oraciones).

## Ejemplo de salida

Solo un array, sin objeto raíz:

```json
[
  {
    "id": "f8g9",
    "location": 32,
    "type": "multiple_selection",
    "question": "¿…?",
    "incorrect_1": "…",
    "incorrect_2": "…",
    "incorrect_3": "…",
    "correct": "…",
    "points": 1,
    "difficulty": "easy",
    "explanation": "…"
  },
  {
    "id": "h0j1",
    "location": 35,
    "type": "true_false",
    "question": "¿…?",
    "incorrect": false,
    "correct": true,
    "points": 2,
    "difficulty": "medium",
    "explanation": "…"
  }
]
```
