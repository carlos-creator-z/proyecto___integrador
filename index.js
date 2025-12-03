/* ==================================================
  index.js - Frontend Rick & Morty
  - Obtiene personajes desde la API pública
  - Renderiza tarjetas de personajes
  - Implementa cambio de tema (claro/oscuro) con localStorage
  - Maneja errores y paginación con "Cargar más"
  ==================================================
*/

const API_BASE = 'https://rickandmortyapi.com/api/character';
// Dirección propia visible (no se usa como endpoint por defecto)
const OWN_URL = 'https://rickandmorti.com/api/personajes';

// Elementos del DOM
const cardsEl = document.getElementById('cards');
const statusEl = document.getElementById('status');
const loadMoreBtn = document.getElementById('load-more');
const themeToggle = document.getElementById('theme-toggle');
const themeLabel = document.getElementById('theme-label');

// Elementos del panel de detalle
const detailPanel = document.getElementById('detail-panel');
const copyUrlBtn = document.getElementById('copy-url');
const ownUrlEl = document.getElementById('own-url');
const footerApiEl = document.getElementById('footer-api');
const detailImage = document.getElementById('detail-image');
const detailName = document.getElementById('detail-name');
const detailDesc = document.getElementById('detail-desc');
const detailStatus = document.getElementById('detail-status');
const detailSpecies = document.getElementById('detail-species');
const detailGender = document.getElementById('detail-gender');
const detailOrigin = document.getElementById('detail-origin');
const detailLocation = document.getElementById('detail-location');
const detailEpisodes = document.getElementById('detail-episodes');
const detailClose = document.getElementById('detail-close');

// Puntero de paginación (la API devuelve 'info.next')
let nextUrl = API_BASE;

// ------------------- Manejo de tema -------------------
// Clave para localStorage
const THEME_KEY = 'rm-theme';

/**
 * Aplica un tema al body y persiste la preferencia.
 * @param {'dark'|'light'} theme
 */
function applyTheme(theme){
  if(theme === 'dark'){
    document.body.classList.add('dark');
    themeToggle.checked = true;
    if(themeLabel) themeLabel.textContent = 'Modo Oscuro';
    if(themeLabel) themeLabel.setAttribute('aria-pressed','true');
    localStorage.setItem(THEME_KEY,'dark');
  } else {
    document.body.classList.remove('dark');
    themeToggle.checked = false;
    if(themeLabel) themeLabel.textContent = 'Modo Claro';
    if(themeLabel) themeLabel.setAttribute('aria-pressed','false');
    localStorage.setItem(THEME_KEY,'light');
  }
}

// Inicializa el tema desde localStorage (persiste entre recargas)
function initTheme(){
  const saved = localStorage.getItem(THEME_KEY);
  if(saved === 'dark') applyTheme('dark');
  else applyTheme('light');
  // listen for user toggle
  themeToggle.addEventListener('change', ()=>{
    applyTheme(themeToggle.checked ? 'dark' : 'light');
  });
  // clicking the label button also toggles theme
  if(themeLabel){
    themeLabel.addEventListener('click', ()=>{
      const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  }
}

// ------------------- Helpers de UI -------------------
function setStatus(text){
  statusEl.textContent = text || '';
}

function createCard(character){
  // Use semantic structure: li > article > figure + div.card-body (only image + name visible)
  const li = document.createElement('li');
  const article = document.createElement('article');
  article.className = 'card';

  // store useful fields as data-attributes for the detail panel
  article.dataset.name = character.name || '';
  article.dataset.image = character.image || '';
  article.dataset.status = character.status || '';
  article.dataset.species = character.species || '';
  article.dataset.gender = character.gender || '';
  article.dataset.origin = character.origin?.name || '';
  article.dataset.location = character.location?.name || '';
  article.dataset.episodes = (character.episode && character.episode.length) || 0;

  article.innerHTML = `
    <figure>
      <img src="${character.image}" alt="Imagen de ${character.name}" loading="lazy">
      <figcaption class="sr-only">Foto de ${character.name}</figcaption>
    </figure>
    <div class="card-body">
      <h3>${character.name}</h3>
    </div>
  `;

  // accessibility: make the article keyboard-focusable
  article.tabIndex = 0;
  li.appendChild(article);
  return li;
}

/**
 * Renderiza un arreglo de personajes en el DOM
 * @param {Array} list
 */
function renderCharacters(list){
  const fragment = document.createDocumentFragment();
  list.forEach(ch => fragment.appendChild(createCard(ch)));
  cardsEl.appendChild(fragment);
  // Después de renderizar las tarjetas, intentar mover el título/subtítulo
  // para que queden arriba de la tarjeta de 'Rick' cuando exista.
  placeTitleAboveRick();
}

/**
 * Busca la tarjeta de Rick y coloca una copia del título y subtítulo encima
 * de su figura. Esto crea una experiencia visual donde el encabezado aparece
 * sobre la imagen de Rick sin remover el header original.
 */
function placeTitleAboveRick(){
  const headerTitle = document.querySelector('.logo-series');
  const headerTag = document.querySelector('.tag');
  if(!headerTitle || !headerTag) return;

  // Encuentra la primera tarjeta cuyo nombre contenga 'rick' (case-insensitive)
  const articles = Array.from(cardsEl.querySelectorAll('article'));
  const rickArticle = articles.find(a => a.dataset.name && a.dataset.name.toLowerCase().includes('rick'));
  if(!rickArticle) return;

  // Evitar insertar duplicados
  if(rickArticle.querySelector('.site-title-clone')) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'site-title-clone';

  const titleClone = headerTitle.cloneNode(true);
  const tagClone = headerTag.cloneNode(true);

  // Ajustar atributos para accesibilidad y evitar IDs duplicados
  titleClone.removeAttribute('id');
  tagClone.removeAttribute('id');

  wrapper.appendChild(titleClone);
  wrapper.appendChild(tagClone);

  const figure = rickArticle.querySelector('figure');
  if(figure) rickArticle.insertBefore(wrapper, figure);
}

// ------------------- Peticiones a la API -------------------
/**
 * Obtiene personajes desde la API usando el puntero nextUrl.
 * Maneja errores básicos de red y HTTP.
 */
async function fetchCharacters(){
  if(!nextUrl){
    setStatus('No hay más personajes para cargar.');
    loadMoreBtn.disabled = true;
    return;
  }

  try{
    setStatus('Cargando personajes...');
    loadMoreBtn.disabled = true;

    const res = await fetch(nextUrl);
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if(Array.isArray(data.results)){
      renderCharacters(data.results);
    }

    // Update pointer and UI for load more
    nextUrl = data.info?.next || null;
    if(!nextUrl) loadMoreBtn.style.display = 'none';
    else loadMoreBtn.style.display = '';

    setStatus('');
  }catch(err){
    console.error('Error fetching characters:', err);
    setStatus('Error al obtener datos. Revisa la consola.');
  }finally{
    loadMoreBtn.disabled = false;
  }
}

// ------------------- Inicialización -------------------
function init(){
  initTheme();

  // cargar la primera página de personajes
  fetchCharacters();

  // Mostrar OWN_URL en status brevemente
  if(statusEl){ const prev = statusEl.textContent; statusEl.textContent = `URL propia: ${OWN_URL}`; setTimeout(()=> statusEl.textContent = prev, 2000); }

  // Actualizar footer link si está presente
  if(footerApiEl) footerApiEl.href = OWN_URL;

  // Copiar URL propia
  if(copyUrlBtn && ownUrlEl){
    copyUrlBtn.addEventListener('click', async ()=>{
      const text = ownUrlEl.href || OWN_URL;
      try{ await navigator.clipboard.writeText(text); setStatus('URL copiada al portapapeles'); setTimeout(()=> setStatus(''), 1600); }
      catch(e){ setStatus('No se pudo copiar la URL'); }
    });
  }

  // manejador del botón "Cargar más"
  loadMoreBtn.addEventListener('click', ()=>{
    fetchCharacters();
  });

  // Mostrar detalle cuando se hace click en una tarjeta (delegación de eventos)
  cardsEl.addEventListener('click', (e)=>{
    const article = e.target.closest('article');
    if(!article) return;
    showDetailFromArticle(article);
  });

  // Teclado: Enter en un artículo enfocado muestra el detalle
  cardsEl.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter'){
      const article = e.target.closest && e.target.closest('article');
      if(article) showDetailFromArticle(article);
    }
  });

  // Cerrar panel de detalle
  if(detailClose) detailClose.addEventListener('click', hideDetail);
  // Close with Escape
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape') hideDetail();
  });
}

/**
 * Rellena y muestra el panel de detalle usando los data-attributes del artículo
 * @param {HTMLElement} article
 */
function showDetailFromArticle(article){
  if(!article) return;
  const d = article.dataset;
  showDetail({
    name: d.name,
    image: d.image,
    status: d.status,
    species: d.species,
    gender: d.gender,
    origin: d.origin,
    location: d.location,
    episodes: d.episodes
  });
}

function showDetail(data){
  if(!detailPanel) return;
  detailImage.src = data.image || '';
  detailImage.alt = data.name || 'Imagen';
  detailName.textContent = data.name || '';
  // Generate a short description because the API does not provide free-text descriptions
  detailDesc.textContent = `${data.name} es ${data.species || 'una entidad'}${data.gender ? ' de género ' + data.gender : ''}.`;
  detailStatus.textContent = data.status || '';
  detailSpecies.textContent = data.species || '';
  detailGender.textContent = data.gender || '';
  detailOrigin.textContent = data.origin || '';
  detailLocation.textContent = data.location || '';
  detailEpisodes.textContent = data.episodes || '0';
  detailPanel.hidden = false;
  detailPanel.focus();
}

function hideDetail(){
  if(!detailPanel) return;
  detailPanel.hidden = true;
}

// Run init when DOM is ready
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
