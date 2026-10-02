"""Pruebas de La Cocina de Nene en un móvil simulado.

Uso (desde la raíz del repositorio):
    node app/build.js && python3 app/tests/test_app.py

Necesita: pip install playwright  (y un Chromium instalado para Playwright).
Sirve la app en http://localhost para poder probar también el modo sin conexión.
"""
import asyncio, datetime, functools, http.server, json, os, shutil, sys, tempfile, threading
from playwright.async_api import async_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
FILES = ['index.html', 'sw.js', 'manifest.webmanifest', 'version.json', 'mascota.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png']
KEY = 'cocina-nene-v1'
WED = datetime.datetime(2026, 9, 30, 13, 0)          # miércoles
SLOT_TYPES = {'p': {'primera'}, 's1': {'snack'}, 's2': {'snack'}, 'm': {'fuerte', 'fria', 'sopa'}}
failures = []


def check(name, ok, detail=''):
    print(('  ok   ' if ok else '  FALLA ') + name + (' -> ' + str(detail) if detail != '' and not ok else ''))
    if not ok:
        failures.append(name)


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def serve(directory):
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=directory))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, 'http://localhost:%d/' % srv.server_address[1]


def old_day():
    return {"items": [{"s": "p", "id": "perico", "f": 1}, {"s": "s1", "id": "batido-cafe", "f": 1},
                      {"s": "m", "id": "pollo-ajillo", "f": 1}, {"s": "s2", "id": "cottage-atun", "f": 1}]}


async def new_page(p, url, seed=None, when=WED, dark=False, width=390, clock=True):
    b = await p.chromium.launch()
    ctx = await b.new_context(viewport={'width': width, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True,
                              color_scheme='dark' if dark else 'light', accept_downloads=True)
    if seed is not None:
        await ctx.add_init_script("if(!sessionStorage.getItem('seeded')){localStorage.setItem('%s', %s);sessionStorage.setItem('seeded','1');}"
                                  % (KEY, json.dumps(json.dumps(seed))))
    pg = await ctx.new_page()
    pg.errs = []
    pg.on('pageerror', lambda e: pg.errs.append(str(e)))
    if clock:
        await pg.clock.install(time=when)
    await pg.goto(url)
    await pg.wait_for_timeout(350)
    return b, ctx, pg


async def state(pg):
    return await pg.evaluate("JSON.parse(localStorage.getItem('%s'))" % KEY)


async def swipe(pg, sel, x1, x2):
    await pg.evaluate("""([sel, x1, x2]) => { const el = document.querySelector(sel);
      const mk = (t, x) => new TouchEvent(t, {bubbles: true, touches: t === 'touchend' ? [] : [new Touch({identifier: 1, target: el, clientX: x, clientY: 400})],
        changedTouches: [new Touch({identifier: 1, target: el, clientX: x, clientY: 400})]});
      el.dispatchEvent(mk('touchstart', x1)); el.dispatchEvent(mk('touchend', x2)); }""", [sel, x1, x2])
    await pg.wait_for_timeout(150)


async def t_recipes_and_guide(p, url):
    print('Recetas y guía')
    b, ctx, pg = await new_page(p, url)
    n = await pg.evaluate("RECETAS.length")
    check('la cabecera dice el número de recetas', str(n) in await pg.inner_text('.app-head .sub'))
    await pg.fill('#q', 'griega'); await pg.wait_for_timeout(150)
    check('buscar «griega» encuentra recetas', await pg.locator('#grid .card').count() >= 1)
    await pg.locator('#grid .card').first.click(); await pg.wait_for_timeout(250)
    txt = await pg.inner_text('#sheet-panel')
    check('la ficha muestra calorías e ingredientes', 'calorías' in txt.lower() and 'ingredientes' in txt.lower())
    await pg.keyboard.press('Escape')
    await pg.click('[data-tab="guia"]'); await pg.wait_for_timeout(150)
    card = pg.locator('#v-guia .g-card', has_text='Lo que más daño le hace')
    check('la guía tiene el ranking de 8 puntos', await card.locator('.rank li').count() == 8)
    check('sin desbordes a 390 px', await pg.evaluate("document.documentElement.scrollWidth") == 390)
    check('sin errores de JavaScript', not pg.errs, pg.errs)
    await b.close()


async def t_fresh_and_dates(p, url):
    print('Menú: primera vez y fechas')
    b, ctx, pg = await new_page(p, url)
    await pg.click('[data-tab="menu"]'); await pg.wait_for_timeout(200)
    check('semana con fechas', (await pg.inner_text('.wnav-l')).replace('\n', ' ') == 'Esta semana 28 sep – 4 oct')
    check('día de hoy con fecha', await pg.inner_text('#day-title') == 'Miércoles 30 sep')
    nums = [await pg.locator('.wk .wk-n').nth(i).inner_text() for i in range(7)]
    check('los días ya pasados empiezan vacíos', nums[0] == '–' and nums[1] == '–' and nums[2] != '–', nums)
    check('los días que faltan salen como plan', await pg.locator('.wk.plan').count() == 4)
    await pg.click('[data-wnext]'); await pg.wait_for_timeout(120)
    first = await pg.inner_text('.it-n >> nth=0')
    await pg.reload(); await pg.wait_for_timeout(350)
    await pg.click('[data-wnext]'); await pg.wait_for_timeout(120)
    check('el plan de la semana que viene no cambia al volver', first == await pg.inner_text('.it-n >> nth=0'))
    check('no se puede ir más allá de la semana que viene', await pg.is_disabled('[data-wnext]'))
    check('sin errores de JavaScript', not pg.errs, pg.errs)
    await b.close()


async def t_migration_and_flows(p, url):
    print('Menú: datos antiguos y uso diario')
    seed = {"tab": "menu", "favs": ["ceviche"], "menu": {"v": 2, "days": [old_day() for _ in range(7)]}, "shop": {"entries": [], "checked": {}}}
    seed["menu"]["days"][1]["items"].append({"s": "s2", "n": "3 huevos con medio aguacate", "pr": 20, "ch": 3, "kc": 330, "f": 1})
    b, ctx, pg = await new_page(p, url, seed)
    await pg.click('[data-day="1"]'); await pg.wait_for_timeout(120)
    check('el menú antiguo pasa a esta semana', await pg.locator('.it').count() == 5)
    check('día pasado: «Llegó a la meta»', 'Llegó a la meta' in await pg.inner_text('.st-msg'))
    await pg.click('[data-day="2"]'); await pg.wait_for_timeout(120)
    await pg.click('[data-sameprev]'); await pg.wait_for_timeout(120)
    check('«Igual que ayer» copia el día', await pg.locator('.it').count() == 5)
    await pg.click('.toast-act'); await pg.wait_for_timeout(120)
    check('y se puede deshacer', await pg.locator('.it').count() == 4)
    await swipe(pg, '.dayview', 300, 120)
    check('deslizar pasa al día siguiente', await pg.inner_text('#day-title') == 'Jueves 1 oct')
    await pg.click('[data-item="0"]'); await pg.wait_for_timeout(150)
    await pg.click('[data-moveto="m"]'); await pg.wait_for_timeout(100)
    check('mover de comida', 'COMIDA PRINCIPAL' in (await pg.inner_text('#picker .kicker')).upper())
    await pg.click('[data-portion="0.5"]'); await pg.wait_for_timeout(100)
    check('porción y media', '×1½' in await pg.inner_text('#v-menu'))
    await pg.click('[data-pk="copiar"]'); await pg.click('[data-copyto="4"]'); await pg.wait_for_timeout(100)
    check('copiar a otro día', 'Copiado al viernes' in await pg.inner_text('#toast'))
    n0 = await pg.locator('.it').count()
    await pg.click('[data-pk="quitar"]'); await pg.wait_for_timeout(120)
    n1 = await pg.locator('.it').count()
    await pg.click('.toast-act'); await pg.wait_for_timeout(120)
    check('quitar y deshacer', n1 == n0 - 1 and await pg.locator('.it').count() == n0)
    from urllib.parse import unquote
    wa = unquote(await pg.get_attribute('.wa-menu', 'href'))
    check('el menú de la semana se puede enviar por WhatsApp', wa.startswith('https://wa.me/?text=*Menú de la semana · 28 sep – 4 oct*') and '*Lunes 28* · ' in wa
          and '• Comida principal: Pollo al ajillo' in wa and '*Domingo 4*' in wa, wa[:160])
    wd = unquote(await pg.get_attribute('.wa-day', 'href'))
    check('y también un solo día', '*Jueves 1 oct*' in wd and 'g de proteína' in wd and 'kcal' in wd, wd[:160])
    st = await state(pg)
    check('se guarda con fechas', list(st['menu']['weeks'].keys()) == ['2026-09-28'], list(st['menu']['weeks'].keys()))
    check('sin errores de JavaScript', not pg.errs, pg.errs)
    await b.close()
    # el lunes siguiente llega un plan nuevo y la semana anterior se conserva
    st['tab'] = 'menu'
    b, ctx, pg = await new_page(p, url, st, when=datetime.datetime(2026, 10, 7, 20, 0))
    st2 = await state(pg)
    check('semana nueva y la anterior guardada', sorted(st2['menu']['weeks'].keys()) == ['2026-09-28', '2026-10-05'], sorted(st2['menu']['weeks'].keys()))
    await pg.evaluate("window.scrollTo(0, 99999)"); await pg.wait_for_timeout(100)
    check('tendencia por semanas', await pg.locator('.tr').count() == 2)
    check('sin errores de JavaScript', not pg.errs, pg.errs)
    await b.close()


async def t_picker_filters(p, url):
    print('Menú: al elegir receta solo salen las de esa comida')
    b, ctx, pg = await new_page(p, url)
    await pg.click('[data-tab="menu"]'); await pg.wait_for_timeout(150)
    types = await pg.evaluate("Object.fromEntries(RECETAS.map(r => [r.id, r.t]))")
    for slot in ['p', 's1', 'm', 's2']:
        await pg.click('[data-add="%s"]' % slot); await pg.wait_for_timeout(120)
        if await pg.inner_text('.seg [aria-selected="true"]') != 'Recetas':
            await pg.click('[data-pktab="recetas"]'); await pg.wait_for_timeout(100)
        ids = await pg.eval_on_selector_all('#pk-results [data-pick]', 'els => els.map(e => e.dataset.pick)')
        check('%s: %d recetas, todas de su tipo' % (slot, len(ids)), ids and all(types[i] in SLOT_TYPES[slot] for i in ids))
        if slot == 'm':
            await pg.click('[data-pkprot="pescado"]'); await pg.wait_for_timeout(100)
            fish = await pg.eval_on_selector_all('#pk-results [data-pick]', 'els => els.map(e => e.dataset.pick)')
            prot = await pg.evaluate("Object.fromEntries(RECETAS.map(r => [r.id, r.p]))")
            check('filtro de pescado', fish and all(prot[i] == 'pescado' for i in fish))
        await pg.click('[data-pk-close]'); await pg.wait_for_timeout(80)
    check('sin errores de JavaScript', not pg.errs, pg.errs)
    await b.close()


async def t_builder_and_shop(p, url):
    print('A mano: armar un plato, y lista de la compra')
    b, ctx, pg = await new_page(p, url)
    await pg.click('[data-tab="menu"]'); await pg.wait_for_timeout(150)
    await pg.click('[data-add="p"]'); await pg.click('[data-pktab="mano"]'); await pg.wait_for_timeout(120)
    await pg.click('[data-bdadd="huevo"]')
    for _ in range(4):
        await pg.click('[data-bdstep="0"][data-d="1"]')
    await pg.fill('#bd-q', 'puerro'); await pg.press('#bd-q', 'Enter'); await pg.wait_for_timeout(100)
    await pg.fill('#bd-q', 'kiwi'); await pg.wait_for_timeout(100)
    check('el kiwi está en la lista de alimentos', await pg.locator('#bd-results [data-bdadd="kiwi"]').count() == 1)
    await pg.fill('#bd-q', 'queso fresco'); await pg.wait_for_timeout(100)
    await pg.click('#bd-results [data-bdadd="queso-fresco"]'); await pg.wait_for_timeout(150)
    tot = (await pg.inner_text('#bd-tot')).replace('\n', ' ')
    check('5 huevos + puerro + 100 g de queso fresco = 49 g / 16 g / 630 kcal', tot == '49 g proteína 16 g carbos 630 kcal', tot)
    await pg.click('#pk-form [type=submit]'); await pg.wait_for_timeout(200)
    check('el plato queda en el menú con nombre automático', '5 huevos, puerro y queso fresco' in await pg.inner_text('#v-menu'))
    idx = await pg.eval_on_selector_all('[data-item]', "els => els.find(e => e.textContent.includes('5 huevos')).dataset.item")
    await pg.click('[data-item="%s"]' % idx); await pg.click('[data-pk="editar"]'); await pg.wait_for_timeout(150)
    await pg.select_option('[data-bdu="0"]', 'g'); await pg.wait_for_timeout(100)
    check('cambiar la medida convierte la cantidad', await pg.input_value('[data-bdq="0"]') == '275')
    await pg.fill('#bd-n', 'Tortilla de puerro'); await pg.click('#pk-form [type=submit]'); await pg.wait_for_timeout(200)
    check('editar ingredientes y renombrar', 'Tortilla de puerro' in await pg.inner_text('#v-menu'))
    await pg.click('[data-add="p"]'); await pg.wait_for_timeout(150)
    check('aparece en Recientes de esa comida', await pg.eval_on_selector_all('.pk-rec .pk-n', 'e => e.map(x => x.textContent)') == ['Tortilla de puerro'])
    await pg.click('[data-pk-close]')
    await pg.click('[data-add="m"]'); await pg.click('[data-pktab="mano"]'); await pg.click('[data-bdnums]'); await pg.wait_for_timeout(100)
    await pg.fill('#pk-n', 'Pollo del restaurante'); await pg.fill('#pk-pr', '45'); await pg.click('#pk-form [type=submit]'); await pg.wait_for_timeout(150)
    check('«solo sé los números» sigue funcionando', 'Pollo del restaurante' in await pg.inner_text('#v-menu'))
    # compra
    await pg.evaluate("window.scrollTo(0, 99999)")
    await pg.click('[data-menushop]'); await pg.wait_for_timeout(150)
    await pg.click('[data-tab="compra"]'); await pg.wait_for_timeout(200)
    txt = await pg.inner_text('#v-compra')
    check('el plato a mano entra en la compra', 'Puerro' in txt and 'Tortilla de puerro' in txt)
    eggs = await pg.eval_on_selector_all('#v-compra .ing-n', "els => els.filter(e => e.firstChild.textContent.trim() === 'Huevos').length")
    check('los huevos del plato se suman a los de las recetas en una sola línea', eggs == 1, eggs)
    st = await state(pg)
    wk = st['menu']['weeks']['2026-09-28']['days']
    want = {it['id'] for i in range(2, 7) for it in wk[i]['items'] if 'id' in it}
    check('la compra solo cuenta de hoy al domingo', {e['id'] for e in st['shop']['entries'] if e['m']} == want)
    await pg.fill('#shop-own', 'Papel de cocina'); await pg.press('#shop-own', 'Enter'); await pg.wait_for_timeout(150)
    check('añadir algo propio a la lista', 'Papel de cocina' in await pg.inner_text('#v-compra') and 'OTRAS COSAS' in (await pg.inner_text('#v-compra')).upper())
    wa = await pg.get_attribute('[data-wa]', 'href')
    check('lo propio va en el mensaje de WhatsApp', 'Papel%20de%20cocina' in wa)
    before = await pg.inner_text('#shop-count')
    await pg.click('.own-row .ing'); await pg.wait_for_timeout(120)
    check('tacharlo baja el contador', int(await pg.inner_text('#shop-count')) == int(before) - 1)
    await pg.click('[data-rmown="0"]'); await pg.wait_for_timeout(120)
    check('y se puede quitar', 'Papel de cocina' not in await pg.inner_text('#v-compra'))
    check('sin desbordes a 390 px', await pg.evaluate("document.documentElement.scrollWidth") == 390)
    check('sin errores de JavaScript', not pg.errs, pg.errs)
    await b.close()


async def t_cook_mode(p, url):
    print('Modo cocina')
    b, ctx, pg = await new_page(p, url)
    await pg.fill('#q', 'pollo al ajillo'); await pg.wait_for_timeout(150)
    await pg.locator('#grid .card').first.click(); await pg.wait_for_timeout(250)
    await pg.click('[data-cook]'); await pg.wait_for_timeout(200)
    check('se abre con los ingredientes', 'Ten a mano' in await pg.inner_text('#cook') and await pg.locator('#cook .ing').count() > 3)
    n = await pg.evaluate("RECETAS.find(r => r.id === 'pollo-ajillo').st.length")
    started = False
    for k in range(1, n + 1):
        await pg.click('[data-ck-go="1"]'); await pg.wait_for_timeout(80)
        if not started and await pg.locator('[data-ck-timer]').count():
            secs = int(await pg.get_attribute('[data-ck-timer] >> nth=0', 'data-ck-timer'))
            await pg.click('[data-ck-timer] >> nth=0'); await pg.wait_for_timeout(100)
            started = True
            check('el temporizador arranca', await pg.locator('.ck-chip').count() == 1 and not await pg.locator('.ck-chip.done').count())
            await pg.clock.fast_forward(secs * 1000 + 1500); await pg.wait_for_timeout(200)
            check('y avisa al terminar', await pg.locator('.ck-chip.done').count() == 1)
    check('hay pasos con tiempo para avisar', started)
    check('cuenta los pasos', ('Paso %d de %d' % (n, n)) in await pg.inner_text('.ck-count'))
    await pg.click('[data-ck-go="1"]'); await pg.wait_for_timeout(150)
    check('al terminar vuelve a la ficha', await pg.is_hidden('#cook') and await pg.is_visible('#sheet'))
    check('sin errores de JavaScript', not pg.errs, pg.errs)
    await b.close()


async def t_backup(p, url):
    print('Copia de seguridad')
    seed = {"tab": "guia", "favs": ["ceviche", "perico"], "menu": {"v": 2, "days": [old_day() for _ in range(7)]},
            "shop": {"entries": [], "checked": {}, "own": ["Café"], "dishes": []}}
    b, ctx, pg = await new_page(p, url, seed)
    check('avisa de que no hay copia todavía', 'Todavía no has guardado ninguna copia' in await pg.inner_text('#backup'))
    async with pg.expect_download() as dl:
        await pg.click('[data-bk-save]')
    path = await (await dl.value).path()
    data = json.load(open(path, encoding='utf8'))
    check('el archivo lleva los datos', data['app'] == 'cocina-nene' and data['data']['favs'] == ['ceviche', 'perico'] and data['data']['shop']['own'] == ['Café'])
    await pg.wait_for_timeout(150)
    check('apunta la fecha de la última copia', 'Última copia: 30 sep 2026' in (await pg.inner_text('#backup')).replace('\n', ' '))
    # móvil nuevo: sin datos, restaurar
    await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(350)
    await pg.click('[data-tab="guia"]')
    bad = os.path.join(tempfile.gettempdir(), 'no-es-copia.json'); open(bad, 'w').write('{"hola": 1}')
    await pg.set_input_files('#bk-file', bad); await pg.wait_for_timeout(200)
    check('rechaza un archivo que no es una copia', 'no es una copia' in await pg.inner_text('#backup'))
    await pg.set_input_files('#bk-file', path); await pg.wait_for_timeout(200)
    check('pide confirmar antes de reemplazar', await pg.locator('[data-bk-ok]').count() == 1)
    await pg.click('[data-bk-ok]'); await pg.wait_for_timeout(500)
    st = await state(pg)
    check('restaura favoritos, menú y lista', st['favs'] == ['ceviche', 'perico'] and st['shop']['own'] == ['Café'] and '2026-09-28' in st['menu']['weeks'])
    check('sin errores de JavaScript', not pg.errs, pg.errs)
    await b.close()


async def t_offline_and_update(p, url, directory):
    print('Sin conexión y aviso de versión nueva')
    b, ctx, pg = await new_page(p, url, clock=False)
    await pg.wait_for_function("navigator.serviceWorker.controller !== null || navigator.serviceWorker.ready.then(() => true)", timeout=10000)
    await pg.reload(); await pg.wait_for_timeout(600)
    check('el service worker controla la página', await pg.evaluate("!!navigator.serviceWorker.controller"))
    await ctx.set_offline(True)
    await pg.reload(); await pg.wait_for_timeout(800)
    check('sin conexión la app sigue abriendo', await pg.evaluate("window.__appOK === true") and await pg.locator('#grid .card').count() > 50)
    await pg.click('[data-tab="menu"]'); await pg.wait_for_timeout(150)
    check('y el menú funciona', await pg.locator('.wk').count() == 7)
    check('sin aviso de versión cuando no hay red', await pg.is_hidden('#update'))
    await ctx.set_offline(False)
    json.dump({'v': 'otra-version'}, open(os.path.join(directory, 'version.json'), 'w'))
    await pg.reload(); await pg.wait_for_timeout(4200)
    check('avisa cuando hay una versión nueva', await pg.is_visible('#update'))
    check('sin errores de JavaScript', not pg.errs, pg.errs)
    await b.close()


async def t_small_and_dark(p, url):
    print('Pantalla pequeña y modo oscuro')
    b, ctx, pg = await new_page(p, url, width=320, dark=True)
    for tab in ['menu', 'compra', 'guia', 'recetas']:
        await pg.click('[data-tab="%s"]' % tab); await pg.wait_for_timeout(120)
        check('%s cabe en 320 px' % tab, await pg.evaluate("document.documentElement.scrollWidth") == 320)
    check('sin errores de JavaScript', not pg.errs, pg.errs)
    await b.close()


async def main():
    tmp = tempfile.mkdtemp(prefix='cocina-')
    for f in FILES:
        shutil.copy(os.path.join(ROOT, f), tmp)
    srv, url = serve(tmp)
    try:
        async with async_playwright() as p:
            await t_recipes_and_guide(p, url)
            await t_fresh_and_dates(p, url)
            await t_migration_and_flows(p, url)
            await t_picker_filters(p, url)
            await t_builder_and_shop(p, url)
            await t_cook_mode(p, url)
            await t_backup(p, url)
            await t_small_and_dark(p, url)
            await t_offline_and_update(p, url, tmp)
    finally:
        srv.shutdown()
        shutil.rmtree(tmp, ignore_errors=True)
    print('\n%s' % ('TODO BIEN' if not failures else 'FALLAN %d: %s' % (len(failures), '; '.join(failures))))
    sys.exit(1 if failures else 0)


asyncio.run(main())
