/* Etiquetas, formato de cantidades y HTML estático (lo usan la app y la versión sin JavaScript) */
var TIPO = {primera:'Primera comida', fuerte:'Plato fuerte', fria:'Plato frío', sopa:'Sopa', snack:'Snack', base:'Salsa o base'};
var TIPOS_CHIPS = [['todas','Todas'],['primera','Primera comida'],['fuerte','Platos fuertes'],['fria','Frías'],['sopa','Sopas'],['snack','Snacks'],['base','Salsas y bases']];
var ORIG = {ve:'Venezolana', ca:'Canaria', es:'Española', as:'Asiática', in:'Internacional', vi:'Viral y favorita'};
var PROTS = [['pollo','Pollo'],['carne','Ternera'],['cerdo','Cerdo'],['pescado','Pescado'],['marisco','Marisco'],['huevos','Huevos'],['lacteos','Lácteos'],['otros','Cordero y conejo']];
var TIEMPOS = [['rapida','15 min o menos'],['media','Hasta 35 min'],['lenta','Sin prisa']];

function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

function fmtDec(v){ return String(Math.round(v*100)/100).replace('.', ','); }
function fmtNum(v){
  var w = Math.floor(v + 1e-9), f = Math.round((v - w) * 100) / 100;
  var fr = {0.25:'¼', 0.5:'½', 0.75:'¾'};
  if (f === 0) return String(w);
  if (fr[f]) return (w ? w : '') + fr[f];
  return fmtDec(v);
}
function unitLabel(u, v){
  if (!u) return '';
  if (u === 'g' || u === 'ml') return u;
  return v > 1 ? u + 's' : u;
}
function qtyText(q, u){
  if (q == null) return 'al gusto';
  if (u === 'g' && q >= 1000) return fmtDec(q / 1000) + ' kg';
  if (u === 'ml' && q >= 1000) return fmtDec(q / 1000) + ' l';
  var n = fmtNum(q);
  return u ? n + ' ' + unitLabel(u, q) : n;
}
function roundQty(v, u){
  if (u === 'g' || u === 'ml') return v < 50 ? Math.max(5, Math.round(v / 5) * 5) : Math.round(v / 10) * 10;
  if (u === 'diente' || u === 'loncha' || u === 'hoja' || u === 'lata') return Math.max(1, Math.round(v));
  if (v < 1) return Math.max(0.25, Math.round(v * 4) / 4);
  return Math.round(v * 2) / 2;
}
function timeText(r){
  var t = r.min >= 60 ? Math.floor(r.min / 60) + ' h' + (r.min % 60 ? ' ' + (r.min % 60) + ' min' : '') : r.min + ' min';
  return r.x ? t + ' + ' + r.x : t;
}
function porciones(n){ return n === 1 ? '1 porción' : n + ' porciones'; }
function tiempoCat(r){ var m = r.min + (r.xm || 0); return m <= 15 ? 'rapida' : m <= 35 ? 'media' : 'lenta'; }

function recipeStaticHTML(r){
  var ings = r.i.map(function(x){
    return '<li class="ing"><span class="ing-n">' + esc(x[2]) + (x[4] ? '<small>' + esc(x[4]) + '</small>' : '') +
      '</span><span class="ing-q">' + esc(qtyText(x[0], x[1])) + '</span></li>';
  }).join('');
  var steps = r.st.map(function(s, k){
    return '<li class="step"><span class="step-n">' + (k + 1) + '</span><span>' + esc(s) + '</span></li>';
  }).join('');
  var facts = timeText(r) + ' · ' + porciones(r.s) + (r.sn ? ' ' + r.sn : '') +
    (r.t !== 'base' ? ' · por porción: ' + r.pr + ' g de proteína, ' + r.ch + ' g de carbohidratos, ' + r.gr + ' g de grasa, unas ' + r.kc + ' kcal' : '');
  return '<article class="book-r" id="r-' + r.id + '">' +
    '<p class="kicker">' + TIPO[r.t] + ' · ' + ORIG[r.o] + '</p>' +
    '<h3>' + esc(r.n) + '</h3><p class="lead">' + esc(r.d) + '</p>' +
    '<p class="book-meta">' + esc(facts) + '</p>' +
    '<h4>Ingredientes</h4><ul class="ings">' + ings + '</ul>' +
    '<h4>Preparación</h4><ol class="steps">' + steps + '</ol>' +
    notesHTML(r) + '</article>';
}
function notesHTML(r){
  var out = '';
  if (r.cr) out += '<div class="note note-src"><b>De dónde viene</b>' + esc(r.cr) +
    (r.cu ? ' <a href="' + esc(r.cu) + '" target="_blank" rel="noopener">Ver la original</a>' : '') + '</div>';
  if (r.tip) out += '<div class="note note-tip"><b>Consejo</b>' + esc(r.tip) + '</div>';
  if (r.fam) out += '<div class="note note-fam"><b>Para la familia</b>' + esc(r.fam) + '</div>';
  if (r.keep) out += '<div class="note note-keep"><b>Se guarda</b>' + esc(r.keep) + '</div>';
  return out ? '<div class="notes">' + out + '</div>' : '';
}

function guideHTML(){
  return '' +
'<section class="g-card g-plate">' +
  '<div class="plate" role="img" aria-label="Plato: casi la mitad proteína, la otra mitad verduras y un poco de grasa buena"></div>' +
  '<div><h3>El plato de Diego</h3><ul class="legend">' +
    '<li><i class="sw sw-pro"></i><span><b>Proteína primero.</b> 200 a 250 g de carne o pescado, o 3 a 4 huevos.</span></li>' +
    '<li><i class="sw sw-veg"></i><span><b>Verduras sin límite.</b> De hoja, calabacín, brócoli, coliflor, pimiento, champiñones, judías verdes.</span></li>' +
    '<li><i class="sw sw-fat"></i><span><b>Un poco de grasa buena.</b> Aceite de oliva, aguacate o queso.</span></li>' +
  '</ul></div>' +
'</section>' +
'<section class="g-card"><h3>Lo que más daño le hace</h3>' +
  '<p>De peor a menos malo. Los seis primeros no se compran ni se sirven, ni en casa ni fuera.</p>' +
  '<p class="rk-h rk-no">Evitar siempre</p><ol class="rank">' +
    '<li><span class="rk-n" aria-hidden="true">1</span><div><b>Bebidas con azúcar</b><span class="rk-ex">Refrescos, zumos (también los naturales), batidos de fruta, bebidas energéticas y café con azúcar.</span><span class="rk-why">El azúcar líquido llega al hígado en minutos y se convierte en grasa. Es lo peor de todo.</span></div></li>' +
    '<li><span class="rk-n" aria-hidden="true">2</span><div><b>Alcohol, sobre todo cerveza</b><span class="rk-ex">Cerveza, combinados con refresco, vino dulce y licores.</span><span class="rk-why">El hígado deja todo lo demás para procesarlo, y mientras tanto la grasa se queda guardada.</span></div></li>' +
    '<li><span class="rk-n" aria-hidden="true">3</span><div><b>Dulces y bollería</b><span class="rk-ex">Galletas, bizcochos, helados, chocolate con leche, golosinas y postres.</span><span class="rk-why">Azúcar, harina y grasa juntos: lo que más rápido engorda.</span></div></li>' +
    '<li><span class="rk-n" aria-hidden="true">4</span><div><b>Harinas y almidones</b><span class="rk-ex">Casabe, arepas, pan, arroz, pasta, papas, yuca, plátano y gofio.</span><span class="rk-why">Al digerirse son azúcar. 100 g de casabe equivalen a unas 5 rebanadas de pan. Lo que más pesa es la costumbre de todos los días.</span></div></li>' +
    '<li><span class="rk-n" aria-hidden="true">5</span><div><b>Fritos y ultraprocesados</b><span class="rk-ex">Papas fritas, chips, empanadas, tequeños, pizza y comida rápida.</span><span class="rk-why">Harina con grasa industrial, y es muy fácil comer de más.</span></div></li>' +
    '<li><span class="rk-n" aria-hidden="true">6</span><div><b>Azúcares que parecen sanos</b><span class="rk-ex">Miel, papelón, siropes, fruta seca, yogures de sabores, granola, cereales y barritas.</span><span class="rk-why">Para el cuerpo son azúcar, diga lo que diga la etiqueta.</span></div></li>' +
  '</ol><p class="rk-h rk-some">Solo de vez en cuando</p><ol class="rank rank-some" start="7">' +
    '<li><span class="rk-n" aria-hidden="true">7</span><div><b>Fruta muy dulce</b><span class="rk-ex">Mango, uvas, piña y plátano.</span><span class="rk-why">Una pieza está bien. Un bol grande o un zumo ya es mucho azúcar. Mejor frutos rojos.</span></div></li>' +
    '<li><span class="rk-n" aria-hidden="true">8</span><div><b>Marisco, sardinas, anchoas y embutidos</b><span class="rk-ex">También chorizo y salchichas.</span><span class="rk-why">Una vez por semana y en ración pequeña. Vísceras (hígado, riñones, mollejas), nunca.</span></div></li>' +
  '</ol><p class="rk-foot">Lo que no está en esta lista: huevos, carne, pollo, pescado, queso, aguacate, aceite de oliva y verduras. La grasa buena no es el problema. El azúcar, las harinas y el alcohol, sí.</p>' +
'</section>' +
'<section class="g-card"><h3>Horario</h3>' +
  '<p>Diego come dentro de una ventana de 6 horas. Fuera de ella, solo agua, café solo, té o agua con gas.</p>' +
  '<ol class="sched">' +
    '<li><span class="sched-t">12:00</span><span>Primera comida</span></li>' +
    '<li><span class="sched-t">15:00</span><span>Merienda</span></li>' +
    '<li><span class="sched-t">17:30</span><span>Comida principal</span></li>' +
    '<li><span class="sched-t">18:00</span><span>Cierra la cocina</span></li>' +
  '</ol>' +
'</section>' +
'<section class="g-card"><h3>Proteína: 150 a 180 g al día</h3>' +
  '<p>Así se suma. Carnes y pescados, pesados en crudo.</p>' +
  '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Alimento</th><th>Cantidad</th><th class="num">Proteína</th></tr></thead><tbody>' +
    '<tr><td>Pechuga de pollo</td><td>100 g</td><td class="num">23 g</td></tr>' +
    '<tr><td>Ternera o cerdo magro</td><td>100 g</td><td class="num">21 g</td></tr>' +
    '<tr><td>Salmón o atún fresco</td><td>100 g</td><td class="num">20 g</td></tr>' +
    '<tr><td>Pescado blanco</td><td>100 g</td><td class="num">18 g</td></tr>' +
    '<tr><td>Huevo</td><td>1</td><td class="num">7 g</td></tr>' +
    '<tr><td>Claras líquidas</td><td>100 ml</td><td class="num">11 g</td></tr>' +
    '<tr><td>Skyr natural</td><td>200 g</td><td class="num">22 g</td></tr>' +
    '<tr><td>Queso fresco</td><td>100 g</td><td class="num">12 g</td></tr>' +
    '<tr><td>Jamón serrano</td><td>50 g</td><td class="num">15 g</td></tr>' +
    '<tr><td>Atún en lata</td><td>1 lata escurrida</td><td class="num">13 g</td></tr>' +
    '<tr><td>Proteína whey</td><td>1 cazo (30 g)</td><td class="num">24 g</td></tr>' +
  '</tbody></table></div>' +
'</section>' +
'<section class="g-card"><h3>Qué sí, qué poco y qué no</h3><div class="lists">' +
  '<div class="list yes"><h4>Sí</h4><ul>' +
    '<li>Pollo, carne, cerdo, pescado y huevos</li>' +
    '<li>Verduras de hoja, calabacín, berenjena, pimiento, brócoli, coliflor, champiñones, judías verdes y tomate</li>' +
    '<li>Aguacate, aceitunas, aceite de oliva, mantequilla y nata</li>' +
    '<li>Skyr, queso fresco y queso fresco batido</li>' +
    '<li>Especias, hierbas, ajo, limón, vinagre y mostaza</li>' +
    '<li>Café y té sin azúcar, agua con gas</li>' +
  '</ul></div>' +
  '<div class="list some"><h4>Con moderación</h4><ul>' +
    '<li>Queso curado: unos 50 g por comida</li>' +
    '<li>Frutos secos y frutos rojos: un puñado</li>' +
    '<li>Caraotas, lentejas o garbanzos: 3 cucharadas</li>' +
    '<li>Zanahoria, calabaza y cebolla: como acompañante, no de base</li>' +
    '<li>Papas arrugadas: una o dos, de vez en cuando</li>' +
    '<li>Marisco, sardinas y anchoas: una vez por semana</li>' +
    '<li>Chocolate negro 85 %: dos onzas</li>' +
  '</ul></div>' +
  '<div class="list no"><h4>No</h4><ul>' +
    '<li>Azúcar, miel, papelón y panela</li>' +
    '<li>Pan, casabe, arepas, cachapas, pasta, arroz y cereales</li>' +
    '<li>Papa, yuca, plátano, batata y gofio</li>' +
    '<li>Zumos, refrescos y batidos de fruta</li>' +
    '<li>Cerveza y alcohol</li>' +
    '<li>Dulces, bollería, galletas y helados</li>' +
    '<li>Tomate frito, ketchup y salsas de bote (también teriyaki, agridulce y hoisin)</li>' +
    '<li>Rebozados y fritos en aceite de girasol</li>' +
    '<li>Vísceras: hígado, riñones y mollejas</li>' +
  '</ul></div>' +
'</div></section>' +
'<section class="g-card"><h3>Si no encuentras skyr</h3>' +
  '<p>Donde pone skyr vale cualquiera de estos, en la misma cantidad. Mira la etiqueta: al menos 8 g de proteína y como mucho 5 g de azúcar por 100 g.</p>' +
  '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Cambio</th><th class="num">Proteína por 100 g</th></tr></thead><tbody>' +
    '<tr><td>Queso cottage o requesón (mejor en recetas saladas)</td><td class="num">11 g</td></tr>' +
    '<tr><td>Yogur alto en proteína (YoPro u otros)</td><td class="num">9 a 10 g</td></tr>' +
    '<tr><td>Queso fresco batido 0 %</td><td class="num">8 g</td></tr>' +
    '<tr><td>Yogur griego 0 % o ligero</td><td class="num">8 a 10 g</td></tr>' +
    '<tr><td>Yogur natural colado una noche en un paño, en la nevera</td><td class="num">8 a 9 g</td></tr>' +
  '</tbody></table></div>' +
  '<p>El yogur griego normal no sirve: tiene mucha grasa y poca proteína. El kéfir tampoco: es líquido y tiene la proteína de la leche.</p>' +
'</section>' +
'<section class="g-card"><h3>Cambios fáciles</h3>' +
  '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>En vez de</th><th>Usa</th></tr></thead><tbody>' +
    '<tr><td>Arroz</td><td>Arroz de coliflor</td></tr>' +
    '<tr><td>Puré de papas</td><td>Puré de coliflor</td></tr>' +
    '<tr><td>Pasta</td><td>Espaguetis de calabacín</td></tr>' +
    '<tr><td>Arepa o pan</td><td>Hojas de lechuga o un crepe de huevo</td></tr>' +
    '<tr><td>Tajadas o papas fritas</td><td>Aguacate o verduras a la plancha</td></tr>' +
    '<tr><td>Pan rallado</td><td>Parmesano rallado o almendra molida</td></tr>' +
    '<tr><td>Tomate frito</td><td>Tomate triturado natural</td></tr>' +
    '<tr><td>Refresco</td><td>Agua con gas y limón</td></tr>' +
    '<tr><td>Postre</td><td>Mousse de chocolate con proteína</td></tr>' +
  '</tbody></table></div>' +
'</section>' +
'<section class="g-card"><h3>Con la medicación</h3><ul class="tips">' +
  '<li>Se llena muy rápido. Sirve primero la proteína: si no termina, que deje las verduras, no la carne.</li>' +
  '<li>Mejor platos pequeños. Si tiene hambre, que repita.</li>' +
  '<li>Lo muy grasiento o frito le puede dar náuseas, sobre todo la semana en que sube la dosis.</li>' +
  '<li>Que beba de 2 a 3 litros de agua al día.</li>' +
  '<li>Si no tiene hambre, un batido de proteína o un skyr es mejor que nada.</li>' +
  '<li>La medicación puede estreñir. Verduras en cada comida, una cucharada de chía o linaza al día y mucha agua.</li>' +
'</ul></section>' +
'<section class="g-card"><h3>Por qué comemos así</h3>' +
  '<p>Menos azúcar y harinas, más proteína y verduras. Así se baja de peso sin perder músculo.</p>' +
  '<p>El marisco, las sardinas y las anchoas van con moderación, y nada de vísceras. La carne roja, mejor dos o tres veces por semana. Y mucha agua todos los días.</p>' +
'</section>';
}
