"""Recalcula proteína y carbohidratos netos por porción a partir de los ingredientes de cada receta,
y avisa de las que se desvían de lo que pone la ficha.
Valores aproximados por 100 g (BEDCA / USDA / etiquetas de súper en España).
Uso: python3 app/tools/audit.py"""
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
R = json.loads(subprocess.check_output(['node', '-e',
    "const s=require('fs').readFileSync(process.argv[1],'utf8');process.stdout.write(JSON.stringify(new Function(s+';return RECETAS;')()))",
    os.path.join(HERE, '..', 'src', 'data.js')]))

# nombre: (proteína/100g, carbos netos/100g, {unidad: gramos})
T = {
 'Aceitunas': (0.8, 0.5, {'': 4}),
 'Aguacate': (2, 1.8, {'': 150}),
 'Ajo': (6.4, 30, {'diente': 4}),
 'Ají dulce': (1, 5, {'': 10}),
 'Almendra molida': (21, 9, {}),
 'Anchoa': (29, 0, {'': 4}),
 'Apio': (0.7, 1.4, {'rama': 40}),
 'Atún en aceite de oliva': (26, 0, {'lata': 52}),
 'Atún fresco': (23, 0, {}),
 'Bebida de almendras sin azúcar': (0.4, 0, {}),
 'Berenjena': (1, 2.9, {'': 300}),
 'Brócoli': (2.8, 4, {}),
 'Calabacín': (1.2, 2.1, {'': 200}),
 'Calabaza': (1, 6.5, {}),
 'Caldo de pescado': (0.5, 0, {}), 'Caldo de pollo': (0.5, 0, {}),
 'Carne picada de ternera': (18.5, 0, {}),
 'Carne picada de cerdo': (17, 0, {}),
 'Carne picada de pollo': (19, 0, {}),
 'Cebolla': (1.1, 8, {'': 150}), 'Cebolla morada': (1.1, 8, {'': 150}),
 'Cebolleta': (1.8, 4.7, {'': 30}),
 'Champiñones': (3.1, 2.3, {}),
 'Chocolate negro 85 %': (10, 14, {}),
 'Chuletillas de cordero': (10, 0, {}),          # con hueso, ~55 % comestible
 'Cilantro': (2, 1, {'manojo': 50}),
 'Claras de huevo': (10.9, 0.7, {}),
 'Col o repollo': (1.3, 3.3, {'': 1000}),
 'Coliflor': (1.9, 3, {'': 600}),
 'Conejo': (13.5, 0, {'': 1200}),                 # entero con hueso
 'Contramuslo de pollo deshuesado': (19.5, 0, {}),
 'Corvina o lubina': (19, 0, {}),
 'Dorada o lubina': (10, 0, {'': 450}),           # entera, ~50 % comestible
 'Entrecot': (19.5, 0, {}),
 'Espinacas baby': (2.9, 1.4, {'puñado': 30}),
 'Espárragos trigueros': (2.2, 1.8, {}),
 'Falda de ternera': (20, 0, {}),
 'Filete de pescado blanco': (18, 0, {}),
 'Filete de ternera': (21, 0, {}),
 'Frambuesas o arándanos': (1, 8, {}),
 'Fresas': (0.7, 5.7, {}),
 'Huevos': (12.6, 0.7, {'': 55}),
 'Jamón serrano': (30, 0, {}), 'Taquitos de jamón serrano': (30, 0, {}),
 'Jengibre fresco': (1.8, 16, {'trozo': 10}),
 'Judías verdes': (1.8, 4.3, {}),
 'Langostinos o gambas peladas': (19, 0, {}),
 'Leche de coco': (2, 3, {}),
 'Lechuga': (1.2, 1.5, {'': 300}), 'Lechuga iceberg': (0.9, 1.8, {'': 500}), 'Lechuga romana': (1.2, 1.2, {'': 300}),
 'Lima': (0, 8, {'': 30}), 'Limón': (0, 7, {'': 40}),   # solo el zumo
 'Lomo de salmón': (20, 0, {}),
 'Lomo o cabezada de cerdo': (20, 0, {}),
 'Mantequilla': (0.9, 0, {}),
 'Mantequilla de cacahuete': (25, 12, {}),
 'Merluza': (17, 0, {}),
 'Mozzarella rallada': (22, 2, {}),
 'Muslos de pollo con hueso': (12.4, 0, {}),      # ~65 % comestible
 'Nata para cocinar': (2.5, 3.5, {}),
 'Nueces': (15, 7, {}),
 'Parmesano': (35, 0, {}),
 'Pechuga de pollo': (23, 0, {}),
 'Pepinillos': (0.5, 3, {'': 15}),
 'Pepino': (0.7, 3, {'': 300}),
 'Perejil': (3, 3, {'manojo': 50}),
 'Pimiento asado': (1, 4, {}),
 'Pimiento rojo': (1, 4.6, {'': 180}), 'Pimiento verde': (0.9, 2.9, {'': 160}),
 'Pimientos de Padrón': (1.5, 3, {}),
 'Pollo cocinado': (31, 0, {}),
 'Proteína whey': (80, 7, {'cazo': 30}),
 'Puerro': (1.5, 12, {'': 150}),
 'Pulpo cocido': (18, 1, {}),
 'Queso cheddar': (25, 1, {'loncha': 20}),
 'Queso cottage': (11, 3.4, {}),
 'Queso crema': (6, 4, {}),
 'Queso de cabra semicurado': (23, 0.5, {}),
 'Queso feta': (14, 4, {}),
 'Queso fresco': (13, 3, {}),
 'Queso rallado para gratinar': (25, 1, {}),
 'Rúcula': (2.6, 2, {'puñado': 20}),
 'Salmón ahumado': (22, 0, {}),
 'Skyr o yogur alto en proteína': (11, 4, {}),
 'Solomillo de cerdo': (21, 0, {}),
 'Taquitos de pavo': (19, 1.5, {}),
 'Tomate': (0.9, 2.7, {'': 120}),
 'Tomate triturado natural': (1.3, 3.5, {}),
 'Tomates cherry': (0.9, 2.7, {'': 15}),
 'Tomates secos en aceite': (5, 17.5, {}),
 'Vino blanco': (0, 2.6, {}),
 'Zanahoria': (0.9, 7, {'': 80}),
 'Carne picada de cordero': (17, 0, {}),
 'Paleta de cerdo deshuesada': (17.5, 0, {}),
 'Chuletas de cerdo': (16, 0, {}),
 'Carne de cabra': (12.4, 0, {}),
 'Pollo entero': (12.4, 0, {'': 1600}),
 'Kéfir natural': (0, 0, {}),
 'Queso de cabra fresco': (15, 1.5, {}),
 'Alubias rojas cocidas': (8.7, 16.4, {}),
 'Chicharros o caballas': (10.5, 0, {}),
 'Bacalao desalado': (18, 0, {}),
 'Queso fresco batido 0 %': (8, 3.5, {}),
 'Semillas de chía': (17, 8, {}),
 'Guindilla verde o jalapeño': (1, 5, {'': 15}),
 'Vino tinto': (0, 2.6, {}),
 'Salsa de skyr y ajo': (10, 4, {'cda': 15}),
 'Tzatziki': (9, 4, {'cda': 15}),
 'Ají verde': (1.5, 2, {'cda': 15}),
 # básicos con algo de macros
 'Salsa de soja': (8, 5, {'cda': 16}),
 'Salsa inglesa': (0, 19, {'cda': 17}),
 'Cacao puro en polvo': (20, 12, {'cda': 7}),
 'Linaza molida': (18, 2, {'cda': 7}),
 'Curry en polvo': (14, 25, {'cda': 6}),
 'Salsa sriracha': (2, 19, {'cdta': 5}),
 'Mayonesa': (1, 1, {'cda': 14}),
 'Mostaza': (4, 5, {'cdta': 5, 'cda': 15}), 'Mostaza de Dijon': (4, 5, {'cdta': 5, 'cda': 15}),
 'Sésamo': (18, 12, {'cdta': 3}),
 'Pimienta palmera o ñora': (10, 30, {'': 6}),
 'Mojo verde': (0.5, 3, {'cda': 15}), 'Mojo rojo': (1, 4, {'cda': 15}), 'Guasacaca': (1, 2, {'cda': 15}),
}
IGNORE_UNITS = {'hoja', 'rama', 'pizca'}

missing = set()
def grams(name, q, u):
    if q is None: return 0
    if u in ('g', 'ml'): return q
    t = T.get(name)
    if not t: missing.add((name, u)); return 0
    w = t[2].get(u)
    if w is None:
        if u in IGNORE_UNITS or u in ('cda', 'cdta'): return 0
        missing.add((name, u)); return 0
    return q * w

rows = []
for r in R:
    P = C = 0
    for x in r['i']:
        q, u, n = x[0], x[1], x[2]
        t = T.get(n)
        if not t:
            if x[3] not in ('e',) and q is not None: missing.add((n, u))
            continue
        g = grams(n, q, u)
        P += g * t[0] / 100; C += g * t[1] / 100
    P /= r['s']; C /= r['s']
    dp, dc = P - r['pr'], C - r['ch']
    flag = abs(dp) > max(4, 0.1 * r['pr']) or abs(dc) > max(3, 0.25 * max(r['ch'], 1))
    rows.append((r['id'], r['t'], r['pr'], round(P), r['ch'], round(C), flag))

print('%-26s %-8s %5s %5s | %4s %4s' % ('receta', 'tipo', 'pr', 'calc', 'ch', 'calc'))
for row in rows:
    print('%-26s %-8s %5s %5s | %4s %4s %s' % (row[0], row[1], row[2], row[3], row[4], row[5], '  <-- revisar' if row[6] else ''))
print('\nsin datos:', sorted(missing))
print('\nPlatos principales/primera comida con > 20 g de carbos calculados:',
      [r[0] for r in rows if r[1] in ('primera', 'fuerte', 'fria', 'sopa') and r[5] > 20])
