# rogerarola.com

Portfolio de Roger Arola. Sitio estatico (HTML + CSS + JS), sin build ni dependencias.

## Estructura

- `index.html`, `styles.css`, `main.js`: la web.
- `assets/fonts/`: Alte Haas Grotesk. Copia aqui `AlteHaasGroteskRegular.ttf` y `AlteHaasGroteskBold.ttf` (nombres exactos).

## Editar contenido

Todo esta en `main.js`: `PROJECTS` (nombre, url, textos y etiquetas EN/ES) y `COPY` (textos de interfaz).
Para anadir un proyecto, anade un objeto a `PROJECTS`. La rueda se adapta sola.

## Probar en local

```bash
npx serve .
```

## Publicar en GitHub Pages

1. Sube todo a un repo y activa Settings > Pages > Deploy from branch (`main`, `/root`).
2. Dominio propio: en Pages > Custom domain pon `rogerarola.com` y apunta el DNS a GitHub.
3. Si el dominio final es otro, cambia `canonical`, `og:url` y el JSON-LD en `index.html`.

Pendiente opcional: imagen para compartir en redes en `assets/og.jpg` (1200x630) y descomentar el meta `og:image`.
