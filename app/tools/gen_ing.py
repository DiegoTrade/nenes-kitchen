"""Genera app/src/ingredientes.js: proteína, carbohidratos y grasa por 100 g de cada ingrediente de las recetas,
con lo que pesa cada medida. Sale de las tablas de audit.py y fat.py, que son la fuente: la app lo usa para
recalcular un plato del menú cuando se le cambia la cantidad de un ingrediente o se le quita uno.
Uso: python3 app/tools/gen_ing.py"""
import io, json, os, contextlib
HERE = os.path.dirname(os.path.abspath(__file__))
ns = {'__file__': os.path.join(HERE, 'fat.py')}
src = open(os.path.join(HERE, 'fat.py'), encoding='utf8').read().split('out, miss = {}, set()')[0]
with contextlib.redirect_stdout(io.StringIO()):
    exec(src, ns)
T, FAT, OIL = ns['T'], ns['FAT'], ns['OIL_UNITS']
used = sorted({x[2] for r in ns['R'] for x in r['i'] if x[0] is not None})
out = {}
for n in used:
    if n not in T and n not in FAT:
        continue
    p, c, units = T.get(n, (0, 0, {}))
    f = FAT.get(n, 0)
    if n in ('Aceite de oliva', 'Aceite de sésamo'):
        units = dict(OIL)
    if p + c + f <= 0:
        continue
    out[n] = [p, c, f, units]
body = ',\n'.join(' %s: %s' % (json.dumps(k, ensure_ascii=False), json.dumps(v, ensure_ascii=False, separators=(',', ':'))) for k, v in out.items())
js = ('/* Ingredientes de las recetas: [proteína, carbohidratos netos, grasa] por 100 g y lo que pesa cada medida (g).\n'
      '   Generado por app/tools/gen_ing.py a partir de las tablas de audit.py y fat.py. No editar a mano. */\n'
      'var INGREDIENTES = {\n' + body + '\n};\n')
open(os.path.join(HERE, '..', 'src', 'ingredientes.js'), 'w', encoding='utf8').write(js)
print('ok ingredientes.js ·', len(out), 'ingredientes')
