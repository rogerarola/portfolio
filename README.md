# rogerarola.com

Portfolio de Roger Arola. Sitio estatico (HTML + CSS + JS), sin build ni dependencias.

## Estructura

- `index.html`, `styles.css`, `main.js`: la web.
- `assets/fonts/`: Alte Haas Grotesk. Copia aqui `AlteHaasGroteskRegular.ttf` y `AlteHaasGroteskBold.ttf` (nombres exactos).
- `assets/shots/`: capturas de cada web para el carousel (`arla-1.jpg` ... `far-3.jpg`).
- `scripts/capture.mjs`: genera esas capturas automaticamente.

## Capturas del carousel

Cada proyecto usa 3 capturas de 1600x1000 (16:10): `assets/shots/<id>-1.jpg`, `-2.jpg`, `-3.jpg`
con `<id>` = `arla`, `pulso`, `far`.

Automatico:

```bash
npm install
npx playwright install chromium
npm run shots
```

Manual: haz las capturas tu mismo y guardalas con esos nombres.

Si falta una captura, la tarjeta usa la imagen `cover` del proyecto (og-image remota) y,
si tampoco carga, una tarjeta tipografica con el nombre. La web nunca se rompe.

## Editar contenido

Todo esta en `main.js`: `PROJECTS` (nombre, url, textos EN/ES, colores de tarjeta) y `COPY` (textos de interfaz).
Para anadir un proyecto, anade un objeto a `PROJECTS` y sus 3 capturas.

## Probar en local

```bash
npm run dev
```

## Publicar en GitHub Pages

1. Sube todo a un repo y activa Settings > Pages > Deploy from branch (`main`, `/root`).
2. Dominio propio: en Pages > Custom domain pon `rogerarola.com` (crea el archivo `CNAME`) y apunta el DNS a GitHub.
3. Si el dominio final es otro, cambia `canonical`, `og:url` y el JSON-LD en `index.html`.

Pendiente opcional: imagen para compartir en redes en `assets/og.jpg` (1200x630) y descomentar el meta `og:image`.
