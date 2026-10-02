# 🍳 La Cocina de Nene

Una app de recetas hecha para Nene: platos altos en proteína y bajos en carbohidratos, con menú de la semana y lista de la compra.

## Qué hace

| Función | Descripción |
|---|---|
| 📖 **118 recetas** | Ingredientes con cantidades, pasos, consejos y qué servir al resto de la familia |
| 🎲 **¿Qué cocino hoy?** | Propone una receta al azar |
| 📅 **Menú** | Registro de cada día con su fecha: cada plato se marca cuando se ha comido, y la app suma la proteína, los carbos y las calorías de lo comido, dice cuánto falta para la meta y a dónde llega lo que queda del plan. Cada lunes llega un menú nuevo y las semanas anteriores se guardan con su media |
| 🥚 **Armar un plato** | En «A mano» se eligen los ingredientes (unos 125 alimentos comunes, con medidas caseras) y la app suma proteína, carbos y calorías. El plato se guarda en Recientes y se puede editar |
| ⚡ **Apuntar rápido** | Recientes, «Igual que ayer», copiar a otro día, mover de comida, deslizar entre días y deshacer |
| 🛒 **Lista de la compra** | Se arma sola con el menú, las recetas y los platos armados a mano. Se le puede añadir cualquier otra cosa y se envía por WhatsApp |
| 👩‍🍳 **Modo cocina** | Los pasos en grande, uno a uno, con la pantalla encendida y avisos de tiempo |
| 💾 **Copia de seguridad** | Guarda y restaura todo lo apuntado, por si se cambia de móvil |
| 📶 **Sin conexión** | La app abre aunque no haya cobertura, y avisa cuando hay una versión nueva |
| 🍃 **Ligeras** | Recetas suaves para los días de poco apetito |
| 🔎 **Filtros** | Tipo de comida, proteína, tiempo y estilo (venezolana, canaria, española, asiática, internacional, virales) |
| ❤️ **Guardadas** | Las recetas favoritas, a un toque |
| 💌 **Notas de amor** | Siguen igual que antes: su parte favorita |

## Instalar en el móvil

1. Abre https://diegotrade.github.io/nenes-kitchen/ en Safari (o Chrome en Android).
2. Toca **Compartir** y después **Añadir a pantalla de inicio**.

## Técnica

- La app publicada es un solo `index.html`, sin librerías (HTML, CSS y JavaScript).
- Los favoritos, el menú y la lista se guardan en el navegador del móvil (`localStorage`).
- `sw.js` guarda una copia para que funcione sin conexión. Cuando hay red, siempre se carga la última versión.
- Si algo falla al cargar, la página muestra todas las recetas en versión sencilla.

## Desarrollo

El código fuente está en `app/`:

| Carpeta | Qué hay |
|---|---|
| `app/src/` | Recetas (`data.js`), alimentos (`foods.js`), pantallas (`render.js`, `app.js`), estilos y plantilla |
| `app/build.js` | Junta todo en `index.html` y escribe `version.json` |
| `app/tests/` | Pruebas en un móvil simulado: menú, compra, modo cocina, copia de seguridad y uso sin conexión |
| `app/tools/` | Comprobación de la proteína, los carbos y las calorías de cada receta a partir de sus ingredientes |

```
node app/build.js                # construye index.html
python3 app/tests/test_app.py    # pruebas (necesita playwright)
python3 app/tools/audit.py       # revisa proteína y carbos de las recetas
python3 app/tools/fat.py         # revisa grasa y calorías
```

Después de cambiar algo en `app/src/`, hay que construir y subir también `index.html` y `version.json`.

## Versiones

| Versión | Cambios |
|---|---|
| V1 a V5 | Nene's Kitchen: generador de comidas, recetas, favoritos, lista de la compra |
| **V9.2** | Plan y comido: cada plato se marca con un toque cuando se ha comido y solo cuenta lo marcado. La tarjeta del día y la semana distinguen lo comido (sólido) del plan (rayado), la app pregunta por lo que quedó sin marcar, y las notas de amor salen al marcar una comida, ya no al azar |
| **V9.1** | Cocina asiática: 18 recetas nuevas (tailandesa, china, coreana, japonesa, vietnamita e india) sin arroz, fideos ni azúcar, con filtro «Asiáticas» (118 recetas) |
| **V9** | Diseño nuevo alrededor de la mascota: portada, colores de yema y coral, títulos redondos, tarjetas de receta con pegatina, ficha compacta, celebración al cumplir la meta y texto con mejor contraste |
| **V8.1** | El menú de la semana, o un solo día, se puede enviar por WhatsApp |
| **V8** | Modo cocina, copia de seguridad, uso sin conexión con aviso de versión nueva, lista de la compra con cosas propias y platos a mano. El código fuente y las pruebas pasan a estar en el repositorio |
| **V7.3** | Guía: ranking de lo que más daño le hace, de peor a menos malo |
| **V7.2** | Armar un plato con ingredientes: la app calcula proteína, carbos y calorías |
| **V7.1** | Al elegir una receta en el Menú solo salen las de esa comida (primera, merienda, principal o extra), con filtro por proteína en las principales |
| **V7** | Menú con fechas reales, historial semanal, plan frente a lo comido, recientes e «Igual que ayer» |
| **V6.2** | Nueva receta: ensalada griega con pollo (100 recetas) |
| **V6.1** | Menú editable como registro diario, calorías y grasa por receta |
| **V6** | La Cocina de Nene: 99 recetas en español, menú semanal, lista de la compra por categorías, filtro de recetas ligeras, guía rápida |

Hecho con Claude, con cariño para Nene 💕
