/**
 * refugios.js — Caso de Uso: Búsqueda de Refugios
 * Con geolocalización (S-1), vista mapa (Leaflet) y tipografía actualizada
 */
'use strict';

const $ = id => document.getElementById(id);

/* ── Verificar sesión ── */
const tokenSesion  = sessionStorage.getItem('token')   || localStorage.getItem('token');
const usuarioGuard = sessionStorage.getItem('usuario') || localStorage.getItem('usuario');
if (!tokenSesion || !usuarioGuard) window.location.href = 'login.html';
const usuarioActual = JSON.parse(usuarioGuard || '{}');

/* ── Coordenadas de localidades de Bogotá ── */
const COORDS_LOCALIDADES = {
  usaquen:       { lat: 4.7016,  lng: -74.0316, nombre: 'Usaquén'       },
  chapinero:     { lat: 4.6473,  lng: -74.0643, nombre: 'Chapinero'     },
  santa_fe:      { lat: 4.6097,  lng: -74.0817, nombre: 'Santa Fe'      },
  kennedy:       { lat: 4.6280,  lng: -74.1509, nombre: 'Kennedy'       },
  suba:          { lat: 4.7416,  lng: -74.0836, nombre: 'Suba'          },
  engativa:      { lat: 4.7016,  lng: -74.1109, nombre: 'Engativá'      },
  bosa:          { lat: 4.6197,  lng: -74.1876, nombre: 'Bosa'          },
  fontibon:      { lat: 4.6716,  lng: -74.1476, nombre: 'Fontibón'      },
  teusaquillo:   { lat: 4.6473,  lng: -74.0976, nombre: 'Teusaquillo'   },
  barrios_unidos:{ lat: 4.6716,  lng: -74.0743, nombre: 'Barrios Unidos'},
  ciudad_bolivar:{ lat: 4.5280,  lng: -74.1609, nombre: 'Ciudad Bolívar'}
};

/* ── Datos simulados de refugios ── */
const REFUGIOS = [
  { id:1,  nombre:'Fundación Huellas Felices',  localidad:'chapinero',      tipo:'perros', animales:42, rating:4.9, descripcion:'Refugio especializado en rescate y rehabilitación de perros maltratados. Contamos con veterinario propio y programa de adopción responsable.', contacto:'huellas@refugios.com',   telefono:'310 555 0101' },
  { id:2,  nombre:'Amigos Felinos Bogotá',       localidad:'suba',           tipo:'gatos',  animales:28, rating:4.8, descripcion:'El hogar más grande de gatos rescatados en Bogotá. Trabajamos con voluntarios y ofrecemos adopciones gratuitas todos los fines de semana.',    contacto:'felinos@refugios.com',    telefono:'310 555 0102' },
  { id:3,  nombre:'Patitas Felices Kennedy',     localidad:'kennedy',        tipo:'mixto',  animales:61, rating:4.7, descripcion:'Atendemos perros y gatos en situación de abandono. Tenemos alianzas con clínicas veterinarias de la localidad para atención médica gratuita.', contacto:'patitas@refugios.com',    telefono:'310 555 0103' },
  { id:4,  nombre:'Refugio San Francisco',       localidad:'usaquen',        tipo:'perros', animales:35, rating:4.6, descripcion:'Fundación sin ánimo de lucro con 10 años de experiencia en adopciones responsables. Realizamos visitas domiciliarias antes de cada adopción.', contacto:'sanfran@refugios.com',    telefono:'310 555 0104' },
  { id:5,  nombre:'Casa Felina Chapinero',       localidad:'chapinero',      tipo:'gatos',  animales:19, rating:4.9, descripcion:'Pequeño refugio familiar dedicado exclusivamente a gatos. Todos nuestros animales están vacunados, desparasitados y esterilizados.',            contacto:'casafelina@refugios.com', telefono:'310 555 0105' },
  { id:6,  nombre:'Fundación Animal Engativá',   localidad:'engativa',       tipo:'mixto',  animales:53, rating:4.5, descripcion:'Atendemos emergencias de animales en la localidad de Engativá. Disponemos de ambulancia veterinaria y equipo de rescate 24/7.',                contacto:'animal@refugios.com',     telefono:'310 555 0106' },
  { id:7,  nombre:'Refugio Esperanza Bosa',      localidad:'bosa',           tipo:'perros', animales:47, rating:4.4, descripcion:'Trabajamos con comunidades vulnerables para promover la tenencia responsable de mascotas y evitar el abandono animal.',                         contacto:'esperanza@refugios.com',  telefono:'310 555 0107' },
  { id:8,  nombre:'Hogar Peludos Fontibón',      localidad:'fontibon',       tipo:'mixto',  animales:22, rating:4.7, descripcion:'Refugio con amplio espacio verde para la rehabilitación de animales. Ofrecemos talleres de adiestramiento básico para nuevos adoptantes.',      contacto:'peludos@refugios.com',    telefono:'310 555 0108' },
  { id:9,  nombre:'Patitas Barrios Unidos',      localidad:'barrios_unidos', tipo:'perros', animales:31, rating:4.8, descripcion:'Nos especializamos en razas medianas y grandes rescatadas de la calle. Contamos con amplio patio y zona de socialización canina.',             contacto:'barrios@refugios.com',    telefono:'310 555 0109' },
  { id:10, nombre:'Felinos Teusaquillo',         localidad:'teusaquillo',    tipo:'gatos',  animales:16, rating:4.6, descripcion:'Refugio gestionado por estudiantes de veterinaria de la Universidad Nacional. Todos los animales reciben atención médica de calidad.',         contacto:'teusa@refugios.com',      telefono:'310 555 0110' },
  { id:11, nombre:'Ciudad Bolívar Animal',       localidad:'ciudad_bolivar', tipo:'mixto',  animales:78, rating:4.3, descripcion:'El refugio más grande del sur de Bogotá. Trabajamos con la alcaldía local en programas de esterilización masiva y adopción comunitaria.',      contacto:'ciudadb@refugios.com',    telefono:'310 555 0111' },
  { id:12, nombre:'Refugio Verde Suba',          localidad:'suba',           tipo:'perros', animales:39, rating:4.9, descripcion:'Fundación premiada por la Alcaldía de Bogotá por su labor en rescate animal. Contamos con 15 voluntarios permanentes y programa de padrinos.', contacto:'verde@refugios.com',      telefono:'310 555 0112' },
];

const LOC        = Object.fromEntries(Object.entries(COORDS_LOCALIDADES).map(([k,v]) => [k, v.nombre]));
const TIPO_EMOJI = { perros:'🐶', gatos:'🐱', mixto:'🐾' };

let filtros      = { localidad:'', tipo:'todos', rating:0, nombre:'' };
let vistaActual  = 'grid'; // grid | lista | mapa
let mapaIniciado = false;
let mapaLeaflet  = null;
let marcadores   = [];
let ubicacionUsuario = null;
let marcadorUsuario  = null;

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  const greeting = $('user-greeting');
  if (greeting && usuarioActual.nombre) greeting.textContent = `Hola, ${usuarioActual.nombre}`;
  renderRefugios();
});

/* ── Geolocalización S-1 ── */
function usarMiUbicacion() {
  const btn = $('btn-geolocate');
  if (btn) { btn.textContent = '📡 Buscando...'; btn.disabled = true; }

  if (!navigator.geolocation) {
    mostrarToast('Tu navegador no soporta geolocalización.', 'error');
    if (btn) { btn.textContent = '📍 Usar mi ubicación'; btn.disabled = false; }
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      ubicacionUsuario = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      const localidadCercana = encontrarLocalidadCercana(ubicacionUsuario.lat, ubicacionUsuario.lng);

      // Aplicar filtro
      filtros.localidad = localidadCercana;
      if ($('filtro-localidad')) $('filtro-localidad').value = localidadCercana;

      mostrarToast(`📍 Ubicación detectada: ${LOC[localidadCercana] || localidadCercana}`, 'info');

      if (btn) { btn.textContent = `📍 ${LOC[localidadCercana]}`; btn.disabled = false; btn.classList.add('btn-geo-active'); }

      renderRefugios();

      // Si el mapa está abierto, centrarlo en la ubicación del usuario
      if (vistaActual === 'mapa' && mapaLeaflet) {
        mapaLeaflet.setView([ubicacionUsuario.lat, ubicacionUsuario.lng], 13);
        if (marcadorUsuario) marcadorUsuario.remove();
        marcadorUsuario = L.marker([ubicacionUsuario.lat, ubicacionUsuario.lng], {
          icon: L.divIcon({ className:'marker-usuario', html:'<div class="marker-yo">Tú</div>', iconSize:[40,40], iconAnchor:[20,20] })
        }).addTo(mapaLeaflet).bindPopup('Tu ubicación actual').openPopup();
        renderMarcadores();
      }
    },
    err => {
      // E-2: Ubicación no disponible
      let msg = 'No se pudo obtener la ubicación.';
      if (err.code === 1) msg = 'Permiso de ubicación denegado. Usa la búsqueda manual.';
      if (err.code === 2) msg = 'Ubicación no disponible. Intenta más tarde.';
      mostrarToast(msg, 'error');
      if (btn) { btn.textContent = '📍 Usar mi ubicación'; btn.disabled = false; }
    },
    { timeout: 8000, maximumAge: 60000 }
  );
}

function encontrarLocalidadCercana(lat, lng) {
  let minDist = Infinity, localidadCercana = 'chapinero';
  Object.entries(COORDS_LOCALIDADES).forEach(([key, coords]) => {
    const dist = Math.sqrt(Math.pow(lat - coords.lat, 2) + Math.pow(lng - coords.lng, 2));
    if (dist < minDist) { minDist = dist; localidadCercana = key; }
  });
  return localidadCercana;
}

/* ── Cambiar vista ── */
function cambiarVista(vista) {
  vistaActual = vista;
  ['grid','lista','mapa'].forEach(v => {
    $(`btn-${v}`)?.classList.toggle('active', v === vista);
  });

  const gridEl = $('refugios-grid');
  const mapaEl = $('mapa-container');

  if (vista === 'mapa') {
    if (gridEl) gridEl.style.display = 'none';
    if (mapaEl) mapaEl.style.display = 'block';
    iniciarMapa();
  } else {
    if (gridEl) { gridEl.style.display = 'grid'; }
    if (mapaEl) mapaEl.style.display = 'none';
    if (vista === 'lista') gridEl.classList.add('vista-lista');
    else gridEl.classList.remove('vista-lista');
    renderRefugios();
  }
}

/* ── Mapa Leaflet ── */
function iniciarMapa() {
  if (!mapaIniciado) {
    mapaLeaflet = L.map('mapa-leaflet').setView([4.6601, -74.0881], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(mapaLeaflet);
    mapaIniciado = true;
  }
  setTimeout(() => mapaLeaflet.invalidateSize(), 100);
  renderMarcadores();
  if (ubicacionUsuario) {
    mapaLeaflet.setView([ubicacionUsuario.lat, ubicacionUsuario.lng], 13);
    if (marcadorUsuario) marcadorUsuario.remove();
    marcadorUsuario = L.marker([ubicacionUsuario.lat, ubicacionUsuario.lng], {
      icon: L.divIcon({ className:'marker-usuario', html:'<div class="marker-yo">Tú</div>', iconSize:[40,40], iconAnchor:[20,20] })
    }).addTo(mapaLeaflet).bindPopup('Tu ubicación actual');
  }
}

function renderMarcadores() {
  if (!mapaLeaflet) return;
  marcadores.forEach(m => m.remove());
  marcadores = [];

  const lista = filtrarRefugios();
  lista.forEach(r => {
    const coords = COORDS_LOCALIDADES[r.localidad];
    if (!coords) return;

    // Pequeño offset para que no se solapen refugios de la misma localidad
    const offsetLat = (Math.random() - 0.5) * 0.01;
    const offsetLng = (Math.random() - 0.5) * 0.01;

    const icono = L.divIcon({
      className: 'marker-refugio',
      html: `<div class="marker-pin">${TIPO_EMOJI[r.tipo]}</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });

    const marker = L.marker([coords.lat + offsetLat, coords.lng + offsetLng], { icon: icono })
      .addTo(mapaLeaflet)
      .bindPopup(`
        <div class="popup-refugio">
          <strong>${r.nombre}</strong><br/>
          <small>📍 ${LOC[r.localidad]} &nbsp;·&nbsp; ⭐ ${r.rating}</small><br/>
          <small>${r.animales} animales</small><br/>
          <button onclick="abrirModal(${r.id})" class="popup-btn">Ver detalles</button>
        </div>
      `);

    marcadores.push(marker);
  });
}

/* ── Render grid/lista ── */
function renderRefugios() {
  if (vistaActual === 'mapa') { renderMarcadores(); return; }

  const lista  = filtrarRefugios();
  const grid   = $('refugios-grid');
  const empty  = $('empty-state');
  const count  = $('resultado-count');

  if (!grid) return;

  if (lista.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'flex';
    if (count) count.textContent = 'No se encontraron refugios';
    return;
  }

  if (empty) empty.style.display = 'none';
  if (count) count.textContent = `${lista.length} refugio${lista.length !== 1 ? 's' : ''} encontrado${lista.length !== 1 ? 's' : ''}`;

  grid.innerHTML = lista.map((r, i) => `
    <div class="refugio-app-card" onclick="abrirModal(${r.id})" style="animation-delay:${i * 0.05}s">
      <div class="rac-header">
        <div class="rac-emoji">${TIPO_EMOJI[r.tipo]}</div>
        <div class="rac-rating">⭐ ${r.rating}</div>
      </div>
      <div class="rac-body">
        <h3 class="rac-nombre">${r.nombre}</h3>
        <span class="rac-loc">📍 ${LOC[r.localidad] || r.localidad}</span>
        <p class="rac-desc">${r.descripcion.substring(0, 90)}...</p>
      </div>
      <div class="rac-footer">
        <span class="rac-animales">${r.animales} animales</span>
        <button class="btn-ver-mas">Ver detalles →</button>
      </div>
    </div>
  `).join('');
}

/* ── Filtros ── */
function filtrarRefugios() {
  return REFUGIOS.filter(r => {
    if (filtros.localidad && r.localidad !== filtros.localidad) return false;
    if (filtros.tipo !== 'todos' && r.tipo !== filtros.tipo) return false;
    if (r.rating < filtros.rating) return false;
    if (filtros.nombre && !r.nombre.toLowerCase().includes(filtros.nombre.toLowerCase())) return false;
    return true;
  });
}

function aplicarFiltros() {
  filtros.localidad = $('filtro-localidad')?.value || '';
  filtros.nombre    = $('filtro-nombre')?.value    || '';
  renderRefugios();
  if (vistaActual === 'mapa') renderMarcadores();
}

function seleccionarTipo(btn) {
  document.querySelectorAll('[data-tipo]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  filtros.tipo = btn.dataset.tipo;
  renderRefugios();
  if (vistaActual === 'mapa') renderMarcadores();
}

function seleccionarRating(btn) {
  document.querySelectorAll('[data-rating]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  filtros.rating = parseFloat(btn.dataset.rating);
  renderRefugios();
  if (vistaActual === 'mapa') renderMarcadores();
}

function limpiarFiltros() {
  filtros = { localidad:'', tipo:'todos', rating:0, nombre:'' };
  ubicacionUsuario = null;
  const btn = $('btn-geolocate');
  if (btn) { btn.textContent = '📍 Usar mi ubicación'; btn.classList.remove('btn-geo-active'); btn.disabled = false; }
  if ($('filtro-localidad')) $('filtro-localidad').value = '';
  if ($('filtro-nombre'))    $('filtro-nombre').value    = '';
  document.querySelectorAll('[data-tipo]').forEach(b => b.classList.toggle('active', b.dataset.tipo === 'todos'));
  document.querySelectorAll('[data-rating]').forEach(b => b.classList.toggle('active', b.dataset.rating === '0'));
  if (marcadorUsuario) { marcadorUsuario.remove(); marcadorUsuario = null; }
  renderRefugios();
  if (vistaActual === 'mapa') renderMarcadores();
}

/* ── Modal ── */
function abrirModal(id) {
  const r = REFUGIOS.find(x => x.id === id);
  if (!r) return;
  const content = $('modal-content');
  if (content) {
    content.innerHTML = `
      <div class="modal-emoji">${TIPO_EMOJI[r.tipo]}</div>
      <div class="modal-header-info">
        <h2>${r.nombre}</h2>
        <div class="modal-meta">
          <span>📍 ${LOC[r.localidad] || r.localidad}</span>
          <span>⭐ ${r.rating}</span>
          <span>${r.animales} animales</span>
        </div>
      </div>
      <p class="modal-desc">${r.descripcion}</p>
      <div class="modal-contact">
        <div class="contact-item"><span class="contact-icon">📧</span><span>${r.contacto}</span></div>
        <div class="contact-item"><span class="contact-icon">📞</span><span>${r.telefono}</span></div>
      </div>
      <div class="modal-actions">
        <button class="btn-primary" onclick="mostrarToast('Funcionalidad próximamente disponible.','info')">Solicitar adopción</button>
        <button class="btn-ghost" onclick="cerrarModal()">Cerrar</button>
      </div>
    `;
  }
  const modal = $('modal-refugio');
  if (modal) { modal.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
}

function cerrarModal(e) {
  if (e && e.target !== $('modal-refugio')) return;
  const modal = $('modal-refugio');
  if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; }
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarModal(); });

/* ── Sesión ── */
function cerrarSesion() {
  sessionStorage.removeItem('token'); sessionStorage.removeItem('usuario');
  localStorage.removeItem('token');   localStorage.removeItem('usuario');
  window.location.href = 'login.html';
}

function mostrarToast(msg, tipo = 'error') {
  const t = $('toast');
  if (!t) return;
  t.textContent = msg;
  t.style.background = tipo === 'info' ? '#1B5E3B' : '#DC2626';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 4000);
}

const navEl = document.getElementById('nav');
window.addEventListener('scroll', () => navEl?.classList.toggle('scrolled', window.scrollY > 20));
