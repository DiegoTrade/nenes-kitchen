# 🍳 La Cocina de Nene

Una app de recetas hecha para Nene: platos altos en proteína y bajos en carbohidratos, con menú de la semana y lista de la compra.

## Qué hace

| Función | Descripción |
|---|---|
| 📖 **100 recetas** | Ingredientes con cantidades, pasos, consejos y qué servir al resto de la familia |
| 🎲 **¿Qué cocino hoy?** | Propone una receta al azar |
| 📅 **Menú** | Registro de cada día con su fecha: suma proteína, carbos y calorías, dice cuánto falta para la meta, y separa lo que ya pasó del plan. Cada lunes llega un menú nuevo y las semanas anteriores se guardan con su media |
| 🥚 **Armar un plato** | En «A mano» se eligen los ingredientes (unos 125 alimentos comunes, con medidas caseras) y la app suma proteína, carbos y calorías. El plato se guarda en Recientes y se puede editar |
| ⚡ **Apuntar rápido** | Recientes, «Igual que ayer», copiar a otro día, mover de comida, deslizar entre días y deshacer |
| 🛒 **Lista de la compra** | Se arma sola con el menú o las recetas, y se envía por WhatsApp |
| 🍃 **Ligeras** | Recetas suaves para los días de poco apetito |
| 🔎 **Filtros** | Tipo de comida, proteína, tiempo y estilo (venezolana, canaria, española, internacional, virales) |
| ❤️ **Guardadas** | Las recetas favoritas, a un toque |
| 💌 **Notas de amor** | Siguen igual que antes: su parte favorita |

## Instalar en el móvil

1. Abre https://diegotrade.github.io/nenes-kitchen/ en Safari (o Chrome en Android).
2. Toca **Compartir** y después **Añadir a pantalla de inicio**.

## Técnica

- Un solo `index.html`, sin librerías (HTML, CSS y JavaScript).
- Los favoritos, el menú y la lista se guardan en el navegador del móvil (`localStorage`).
- Si algo falla al cargar, la página muestra todas las recetas en versión sencilla.

## Versiones

| Versión | Cambios |
|---|---|
| V1 a V5 | Nene's Kitchen: generador de comidas, recetas, favoritos, lista de la compra |
| **V7.3** | Guía: ranking de lo que más daño le hace, de peor a menos malo |
| **V7.2** | Armar un plato con ingredientes: la app calcula proteína, carbos y calorías |
| **V7.1** | Al elegir una receta en el Menú solo salen las de esa comida (primera, merienda, principal o extra), con filtro por proteína en las principales |
| **V7** | Menú con fechas reales, historial semanal, plan frente a lo comido, recientes e «Igual que ayer» |
| **V6.2** | Nueva receta: ensalada griega con pollo (100 recetas) |
| **V6.1** | Menú editable como registro diario, calorías y grasa por receta |
| **V6** | La Cocina de Nene: 99 recetas en español, menú semanal, lista de la compra por categorías, filtro de recetas ligeras, guía rápida |

Hecho con Claude, con cariño para Nene 💕
