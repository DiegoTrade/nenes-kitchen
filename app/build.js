/* Construye la app: junta src/ en un solo index.html en la raíz del repositorio.
   Uso: node app/build.js */
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const crypto = require('crypto');
const src = f => fs.readFileSync(path.join(__dirname, 'src', f), 'utf8');
const root = path.join(__dirname, '..');

const data = src('data.js'), foods = src('foods.js'), render = src('render.js'), app = src('app.js');
const ctx = {};
vm.createContext(ctx);
vm.runInContext(data + '\n' + render + '\n;this.RECETAS = RECETAS;', ctx);
const R = ctx.RECETAS;

/* versión sencilla, sin JavaScript: todas las recetas y la guía */
const order = [['primera', 'Primera comida'], ['fuerte', 'Platos fuertes'], ['fria', 'Platos fríos'], ['sopa', 'Sopas'], ['snack', 'Snacks'], ['base', 'Salsas y bases']];
let book = order.map(([t, label]) => '<h2>' + label + '</h2>' + R.filter(r => r.t === t).map(r => ctx.recipeStaticHTML(r)).join('')).join('');
book += '<h2>Guía rápida</h2><div class="guide">' + ctx.guideHTML() + '</div>';

let html = src('template.html')
  .replace('{{STYLE}}', () => src('style.css'))
  .replace('{{N}}', String(R.length))
  .replace('{{GUIDE}}', () => ctx.guideHTML())
  .replace('{{BOOK}}', () => book)
  .replace('{{SCRIPT}}', () => data + '\n' + foods + '\n' + render + '\n' + app);

const version = crypto.createHash('sha1').update(html).digest('hex').slice(0, 10);
html = html.replace('{{VERSION}}', version);
if (/\{\{[A-Z0-9]+\}\}/.test(html.replace(/<script>[\s\S]*<\/script>/g, ''))) throw new Error('queda un marcador sin rellenar en la plantilla');

fs.writeFileSync(path.join(root, 'index.html'), html);
fs.writeFileSync(path.join(root, 'version.json'), JSON.stringify({v: version}) + '\n');
console.log('ok index.html', (html.length / 1024).toFixed(1) + ' KB ·', R.length, 'recetas · versión', version);
