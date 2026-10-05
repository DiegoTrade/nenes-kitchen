(function(){
'use strict';
var R = RECETAS, byId = {};
R.forEach(function(r){ byId[r.id] = r; });
(typeof LIGERAS !== 'undefined' ? LIGERAS : []).forEach(function(id){ if (byId[id]) byId[id].li = true; });
/* alimentos para armar platos a mano */
var FOODS = typeof ALIMENTOS !== 'undefined' ? ALIMENTOS : [], FOOD = {};
FOODS.forEach(function(x){ x.kc = x.k != null ? x.k : 4 * x.p + 4 * x.c + 9 * x.f; FOOD[x.id] = x; });
function baseUnit(x){ return x.l ? 'ml' : 'g'; }
function unitsOf(x){ return (x.u || []).concat([[baseUnit(x), 1, baseUnit(x)]]); }
function unitOf(x, u){ return unitsOf(x).filter(function(v){ return v[0] === u; })[0] || null; }
function ingMac(g){ var x = FOOD[g[0]], k = g[1] * unitOf(x, g[2])[1] / 100; return {pr: x.p * k, ch: x.c * k, kc: x.kc * k}; }
function shortName(x){ return x.n.replace(/ \(.*\)$/, ''); }
function cleanIng(a){
  if (!Array.isArray(a)) return null;
  var out = a.filter(function(g){ return Array.isArray(g) && FOOD[g[0]] && Number(g[1]) > 0 && unitOf(FOOD[g[0]], g[2]); })
    .map(function(g){ return [g[0], Math.min(5000, Number(g[1])), g[2]]; }).slice(0, 25);
  return out.length ? out : null;
}
function $(s, el){ return (el || document).querySelector(s); }
function norm(s){ return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
function svg(inner, size){ return '<svg viewBox="0 0 24 24" width="' + (size || 18) + '" height="' + (size || 18) + '" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>'; }
var ICON = {
  heart: svg('<path class="hf" d="M12 20s-7.2-4.4-9-8.9C1.8 7.9 3.8 4.6 7.2 4.6c2 0 3.6 1.1 4.8 2.8 1.2-1.7 2.8-2.8 4.8-2.8 3.4 0 5.4 3.3 4.2 6.5C19.2 15.6 12 20 12 20z"/>', 20),
  clock: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>', 15),
  users: svg('<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19c.6-3 2.8-4.6 5.5-4.6s4.9 1.6 5.5 4.6"/><path d="M15.5 5.6a3 3 0 010 5.8M17.5 14.6c1.7.6 2.8 2 3.1 4.4"/>', 15),
  close: svg('<path d="M6 6l12 12M18 6L6 18"/>', 20),
  back: svg('<path d="M15 5l-7 7 7 7"/>', 20),
  next: svg('<path d="M9 5l7 7-7 7"/>', 20),
  check: svg('<path d="M5 12.5l4.2 4.2L19 7"/>', 14),
  arrow: svg('<path d="M9 6l6 6-6 6"/>', 14),
  swap: svg('<path d="M4 9a8 8 0 0114-3l2 2M20 4v4h-4M20 15a8 8 0 01-14 3l-2-2M4 20v-4h4"/>', 17),
  cart: svg('<path d="M3 4h2.2l2.3 11h10.8l2-8H6.3"/><circle cx="9.5" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/>', 18),
  dice: svg('<rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="15" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/><circle cx="9" cy="15" r="1" fill="currentColor"/>', 18),
  sliders: svg('<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>', 17),
  copy: svg('<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"/>', 17),
  chat: svg('<path d="M5 4.5h14a2 2 0 012 2v8a2 2 0 01-2 2h-6.5L8 20v-3.5H5a2 2 0 01-2-2v-8a2 2 0 012-2z"/><path d="M8 9h8M8 12.5h5"/>', 18),
  trash: svg('<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>', 17),
  x: svg('<path d="M7 7l10 10M17 7L7 17"/>', 14),
  plus: svg('<path d="M12 5v14M5 12h14"/>', 18),
  play: svg('<path d="M8 5.5v13l10-6.5z" fill="currentColor"/>', 15),
  save: svg('<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19h14"/>', 18),
  up: svg('<path d="M12 20V9M7.5 13.5L12 9l4.5 4.5M5 5h14"/>', 18)
};

/* ---------- estado guardado en este navegador ---------- */
var KEY = 'cocina-nene-v1';
function load(){ try { var v = JSON.parse(localStorage.getItem(KEY)); return v && typeof v === 'object' ? v : {}; } catch (e) { return {}; } }
function snapshot(){ return {tab: S.tab, favs: Array.from(S.favs), menu: S.menu, shop: S.shop, bk: S.bk}; }
function save(){ try { pruneWeeks(); localStorage.setItem(KEY, JSON.stringify(snapshot())); } catch (e) {} }

var DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
var SLOTS = [['p', '12:00', 'Primera comida'], ['s1', '15:00', 'Merienda'], ['m', '17:30', 'Comida principal'], ['s2', 'Extra', 'Snack o batido']];
var POOL = {
  p: R.filter(function(r){ return r.t === 'primera'; }).map(function(r){ return r.id; }),
  m: R.filter(function(r){ return r.t === 'fuerte' || r.t === 'fria' || r.t === 'sopa'; }).map(function(r){ return r.id; }),
  s: R.filter(function(r){ return r.t === 'snack'; }).map(function(r){ return r.id; })
};
function poolFor(slot){ return slot === 'm' ? POOL.m : slot === 'p' ? POOL.p : POOL.s; }
function shuffle(a){ a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function pick(a){ return a[Math.floor(Math.random() * a.length)]; }

function pickMains(avoid){
  var base = POOL.m.filter(function(id){ return !avoid || avoid.indexOf(id) < 0; });
  if (base.length < 14) base = POOL.m;
  for (var tries = 0; tries < 300; tries++) {
    var out = [], cnt = {}, pool = shuffle(base);
    for (var k = 0; k < pool.length && out.length < 7; k++) {
      var r = byId[pool[k]], p = r.p, lim = p === 'pescado' ? 3 : p === 'marisco' ? 1 : 2;
      if ((cnt[p] || 0) >= lim) continue;
      if (out.length && byId[out[out.length - 1]].p === p) continue;
      out.push(r.id); cnt[p] = (cnt[p] || 0) + 1;
    }
    if (out.length === 7 && (cnt.pescado || 0) >= 2) return out;
  }
  return shuffle(base).slice(0, 7);
}
var SLOT_KEYS = ['p', 's1', 'm', 's2'];

/* ---------- fechas: cada semana se guarda con la fecha de su lunes ---------- */
var MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
function pad2(n){ return (n < 10 ? '0' : '') + n; }
function keyOf(d){ return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
function parseKey(k){ var p = k.split('-'); return new Date(+p[0], +p[1] - 1, +p[2], 12); }
function addDays(d, n){ return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, 12); }
function mondayOf(d){ return addDays(d, -((d.getDay() + 6) % 7)); }
function weekShift(k, n){ return keyOf(addDays(parseKey(k), 7 * n)); }
function dateOf(k, i){ return addDays(parseKey(k), i); }
function fmtDate(d){ return d.getDate() + ' ' + MESES[d.getMonth()]; }
var NOW, TODAY, CUR;
function setNow(){ var n = new Date(); NOW = new Date(n.getFullYear(), n.getMonth(), n.getDate(), 12); TODAY = (NOW.getDay() + 6) % 7; CUR = keyOf(mondayOf(NOW)); }
setNow();
/* -1 ya pasó, 0 hoy, 1 todavía no ha llegado (es plan) */
function when(k, i){ if (k !== CUR) return k < CUR ? -1 : 1; return i < TODAY ? -1 : i === TODAY ? 0 : 1; }

function mkItem(slot, id){ return {s: slot, id: id, f: 1}; }
function emptyWeek(){ return {days: DIAS.map(function(){ return {items: []}; })}; }
function mainsOf(w){ var out = []; if (w) w.days.forEach(function(d){ d.items.forEach(function(x){ if (x.s === 'm' && x.id) out.push(x.id); }); }); return out; }
function genWeek(from, avoid){
  var ps = shuffle(POOL.p), ms = pickMains(avoid), w = emptyWeek();
  for (var k = from; k < 7; k++) {
    var sn = shuffle(POOL.s);
    w.days[k].items = [mkItem('p', ps[k % ps.length]), mkItem('s1', sn[0]), mkItem('m', ms[k]), mkItem('s2', sn[1])];
  }
  return w;
}
var READY = false;
function ensureWeek(k){
  var W = S.menu.weeks;
  if (!W[k]) {
    if (k < CUR) W[k] = emptyWeek();
    else { W[k] = genWeek(k === CUR ? TODAY : 0, mainsOf(W[weekShift(k, -1)])); if (READY) save(); }
  }
  return W[k];
}
/* lo ya comido se queda; lo nuevo solo rellena las comidas que no tienen nada marcado */
function keepEaten(old, fresh){
  var keep = old.items.filter(function(x){ return x.e; });
  if (!keep.length) return fresh;
  return {items: keep.concat(fresh.items.filter(function(x){ return !keep.some(function(y){ return y.s === x.s; }); }))};
}
function genDay(k){
  var w = ensureWeek(S.wk), used = [];
  w.days.forEach(function(d, j){ if (j !== k) d.items.forEach(function(x){ if (x.s === 'm' && x.id) used.push(x.id); }); });
  var mains = POOL.m.filter(function(id){ return used.indexOf(id) < 0; });
  var sn = shuffle(POOL.s);
  return keepEaten(w.days[k], {items: [mkItem('p', pick(POOL.p)), mkItem('s1', sn[0]), mkItem('m', pick(mains.length ? mains : POOL.m)), mkItem('s2', sn[1])]});
}
function num(x){ x = Number(String(x).replace(',', '.')); return isFinite(x) && x >= 0 ? Math.round(x * 10) / 10 : 0; }
function cleanFood(it){
  if (!it) return null;
  if (it.id) return byId[it.id] ? {id: it.id} : null;
  if (typeof it.n === 'string' && it.n.trim()) {
    var o = {n: it.n.trim().slice(0, 60), pr: num(it.pr), ch: num(it.ch), kc: num(it.kc)}, ing = cleanIng(it.ing);
    if (ing) o.ing = ing;
    return o;
  }
  return null;
}
function cleanItem(it){
  if (!it || SLOT_KEYS.indexOf(it.s) < 0) return null;
  var c = cleanFood(it);
  if (!c) return null;
  c.s = it.s; c.f = Number(it.f) > 0 ? Math.min(10, Number(it.f)) : 1;
  if (it.e) c.e = 1;
  return c;
}
function cleanDays(days){
  return days.map(function(d){
    var o = {items: (d && Array.isArray(d.items) ? d.items : []).map(cleanItem).filter(Boolean)};
    if (d && d.rv) o.rv = 1;
    return o;
  });
}
/* datos de antes de que existiera «comido»: lo de los días que ya pasaron cuenta como comido */
function markPast(weeks){
  Object.keys(weeks).forEach(function(k){ weeks[k].days.forEach(function(d, i){ if (when(k, i) < 0) d.items.forEach(function(x){ x.e = 1; }); }); });
}
/* v4: cada plato lleva e:1 cuando se ha comido; rv:1 en el día cuando ya se preguntó por lo que quedó sin marcar */
function loadMenu(m){
  var out = {v: 4, weeks: {}, recent: [], seen: false, tk: false};
  if (!m || typeof m !== 'object') return out;
  if ((m.v === 3 || m.v === 4) && m.weeks && typeof m.weeks === 'object') {
    Object.keys(m.weeks).forEach(function(k){
      var w = m.weeks[k];
      if (/^\d{4}-\d{2}-\d{2}$/.test(k) && w && Array.isArray(w.days) && w.days.length === 7) out.weeks[k] = {days: cleanDays(w.days)};
    });
    out.recent = (Array.isArray(m.recent) ? m.recent : []).map(function(x){ var c = cleanFood(x); if (c && ['p', 's', 'm'].indexOf(x.s) >= 0) c.s = x.s; return c; }).filter(Boolean).slice(0, 24);
    out.seen = !!m.seen; out.tk = !!m.tk;
    if (m.v === 3) markPast(out.weeks);
    return out;
  }
  /* versiones anteriores: el menú guardado pasa a ser esta semana */
  if (Array.isArray(m.days) && m.days.length === 7) {
    if (m.v === 2) out.weeks[CUR] = {days: cleanDays(m.days)};
    else if (m.days.every(function(d){ return d && byId[d.p] && byId[d.s1] && byId[d.m] && byId[d.s2]; })) {
      out.weeks[CUR] = {days: m.days.map(function(d){ return {items: [mkItem('p', d.p), mkItem('s1', d.s1), mkItem('m', d.m), mkItem('s2', d.s2)]}; })};
    }
    markPast(out.weeks);
  }
  return out;
}
function pruneWeeks(){
  var W = S.menu.weeks, min = weekShift(CUR, -52), max = weekShift(CUR, 1);
  Object.keys(W).forEach(function(k){
    var empty = W[k].days.every(function(d){ return !d.items.length; });
    if (k < min || k > max || (k < CUR && empty)) delete W[k];
  });
}

var saved = load();
var S = {
  tab: ['recetas', 'menu', 'compra', 'guia'].indexOf(saved.tab) >= 0 ? saved.tab : 'recetas',
  tipo: 'todas', prot: null, tiempo: null, orig: null, prep: false, fav: false, li: false, q: '', open: false,
  favs: new Set((Array.isArray(saved.favs) ? saved.favs : []).filter(function(id){ return byId[id]; })),
  menu: loadMenu(saved.menu), wk: CUR, day: TODAY,
  bk: typeof saved.bk === 'string' ? saved.bk : null,
  shop: {entries: [], checked: {}, own: [], dishes: []}
};
ensureWeek(CUR);
if (saved.shop && Array.isArray(saved.shop.entries)) {
  S.shop.entries = saved.shop.entries.filter(function(e){ return e && byId[e.id] && e.f > 0; });
  S.shop.checked = saved.shop.checked && typeof saved.shop.checked === 'object' ? saved.shop.checked : {};
}
if (saved.shop) {
  S.shop.own = (Array.isArray(saved.shop.own) ? saved.shop.own : []).filter(function(t){ return typeof t === 'string' && t.trim(); })
    .map(function(t){ return t.trim().slice(0, 60); }).slice(0, 80);
  S.shop.dishes = (Array.isArray(saved.shop.dishes) ? saved.shop.dishes : []).map(function(d){
    var ing = d ? cleanIng(d.ing) : null;
    return ing && typeof d.n === 'string' ? {n: d.n.slice(0, 60), ing: ing, f: Number(d.f) > 0 ? Math.min(20, Number(d.f)) : 1} : null;
  }).filter(Boolean);
}
var hash = (location.hash || '').slice(1);
if (['recetas', 'menu', 'compra', 'guia'].indexOf(hash) >= 0) S.tab = hash;

/* ---------- pestañas ---------- */
function setTab(t, keepScroll){
  S.tab = t;
  ['recetas', 'menu', 'compra', 'guia'].forEach(function(x){ $('#v-' + x).hidden = x !== t; });
  document.querySelectorAll('[data-tab]').forEach(function(b){
    if (b.getAttribute('data-tab') === t) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  if (t === 'menu') renderMenu();
  if (t === 'compra') renderShop();
  if (!keepScroll) window.scrollTo(0, 0);
  save();
}
document.querySelectorAll('[data-tab]').forEach(function(b){
  b.addEventListener('click', function(){ setTab(b.getAttribute('data-tab')); });
});

/* ---------- recetas ---------- */
function filtered(){
  var q = norm(S.q.trim()), words = q ? q.split(/\s+/) : [];
  return R.filter(function(r){
    if (S.tipo !== 'todas' && r.t !== S.tipo) return false;
    if (S.prot && r.p !== S.prot) return false;
    if (S.tiempo && tiempoCat(r) !== S.tiempo) return false;
    if (S.orig && r.o !== S.orig && r.o2 !== S.orig) return false;
    if (S.prep && !r.prep) return false;
    if (S.li && !r.li) return false;
    if (S.fav && !S.favs.has(r.id)) return false;
    if (words.length) {
      var hay = norm(r.n + ' ' + r.d + ' ' + r.i.map(function(x){ return x[2]; }).join(' '));
      if (!words.every(function(w){ return hay.indexOf(w) >= 0; })) return false;
    }
    return true;
  });
}
function chip(g, v, label, on){ return '<button type="button" class="chip" data-g="' + g + '" data-v="' + v + '" aria-pressed="' + on + '">' + label + '</button>'; }
function group(label, chips){ return '<div class="fgroup"><p class="label">' + label + '</p><div class="fchips">' + chips.join('') + '</div></div>'; }
function activeCount(){ return (S.prot ? 1 : 0) + (S.tiempo ? 1 : 0) + (S.orig ? 1 : 0) + (S.prep ? 1 : 0) + (S.fav ? 1 : 0) + (S.li ? 1 : 0); }

function renderControls(list){
  var prev = $('.tipos'), sl = prev ? prev.scrollLeft : 0, prevQ = $('.quick'), slq = prevQ ? prevQ.scrollLeft : 0, n = activeCount();
  var h = '<div class="chips tipos" role="group" aria-label="Tipo de comida">' +
    TIPOS_CHIPS.map(function(t){ return chip('tipo', t[0], t[1], S.tipo === t[0]); }).join('') + '</div>';
  h += '<div class="chips quick" role="group" aria-label="Accesos rápidos">' +
    chip('orig', 'vi', 'Virales y favoritas', S.orig === 'vi') +
    chip('orig', 'as', 'Asiáticas', S.orig === 'as') +
    chip('li', '1', 'Ligeras (días de náuseas)', S.li) +
    chip('orig', 've', 'Venezolanas', S.orig === 've') +
    chip('orig', 'ca', 'Canarias', S.orig === 'ca') +
    chip('prep', '1', 'Se preparan antes', S.prep) +
    chip('fav', '1', 'Guardadas', S.fav) + '</div>';
  h += '<div class="filter-bar"><button type="button" class="linkbtn" id="toggle-filters" aria-expanded="' + S.open + '" aria-controls="filters">' +
    ICON.sliders + '<span>Filtros' + (n ? ' (' + n + ')' : '') + '</span></button>' +
    '<span class="count">' + (list.length === 1 ? '1 receta' : list.length + ' recetas') + '</span>' +
    (n || S.q || S.tipo !== 'todas' ? '<button type="button" class="linkbtn" data-clear-filters>Quitar filtros</button>' : '') + '</div>';
  h += '<div class="filters" id="filters"' + (S.open ? '' : ' hidden') + '>' +
    group('Proteína', PROTS.map(function(p){ return chip('prot', p[0], p[1], S.prot === p[0]); })) +
    group('Tiempo', TIEMPOS.map(function(t){ return chip('tiempo', t[0], t[1], S.tiempo === t[0]); })) +
    group('Estilo', Object.keys(ORIG).map(function(k){ return chip('orig', k, ORIG[k], S.orig === k); })) +
    '</div>';
  $('#controls').innerHTML = h;
  $('.tipos').scrollLeft = sl;
  $('.quick').scrollLeft = slq;
}
var TILE = {pollo: '🍗', carne: '🥩', cerdo: '🥓', pescado: '🐟', marisco: '🦐', huevos: '🍳', lacteos: '🧀', otros: '🍖'};
function tileHTML(r, big){
  var t = r.t === 'sopa' ? ['🍲', 'sopa'] : r.t === 'base' ? ['🥣', 'base'] : [TILE[r.p] || '🍽️', TILE[r.p] ? r.p : 'otros'];
  return '<span class="tile tile-' + t[1] + (big ? ' tile-big' : '') + '" aria-hidden="true">' + t[0] + '</span>';
}
function cardHTML(r){
  var fav = S.favs.has(r.id), base = r.t === 'base';
  return '<article class="card" data-open="' + r.id + '" tabindex="0" aria-label="' + esc(r.n) + '">' + tileHTML(r) +
    '<div class="card-main"><h3 class="card-title">' + esc(r.n) + '</h3>' +
    '<p class="card-desc">' + esc(r.d) + '</p>' +
    '<div class="card-foot">' +
    (base ? '<span class="meta">' + ICON.users + porciones(r.s) + ' ' + esc(r.sn || '') + '</span>'
      : '<span class="badge pro">' + r.pr + ' g proteína</span><span class="badge carb">' + r.ch + ' g carbos</span>') +
    '<span class="meta">' + esc(timeText(r)) + '</span></div></div>' +
    '<button type="button" class="fav-btn' + (fav ? ' on' : '') + '" data-fav="' + r.id + '" aria-pressed="' + fav + '" aria-label="Guardar ' + esc(r.n) + '">' + ICON.heart + '</button></article>';
}
function renderList(){
  var list = filtered();
  renderControls(list);
  $('#grid').innerHTML = list.length ? list.map(cardHTML).join('')
    : '<div class="empty"><p>No hay recetas con estos filtros.</p><button type="button" class="btn" data-clear-filters>Quitar filtros</button></div>';
}
function clearFilters(){
  S.tipo = 'todas'; S.prot = S.tiempo = S.orig = null; S.prep = S.fav = S.li = false; S.q = ''; $('#q').value = '';
  renderList();
}
function toggleFav(id){ if (S.favs.has(id)) S.favs.delete(id); else S.favs.add(id); save(); }

$('#v-recetas').addEventListener('click', function(e){
  var t = e.target.closest('button, [data-open]');
  if (!t) return;
  if (t.hasAttribute('data-fav')) { toggleFav(t.getAttribute('data-fav')); renderList(); return; }
  if (t.hasAttribute('data-g')) {
    var g = t.getAttribute('data-g'), v = t.getAttribute('data-v');
    if (g === 'tipo') S.tipo = v;
    else if (g === 'prep' || g === 'fav' || g === 'li') S[g] = !S[g];
    else S[g] = S[g] === v ? null : v;
    renderList(); return;
  }
  if (t.id === 'toggle-filters') { S.open = !S.open; renderList(); $('#toggle-filters').focus(); return; }
  if (t.hasAttribute('data-clear-filters')) { clearFilters(); return; }
  if (t.id === 'random') { randomRecipe(); return; }
  if (t.hasAttribute('data-open')) openRecipe(t.getAttribute('data-open'));
});
$('#v-recetas').addEventListener('keydown', function(e){
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('card')) { e.preventDefault(); openRecipe(e.target.getAttribute('data-open')); }
});
$('#q').addEventListener('input', function(){ S.q = this.value; renderList(); });

function randomRecipe(exclude){
  var list = filtered();
  if (S.tipo === 'todas') list = list.filter(function(r){ return r.t !== 'snack' && r.t !== 'base'; });
  if (!list.length) list = R.filter(function(r){ return r.t === 'fuerte'; });
  if (exclude && list.length > 1) list = list.filter(function(r){ return r.id !== exclude; });
  openRecipe(pick(list).id, {random: true});
}

/* ---------- ficha de receta ---------- */
var SH = {stack: [], serv: 1, random: false, lastFocus: null};
var sheet = $('#sheet'), panel = $('#sheet-panel');
function cur(){ return byId[SH.stack[SH.stack.length - 1]]; }

function openRecipe(id, o){
  o = o || {};
  if (sheet.hidden) { SH.lastFocus = document.activeElement; SH.stack = [id]; }
  else if (o.push) SH.stack.push(id);
  else SH.stack = [id];
  if (!o.push) SH.random = !!o.random;
  SH.serv = byId[id].s;
  renderSheet();
  sheet.hidden = false;
  document.documentElement.classList.add('locked');
  panel.scrollTop = 0;
  panel.focus({preventScroll: true});
}
function closeSheet(){
  sheet.hidden = true;
  document.documentElement.classList.remove('locked');
  SH.stack = [];
  if (SH.lastFocus && document.body.contains(SH.lastFocus)) SH.lastFocus.focus({preventScroll: true});
}
function back(){ SH.stack.pop(); SH.serv = cur().s; renderSheet(); panel.scrollTop = 0; }

function ingsHTML(r){
  var f = SH.serv / r.s;
  return r.i.map(function(x){
    var q = x[0] == null ? null : roundQty(x[0] * f, x[1]);
    var qt = esc(qtyText(q, x[1]));
    if (x[5]) {
      return '<li><div class="ing ing-ref"><span class="tick tick-ref" aria-hidden="true">' + ICON.arrow + '</span>' +
        '<button type="button" class="ing-n ing-link" data-ref="' + x[5] + '">' + esc(x[2]) + '<small>Ver receta' + (x[4] ? ' · ' + esc(x[4]) : '') + '</small></button>' +
        '<span class="ing-q">' + qt + '</span></div></li>';
    }
    return '<li><button type="button" class="ing" aria-pressed="false"><span class="tick" aria-hidden="true">' + ICON.check + '</span>' +
      '<span class="ing-n">' + esc(x[2]) + (x[4] ? '<small>' + esc(x[4]) + '</small>' : '') + '</span>' +
      '<span class="ing-q">' + qt + '</span></button></li>';
  }).join('');
}
function fact(cls, label, value, sub){
  return '<div class="fact ' + cls + '"><span class="label">' + label + '</span><span class="fact-v">' + value + '</span>' + (sub ? '<span class="fact-s">' + sub + '</span>' : '') + '</div>';
}
function renderSheet(){
  var r = cur(), fav = S.favs.has(r.id);
  var mainTime = r.min >= 60 ? Math.floor(r.min / 60) + ' h' + (r.min % 60 ? ' ' + (r.min % 60) + ' min' : '') : r.min + ' min';
  var h = '<div class="sheet-bar">' +
    (SH.stack.length > 1 ? '<button type="button" class="icon-btn" data-back aria-label="Volver a ' + esc(byId[SH.stack[SH.stack.length - 2]].n) + '">' + ICON.back + '</button>' : '<span></span>') +
    '<span class="grabber" aria-hidden="true"></span>' +
    '<button type="button" class="icon-btn" data-close aria-label="Cerrar">' + ICON.close + '</button></div>';
  h += '<div class="rs-head">' + tileHTML(r, true) + '<div class="tags"><span class="tag-s">' + TIPO[r.t] + '</span><span class="tag-s">' + ORIG[r.o] + '</span>' +
    (r.prep ? '<span class="tag-s">Se prepara antes</span>' : '') + '</div></div>' +
    '<h2 id="sheet-title" class="sheet-title">' + esc(r.n) + '</h2><p class="lead">' + esc(r.d) + '</p>';
  h += '<div class="stats" aria-label="Por porción">' +
    '<div class="stat stat-pro"><b>' + r.pr + ' g</b><span>proteína</span></div>' +
    '<div class="stat stat-carb"><b>' + r.ch + ' g</b><span>carbos</span></div>' +
    '<div class="stat"><b>' + r.gr + ' g</b><span>grasa</span></div>' +
    '<div class="stat"><b>' + fmtKc(r.kc) + '</b><span>calorías</span></div></div>' +
    '<p class="rs-cap">Por porción' + (r.sn ? ' · ' + esc(r.sn) : '') + '</p>' +
    '<div class="rs-row"><span class="rs-time">' + ICON.clock + mainTime + (r.x ? '<small>+ ' + esc(r.x) + '</small>' : '') + '</span>' +
    '<div class="rs-serv"><span class="label">Porciones</span><div class="stepper">' +
      '<button type="button" data-serv="-1" aria-label="Menos porciones">−</button>' +
      '<output id="serv-out" aria-live="polite">' + SH.serv + '</output>' +
      '<button type="button" data-serv="1" aria-label="Más porciones">+</button></div></div></div>';
  h += '<div class="sec-h"><h3>Ingredientes</h3><span>Toca para tachar</span></div><ul class="ings" id="ings">' + ingsHTML(r) + '</ul>';
  h += '<div class="sec-h"><h3>Preparación</h3><button type="button" class="btn small cook-go" data-cook>' + ICON.play + 'Modo cocina</button></div><ol class="steps">' + r.st.map(function(s, k){
    return '<li><button type="button" class="step" aria-pressed="false"><span class="step-n" aria-hidden="true">' + (k + 1) + '</span><span class="step-t">' + esc(s) + '</span></button></li>';
  }).join('') + '</ol>';
  h += notesHTML(r);
  h += '<div class="actions">' +
    '<button type="button" class="btn primary" data-add>' + ICON.cart + 'Añadir a la compra</button>' +
    '<button type="button" class="btn fav-toggle' + (fav ? ' on' : '') + '" data-favsheet aria-pressed="' + fav + '">' + ICON.heart + (fav ? 'Guardada' : 'Guardar') + '</button>' +
    (SH.random && SH.stack.length === 1 ? '<button type="button" class="btn" data-reroll>' + ICON.dice + 'Otra idea</button>' : '') +
    '</div>';
  panel.innerHTML = h;
}
function updateIngs(){
  var list = $('#ings'), pressed = [];
  list.querySelectorAll('.ing').forEach(function(b, k){ pressed[k] = b.getAttribute('aria-pressed') === 'true'; });
  list.innerHTML = ingsHTML(cur());
  list.querySelectorAll('.ing').forEach(function(b, k){ if (pressed[k] && b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', 'true'); });
  $('#serv-out').textContent = SH.serv;
}
panel.addEventListener('click', function(e){
  var t = e.target.closest('button');
  if (!t) return;
  var r = cur();
  if (t.hasAttribute('data-close')) { closeSheet(); return; }
  if (t.hasAttribute('data-back')) { back(); return; }
  if (t.hasAttribute('data-serv')) { SH.serv = Math.min(12, Math.max(1, SH.serv + Number(t.getAttribute('data-serv')))); updateIngs(); return; }
  if (t.hasAttribute('data-ref')) { openRecipe(t.getAttribute('data-ref'), {push: true}); return; }
  if (t.hasAttribute('data-cook')) { openCook(r.id); return; }
  if (t.classList.contains('ing') || t.classList.contains('step')) { t.setAttribute('aria-pressed', t.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); return; }
  if (t.hasAttribute('data-add')) { addToShop(r.id, SH.serv / r.s, false); toast('Añadido a la compra: ' + r.n); return; }
  if (t.hasAttribute('data-favsheet')) {
    toggleFav(r.id);
    var on = S.favs.has(r.id);
    t.classList.toggle('on', on); t.setAttribute('aria-pressed', on);
    t.lastChild.textContent = on ? 'Guardada' : 'Guardar';
    if (S.tab === 'recetas') renderList();
    return;
  }
  if (t.hasAttribute('data-reroll')) { randomRecipe(r.id); }
});
$('.sheet-backdrop').addEventListener('click', closeSheet);
document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && !sheet.hidden) closeSheet(); });

/* ---------- menú semanal ---------- */
var SLOT_LABEL = {p: 'Primera comida', s1: 'Merienda', m: 'Comida principal', s2: 'Snack o extra'};
var SLOT_SHORT = {p: 'Primera', s1: 'Merienda', m: 'Principal', s2: 'Extra'};
var SLOT_TIME = {p: '12:00', s1: '15:00', m: '17:30', s2: ''};
var LETRA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
var GOAL = 150, GOAL_HI = 180, SCALE = 220;
var RAPIDOS = [
  {g: 'pro', n: 'Huevo cocido', pr: 7, ch: 0.4, kc: 80},
  {g: 'pro', n: '2 huevos cocidos', pr: 14, ch: 1, kc: 160},
  {g: 'pro', n: 'Batido de proteína (1 cazo)', pr: 24, ch: 2, kc: 120},
  {g: 'pro', n: 'Skyr o yogur proteico (200 g)', pr: 22, ch: 8, kc: 130},
  {g: 'pro', n: 'Jamón serrano (50 g)', pr: 15, ch: 0, kc: 120},
  {g: 'pro', n: 'Cecina (50 g)', pr: 19, ch: 0, kc: 110},
  {g: 'pro', n: 'Lata de atún escurrida', pr: 13, ch: 0, kc: 90},
  {g: 'pro', n: 'Pollo cocinado (100 g)', pr: 31, ch: 0, kc: 160},
  {g: 'pro', n: 'Queso fresco (100 g)', pr: 13, ch: 3, kc: 190},
  {g: 'otro', n: 'Puñado de almendras (30 g)', pr: 6, ch: 3, kc: 170},
  {g: 'otro', n: 'Medio aguacate', pr: 1.5, ch: 1.5, kc: 110},
  {g: 'otro', n: 'Vaso de kéfir (250 ml)', pr: 8, ch: 10, kc: 150},
  {g: 'fuera', n: 'Casabe (1 trozo, 15 g)', pr: 0.2, ch: 12, kc: 50},
  {g: 'fuera', n: 'Arroz blanco (½ taza)', pr: 2, ch: 22, kc: 100},
  {g: 'fuera', n: 'Arepa mediana', pr: 4, ch: 38, kc: 180},
  {g: 'fuera', n: 'Pan (1 rebanada)', pr: 3, ch: 15, kc: 80},
  {g: 'fuera', n: 'Papa mediana', pr: 3, ch: 26, kc: 115},
  {g: 'fuera', n: 'Fruta (1 pieza)', pr: 1, ch: 15, kc: 70}
];
function wk(){ return ensureWeek(S.wk); }
function curDay(){ return wk().days[S.day]; }
function food(x){ return x.id ? byId[x.id] : x; }
function mac(it){ var r = food(it); return {pr: (r.pr || 0) * it.f, ch: (r.ch || 0) * it.f, kc: (r.kc || 0) * it.f}; }
function sumItems(items){
  var t = {pr: 0, ch: 0, kc: 0};
  items.forEach(function(it){ var m = mac(it); t.pr += m.pr; t.ch += m.ch; t.kc += m.kc; });
  return {pr: Math.round(t.pr), ch: Math.round(t.ch), kc: Math.round(t.kc / 10) * 10};
}
/* dayTot: todo lo apuntado (el plan). eatTot: solo lo marcado como comido */
function dayTot(d){ return sumItems(d.items); }
function eatTot(d){ return sumItems(d.items.filter(function(it){ return it.e; })); }
function nEat(d){ return d.items.filter(function(it){ return it.e; }).length; }
function itemName(it){ return food(it).n; }
function fmtKc(n){ return n >= 1000 ? Math.floor(n / 1000) + '.' + String(n % 1000).padStart(3, '0') : String(n); }
function macLine(m){ return Math.round(m.pr) + ' g prot · ' + Math.round(m.ch) + ' g carb' + (m.kc ? ' · ' + fmtKc(Math.round(m.kc / 10) * 10) + ' kcal' : ''); }
function suggestion(gap){ return gap <= 7 ? RAPIDOS[0] : gap <= 14 ? RAPIDOS[1] : RAPIDOS[2]; }
function clone(x){ return JSON.parse(JSON.stringify(x)); }
function foodKey(x){ return x.id ? 'r:' + x.id : 'n:' + norm(x.n); }
function slotGroup(s){ return s === 's1' || s === 's2' ? 's' : s; }
function remember(it){
  var d = cleanFood(it);
  if (!d) return;
  if (it.s) d.s = slotGroup(it.s);
  var k = foodKey(d);
  S.menu.recent = [d].concat(S.menu.recent.filter(function(x){ return foodKey(x) !== k; })).slice(0, 24);
}
function dayRel(k, i){
  var st = when(k, i), diff = Math.round((dateOf(k, i) - NOW) / 864e5);
  if (st === 0) return 'hoy';
  if (diff === -1) return 'ayer';
  if (diff === 1) return 'mañana · plan';
  return st > 0 ? 'plan' : '';
}
function weekStats(k){
  var w = S.menu.weeks[k];
  if (!w) return null;
  var done = [], plan = [];
  w.days.forEach(function(d, i){
    if (!d.items.length) return;
    var st = when(k, i), ne = nEat(d);
    if (st > 0) plan.push(dayTot(d).pr);
    else if (st < 0) { if (ne) done.push(eatTot(d).pr); }
    else if (ne === d.items.length) done.push(eatTot(d).pr);   /* hoy cuenta en la media cuando ya está todo marcado */
    else plan.push(dayTot(d).pr);
  });
  function st(a){ return a.length ? {n: a.length, avg: Math.round(a.reduce(function(x, y){ return x + y; }, 0) / a.length), ok: a.filter(function(v){ return v >= GOAL; }).length} : null; }
  return {done: st(done), plan: st(plan)};
}
function canPrev(){ return Object.keys(S.menu.weeks).some(function(k){ return k < S.wk; }); }
function canNext(){ return S.wk < weekShift(CUR, 1); }
function weekLabel(k){
  var a = parseKey(k), b = addDays(a, 6);
  var rng = a.getMonth() === b.getMonth() ? a.getDate() + '–' + fmtDate(b) : fmtDate(a) + ' – ' + fmtDate(b);
  var name = k === CUR ? 'Esta semana' : k === weekShift(CUR, 1) ? 'Semana que viene' : k === weekShift(CUR, -1) ? 'Semana pasada' : 'Semana del ' + fmtDate(a);
  return {name: name, rng: rng};
}
function band(){ return '<span class="band" style="bottom:' + (GOAL / SCALE * 100).toFixed(1) + '%;height:' + ((GOAL_HI - GOAL) / SCALE * 100).toFixed(1) + '%"></span>'; }

function weekHTML(){
  var k = S.wk, w = wk(), lb = weekLabel(k), anyPlan = false;
  var pct = function(v){ return v > 0 ? Math.max(4, Math.min(100, v / SCALE * 100)) : 0; };
  var h = '<div class="week">' +
    '<div class="wnav"><button type="button" class="icon-btn" data-wprev aria-label="Semana anterior"' + (canPrev() ? '' : ' disabled') + '>' + ICON.back + '</button>' +
    '<p class="wnav-l"><b>' + lb.name + '</b><span>' + lb.rng + '</span></p>' +
    '<button type="button" class="icon-btn" data-wnext aria-label="Semana siguiente"' + (canNext() ? '' : ' disabled') + '>' + ICON.next + '</button></div>';
  h += '<div class="wk-row" role="tablist" aria-label="Días de la semana">' + w.days.map(function(d, i){
    var st = when(k, i), has = d.items.length > 0, dt = dateOf(k, i), all = dayTot(d), eat = eatTot(d), ne = nEat(d), open = d.items.length - ne;
    /* barra sólida: lo comido. Rayada: lo que es plan (días que no han llegado y lo que queda de hoy) */
    var solid = st <= 0 && ne ? pct(eat.pr) : 0, hatch = st > 0 || (st === 0 && open) ? pct(all.pr) : 0;
    if (hatch) anyPlan = true;
    var num = st > 0 ? (has ? all.pr : '–') : ne ? eat.pr : st === 0 && has ? 0 : '–';
    var say = !has ? 'nada apuntado' : st > 0 ? all.pr + ' g de proteína en el plan'
      : (ne ? eat.pr + ' g de proteína' : 'nada marcado como comido') + (st === 0 && open ? ', el plan llega a ' + all.pr + ' g' : '');
    var lab = DIAS[i] + ' ' + fmtDate(dt) + (st === 0 ? ', hoy' : st > 0 ? ', plan' : '') + ': ' + say;
    return '<button type="button" class="wk' + (st === 0 ? ' today' : '') + (st > 0 ? ' plan' : '') + '" role="tab" aria-selected="' + (i === S.day) + '" data-day="' + i + '" aria-label="' + lab + '" title="' + lab + '">' +
      '<span class="wk-d">' + LETRA[i] + '</span><span class="wk-dt">' + dt.getDate() + '</span>' +
      '<span class="wk-bar">' + band() + (hatch ? '<i class="pl" style="height:' + hatch.toFixed(1) + '%"></i>' : '') + (solid ? '<i style="height:' + solid.toFixed(1) + '%"></i>' : '') + '</span>' +
      '<span class="wk-n">' + num + '</span></button>';
  }).join('') + '</div>';
  h += '<p class="wk-legend"><span><i class="lg lg-band"></i>meta 150–180 g</span>' + (anyPlan ? '<span><i class="lg lg-plan"></i>plan, aún sin comer</span>' : '') + '</p></div>';
  return h;
}
var seenPr = {};
function statusHTML(d, st, party){
  var all = dayTot(d), has = d.items.length > 0, plan = st > 0, ne = nEat(d), open = d.items.length - ne;
  /* lo que cuenta: en los días que no han llegado, el plan; hoy y antes, solo lo marcado como comido */
  var t = plan ? all : eatTot(d), proj = st === 0 ? all.pr : t.pr, gap = GOAL - t.pr, msg, cls = '';
  if (!has) msg = plan ? 'Todavía no hay nada planeado' : st < 0 ? 'No se apuntó nada este día' : 'Todavía no hay nada apuntado';
  else if (t.pr >= GOAL) { cls = ' ok'; msg = ICON.check + (plan ? 'El plan llega a la meta' : st < 0 ? 'Llegó a la meta' : 'Meta cumplida'); }
  else if (plan) { cls = ' low'; msg = 'Al plan le faltan ' + gap + ' g'; }
  else if (st < 0) { if (ne) { cls = ' low'; msg = 'Se quedó a ' + gap + ' g de la meta'; } else msg = 'No se marcó nada este día'; }
  else { cls = proj >= GOAL ? '' : ' low'; msg = 'Faltan ' + gap + ' g para la meta'; }
  var pc = function(v){ return Math.min(100, v / SCALE * 100); };
  var fill = plan ? 0 : pc(t.pr), hatch = plan || (st === 0 && open) ? pc(all.pr) : 0, x1 = GOAL / SCALE * 100, x2 = GOAL_HI / SCALE * 100;
  var met = has && t.pr >= GOAL;
  var h = '<div class="status' + (met ? ' met' : '') + (party ? ' party' : '') + '">' +
    (met ? '<img class="st-egg" src="mascota.png" alt="" width="420" height="372">' : '') +
    (party ? '<span class="sparks" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>' : '') +
    '<div class="st-top"><span class="label">' + (plan ? 'Proteína del plan' : st === 0 ? 'Proteína comida hoy' : 'Proteína comida') + '</span><span class="st-goal">meta 150–180 g</span></div>' +
    '<div class="st-mid"><p class="st-big"><b>' + t.pr + '</b> g</p><p class="st-msg' + cls + '">' + msg + '</p></div>' +
    '<div class="pbar" aria-hidden="true"><span class="pbar-band" style="left:' + x1.toFixed(1) + '%;width:' + (x2 - x1).toFixed(1) + '%"></span>' +
      (hatch ? '<i class="pl" style="width:' + hatch.toFixed(1) + '%"></i>' : '') +
      (fill ? '<i style="width:' + fill.toFixed(1) + '%"></i>' : '') +
      '<span class="pbar-t" style="left:' + x1.toFixed(1) + '%"></span><span class="pbar-t" style="left:' + x2.toFixed(1) + '%"></span></div>' +
    '<p class="st-sub"><span><b>' + t.ch + ' g</b> carbos</span><span><b>' + fmtKc(t.kc) + '</b> kcal</span></p>';
  if (st === 0 && has && open) {
    h += '<p class="st-plan"><i class="lg lg-plan" aria-hidden="true"></i><span>Con lo que queda del plan llegas a <b>' + all.pr + ' g</b>' +
      (all.pr < GOAL ? ': faltan ' + (GOAL - all.pr) + ' g' : '') + '</span></p>';
  }
  if (has && st >= 0 && proj < GOAL) {
    var sg = suggestion(GOAL - proj);
    h += '<button type="button" class="btn small st-add" data-suggest="' + RAPIDOS.indexOf(sg) + '">+ ' + esc(sg.n) + ' <span>+' + sg.pr + ' g</span></button>';
  }
  return h + '</div>';
}
/* hoy y los días pasados: cada plato lleva un círculo para marcarlo como comido */
function itemRow(it, i, st, just){
  var f = it.f !== 1 ? ' <span class="it-f">×' + fmtNum(it.f) + '</span>' : '', can = st <= 0, nm = esc(itemName(it));
  return '<li class="it-li' + (can ? (it.e ? ' done' : ' open') : '') + (just ? ' pop' : '') + '">' +
    (can ? '<button type="button" class="it-chk" data-eat="' + i + '" aria-pressed="' + !!it.e + '" aria-label="' + (it.e ? 'Comido: ' : 'Marcar como comido: ') + nm + '">' +
      '<span class="tick" aria-hidden="true">' + ICON.check + '</span></button>' : '') +
    '<button type="button" class="it" data-item="' + i + '"><span class="it-main"><span class="it-n">' + nm + f + '</span>' +
    '<span class="it-m">' + macLine(mac(it)) + '</span></span><span class="it-go" aria-hidden="true">' + ICON.arrow + '</span></button></li>';
}
/* el día pasado más reciente (hasta tres días atrás) con platos sin marcar y por el que aún no se ha preguntado */
function pendingReview(){
  for (var n = 1; n <= 3; n++) {
    var dt = addDays(NOW, -n), k = keyOf(mondayOf(dt)), i = (dt.getDay() + 6) % 7, w = S.menu.weeks[k];
    if (!w) continue;
    var dd = w.days[i], open = dd.items.filter(function(x){ return !x.e; });
    if (open.length && !dd.rv) return {k: k, i: i, d: dd, n: n, open: open};
  }
  return null;
}
function reviewHTML(){
  var p = pendingReview();
  if (!p) return '';
  var c = p.open.length, name = p.n === 1 ? 'Ayer' : 'El ' + DIAS[p.i].toLowerCase() + ' ' + dateOf(p.k, p.i).getDate();
  return '<div class="review" role="group" aria-label="Platos sin marcar"><p class="rv-t">' + name + (c === 1 ? ' quedó 1 plato sin marcar' : ' quedaron ' + c + ' platos sin marcar') + '</p>' +
    '<p class="rv-l">' + esc(p.open.map(itemName).join(' · ')) + '</p>' +
    '<div class="rv-acts"><button type="button" class="btn small primary" data-review="si">' + (c === 1 ? 'Sí, se comió' : 'Sí, se comieron') + '</button>' +
    '<button type="button" class="btn small" data-review="no">No</button>' +
    '<button type="button" class="btn small" data-review="ver">Ver el día</button></div></div>';
}
function review(act){
  var p = pendingReview();
  if (!p) return;
  var k = p.k, i = p.i, before = clone(p.d.items);
  p.d.rv = 1;
  if (act === 'si') p.d.items.forEach(function(x){ x.e = 1; });
  save();
  if (act === 'ver') { goDay(k, i, -1); return; }
  renderMenu();
  toast(act === 'si' ? 'Apuntado como comido' : 'Vale, no cuenta', 'Deshacer', function(){
    var dd = ensureWeek(k).days[i]; dd.items = before; delete dd.rv; save(); renderMenu();
  });
}
/* marcar o desmarcar un plato del día que se está viendo */
function tickItem(idx){
  var d = curDay(), it = d.items[idx], st = when(S.wk, S.day);
  if (!it || st > 0) return;
  if (it.e) delete it.e; else it.e = 1;
  S.menu.tk = true;
  save();
  var party = renderMenu({just: it.e ? idx : -1});
  var b = document.querySelector('[data-eat="' + idx + '"]'); if (b) b.focus({preventScroll: true});
  if (it.e && st === 0) react(it, party);
}
/* la reacción al marcar una comida de hoy: una nota de amor en las dos comidas grandes, un aviso corto en lo demás */
function react(it, party){
  var meal = it.s === 'p' || it.s === 'm';
  if (meal && typeof LOVE !== 'undefined' && LOVE.length && !(loved && loved.has(it))) {
    if (loved) loved.add(it);
    showLove(party ? {pill: '🎉 ¡Meta del día cumplida!'} : null);
  } else if (!party) toast('Comido: ' + itemName(it));
}
function prevDay(){
  var k = S.wk, i = S.day - 1;
  if (i < 0) { k = weekShift(k, -1); i = 6; if (!S.menu.weeks[k]) return null; }
  return {k: k, i: i, d: S.menu.weeks[k].days[i]};
}
function trendHTML(){
  var ks = Object.keys(S.menu.weeks).filter(function(k){ return k <= CUR; }).sort().filter(function(k){ var s = weekStats(k); return s && s.done; }).slice(-8);
  if (ks.length < 2) return '';
  var lab = ks.indexOf(S.wk) >= 0 ? S.wk : ks[ks.length - 1];
  return '<p class="trend-t">Media de proteína por semana</p><div class="trend">' + ks.map(function(k, j){
    var s = weekStats(k).done, a = parseKey(k), hgt = Math.max(4, Math.min(100, s.avg / SCALE * 100));
    var al = 'Semana del ' + fmtDate(a) + ': ' + s.avg + ' g de media en ' + s.n + (s.n === 1 ? ' día' : ' días');
    return '<button type="button" class="tr' + (k === S.wk ? ' on' : '') + '" data-gowk="' + k + '" aria-label="' + al + '" title="' + al + '"' + (j === 0 ? ' style="grid-column:' + (9 - ks.length) + '"' : '') + '>' +
      '<span class="tr-v">' + (k === lab ? s.avg : '') + '</span>' +
      '<span class="tr-bar">' + band() + '<i style="height:' + hgt.toFixed(1) + '%"></i></span>' +
      '<span class="tr-d">' + fmtDate(a) + '</span></button>';
  }).join('') + '</div>';
}
/* texto del menú para enviar por WhatsApp */
function dayLines(d, marks){
  var lines = [];
  SLOT_KEYS.forEach(function(sk){
    var its = d.items.filter(function(it){ return it.s === sk; });
    if (its.length) lines.push('• ' + SLOT_LABEL[sk] + ': ' + its.map(function(it){ return itemName(it) + (it.f !== 1 ? ' (×' + fmtNum(it.f) + ')' : '') + (marks && it.e ? ' ✅' : ''); }).join(' + '));
  });
  return lines;
}
function menuText(k){
  var w = ensureWeek(k), out = ['*Menú de la semana · ' + weekLabel(k).rng + '*', ''];
  w.days.forEach(function(d, i){
    if (!d.items.length) return;
    var st = when(k, i), ne = nEat(d), all = dayTot(d).pr;
    var head = st > 0 || (st === 0 && !ne) ? all + ' g de proteína'
      : !ne ? 'sin marcar' : st === 0 && ne < d.items.length ? eatTot(d).pr + ' g comidos de ' + all + ' g del plan' : eatTot(d).pr + ' g de proteína';
    out.push('*' + DIAS[i] + ' ' + dateOf(k, i).getDate() + '* · ' + head);
    out = out.concat(dayLines(d, st <= 0));
    out.push('');
  });
  out.push('La Cocina de Nene');
  return out.join('\n');
}
function dayText(k, i){
  var d = ensureWeek(k).days[i], st = when(k, i), ne = nEat(d), all = dayTot(d), eat = eatTot(d);
  var line = function(t){ return t.pr + ' g de proteína · ' + t.ch + ' g de carbos · ' + fmtKc(t.kc) + ' kcal'; };
  var foot = st > 0 || (st === 0 && !ne) ? [line(all)]
    : !ne ? ['Sin marcar'] : st === 0 && ne < d.items.length ? ['Comido: ' + line(eat), 'Plan del día: ' + all.pr + ' g de proteína'] : [line(eat)];
  return ['*' + DIAS[i] + ' ' + fmtDate(dateOf(k, i)) + '*'].concat(dayLines(d, st <= 0), [''], foot).join('\n');
}
function waLink(text, cls, label){
  return '<a class="' + cls + '" href="https://wa.me/?text=' + encodeURIComponent(text) + '" target="_blank" rel="noopener">' + ICON.chat + label + '</a>';
}
function summaryHTML(){
  var k = S.wk, s = weekStats(k), h = '<section class="wsum" aria-labelledby="wsum-t"><h3 id="wsum-t">' + (k === CUR ? 'Esta semana' : weekLabel(k).name) + '</h3>';
  if (s && s.done) h += '<p>Media de <b>' + s.done.avg + ' g</b> de proteína al día en ' + (s.done.n === 1 ? '1 día' : s.done.n + ' días') + ' · <b>' + s.done.ok + ' de ' + s.done.n + '</b> en la meta.</p>';
  if (s && s.plan) h += '<p class="wsum-plan">' + (s.done ? 'Lo que queda del plan' : 'El plan') + ' da una media de ' + s.plan.avg + ' g al día.</p>';
  if (!s || (!s.done && !s.plan)) h += '<p class="wsum-plan">No hay nada apuntado esta semana.</p>';
  h += trendHTML();
  var any = wk().days.some(function(d){ return d.items.length; }), acts = '';
  if (k >= CUR) acts += '<button type="button" class="btn primary" data-menushop>' + ICON.cart + (k === CUR ? 'Añadir de hoy al domingo a la compra' : 'Añadir la semana a la compra') + '</button>';
  if (any) acts += waLink(menuText(k), 'btn wa-menu', 'Enviar el menú por WhatsApp');
  if (k >= CUR) acts += '<button type="button" class="btn" data-newmenu>' + ICON.dice + (k === CUR ? 'Proponer otro menú de hoy al domingo' : 'Proponer otro menú para esa semana') + '</button>';
  if (acts) h += '<div class="wsum-acts">' + acts + '</div>';
  return h + '</section>';
}
function renderMenu(o){
  o = o || {};
  var k = S.wk, d = curDay(), st = when(k, S.day), rel = dayRel(k, S.day), onToday = k === CUR && S.day === TODAY;
  var h = '<header class="mhead"><h2>Menú</h2>' + (onToday ? '' : '<button type="button" class="btn small" data-today>Ir a hoy</button>') + '</header>';
  h += weekHTML();
  if (onToday) h += reviewHTML();
  h += '<section class="dayview' + (o.dir ? (o.dir > 0 ? ' slide-next' : ' slide-prev') : '') + '" aria-labelledby="day-title">';
  h += '<div class="day-top"><h3 id="day-title">' + DIAS[S.day] + ' <span>' + fmtDate(dateOf(k, S.day)) + '</span></h3>' +
    (rel ? '<span class="tag' + (st > 0 ? ' tag-plan' : st === 0 ? ' tag-hoy' : '') + '">' + rel + '</span>' : '') + '</div>';
  if (!S.menu.seen) h += '<p class="day-hint">Toca un plato para cambiarlo, ajustar la porción o quitarlo. Desliza a los lados para cambiar de día.</p>';
  else if (st === 0 && !S.menu.tk && d.items.length) h += '<p class="day-hint">Toca el círculo de cada plato cuando ya se haya comido. Solo cuenta lo marcado.</p>';
  var pk = k + '|' + S.day, nowPr = (st > 0 ? dayTot(d) : eatTot(d)).pr, party = st === 0 && seenPr[pk] != null && seenPr[pk] < GOAL && nowPr >= GOAL;
  seenPr[pk] = nowPr;
  h += statusHTML(d, st, party);
  SLOT_KEYS.forEach(function(sk){
    var rows = '';
    d.items.forEach(function(it, i){ if (it.s === sk) rows += itemRow(it, i, st, o.just === i); });
    h += '<div class="grp' + (o.slot === sk ? ' flash' : '') + '"><div class="grp-h"><span class="grp-l">' + SLOT_LABEL[sk] + '</span>' +
      (SLOT_TIME[sk] ? '<span class="grp-t">' + SLOT_TIME[sk] + '</span>' : '') +
      '<button type="button" class="grp-add" data-add="' + sk + '" aria-label="Añadir a ' + SLOT_LABEL[sk].toLowerCase() + '">+ Añadir</button></div>' +
      (rows ? '<ul class="items">' + rows + '</ul>' : '<p class="grp-empty">Nada apuntado</p>') + '</div>';
  });
  var p = prevDay(), yest = p && Math.round((dateOf(k, S.day) - NOW) / 864e5) === 0;
  var ic = function(i){ return '<span class="db-ic" aria-hidden="true">' + i + '</span>'; };
  h += '<div class="day-tools">' +
    (p && p.d.items.length ? '<button type="button" class="daybtn" data-sameprev>' + ic(ICON.copy) + '<span>' + (yest ? 'Igual que ayer' : 'Igual que el ' + DIAS[p.i].toLowerCase()) + '</span></button>' : '') +
    (st >= 0 ? '<button type="button" class="daybtn" data-dayrandom>' + ic(ICON.dice) + '<span>Otro día al azar</span></button>' : '') +
    (d.items.length ? '<a class="daybtn wa-day" href="https://wa.me/?text=' + encodeURIComponent(dayText(k, S.day)) + '" target="_blank" rel="noopener">' + ic(ICON.chat) + '<span>Enviar por WhatsApp</span></a>' : '') +
    (d.items.length ? '<button type="button" class="daybtn daybtn-del" data-dayclear>' + ic(ICON.trash) + '<span>Vaciar el día</span></button>' : '') + '</div></section>';
  h += summaryHTML();
  $('#v-menu').innerHTML = h;
  if (party) toast('¡Meta de proteína cumplida!');
  return party;
}
function randomFor(it, d){
  var pool = poolFor(it.s === 's1' || it.s === 's2' ? 's' : it.s);
  var inDay = d.items.map(function(x){ return x.id; });
  var usedMains = it.s === 'm' ? mainsOf(wk()) : [];
  var c = pool.filter(function(id){ return id !== it.id && inDay.indexOf(id) < 0 && usedMains.indexOf(id) < 0; });
  if (!c.length) c = pool.filter(function(id){ return id !== it.id; });
  return pick(c);
}
function undoDay(){
  var k = S.wk, i = S.day, before = clone(curDay().items);
  return function(){ ensureWeek(k).days[i].items = before; S.wk = k; S.day = i; save(); renderMenu(); };
}
function menuToShop(k){
  k = k || CUR;
  var w = ensureWeek(k), c = {};
  var dishes = {};
  w.days.forEach(function(d, i){
    if (when(k, i) < 0) return;
    d.items.forEach(function(it){
      if (it.e) return;
      if (it.id) c[it.id] = (c[it.id] || 0) + it.f;
      else if (it.ing) { var dk = it.n + JSON.stringify(it.ing); if (dishes[dk]) dishes[dk].f += it.f; else dishes[dk] = {n: it.n, ing: clone(it.ing), f: it.f}; }
    });
  });
  if (!Object.keys(c).length && !Object.keys(dishes).length) { toast('No quedan platos en el menú de esta semana'); return; }
  S.shop.dishes = Object.keys(dishes).map(function(dk){ return dishes[dk]; });
  S.shop.entries = S.shop.entries.filter(function(e){ return !e.m; });
  Object.keys(c).forEach(function(id){ S.shop.entries.push({id: id, f: Math.ceil(c[id] / byId[id].s - 1e-9), m: true}); });
  save(); updateShopCount();
  toast(k === CUR ? 'Menú de hoy al domingo añadido a la compra' : 'Menú de esa semana añadido a la compra');
}
function goDay(k, i, dir){ S.wk = k; S.day = i; renderMenu({dir: dir}); }
function moveDay(delta){
  var i = S.day + delta, k = S.wk;
  if (i < 0) { if (!canPrev()) return false; k = weekShift(k, -1); i = 6; }
  else if (i > 6) { if (!canNext()) return false; k = weekShift(k, 1); i = 0; }
  goDay(k, i, delta);
  return true;
}
function changeWeek(n){
  if (n < 0 ? !canPrev() : !canNext()) return;
  var k = weekShift(S.wk, n);
  S.wk = k; if (k === CUR) S.day = TODAY;
  renderMenu();
}
$('#v-menu').addEventListener('click', function(e){
  var t = e.target.closest('button');
  if (!t) return;
  if (t.hasAttribute('data-day')) {
    var nd = Number(t.getAttribute('data-day')), dir = nd - S.day;
    goDay(S.wk, nd, dir);
    var b = document.querySelector('[data-day="' + S.day + '"]'); if (b) b.focus({preventScroll: true});
    return;
  }
  if (t.hasAttribute('data-wprev') || t.hasAttribute('data-wnext')) {
    changeWeek(t.hasAttribute('data-wprev') ? -1 : 1);
    var nb = document.querySelector(t.hasAttribute('data-wprev') ? '[data-wprev]' : '[data-wnext]'); if (nb && !nb.disabled) nb.focus({preventScroll: true});
    return;
  }
  if (t.hasAttribute('data-today')) { goDay(CUR, TODAY, 0); return; }
  if (t.hasAttribute('data-gowk')) { var gk = t.getAttribute('data-gowk'); goDay(gk, gk === CUR ? TODAY : 0, 0); window.scrollTo({top: 0, behavior: 'smooth'}); return; }
  if (t.hasAttribute('data-eat')) { tickItem(Number(t.getAttribute('data-eat'))); return; }
  if (t.hasAttribute('data-review')) { review(t.getAttribute('data-review')); return; }
  if (t.hasAttribute('data-item')) { openPicker({mode: 'item', idx: Number(t.getAttribute('data-item'))}); return; }
  if (t.hasAttribute('data-add')) { openPicker({mode: 'add', slot: t.getAttribute('data-add')}); return; }
  if (t.hasAttribute('data-suggest')) {
    var q = RAPIDOS[Number(t.getAttribute('data-suggest'))], nq = {s: 's2', n: q.n, pr: q.pr, ch: q.ch, kc: q.kc, f: 1};
    curDay().items.push(nq); remember(nq);
    save(); renderMenu({slot: 's2'}); toast('Añadido: ' + q.n); return;
  }
  if (t.hasAttribute('data-sameprev')) {
    var p = prevDay(), u1 = undoDay(), yest = Math.round((dateOf(S.wk, S.day) - NOW) / 864e5) === 0, past = when(S.wk, S.day) < 0;
    /* copiado a un día pasado es un registro (comido); a hoy o más adelante es plan */
    curDay().items = clone(p.d.items).map(function(x){ if (past) x.e = 1; else delete x.e; return x; });
    save(); renderMenu();
    toast(yest ? 'Copiado de ayer' : 'Copiado del ' + DIAS[p.i].toLowerCase(), 'Deshacer', u1); return;
  }
  if (t.hasAttribute('data-dayrandom')) {
    var u2 = undoDay();
    wk().days[S.day] = genDay(S.day); save(); renderMenu();
    toast('Día nuevo propuesto', 'Deshacer', u2); return;
  }
  if (t.hasAttribute('data-dayclear')) {
    var u3 = undoDay();
    curDay().items = []; save(); renderMenu();
    toast('Día vaciado', 'Deshacer', u3); return;
  }
  if (t.hasAttribute('data-newmenu')) {
    var k = S.wk, w = wk(), before = clone(w.days), from = k === CUR ? TODAY : 0;
    var fresh = genWeek(from, mainsOf(S.menu.weeks[weekShift(k, -1)]));
    for (var i = from; i < 7; i++) w.days[i] = keepEaten(w.days[i], fresh.days[i]);
    save(); renderMenu();
    toast(k === CUR ? 'Menú nuevo de hoy al domingo' : 'Menú nuevo para esa semana', 'Deshacer', function(){ ensureWeek(k).days = before; S.wk = k; save(); renderMenu(); });
    return;
  }
  if (t.hasAttribute('data-menushop')) { menuToShop(S.wk); }
});
$('#v-menu').addEventListener('keydown', function(e){
  if (!e.target.classList.contains('wk') || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
  e.preventDefault();
  if (moveDay(e.key === 'ArrowLeft' ? -1 : 1)) { var b = document.querySelector('[data-day="' + S.day + '"]'); if (b) b.focus({preventScroll: true}); }
});
var swipe = null;
$('#v-menu').addEventListener('touchstart', function(e){
  swipe = e.touches.length === 1 && e.target.closest('.dayview') ? {x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now()} : null;
}, {passive: true});
$('#v-menu').addEventListener('touchend', function(e){
  if (!swipe) return;
  var c = e.changedTouches[0], dx = c.clientX - swipe.x, dy = c.clientY - swipe.y, quick = Date.now() - swipe.t < 700;
  swipe = null;
  if (quick && Math.abs(dx) > 60 && Math.abs(dy) < Math.abs(dx) * 0.6) moveDay(dx < 0 ? 1 : -1);
}, {passive: true});
document.addEventListener('visibilitychange', function(){
  if (document.hidden) return;
  var before = CUR + '|' + TODAY;
  setNow();
  if (CUR + '|' + TODAY === before) return;
  S.wk = CUR; S.day = TODAY; ensureWeek(CUR); save();
  if (S.tab === 'menu') renderMenu();
});

/* ---------- selector del menú: añadir, cambiar, porciones, mover, copiar, quitar ---------- */
var picker = $('#picker'), ppanel = $('#picker-panel');
var PK = {mode: 'add', slot: 'p', idx: -1, tab: 'recetas', q: '', copy: false, all: false, prot: null, lastFocus: null};
function newBuild(){ return {n: '', ing: [], q: '', nums: false}; }
PK.bd = newBuild();
var SEARCH_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg>';
var SLOT_TYPES = {p: ['primera'], s1: ['snack'], s2: ['snack'], m: ['fuerte', 'fria', 'sopa']};
var SLOT_PLURAL = {p: 'primeras comidas', s1: 'snacks y meriendas', s2: 'snacks y meriendas', m: 'comidas principales'};
function fitsSlot(r){ return SLOT_TYPES[PK.slot].indexOf(r.t) >= 0; }
function recentFits(x){
  var g = slotGroup(PK.slot);
  if (x.id && fitsSlot(byId[x.id])) return true;
  return x.s ? x.s === g : !x.id;
}
function firstTab(){ return S.menu.recent.some(recentFits) ? 'recientes' : 'recetas'; }
function cap(t){ return t.charAt(0).toUpperCase() + t.slice(1); }
function openPicker(o){
  if (picker.hidden) PK.lastFocus = document.activeElement;
  PK.mode = o.mode; PK.idx = o.idx != null ? o.idx : -1; PK.copy = false; PK.q = ''; PK.all = false; PK.prot = null; PK.bd = newBuild();
  PK.slot = o.slot || (PK.idx >= 0 ? curDay().items[PK.idx].s : 'p');
  PK.tab = o.tab || firstTab();
  if (!S.menu.seen) { S.menu.seen = true; save(); var hn = $('.day-hint'); if (hn) hn.remove(); }
  renderPicker();
  picker.hidden = false;
  document.documentElement.classList.add('locked');
  ppanel.scrollTop = 0;
  ppanel.focus({preventScroll: true});
}
function closePicker(){
  picker.hidden = true;
  if (sheet.hidden) document.documentElement.classList.remove('locked');
  if (PK.lastFocus && document.body.contains(PK.lastFocus)) PK.lastFocus.focus({preventScroll: true});
}
function slotRank(r){
  var want = PK.slot === 'p' ? ['primera'] : PK.slot === 'm' ? ['fuerte', 'fria', 'sopa'] : ['snack'];
  return want.indexOf(r.t) >= 0 ? 0 : r.t === 'base' ? 2 : 1;
}
function recipeList(list){
  return '<ul class="pk-list">' + list.map(function(r){
    return '<li><button type="button" data-pick="' + r.id + '"><span class="pk-n">' + esc(r.n) + '</span><span class="pk-m">' + macLine(r) + ' · ' + TIPO[r.t].toLowerCase() + '</span></button></li>';
  }).join('') + '</ul>';
}
function allToggle(){
  return '<button type="button" class="linkbtn pk-all" data-pkall>' + (PK.all ? 'Ver solo ' + SLOT_PLURAL[PK.slot] : 'Ver todas las recetas') + '</button>';
}
function recipeResults(){
  var words = norm(PK.q.trim()).split(/\s+/).filter(Boolean), q = esc(PK.q.trim());
  var match = R.filter(function(r){
    if (!words.length) return true;
    var hay = norm(r.n + ' ' + r.d);
    return words.every(function(w){ return hay.indexOf(w) >= 0; });
  });
  if (PK.all) {
    match.sort(function(a, b){ return slotRank(a) - slotRank(b); });
    return '<p class="pk-sub">Todas las recetas · ' + match.length + '</p>' +
      (match.length ? recipeList(match) : '<p class="muted pk-note">Ninguna receta con «' + q + '». Puedes apuntarlo en «A mano».</p>') + allToggle();
  }
  var inSlot = match.filter(fitsSlot), h = '';
  var prots = PROTS.filter(function(p){ return inSlot.some(function(r){ return r.p === p[0]; }); });
  if (PK.prot && !prots.some(function(p){ return p[0] === PK.prot; })) PK.prot = null;
  var list = PK.prot ? inSlot.filter(function(r){ return r.p === PK.prot; }) : inSlot;
  h += '<p class="pk-sub">' + cap(SLOT_PLURAL[PK.slot]) + ' · ' + list.length + '</p>';
  if (inSlot.length > 12 && prots.length > 1) {
    h += '<div class="pk-chips" role="group" aria-label="Filtrar por proteína">' +
      '<button type="button" class="chip" data-pkprot="" aria-pressed="' + !PK.prot + '">Todas</button>' +
      prots.map(function(p){ return '<button type="button" class="chip" data-pkprot="' + p[0] + '" aria-pressed="' + (PK.prot === p[0]) + '">' + p[1] + '</button>'; }).join('') + '</div>';
  }
  if (list.length) h += recipeList(list);
  else {
    var others = match.filter(function(r){ return !fitsSlot(r); });
    h += '<p class="muted pk-note">No hay ' + SLOT_PLURAL[PK.slot] + ' con «' + q + '».' + (others.length ? '' : ' Puedes apuntarlo en «A mano».') + '</p>';
    if (others.length) return h + '<p class="pk-sub">En otras recetas</p>' + recipeList(others.sort(function(a, b){ return slotRank(a) - slotRank(b); }));
  }
  return h + allToggle();
}
function recentHTML(){
  var list = S.menu.recent, fit = [], other = [];
  if (!list.length) return '<p class="muted pk-note">Aquí aparece lo que vayas añadiendo, para repetirlo con un toque.</p>';
  list.forEach(function(x, k){ (recentFits(x) ? fit : other).push(k); });
  function rows(ks){
    return '<ul class="pk-list">' + ks.map(function(k){
      var x = list[k], f = food(x);
      return '<li class="pk-rec"><button type="button" data-recent="' + k + '"><span class="pk-n">' + esc(f.n) + '</span><span class="pk-m">' + macLine(f) + (x.id ? ' · ' + TIPO[f.t].toLowerCase() : '') + '</span></button>' +
        '<button type="button" class="pk-x" data-rmrecent="' + k + '" aria-label="Quitar ' + esc(f.n) + ' de recientes">' + ICON.x + '</button></li>';
    }).join('') + '</ul>';
  }
  var h = fit.length ? '<p class="muted pk-note">Lo último que has añadido en ' + SLOT_PLURAL[PK.slot] + '. Toca para repetirlo.</p>' + rows(fit)
    : '<p class="muted pk-note">Todavía no hay nada reciente en ' + SLOT_PLURAL[PK.slot] + '.</p>';
  if (other.length) h += PK.all ? '<p class="pk-sub">De otras comidas</p>' + rows(other) + '<button type="button" class="linkbtn pk-all" data-pkall>Ver solo ' + SLOT_PLURAL[PK.slot] + '</button>'
    : '<button type="button" class="linkbtn pk-all" data-pkall>Ver también de otras comidas (' + other.length + ')</button>';
  return h;
}
/* ---------- armar un plato con ingredientes ---------- */
function r1(v){ return String(Math.round(v * 10) / 10).replace('.', ','); }
function qtyIn(v){ return String(Math.round(v * 100) / 100).replace('.', ','); }
function ingText(g){
  var x = FOOD[g[0]], u = unitOf(x, g[2]), q = fmtNum(g[1]);
  if (u[0] === 'huevo' || u[0] === 'clara') return q + ' ' + (g[1] > 1 ? u[2] : u[0]);
  return q + ' ' + (u[0] === 'g' || u[0] === 'ml' ? u[0] : g[1] > 1 ? u[2] : u[0]) + ' de ' + shortName(x).toLowerCase();
}
function autoName(ing){
  var parts = ing.map(function(g){
    var x = FOOD[g[0]], u = g[2];
    if ((u === 'huevo' || u === 'clara') && g[1] >= 2) return fmtNum(g[1]) + ' ' + unitOf(x, u)[2];
    return shortName(x).toLowerCase();
  });
  var t = parts.length > 1 ? parts.slice(0, -1).join(', ') + ' y ' + parts[parts.length - 1] : parts[0];
  return t.charAt(0).toUpperCase() + t.slice(1);
}
function bdTotals(){
  var t = {pr: 0, ch: 0, kc: 0};
  PK.bd.ing.forEach(function(g){ var m = ingMac(g); t.pr += m.pr; t.ch += m.ch; t.kc += m.kc; });
  return t;
}
function bdTotHTML(){
  if (!PK.bd.ing.length) return '<span class="bd-hint">El total aparece aquí al añadir ingredientes</span>';
  var t = bdTotals();
  return '<span><b>' + Math.round(t.pr) + ' g</b> proteína</span><span><b>' + Math.round(t.ch) + ' g</b> carbos</span><span><b>' + fmtKc(Math.round(t.kc / 10) * 10) + '</b> kcal</span>';
}
function bdStep(g){
  if (g[2] === 'g' || g[2] === 'ml') return g[1] < 30 ? 5 : 10;
  return g[1] % 1 || g[1] < 1 || FOOD[g[0]].d[0] < 1 ? 0.5 : 1;
}
function bdRowsHTML(){
  if (!PK.bd.ing.length) return '<p class="muted bd-empty">Busca cada ingrediente abajo y ponle la cantidad. La app suma sola la proteína, los carbos y las calorías.</p>';
  return '<ul class="bd-list">' + PK.bd.ing.map(function(g, i){
    var x = FOOD[g[0]], us = unitsOf(x);
    return '<li class="bd-row"><div class="bd-top"><span class="bd-n">' + esc(x.n) + '</span>' +
      '<span class="bd-m" id="bd-m' + i + '">' + Math.round(ingMac(g).pr) + ' g prot</span>' +
      '<button type="button" class="bd-x" data-bdrm="' + i + '" aria-label="Quitar ' + esc(x.n) + '">' + ICON.x + '</button></div>' +
      '<div class="bd-ctl"><div class="stepper"><button type="button" data-bdstep="' + i + '" data-d="-1" aria-label="Menos ' + esc(shortName(x)) + '">−</button>' +
      '<input class="bd-qty" data-bdq="' + i + '" type="text" inputmode="decimal" value="' + qtyIn(g[1]) + '" aria-label="Cantidad de ' + esc(shortName(x)) + '">' +
      '<button type="button" data-bdstep="' + i + '" data-d="1" aria-label="Más ' + esc(shortName(x)) + '">+</button></div>' +
      (us.length > 1 ? '<select class="bd-unit" data-bdu="' + i + '" aria-label="Medida de ' + esc(shortName(x)) + '">' + us.map(function(u){
        return '<option value="' + u[0] + '"' + (u[0] === g[2] ? ' selected' : '') + '>' + u[0] + (u[1] > 1 ? ' (' + fmtDec(u[1]) + ' ' + baseUnit(x) + ')' : '') + '</option>';
      }).join('') + '</select>' : '<span class="bd-u">' + g[2] + '</span>') + '</div></li>';
  }).join('') + '</ul>';
}
function perText(x){
  var u = x.u ? x.u[0] : null;
  if (u) { var k = u[1] / 100; return r1(x.p * k) + ' g prot · ' + r1(x.c * k) + ' g carb por ' + u[0]; }
  return r1(x.p) + ' g prot · ' + r1(x.c) + ' g carb por 100 ' + baseUnit(x);
}
function frequentFoods(){
  var cnt = {}, add = function(it){ (it.ing || []).forEach(function(g){ cnt[g[0]] = (cnt[g[0]] || 0) + 1; }); };
  S.menu.recent.forEach(add);
  Object.keys(S.menu.weeks).forEach(function(k){ S.menu.weeks[k].days.forEach(function(d){ d.items.forEach(add); }); });
  var have = PK.bd.ing.map(function(g){ return g[0]; });
  var ids = Object.keys(cnt).sort(function(a, b){ return cnt[b] - cnt[a]; });
  (typeof ALIMENTOS_TOP !== 'undefined' ? ALIMENTOS_TOP : []).forEach(function(id){ if (ids.indexOf(id) < 0) ids.push(id); });
  return ids.filter(function(id){ return FOOD[id] && have.indexOf(id) < 0; }).slice(0, 12);
}
function foodSearch(q){
  var words = norm(q.trim()).split(/\s+/).filter(Boolean);
  if (!words.length) return null;
  return FOODS.filter(function(x){ var hay = norm(x.n + ' ' + (x.a || '')); return words.every(function(w){ return hay.indexOf(w) >= 0; }); }).slice(0, 10);
}
function bdResultsHTML(){
  var list = foodSearch(PK.bd.q);
  if (!list) return '<p class="pk-sub bd-h">Los más usados</p><div class="bd-chips">' + frequentFoods().map(function(id){
    return '<button type="button" class="chip" data-bdadd="' + id + '">+ ' + esc(shortName(FOOD[id])) + '</button>';
  }).join('') + '</div>';
  if (!list.length) return '<p class="muted bd-note">No está en la lista. Prueba con otra palabra o usa «Solo sé los números».</p>';
  return '<ul class="pk-list">' + list.map(function(x){
    return '<li><button type="button" data-bdadd="' + x.id + '"><span class="pk-n">' + esc(x.n) + '</span><span class="pk-m">' + perText(x) + '</span></button></li>';
  }).join('') + '</ul>';
}
function numsFormHTML(){
  return '<form class="form" id="pk-form" novalidate>' +
    '<label for="pk-n">Qué comió<input id="pk-n" type="text" maxlength="60" placeholder="Ej.: pollo a la plancha del restaurante"></label>' +
    '<div class="grid3"><label for="pk-pr">Proteína (g)<input id="pk-pr" type="text" inputmode="decimal" placeholder="0"></label>' +
    '<label for="pk-ch">Carbos (g)<input id="pk-ch" type="text" inputmode="decimal" placeholder="0"></label>' +
    '<label for="pk-kc">Calorías<input id="pk-kc" type="text" inputmode="decimal" placeholder="opcional"></label></div>' +
    '<p class="muted">Para comidas de fuera. ¿No sabes la proteína? 100 g de pollo son unos 23 g, un huevo unos 7 g.</p>' +
    '<p class="form-err" id="pk-err" hidden></p>' +
    '<button type="submit" class="btn primary">' + (PK.mode === 'replace' ? 'Cambiar' : 'Añadir') + '</button>' +
    '<button type="button" class="linkbtn bd-alt" data-bdnums>Mejor armarlo con ingredientes</button></form>';
}
function builderHTML(){
  var b = PK.bd, edit = PK.mode === 'edit';
  if (b.nums && !edit) return numsFormHTML();
  return '<form class="form" id="pk-form" novalidate>' +
    '<label for="bd-n">Nombre del plato<input id="bd-n" type="text" maxlength="60" placeholder="Opcional. Ej.: tortilla de puerro" value="' + esc(b.n) + '"></label>' +
    '<div><p class="pk-sub bd-h">Ingredientes</p><div id="bd-rows">' + bdRowsHTML() + '</div></div>' +
    '<label class="search" for="bd-q"><span class="sr">Buscar un ingrediente</span>' + SEARCH_SVG +
      '<input id="bd-q" type="search" placeholder="Añade: huevo, pollo, queso…" autocomplete="off" enterkeyhint="done" value="' + esc(b.q) + '"></label>' +
    '<div id="bd-results">' + bdResultsHTML() + '</div>' +
    (edit ? '' : '<button type="button" class="linkbtn bd-alt" data-bdnums>Solo sé los números (comida de fuera)</button>') +
    '<p class="form-err" id="pk-err" hidden></p>' +
    '<div class="bd-foot"><p class="bd-tot" id="bd-tot" aria-live="polite">' + bdTotHTML() + '</p>' +
    '<button type="submit" class="btn primary">' + (edit ? 'Guardar cambios' : PK.mode === 'replace' ? 'Cambiar' : 'Añadir a ' + SLOT_LABEL[PK.slot].toLowerCase()) + '</button></div></form>';
}
function bdRefresh(focusSel){
  var r = $('#bd-rows'); if (r) r.innerHTML = bdRowsHTML();
  var q = $('#bd-results'); if (q) q.innerHTML = bdResultsHTML();
  var t = $('#bd-tot'); if (t) t.innerHTML = bdTotHTML();
  var er = $('#pk-err'); if (er) er.hidden = true;
  if (focusSel) { var f = ppanel.querySelector(focusSel); if (f) f.focus({preventScroll: true}); }
}
function bdAdd(id){
  var x = FOOD[id];
  if (!x) return;
  var at = PK.bd.ing.map(function(g){ return g[0]; }).indexOf(id);
  if (at < 0) { PK.bd.ing.push([id, x.d[0], x.d[1]]); at = PK.bd.ing.length - 1; }
  PK.bd.q = '';
  var qi = $('#bd-q'); if (qi) { qi.value = ''; qi.blur(); }
  bdRefresh();
  var row = ppanel.querySelectorAll('.bd-row')[at];
  if (row) { row.classList.add('flash-row'); row.scrollIntoView({block: 'nearest', behavior: 'smooth'}); }
}
function pkBtn(act, icon, label, extra){ return '<button type="button" class="btn pk-act" data-pk="' + act + '"' + (extra || '') + '>' + icon + label + '</button>'; }
function renderPicker(){
  var d = curDay(), it = PK.idx >= 0 ? d.items[PK.idx] : null;
  var h = '<div class="sheet-bar"><span></span><span class="grabber" aria-hidden="true"></span><button type="button" class="icon-btn" data-pk-close aria-label="Cerrar">' + ICON.close + '</button></div>';
  h += '<p class="kicker">' + SLOT_LABEL[PK.slot] + ' · ' + DIAS[S.day] + ' ' + fmtDate(dateOf(S.wk, S.day)) + '</p>';
  if (PK.mode === 'item' && it) {
    h += '<h2 id="pk-title" class="sheet-title">' + esc(itemName(it)) + '</h2><p class="lead">' + macLine(mac(it)) + '</p>';
    if (it.ing) h += '<p class="bd-sum">' + esc(it.ing.map(ingText).join(' · ')) + '</p>';
    h += '<div class="pk-row"><span class="label">Porciones</span><div class="stepper">' +
      '<button type="button" data-portion="-0.5" aria-label="Menos">−</button><output>' + fmtNum(it.f) + '</output>' +
      '<button type="button" data-portion="0.5" aria-label="Más">+</button></div></div>';
    h += '<div class="pk-slot"><span class="label">Comida</span><div class="seg seg4">' + SLOT_KEYS.map(function(sk){
      return '<button type="button" data-moveto="' + sk + '" aria-pressed="' + (it.s === sk) + '">' + SLOT_SHORT[sk] + '</button>';
    }).join('') + '</div></div>';
    h += '<div class="pk-grid">' +
      (when(S.wk, S.day) <= 0 ? pkBtn('comido', ICON.check, it.e ? 'Comido' : 'Marcar comido', ' aria-pressed="' + !!it.e + '"') : '') +
      (it.id ? pkBtn('ver', ICON.arrow, 'Ver receta') : '') +
      (it.ing ? pkBtn('editar', ICON.sliders, 'Ingredientes') : '') +
      pkBtn('cambiar', ICON.swap, 'Cambiar') +
      (it.id ? pkBtn('azar', ICON.dice, 'Otra al azar') : '') +
      pkBtn('copiar', ICON.copy, 'Copiar a…', ' aria-expanded="' + PK.copy + '"') + '</div>';
    if (PK.copy) h += '<div class="daychips">' + DIAS.map(function(n, k){
      return k === S.day ? '' : '<button type="button" class="chip" data-copyto="' + k + '">' + n.slice(0, 3) + ' ' + dateOf(S.wk, k).getDate() + '</button>';
    }).join('') + '</div>';
    h += '<button type="button" class="btn pk-del" data-pk="quitar">' + ICON.trash + 'Quitar de este día</button>';
  } else if (PK.mode === 'edit' && it) {
    h += '<h2 id="pk-title" class="sheet-title">Editar plato</h2>' + builderHTML();
  } else {
    h += '<h2 id="pk-title" class="sheet-title">' + (PK.mode === 'replace' && it ? 'Cambiar ' + esc(itemName(it)) : 'Añadir') + '</h2>';
    h += '<div class="seg seg4" role="tablist" aria-label="Qué añadir">' +
      [['recientes', 'Recientes'], ['recetas', 'Recetas'], ['rapidos', 'Rápidos'], ['mano', 'A mano']].map(function(tb){
        return '<button type="button" role="tab" data-pktab="' + tb[0] + '" aria-selected="' + (PK.tab === tb[0]) + '">' + tb[1] + '</button>';
      }).join('') + '</div>';
    if (PK.tab === 'recientes') h += recentHTML();
    else if (PK.tab === 'recetas') {
      h += '<label class="search" for="pk-q"><span class="sr">Buscar receta</span>' +
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg>' +
        '<input id="pk-q" type="search" placeholder="' + (PK.all ? 'Busca en todas las recetas…' : 'Busca en ' + SLOT_PLURAL[PK.slot] + '…') + '" autocomplete="off" value="' + esc(PK.q) + '"></label>' +
        '<div id="pk-results">' + recipeResults() + '</div>';
    } else if (PK.tab === 'rapidos') {
      var grp = function(g, title){
        return '<p class="pk-sub">' + title + '</p><ul class="pk-list">' + RAPIDOS.map(function(q, k){
          return q.g === g ? '<li><button type="button" data-quick="' + k + '"><span class="pk-n">' + esc(q.n) + '</span><span class="pk-m">' + macLine(q) + '</span></button></li>' : '';
        }).join('') + '</ul>';
      };
      h += grp('pro', 'Proteína rápida') + grp('otro', 'Otros') + grp('fuera', 'Fuera del plan (apúntalo igual)');
    } else h += builderHTML();
  }
  ppanel.innerHTML = h;
}
function putItem(newIt, label){
  var d = curDay();
  /* lo que se apunta a mano hoy o en un día pasado ya está comido; al cambiar un plato se conserva su marca */
  if (PK.mode === 'replace' && PK.idx >= 0) { newIt.s = d.items[PK.idx].s; if (d.items[PK.idx].e) newIt.e = 1; d.items[PK.idx] = newIt; toast('Cambiado por: ' + label); }
  else { newIt.s = PK.slot; if (when(S.wk, S.day) <= 0) newIt.e = 1; d.items.push(newIt); toast('Añadido: ' + label); }
  remember(newIt);
  save(); closePicker(); renderMenu({slot: newIt.s});
}
ppanel.addEventListener('input', function(e){
  var t = e.target, er = $('#pk-err');
  if (t.id === 'pk-q') { PK.q = t.value; $('#pk-results').innerHTML = recipeResults(); }
  if (t.id === 'pk-n' || t.id === 'bd-n') { if (er) er.hidden = true; }
  if (t.id === 'bd-n') PK.bd.n = t.value;
  if (t.id === 'bd-q') { PK.bd.q = t.value; $('#bd-results').innerHTML = bdResultsHTML(); }
  if (t.hasAttribute('data-bdq')) {
    var i = Number(t.getAttribute('data-bdq')), v = num(t.value), g = PK.bd.ing[i];
    if (g && v > 0) { g[1] = Math.min(5000, v); $('#bd-m' + i).textContent = Math.round(ingMac(g).pr) + ' g prot'; $('#bd-tot').innerHTML = bdTotHTML(); }
  }
});
ppanel.addEventListener('change', function(e){
  var t = e.target;
  if (t.hasAttribute('data-bdq')) { bdRefresh(); return; }
  if (t.hasAttribute('data-bdu')) {
    var i = Number(t.getAttribute('data-bdu')), g = PK.bd.ing[i], x = FOOD[g[0]], grams = g[1] * unitOf(x, g[2])[1], nu = unitOf(x, t.value);
    var q = grams / nu[1];
    g[1] = nu[1] === 1 ? Math.max(5, Math.round(q / 5) * 5) : Math.max(0.5, Math.round(q * 2) / 2);
    g[2] = t.value;
    bdRefresh('[data-bdu="' + i + '"]');
  }
});
ppanel.addEventListener('keydown', function(e){
  if (e.target.id !== 'bd-q' || e.key !== 'Enter') return;
  e.preventDefault();
  var list = foodSearch(PK.bd.q);
  if (list && list.length) bdAdd(list[0].id); else e.target.blur();
});
ppanel.addEventListener('submit', function(e){
  if (e.target.id !== 'pk-form') return;
  e.preventDefault();
  var er = $('#pk-err');
  if (PK.bd.nums && PK.mode !== 'edit') {
    var n = $('#pk-n').value.trim();
    if (!n) { er.textContent = 'Escribe qué comió.'; er.hidden = false; $('#pk-n').focus(); return; }
    putItem({n: n.slice(0, 60), pr: num($('#pk-pr').value), ch: num($('#pk-ch').value), kc: num($('#pk-kc').value), f: 1}, n);
    return;
  }
  if (!PK.bd.ing.length) { er.textContent = 'Añade al menos un ingrediente.'; er.hidden = false; $('#bd-q').focus(); return; }
  var tt = bdTotals(), name = (PK.bd.n.trim() || autoName(PK.bd.ing)).slice(0, 60);
  var nw = {n: name, pr: Math.round(tt.pr * 10) / 10, ch: Math.round(tt.ch * 10) / 10, kc: Math.round(tt.kc), ing: clone(PK.bd.ing), f: 1};
  if (PK.mode === 'edit') {
    var d = curDay(), old = d.items[PK.idx], ok = foodKey(old);
    nw.s = old.s; nw.f = old.f; if (old.e) nw.e = 1; d.items[PK.idx] = nw;
    S.menu.recent = S.menu.recent.filter(function(x){ return foodKey(x) !== ok; });
    remember(nw);
    save(); closePicker(); renderMenu({slot: nw.s}); toast('Guardado: ' + name);
    return;
  }
  putItem(nw, name);
});
ppanel.addEventListener('click', function(e){
  var t = e.target.closest('button');
  if (!t) return;
  var d = curDay(), it = PK.idx >= 0 ? d.items[PK.idx] : null;
  if (t.hasAttribute('data-pk-close')) { closePicker(); return; }
  if (t.hasAttribute('data-bdadd')) { bdAdd(t.getAttribute('data-bdadd')); return; }
  if (t.hasAttribute('data-bdrm')) { PK.bd.ing.splice(Number(t.getAttribute('data-bdrm')), 1); bdRefresh('#bd-q'); return; }
  if (t.hasAttribute('data-bdstep')) {
    var bi = Number(t.getAttribute('data-bdstep')), bg = PK.bd.ing[bi], st = bdStep(bg), dv = Number(t.getAttribute('data-d'));
    bg[1] = Math.max(st, Math.round((bg[1] + dv * st) * 100) / 100);
    bdRefresh('[data-bdstep="' + bi + '"][data-d="' + dv + '"]'); return;
  }
  if (t.hasAttribute('data-bdnums')) { PK.bd.nums = !PK.bd.nums; renderPicker(); var nb = ppanel.querySelector(PK.bd.nums ? '#pk-n' : '[data-bdnums]'); if (nb) nb.focus({preventScroll: true}); return; }
  if (t.hasAttribute('data-pkall')) { PK.all = !PK.all; PK.prot = null; renderPicker(); var ab = ppanel.querySelector('[data-pkall]'); if (ab) ab.focus({preventScroll: true}); return; }
  if (t.hasAttribute('data-pkprot')) { PK.prot = t.getAttribute('data-pkprot') || null; $('#pk-results').innerHTML = recipeResults(); var pc = ppanel.querySelector('[data-pkprot="' + (PK.prot || '') + '"]'); if (pc) pc.focus({preventScroll: true}); return; }
  if (t.hasAttribute('data-pktab')) { PK.tab = t.getAttribute('data-pktab'); PK.all = false; PK.prot = null; renderPicker(); var tb = ppanel.querySelector('[data-pktab="' + PK.tab + '"]'); if (tb) tb.focus({preventScroll: true}); return; }
  if (t.hasAttribute('data-pick')) { var r = byId[t.getAttribute('data-pick')]; putItem({id: r.id, f: 1}, r.n); return; }
  if (t.hasAttribute('data-quick')) { var q = RAPIDOS[Number(t.getAttribute('data-quick'))]; putItem({n: q.n, pr: q.pr, ch: q.ch, kc: q.kc, f: 1}, q.n); return; }
  if (t.hasAttribute('data-recent')) {
    var x = S.menu.recent[Number(t.getAttribute('data-recent'))];
    if (x) putItem(x.id ? {id: x.id, f: 1} : Object.assign(cleanFood(x), {f: 1}), food(x).n);
    return;
  }
  if (t.hasAttribute('data-rmrecent')) {
    var rk = Number(t.getAttribute('data-rmrecent')), sc = ppanel.scrollTop;
    S.menu.recent.splice(rk, 1); save(); renderPicker(); ppanel.scrollTop = sc;
    var nx = ppanel.querySelector('[data-rmrecent="' + Math.min(rk, S.menu.recent.length - 1) + '"]'); if (nx) nx.focus({preventScroll: true});
    return;
  }
  if (!it) return;
  if (t.hasAttribute('data-portion')) {
    it.f = Math.min(6, Math.max(0.5, it.f + Number(t.getAttribute('data-portion'))));
    save(); renderMenu(); renderPicker();
    var pb = ppanel.querySelector('[data-portion="' + t.getAttribute('data-portion') + '"]'); if (pb) pb.focus({preventScroll: true});
    return;
  }
  if (t.hasAttribute('data-moveto')) {
    it.s = PK.slot = t.getAttribute('data-moveto');
    save(); renderMenu({slot: it.s}); renderPicker();
    var mb = ppanel.querySelector('[data-moveto="' + it.s + '"]'); if (mb) mb.focus({preventScroll: true});
    return;
  }
  var act = t.getAttribute('data-pk');
  if (act === 'comido') { var ei = PK.idx; closePicker(); tickItem(ei); return; }
  if (act === 'ver') { var id = it.id; closePicker(); openRecipe(id); return; }
  if (act === 'cambiar') { PK.mode = 'replace'; PK.all = false; PK.prot = null; PK.bd = newBuild(); PK.tab = firstTab(); PK.q = ''; renderPicker(); ppanel.scrollTop = 0; return; }
  if (act === 'editar') { PK.mode = 'edit'; PK.bd = {n: it.n, ing: clone(it.ing), q: '', nums: false}; renderPicker(); ppanel.scrollTop = 0; return; }
  if (act === 'azar') { it.id = randomFor(it, d); save(); renderMenu({slot: it.s}); renderPicker(); toast('Cambiado por: ' + itemName(it)); return; }
  if (act === 'copiar') { PK.copy = !PK.copy; renderPicker(); var cb = ppanel.querySelector('[data-pk="copiar"]'); if (cb) cb.focus({preventScroll: true}); return; }
  if (t.hasAttribute('data-copyto')) {
    var k = Number(t.getAttribute('data-copyto')), cp = clone(it);
    if (when(S.wk, k) <= 0) cp.e = 1; else delete cp.e;
    wk().days[k].items.push(cp);
    save(); renderMenu(); toast('Copiado al ' + DIAS[k].toLowerCase() + ' ' + dateOf(S.wk, k).getDate()); return;
  }
  if (act === 'quitar') {
    var removed = d.items.splice(PK.idx, 1)[0], at = PK.idx, day = S.day, wkey = S.wk;
    save(); closePicker(); renderMenu();
    toast('Quitado: ' + itemName(removed), 'Deshacer', function(){ ensureWeek(wkey).days[day].items.splice(at, 0, removed); save(); renderMenu(); });
  }
});
picker.querySelector('.sheet-backdrop').addEventListener('click', closePicker);
document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && !picker.hidden) { e.stopImmediatePropagation(); closePicker(); } }, true);

/* ---------- lista de la compra ---------- */
var SKIP = {'agua': 1, 'sal': 1, 'sal y pimienta': 1, 'sal gorda': 1, 'sal gorda y pimienta': 1, 'pimienta negra': 1, 'cubitos de hielo': 1};
var CATS = [['p', 'Carne, pescado y embutido'], ['h', 'Huevos y lácteos'], ['v', 'Frutas y verduras'], ['d', 'Despensa']];
var COUNT_UNITS = ['', 'diente', 'loncha', 'hoja', 'lata', 'cazo', 'manojo', 'puñado', 'rama', 'trozo'];

function addToShop(id, f, fromMenu){
  f = Math.round(f * 100) / 100;
  var e = S.shop.entries.filter(function(x){ return x.id === id && !x.m; })[0];
  if (e && !fromMenu) e.f = Math.round((e.f + f) * 100) / 100;
  else S.shop.entries.push({id: id, f: f, m: !!fromMenu});
  save(); updateShopCount();
}
/* cómo se compra cada alimento de los platos armados a mano */
var FCAT = {};
[['p', 'pechuga pollo-cocinado contramuslo pavo pavo-fiambre jamon-york jamon-serrano cecina chorizo bacon ternera-picada ternera-filete entrecot cerdo-lomo cerdo-solomillo cerdo-picada cabra conejo cordero pollo-picado muslo-piel costilla-cerdo lomo-embuchado bonito sardina-fresca anchoas berberechos surimi salmon salmon-ahumado atun-fresco merluza pescado-blanco bacalao caballa langostinos pulpo calamar mejillones'],
 ['h', 'huevo clara queso-fresco queso-batido skyr yogur yogur-griego cottage queso-semi queso-cabra queso-curado queso-lonchas mozzarella queso-rallado parmesano queso-crema leche-entera leche-semi leche-desnatada kefir nata-cocinar nata-montar mantequilla requeson queso-cabra-fresco queso-blanco feta halloumi postre-proteico batido-listo gelatina tofu edamame'],
 ['v', 'puerro cebolla ajo tomate tomate-cherry pimiento-rojo pimiento-verde calabacin berenjena espinacas champinones brocoli coliflor judias esparragos lechuga pepino rabano apio acelgas berros endivia pak-choi brotes-soja coles-bruselas alcachofa chayota padron remolacha yuca zanahoria calabaza col aguacate papa batata platano kiwi ciruela melocoton albaricoque pera mandarina pomelo sandia melon tuno guayaba nispero parchita granada cerezas uvas higo caqui higo-pasado manzana naranja fresas frutos-rojos papaya pina mango'],
 ['e', 'aceite aceite-otros mayonesa mojo guasacaca salsa-soja ketchup mostaza sriracha azucar miel']
].forEach(function(g){ g[1].split(' ').forEach(function(id){ FCAT[id] = g[0]; }); });
var SHOP_NAME = {huevo: 'Huevos', clara: 'Claras de huevo', pechuga: 'Pechuga de pollo', 'pollo-cocinado': 'Pollo cocinado', contramuslo: 'Contramuslo de pollo deshuesado',
  'ternera-picada': 'Carne picada de ternera', 'ternera-filete': 'Filete de ternera', 'cerdo-picada': 'Carne picada de cerdo', salmon: 'Lomo de salmón', 'atun-fresco': 'Atún fresco',
  'atun-aceite': 'Atún en aceite de oliva', langostinos: 'Langostinos o gambas peladas', 'queso-fresco': 'Queso fresco', 'queso-batido': 'Queso fresco batido 0 %',
  'queso-cabra': 'Queso de cabra semicurado', 'queso-rallado': 'Queso rallado para gratinar', 'tomate-cherry': 'Tomates cherry', espinacas: 'Espinacas baby',
  champinones: 'Champiñones', esparragos: 'Espárragos trigueros', judias: 'Judías verdes', col: 'Col o repollo', 'frutos-rojos': 'Frambuesas o arándanos', whey: 'Proteína whey'};
var SHOP_UNIT = {huevo: '', unidad: '', yogur: '', bola: '', diente: 'diente', lata: 'lata', cazo: 'cazo', 'puñado': 'puñado'};
function shopItem(g, f){
  /* lo que se cuenta (huevos, tomates, latas) va por unidades aunque el plato esté en gramos; lo demás, en gramos o ml */
  var x = FOOD[g[0]], first = x.u ? x.u[0] : null, grams = g[1] * f * unitOf(x, g[2])[1], unit = baseUnit(x), q = grams;
  if (x.id === 'clara') unit = 'ml';
  else if (first && SHOP_UNIT[first[0]] != null) { unit = SHOP_UNIT[first[0]]; q = grams / first[1]; }
  return {n: SHOP_NAME[x.id] || shortName(x), u: unit, c: FCAT[x.id] || 'd', q: q};
}
function ownKey(t){ return 'o|' + norm(t); }
function shopData(){
  var map = {}, basics = {}, refs = {};
  S.shop.dishes.forEach(function(d){
    d.ing.forEach(function(g){
      var x = shopItem(g, d.f);
      if (x.c === 'e') { basics['e|' + norm(x.n)] = x.n; return; }
      var k = norm(x.n) + '|' + x.u, it = map[k] || (map[k] = {k: k, n: x.n, u: x.u, c: x.c, q: 0, from: []});
      it.q += x.q;
      if (it.from.indexOf(d.n) < 0) it.from.push(d.n);
    });
  });
  S.shop.entries.forEach(function(e){
    var r = byId[e.id];
    r.i.forEach(function(x){
      var q = x[0], u = x[1], n = x[2], c = x[3];
      if (c === 'r') { refs[x[5]] = 1; return; }
      if (c === 'e') { if (!SKIP[norm(n)]) basics['e|' + norm(n)] = n; return; }
      var k = norm(n) + '|' + u, it = map[k] || (map[k] = {k: k, n: n, u: u, c: c, q: 0, from: []});
      if (q != null) it.q += q * e.f;
      if (it.from.indexOf(r.n) < 0) it.from.push(r.n);
    });
  });
  var items = Object.keys(map).map(function(k){ return map[k]; });
  return {items: items, basics: basics, refs: Object.keys(refs)};
}
function shopQty(it){
  var q = it.q, u = it.u;
  if (!q) return '';
  if (COUNT_UNITS.indexOf(u) >= 0) {
    q = Math.ceil(q - 1e-9);
    var s = qtyText(q, u);
    if (it.n === 'Ajo' && q >= 6) { var c = Math.ceil(q / 10); s += c === 1 ? ' (1 cabeza)' : ' (unas ' + c + ' cabezas)'; }
    return s;
  }
  if (u === 'g' || u === 'ml') return qtyText(q < 100 ? Math.ceil(q / 10) * 10 : Math.ceil(q / 50) * 50, u);
  return qtyText(Math.ceil(q * 2) / 2, u);
}
function byName(a, b){ return a.n.localeCompare(b.n, 'es'); }
function shopText(){
  var d = shopData(), lines = ['Lista de la compra (La Cocina de Nene)', ''];
  CATS.forEach(function(c){
    var its = d.items.filter(function(it){ return it.c === c[0] && !S.shop.checked[it.k]; }).sort(byName);
    if (!its.length) return;
    lines.push(c[1].toUpperCase());
    its.forEach(function(it){ var q = shopQty(it); lines.push('• ' + it.n + (q ? ': ' + q : '')); });
    lines.push('');
  });
  var own = S.shop.own.filter(function(t){ return !S.shop.checked[ownKey(t)]; });
  if (own.length) { lines.push('OTRAS COSAS'); own.forEach(function(t){ lines.push('• ' + t); }); lines.push(''); }
  var bk = Object.keys(d.basics).filter(function(k){ return !S.shop.checked[k]; });
  if (bk.length) { lines.push('REVISA QUE HAYA EN CASA'); bk.sort().forEach(function(k){ lines.push('• ' + d.basics[k]); }); }
  return lines.join('\n').trim();
}
function pendingCount(){
  var d = shopData();
  return d.items.filter(function(it){ return !S.shop.checked[it.k]; }).length + S.shop.own.filter(function(t){ return !S.shop.checked[ownKey(t)]; }).length;
}
function updateShopCount(){
  var n = pendingCount(), b = $('#shop-count');
  b.textContent = n; b.hidden = !n;
}
function shopRow(key, name, sub, qty){
  var on = !!S.shop.checked[key];
  return '<li><button type="button" class="ing" data-check="' + esc(key) + '" aria-pressed="' + on + '"><span class="tick" aria-hidden="true">' + ICON.check + '</span>' +
    '<span class="ing-n">' + esc(name) + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</span>' +
    (qty ? '<span class="ing-q">' + esc(qty) + '</span>' : '') + '</button></li>';
}
function ownFormHTML(){
  return '<form class="shop-add" id="shop-add"><label class="sr" for="shop-own">Añadir otra cosa a la lista</label>' +
    '<input id="shop-own" type="text" maxlength="60" placeholder="Añade algo más a la lista" autocomplete="off" enterkeyhint="done">' +
    '<button type="submit" class="btn" aria-label="Añadir a la lista">' + ICON.plus + '</button></form>';
}
function renderShop(){
  var v = $('#v-compra'), d = shopData(), own = S.shop.own;
  var h = '<header class="view-head"><h2>Lista de la compra</h2>';
  if (!S.shop.entries.length && !S.shop.dishes.length && !own.length) {
    v.innerHTML = h + '<p>Añade una receta desde su ficha, el menú de la semana o cualquier otra cosa que haga falta.</p></header>' + ownFormHTML() +
      '<div class="empty"><img class="empty-egg" src="mascota.png" alt="" width="420" height="372"><p>La lista está vacía.</p><button type="button" class="btn primary" data-menushop>' + ICON.cart + 'Añadir el menú de hoy al domingo</button></div>';
    return;
  }
  var total = d.items.length + own.length, pend = pendingCount();
  h += '<p>' + (total === 1 ? '1 producto' : total + ' productos') + ' · ' + (pend ? pend + ' por comprar' : 'todo comprado') + '. Toca un producto para tacharlo.</p></header>';
  h += '<div class="toolbar"><button type="button" class="btn" data-copy>' + ICON.copy + 'Copiar</button>' +
    '<a class="btn" data-wa href="https://wa.me/?text=' + encodeURIComponent(shopText()) + '" target="_blank" rel="noopener">' + ICON.chat + 'Enviar por WhatsApp</a>' +
    '<button type="button" class="btn danger" data-clear>' + ICON.trash + 'Vaciar</button></div>';
  h += ownFormHTML();
  var ne = S.shop.entries.length + S.shop.dishes.length;
  if (ne) h += '<details class="shop-recs"' + (S.recsOpen ? ' open' : '') + '><summary>' + (ne === 1 ? '1 plato en la lista' : ne + ' platos en la lista') + '</summary><div class="fchips">' + S.shop.entries.map(function(e, k){
    var r = byId[e.id], sv = Math.round(e.f * r.s * 100) / 100;
    return '<span class="rec-chip"><button type="button" class="rec-open" data-open="' + r.id + '">' + esc(r.n) + ' <small>' + fmtNum(sv) + (sv === 1 ? ' porción' : ' porciones') + '</small></button>' +
      '<button type="button" class="rec-x" data-remove="' + k + '" aria-label="Quitar ' + esc(r.n) + ' de la lista">' + ICON.x + '</button></span>';
  }).join('') + S.shop.dishes.map(function(x, k){
    return '<span class="rec-chip"><span class="rec-open rec-dish">' + esc(x.n) + ' <small>a mano' + (x.f !== 1 ? ' ×' + fmtNum(x.f) : '') + '</small></span>' +
      '<button type="button" class="rec-x" data-rmdish="' + k + '" aria-label="Quitar ' + esc(x.n) + ' de la lista">' + ICON.x + '</button></span>';
  }).join('') + '</div></details>';
  CATS.forEach(function(c){
    var its = d.items.filter(function(it){ return it.c === c[0]; }).sort(byName);
    if (!its.length) return;
    h += '<section class="shop-group"><h3>' + c[1] + '</h3><ul class="ings">' + its.map(function(it){ return shopRow(it.k, it.n, it.from.join(', '), shopQty(it)); }).join('') + '</ul></section>';
  });
  if (own.length) {
    h += '<section class="shop-group"><h3>Otras cosas</h3><ul class="ings">' + own.map(function(t, k){
      var key = ownKey(t), on = !!S.shop.checked[key];
      return '<li class="own-row"><button type="button" class="ing" data-check="' + esc(key) + '" aria-pressed="' + on + '"><span class="tick" aria-hidden="true">' + ICON.check + '</span><span class="ing-n">' + esc(t) + '</span></button>' +
        '<button type="button" class="rec-x" data-rmown="' + k + '" aria-label="Quitar ' + esc(t) + ' de la lista">' + ICON.x + '</button></li>';
    }).join('') + '</ul></section>';
  }
  var bk = Object.keys(d.basics).sort();
  if (bk.length) {
    h += '<section class="shop-group"><h3>Revisa que haya en casa</h3><ul class="ings">' + bk.map(function(k){ return shopRow(k, d.basics[k], '', ''); }).join('') + '</ul></section>';
  }
  if (d.refs.length) {
    h += '<section class="shop-group"><h3>Para preparar en casa</h3><p class="muted">Estas salsas se usan en las recetas de la lista. Ábrelas para añadir sus ingredientes.</p><div class="fchips">' +
      d.refs.map(function(id){ return '<button type="button" class="chip" data-open="' + id + '">' + esc(byId[id].n) + '</button>'; }).join('') + '</div></section>';
  }
  v.innerHTML = h;
}
function copyText(txt){
  function fallback(){
    var ta = document.createElement('textarea'), ok = false;
    ta.value = txt; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.top = '0'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { ok = document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    toast(ok ? 'Lista copiada' : 'No se pudo copiar. Usa el botón de WhatsApp.');
  }
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function(){ toast('Lista copiada'); }, fallback);
  else fallback();
}
var clearTimer = null;
$('#v-compra').addEventListener('toggle', function(e){ if (e.target.classList.contains('shop-recs')) S.recsOpen = e.target.open; }, true);
$('#v-compra').addEventListener('submit', function(e){
  if (e.target.id !== 'shop-add') return;
  e.preventDefault();
  var t = $('#shop-own').value.trim().slice(0, 60);
  if (!t) { $('#shop-own').focus(); return; }
  var key = ownKey(t);
  if (!S.shop.own.some(function(x){ return ownKey(x) === key; })) S.shop.own.push(t);
  delete S.shop.checked[key];
  save(); updateShopCount(); renderShop();
  $('#shop-own').focus({preventScroll: true});
});
$('#v-compra').addEventListener('click', function(e){
  var t = e.target.closest('button');
  if (!t) return;
  if (t.hasAttribute('data-rmown')) { var rm = S.shop.own.splice(Number(t.getAttribute('data-rmown')), 1)[0]; if (rm) delete S.shop.checked[ownKey(rm)]; save(); updateShopCount(); renderShop(); return; }
  if (t.hasAttribute('data-rmdish')) { S.shop.dishes.splice(Number(t.getAttribute('data-rmdish')), 1); save(); updateShopCount(); renderShop(); return; }
  if (t.hasAttribute('data-check')) {
    var k = t.getAttribute('data-check');
    if (S.shop.checked[k]) delete S.shop.checked[k]; else S.shop.checked[k] = 1;
    save(); updateShopCount(); renderShop();
    var nb = document.querySelector('[data-check="' + CSS.escape(k) + '"]');
    if (nb) nb.focus({preventScroll: true});
    return;
  }
  if (t.hasAttribute('data-open')) { openRecipe(t.getAttribute('data-open')); return; }
  if (t.hasAttribute('data-remove')) { S.shop.entries.splice(Number(t.getAttribute('data-remove')), 1); save(); updateShopCount(); renderShop(); return; }
  if (t.hasAttribute('data-menushop')) { menuToShop(CUR); renderShop(); return; }
  if (t.hasAttribute('data-copy')) { copyText(shopText()); return; }
  if (t.hasAttribute('data-clear')) {
    if (!t.classList.contains('confirm')) {
      t.classList.add('confirm'); t.lastChild.textContent = 'Toca otra vez para vaciar';
      clearTimeout(clearTimer);
      clearTimer = setTimeout(function(){ if (document.body.contains(t)) { t.classList.remove('confirm'); t.lastChild.textContent = 'Vaciar'; } }, 3000);
      return;
    }
    S.shop = {entries: [], checked: {}, own: [], dishes: []}; save(); updateShopCount(); renderShop(); toast('Lista vaciada');
  }
});

/* ---------- modo cocina: pasos grandes, pantalla encendida y temporizadores ---------- */
var cookEl = $('#cook'), CK = {id: null, step: 0, lastFocus: null}, TIMERS = [], timerTick = null, audioCtx = null, wakeLock = null;
function keepAwake(on){
  if (!('wakeLock' in navigator)) return;
  if (on) navigator.wakeLock.request('screen').then(function(l){ wakeLock = l; }).catch(function(){});
  else if (wakeLock) { wakeLock.release().catch(function(){}); wakeLock = null; }
}
function durations(text){
  var out = [], re = /(\d+)(?:\s*(?:o|a|-|–)\s*(\d+))?\s*(minutos?|min|horas?|h|segundos?)(?![a-záéíóúñ])/gi, m;
  while ((m = re.exec(text))) {
    var c = m[3].charAt(0).toLowerCase(), mult = c === 'h' ? 3600 : c === 's' ? 1 : 60;
    [m[1], m[2]].forEach(function(v){ var x = Number(v) * mult; if (v && x >= 10 && x <= 21600 && out.indexOf(x) < 0) out.push(x); });
  }
  return out;
}
function fmtDur(x){
  if (x >= 3600) return Math.floor(x / 3600) + ' h' + (x % 3600 ? ' ' + Math.round(x % 3600 / 60) + ' min' : '');
  return x >= 60 ? Math.round(x / 60) + ' min' : x + ' s';
}
function clock(x){
  var h = Math.floor(x / 3600), m = Math.floor(x % 3600 / 60), sc = x % 60;
  return (h ? h + ':' + pad2(m) : m) + ':' + pad2(sc);
}
function timersHTML(){
  return TIMERS.map(function(t, i){
    var left = Math.max(0, Math.ceil((t.end - Date.now()) / 1000));
    return '<span class="ck-chip' + (t.done ? ' done' : '') + '">' + ICON.clock + '<b>' + (t.done ? '¡Listo!' : clock(left)) + '</b><span>' + esc(t.label) + '</span>' +
      '<button type="button" data-ck-rmtimer="' + i + '" aria-label="Quitar el temporizador de ' + esc(t.label) + '">' + ICON.x + '</button></span>';
  }).join('');
}
function paintTimers(){ var el = $('#ck-timers'); if (el) { el.innerHTML = timersHTML(); el.hidden = !TIMERS.length; } }
function beep(){
  if (!audioCtx) return;
  try {
    var t0 = audioCtx.currentTime;
    [0, 0.35, 0.7].forEach(function(dt){
      var o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.frequency.value = 880; o.connect(g); g.connect(audioCtx.destination);
      g.gain.setValueAtTime(0.0001, t0 + dt); g.gain.exponentialRampToValueAtTime(0.4, t0 + dt + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dt + 0.25);
      o.start(t0 + dt); o.stop(t0 + dt + 0.3);
    });
  } catch (e) {}
}
function tickTimers(){
  var now = Date.now(), rang = false;
  TIMERS.forEach(function(t){
    if (!t.done && now >= t.end) { t.done = true; rang = true; if (cookEl.hidden) toast('Tiempo cumplido: ' + t.label + ' de ' + t.rec); }
  });
  if (rang) { beep(); if (navigator.vibrate) { try { navigator.vibrate([300, 150, 300]); } catch (e) {} } }
  if (!TIMERS.length) { clearInterval(timerTick); timerTick = null; }
  paintTimers();
}
function startTimer(secs){
  if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  TIMERS.push({label: 'Paso ' + CK.step, rec: byId[CK.id].n, end: Date.now() + secs * 1000, done: false});
  if (!timerTick) timerTick = setInterval(tickTimers, 500);
  paintTimers();
}
function renderCook(){
  var r = byId[CK.id], n = r.st.length, k = CK.step, f = SH.serv / r.s;
  var h = '<header class="ck-bar"><button type="button" class="icon-btn" data-ck-close aria-label="Salir del modo cocina">' + ICON.close + '</button>' +
    '<p class="ck-title">' + esc(r.n) + '</p><span class="ck-count">' + (k === 0 ? 'Antes de empezar' : 'Paso ' + k + ' de ' + n) + '</span></header>' +
    '<div class="ck-prog" aria-hidden="true"><i style="width:' + (k / n * 100).toFixed(1) + '%"></i></div>' +
    '<div class="ck-timers" id="ck-timers"' + (TIMERS.length ? '' : ' hidden') + '>' + timersHTML() + '</div><div class="ck-body" id="ck-body">';
  if (k === 0) {
    h += '<h2 class="ck-h">Ten a mano</h2><p class="ck-sub">Para ' + porciones(SH.serv) + '. Toca lo que ya tengas listo.</p><ul class="ings">' + r.i.map(function(x){
      var q = x[0] == null ? null : roundQty(x[0] * f, x[1]);
      return '<li><button type="button" class="ing" aria-pressed="false"><span class="tick" aria-hidden="true">' + ICON.check + '</span>' +
        '<span class="ing-n">' + esc(x[2]) + (x[4] ? '<small>' + esc(x[4]) + '</small>' : '') + '</span><span class="ing-q">' + esc(qtyText(q, x[1])) + '</span></button></li>';
    }).join('') + '</ul><p class="ck-note">La pantalla se queda encendida mientras estés en el modo cocina.</p>';
  } else {
    var ds = durations(r.st[k - 1]);
    h += '<p class="ck-step">' + esc(r.st[k - 1]) + '</p>';
    if (ds.length) h += '<div class="ck-tbtns">' + ds.map(function(x){ return '<button type="button" class="btn" data-ck-timer="' + x + '">' + ICON.clock + 'Avisar en ' + fmtDur(x) + '</button>'; }).join('') + '</div>';
    if (k === n && r.tip) h += '<p class="ck-tip"><b>Consejo</b>' + esc(r.tip) + '</p>';
  }
  h += '</div><footer class="ck-nav"><button type="button" class="btn" data-ck-go="-1"' + (k === 0 ? ' disabled' : '') + '>' + ICON.back + 'Anterior</button>' +
    '<button type="button" class="btn primary" data-ck-go="1">' + (k === 0 ? 'Empezar' : k < n ? 'Siguiente' : 'Terminar') + (k < n ? ICON.next : '') + '</button></footer>';
  cookEl.innerHTML = h;
}
function openCook(id){
  CK.id = id; CK.step = 0; CK.lastFocus = document.activeElement;
  renderCook();
  cookEl.hidden = false;
  document.documentElement.classList.add('locked');
  keepAwake(true);
  cookEl.focus({preventScroll: true});
}
function closeCook(){
  cookEl.hidden = true;
  keepAwake(false);
  if (sheet.hidden && picker.hidden) document.documentElement.classList.remove('locked');
  if (CK.lastFocus && document.body.contains(CK.lastFocus)) CK.lastFocus.focus({preventScroll: true});
}
function cookGo(d){
  var n = byId[CK.id].st.length, k = CK.step + d;
  if (k < 0) return;
  if (k > n) {
    closeCook();
    var hit = ensureWeek(CUR).days[TODAY].items.filter(function(x){ return x.id === CK.id && !x.e; })[0];
    if (hit) {
      hit.e = 1; S.menu.tk = true; save();
      if (S.tab === 'menu') renderMenu();
      if (loved) loved.add(hit);
      showLove({pill: '👩‍🍳 Hecho y marcado en el menú de hoy'});
    } else showLove({msg: '¡Buen provecho!', pill: '👩‍🍳 Receta terminada', btn: '¡A comer!'});
    return;
  }
  CK.step = k; renderCook();
  $('#ck-body').scrollTop = 0;
  var b = cookEl.querySelector('[data-ck-go="' + d + '"]'); if (b && !b.disabled) b.focus({preventScroll: true});
}
cookEl.addEventListener('click', function(e){
  var t = e.target.closest('button');
  if (!t) return;
  if (t.hasAttribute('data-ck-close')) { closeCook(); return; }
  if (t.hasAttribute('data-ck-go')) { cookGo(Number(t.getAttribute('data-ck-go'))); return; }
  if (t.hasAttribute('data-ck-timer')) { startTimer(Number(t.getAttribute('data-ck-timer'))); toast('Temporizador en marcha: ' + fmtDur(Number(t.getAttribute('data-ck-timer')))); return; }
  if (t.hasAttribute('data-ck-rmtimer')) { TIMERS.splice(Number(t.getAttribute('data-ck-rmtimer')), 1); paintTimers(); return; }
  if (t.classList.contains('ing')) t.setAttribute('aria-pressed', t.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
});
document.addEventListener('keydown', function(e){
  if (cookEl.hidden) return;
  if (e.key === 'Escape') { e.stopImmediatePropagation(); closeCook(); }
  else if (e.key === 'ArrowRight') cookGo(1);
  else if (e.key === 'ArrowLeft') cookGo(-1);
}, true);
var ckSwipe = null;
cookEl.addEventListener('touchstart', function(e){ ckSwipe = e.touches.length === 1 ? {x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now()} : null; }, {passive: true});
cookEl.addEventListener('touchend', function(e){
  if (!ckSwipe) return;
  var c = e.changedTouches[0], dx = c.clientX - ckSwipe.x, dy = c.clientY - ckSwipe.y, quick = Date.now() - ckSwipe.t < 700;
  ckSwipe = null;
  if (quick && Math.abs(dx) > 70 && Math.abs(dy) < Math.abs(dx) * 0.5) cookGo(dx < 0 ? 1 : -1);
}, {passive: true});
document.addEventListener('visibilitychange', function(){ if (!document.hidden && !cookEl.hidden) keepAwake(true); });

/* ---------- copia de seguridad ---------- */
var BK = {pending: null, err: ''};
function longDate(iso){ var d = new Date(iso); return isNaN(d) ? '' : d.getDate() + ' ' + MESES[d.getMonth()] + ' ' + d.getFullYear(); }
function renderBackup(){
  var el = $('#backup');
  if (!el) return;
  var h = '<section class="g-card bk"><h3>Copia de seguridad</h3>' +
    '<p>El menú, lo apuntado, la lista de la compra y las recetas guardadas están solo en este móvil. Guarda una copia de vez en cuando, por si cambias de teléfono o se borran los datos.</p>' +
    '<p class="bk-last">' + (S.bk && longDate(S.bk) ? 'Última copia: <b>' + longDate(S.bk) + '</b>.' : 'Todavía no has guardado ninguna copia.') + '</p>';
  if (BK.pending) {
    h += '<div class="bk-box"><p>Copia del <b>' + (longDate(BK.pending.date) || 'archivo') + '</b>. Al restaurarla se reemplaza todo lo que hay ahora en este móvil.</p>' +
      '<div class="actions"><button type="button" class="btn primary" data-bk-ok>Restaurar esta copia</button><button type="button" class="btn" data-bk-cancel>Cancelar</button></div></div>';
  } else {
    h += '<div class="actions"><button type="button" class="btn primary" data-bk-save>' + ICON.save + 'Guardar una copia</button>' +
      '<button type="button" class="btn" data-bk-load>' + ICON.up + 'Restaurar una copia</button></div>';
  }
  if (BK.err) h += '<p class="form-err" role="alert">' + esc(BK.err) + '</p>';
  h += '<input type="file" id="bk-file" accept=".json,application/json,text/plain" hidden></section>';
  el.innerHTML = h;
}
function saveBackup(){
  var now = new Date(), name = 'cocina-de-nene-' + keyOf(now) + '.json';
  var txt = JSON.stringify({app: 'cocina-nene', v: 1, date: now.toISOString(), data: snapshot()});
  function done(){ S.bk = now.toISOString(); BK.err = ''; save(); renderBackup(); toast('Copia guardada'); }
  function download(){
    var a = document.createElement('a'), url = URL.createObjectURL(new Blob([txt], {type: 'application/json'}));
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 5000);
    done();
  }
  var file = null;
  try { file = new File([txt], name, {type: 'application/json'}); } catch (e) {}
  if (file && navigator.canShare && navigator.canShare({files: [file]})) {
    navigator.share({files: [file], title: 'Copia de La Cocina de Nene'}).then(done, function(err){ if (!err || err.name !== 'AbortError') download(); });
  } else download();
}
$('#backup').addEventListener('click', function(e){
  var t = e.target.closest('button');
  if (!t) return;
  if (t.hasAttribute('data-bk-save')) { saveBackup(); return; }
  if (t.hasAttribute('data-bk-load')) { BK.err = ''; $('#bk-file').click(); return; }
  if (t.hasAttribute('data-bk-cancel')) { BK.pending = null; renderBackup(); return; }
  if (t.hasAttribute('data-bk-ok') && BK.pending) {
    try { localStorage.setItem(KEY, JSON.stringify(BK.pending.data)); }
    catch (err) { BK.err = 'No se pudo restaurar en este navegador.'; BK.pending = null; renderBackup(); return; }
    location.reload();
  }
});
$('#backup').addEventListener('change', function(e){
  var f = e.target.id === 'bk-file' && e.target.files && e.target.files[0];
  if (!f) return;
  var fr = new FileReader();
  fr.onload = function(){
    var o = null;
    try { o = JSON.parse(fr.result); } catch (err) {}
    if (o && o.app === 'cocina-nene' && o.data && typeof o.data === 'object' && !Array.isArray(o.data)) { BK.pending = o; BK.err = ''; }
    else { BK.pending = null; BK.err = 'Ese archivo no es una copia de La Cocina de Nene.'; }
    renderBackup();
  };
  fr.onerror = function(){ BK.pending = null; BK.err = 'No se pudo leer el archivo.'; renderBackup(); };
  fr.readAsText(f);
});

/* ---------- sin conexión y aviso de versión nueva ---------- */
var lastCheck = 0;
function checkVersion(){
  if (location.protocol === 'file:' || typeof APP_V === 'undefined' || Date.now() - lastCheck < 300000) return;
  lastCheck = Date.now();
  fetch('version.json?t=' + lastCheck, {cache: 'no-store'}).then(function(r){ return r.ok ? r.json() : null; })
    .then(function(j){ if (j && j.v && j.v !== APP_V) $('#update').hidden = false; }).catch(function(){});
}
$('#update-btn').addEventListener('click', function(){ location.reload(); });
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', function(){ navigator.serviceWorker.register('sw.js').catch(function(){}); });
}
document.addEventListener('visibilitychange', function(){ if (!document.hidden) checkVersion(); });
setTimeout(checkVersion, 3000);

/* ---------- notas de amor ---------- */
var lastLove = -1, loved = typeof WeakSet !== 'undefined' ? new WeakSet() : null;   /* platos que ya tuvieron su nota */
function showLove(o){
  var msg = o && o.msg;
  if (!msg) {
    var k; do { k = Math.floor(Math.random() * LOVE.length); } while (LOVE.length > 1 && k === lastLove);
    lastLove = k; msg = LOVE[k];
  }
  $('#love-msg').textContent = msg;
  $('#love-pill').textContent = o && o.pill || '💌 From Diego';
  $('#love-btn').textContent = o && o.btn || 'Ay Diego 😅';
  var hearts = ['💕','💖','❤️','💗','💝','✨'], h = '';
  for (var i = 0; i < 12; i++) {
    h += '<span style="left:' + Math.round(Math.random() * 95) + '%;animation-delay:' + (Math.random() * 2.5).toFixed(2) + 's;animation-duration:' + (3 + Math.random() * 2).toFixed(2) + 's">' + hearts[Math.floor(Math.random() * hearts.length)] + '</span>';
  }
  $('.love-hearts').innerHTML = h;
  $('#love').hidden = false;
  $('.love-btn').focus({preventScroll: true});
}
function closeLove(){ $('#love').hidden = true; $('.love-hearts').innerHTML = ''; }
$('#love').addEventListener('click', function(e){ if (e.target.closest('[data-love-close]')) closeLove(); });
document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && !$('#love').hidden) { e.stopImmediatePropagation(); closeLove(); } }, true);

/* ---------- aviso ---------- */
var toastTimer = null, toastFn = null;
function toast(msg, actionLabel, fn){
  var el = $('#toast');
  toastFn = fn || null;
  el.innerHTML = '<span></span>' + (fn ? '<button type="button" class="toast-act">' + esc(actionLabel) + '</button>' : '');
  el.firstChild.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ el.hidden = true; toastFn = null; }, fn ? 5000 : 2600);
}
$('#toast').addEventListener('click', function(e){
  if (e.target.closest('.toast-act') && toastFn) { var f = toastFn; toastFn = null; $('#toast').hidden = true; f(); }
});

/* ---------- inicio ---------- */
renderList();
renderBackup();
setTab(S.tab, true);
updateShopCount();
READY = true;
save();
window.__appOK = true;
})();
