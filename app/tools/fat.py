"""Grasa y calorías por porción (kcal = 4·proteína + 4·carbos + 9·grasa). Usa la tabla de audit.py.
Uso: python3 app/tools/fat.py   (imprime las recetas cuya ficha no coincide con el cálculo)"""
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, 'audit.py'), encoding='utf8').read()
exec(src.split('rows = []')[0])   # define R, T, grams, missing

# grasa por 100 g (aprox.)
FAT = {
 'Aceitunas': 15, 'Aguacate': 15, 'Ajo': 0.5, 'Ají dulce': 0.3, 'Almendra molida': 50, 'Anchoa': 10, 'Apio': 0.2,
 'Atún en aceite de oliva': 8, 'Atún fresco': 3, 'Bebida de almendras sin azúcar': 1.1, 'Berenjena': 0.2, 'Brócoli': 0.4,
 'Calabacín': 0.3, 'Calabaza': 0.1, 'Caldo de pescado': 0.3, 'Caldo de pollo': 0.3,
 'Carne picada de ternera': 15, 'Carne picada de cerdo': 20, 'Carne picada de pollo': 8, 'Carne picada de cordero': 20,
 'Cebolla': 0.1, 'Cebolla morada': 0.1, 'Cebolleta': 0.2, 'Champiñones': 0.3, 'Chocolate negro 85 %': 46,
 'Chuletillas de cordero': 15, 'Cilantro': 0.5, 'Claras de huevo': 0.2, 'Col o repollo': 0.1, 'Coliflor': 0.3,
 'Conejo': 3.5, 'Contramuslo de pollo deshuesado': 6, 'Corvina o lubina': 2.5, 'Dorada o lubina': 3, 'Entrecot': 15,
 'Espinacas baby': 0.4, 'Espárragos trigueros': 0.1, 'Falda de ternera': 10, 'Filete de pescado blanco': 1,
 'Filete de ternera': 5, 'Frambuesas o arándanos': 0.6, 'Fresas': 0.3, 'Huevos': 10, 'Jamón serrano': 13,
 'Taquitos de jamón serrano': 13, 'Jengibre fresco': 0.8, 'Judías verdes': 0.2, 'Langostinos o gambas peladas': 1,
 'Leche de coco': 18, 'Lechuga': 0.2, 'Lechuga iceberg': 0.2, 'Lechuga romana': 0.3, 'Lima': 0, 'Limón': 0,
 'Lomo de salmón': 13, 'Lomo o cabezada de cerdo': 8, 'Mantequilla': 81, 'Mantequilla de cacahuete': 50, 'Merluza': 1.5,
 'Mozzarella rallada': 20, 'Muslos de pollo con hueso': 10, 'Nata para cocinar': 18, 'Nueces': 65, 'Parmesano': 28,
 'Pechuga de pollo': 1.5, 'Pepinillos': 0.1, 'Pepino': 0.1, 'Perejil': 0.8, 'Pimiento asado': 0.3, 'Pimiento rojo': 0.3,
 'Pimiento verde': 0.2, 'Pimientos de Padrón': 0.3, 'Pollo cocinado': 4, 'Proteína whey': 6, 'Puerro': 0.3,
 'Pulpo cocido': 1.5, 'Queso cheddar': 33, 'Queso cottage': 4.3, 'Queso crema': 25, 'Queso de cabra semicurado': 30,
 'Queso feta': 21, 'Queso fresco': 14, 'Queso rallado para gratinar': 27, 'Rúcula': 0.7, 'Salmón ahumado': 10,
 'Skyr o yogur alto en proteína': 0.3, 'Solomillo de cerdo': 3.5, 'Taquitos de pavo': 2, 'Tomate': 0.2,
 'Tomate triturado natural': 0.2, 'Tomates cherry': 0.2, 'Tomates secos en aceite': 14, 'Vino blanco': 0, 'Vino tinto': 0,
 'Zanahoria': 0.2, 'Carne de cabra': 2, 'Paleta de cerdo deshuesada': 18, 'Chuletas de cerdo': 12, 'Pollo entero': 10,
 'Kéfir natural': 0, 'Queso de cabra fresco': 20, 'Alubias rojas cocidas': 0.5, 'Chicharros o caballas': 6,
 'Bacalao desalado': 0.7, 'Queso fresco batido 0 %': 0.2, 'Semillas de chía': 31, 'Guindilla verde o jalapeño': 0.4,
 'Salsa de skyr y ajo': 0.5, 'Tzatziki': 4, 'Ají verde': 33, 'Mojo verde': 45, 'Mojo rojo': 45, 'Guasacaca': 25,
 'Salsa de soja': 0, 'Salsa inglesa': 0, 'Cacao puro en polvo': 14, 'Linaza molida': 42, 'Curry en polvo': 14,
 'Salsa sriracha': 1, 'Mayonesa': 75, 'Mostaza': 4, 'Mostaza de Dijon': 4, 'Sésamo': 50, 'Pimienta palmera o ñora': 10,
 'Aceite de oliva': 100, 'Aceite de sésamo': 100,
}
OIL_UNITS = {'cda': 13.5, 'cdta': 4.5, 'ml': 0.92}

out, miss = {}, set()
for r in R:
    P = C = F = 0
    for x in r['i']:
        q, u, n = x[0], x[1], x[2]
        if q is None: continue
        if n in ('Aceite de oliva', 'Aceite de sésamo'):
            g = q * OIL_UNITS.get(u, 1)
        else:
            g = grams(n, q, u)
        t = T.get(n)
        if t:
            P += g * t[0] / 100; C += g * t[1] / 100
        if n in FAT:
            F += g * FAT[n] / 100
        elif t is not None or x[3] != 'e':
            miss.add(n)
    s = r['s']
    P, C, F = P / s, C / s, F / s
    kc = 4 * P + 4 * C + 9 * F
    out[r['id']] = (round(F), int(round(kc / 10.0) * 10))

diff = [(r['id'], r.get('gr'), out[r['id']][0], r.get('kc'), out[r['id']][1]) for r in R
        if r.get('gr') != out[r['id']][0] or r.get('kc') != out[r['id']][1]]
if miss: print('sin grasa:', sorted(miss))
print('%-28s %6s %6s | %6s %6s' % ('receta', 'grasa', 'calc', 'kcal', 'calc'))
for d in diff: print('%-28s %6s %6s | %6s %6s' % d)
print('\n%d recetas revisadas, %d no coinciden con el cálculo.' % (len(R), len(diff)))
