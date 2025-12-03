# Rick & Morty - Galería de Personajes

Galería interactiva de personajes de *Rick and Morty* con tema claro/oscuro, panel de detalle y paginación.

**API:** https://rickandmortyapi.com/api/character

---

## 🎯 Características

- Galería responsiva (mobile-first, 2-4 columnas).
- Tema claro/oscuro persistente en `localStorage`.
- Panel de detalle interactivo al hacer click.
- Paginación con botón "Cargar más".
- Título clonado encima de la tarjeta de Rick.
- Navegación por teclado (Tab, Enter, Escape).
- Accesibilidad ARIA y HTML semántico.

---

## 📁 Estructura

```
proyecto integrador/
├── index.html    # HTML5 semántico
├── styles.css    # CSS3 responsivo con variables
├── index.js      # Lógica (Vanilla JS)
└── README.MD     # Esta documentación
```


---

## 🛠️ Tecnología

### HTML (`index.html`)

**Estructura semántica:**
- `<header>` — Logo, switch de tema, botón "Cargar más".
- `<main>` → `<section class="results-section">` — Contenedor principal.
- `<aside id="detail-panel">` — Panel de detalle (oculto por defecto).
- `<ul id="cards">` — Lista de tarjetas (generadas por JS).
- `<footer>` — Créditos.

**Elementos clave:**
| ID/Clase | Propósito |
|----------|-----------|
| `#theme-toggle` | Checkbox para tema claro/oscuro |
| `#theme-label` | Botón visible del tema |
| `#load-more` | Botón "Cargar más" |
| `#detail-panel` | Panel de detalle (hidden) |
| `#cards` | Contenedor de tarjetas |
| `.card` | Tarjeta individual |

### CSS (`styles.css`)

**Variables principales:**
```css
:root {
  --bg: #f6f9f3;           /* Fondo claro */
  --text: #0b2a0b;         /* Texto oscuro */
  --accent: #3be54a;       /* Verde neón */
  --accent-2: #7cc4ff;     /* Cyan */
  --transition: 300ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

body.dark {
  --bg: #000000;           /* Negro puro */
  --text: #e6ffee;         /* Verde muy claro */
  --accent: #6dfc8b;       /* Verde más brillante */
}
```

**Grid de tarjetas:**
```css
.cards {
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  /* Se ajusta automáticamente: 2-4 columnas según ancho */
}
```

**Breakpoints:**
| Ancho | Columnas |
|-------|----------|
| < 641px | 2–3 |
| 641–900px | 3 |
| > 1025px | 4 |

### JavaScript (`index.js`)

**Constantes:**
```javascript
const API_BASE = 'https://rickandmortyapi.com/api/character';
const OWN_URL = 'https://rickandmorti.com/api/personajes';
const THEME_KEY = 'rm-theme';
```

**Funciones principales:**

| Función | Propósito |
|---------|-----------|
| `init()` | Inicializa todo (tema, primer fetch, listeners) |
| `initTheme()` | Lee tema de localStorage y lo aplica |
| `applyTheme(theme)` | Cambia tema y persiste en localStorage |
| `fetchCharacters()` | Obtiene personajes de la API |
| `renderCharacters(list)` | Renderiza tarjetas en el DOM |
| `createCard(character)` | Crea una tarjeta individual |
| `placeTitleAboveRick()` | Clona el título encima de la tarjeta de Rick |
| `showDetail(data)` | Muestra el panel de detalle |
| `hideDetail()` | Oculta el panel de detalle |

**Flujo principal:**
1. `DOMContentLoaded` → `init()`.
2. `initTheme()` — lee y aplica preferencia guardada.
3. `fetchCharacters()` — obtiene primera página.
4. Usuario interactúa:
   - Click tarjeta → `showDetail()`.
   - Click "Cargar más" → `fetchCharacters()` (siguiente página).
   - Toggle tema → `applyTheme()` + `localStorage.setItem()`.

---

## ✅ Requisitos

- Navegador moderno (Chrome/Edge 90+, Firefox 88+, Safari 14+).
- Conexión a Internet para consumir la API pública.

---

## 💾 Almacenamiento

- **localStorage clave:** `'rm-theme'`
- **Valores:** `'dark'` | `'light'`
- Persiste la preferencia de tema entre sesiones.

---

## 📝 Notas

- Depuración: abre consola (F12) para ver logs y localStorage.
- Performance: imágenes con `loading="lazy"`, DOM cacheado, DocumentFragment para batch renders.
- Compatible: Chrome/Edge 90+, Firefox 88+, Safari 14+.

---

## Créditos

- **API:** [Rick and Morty API](https://rickandmortyapi.com/)
- **Serie original:** *Rick and Morty* (Adult Swim)
- **Diseño e implementación:** Proyecto educativo

---

**Última actualización:** Diciembre 2025

Para más información o contribuciones, abre un issue o PR en el repositorio.
