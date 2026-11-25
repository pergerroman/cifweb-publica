# Registro de cambios

Este archivo registra cambios funcionales, de estructura, publicación y mantenimiento. Las correcciones puramente editoriales pueden agruparse cuando formen parte de una misma entrega.

## 2026-11-25

### Estructura y publicación

- Se unificaron la portada, Vacaciones en el CIF y el Festival Patagónico de Gimnasia bajo una única raíz publicable.
- Se establecieron como rutas públicas `/`, `/vacaciones/` y `/festival-patagonico-de-gimnasia/`.
- Se agregó el alias `/fpg/`, con redirección permanente hacia la ruta canónica larga y respaldo HTML con `noindex`.
- Se agregó la redirección de la ruta anterior `/club-cif-vacaciones/` hacia `/vacaciones/`.
- Se configuró HTTPS y la normalización de `www.clubcif.com` hacia `clubcif.com` para Apache y Vercel.
- Se definieron políticas de caché para documentos, estilos, scripts, fuentes e imágenes en `.htaccess`.

### Navegación y experiencia

- Se conectaron las opciones Vacaciones y FPG del carrusel principal con sus respectivas secciones.
- Se creó una página `404.html` personalizada con accesos a las secciones principales.
- Se agregó desplazamiento automático continuo a la galería de Vacaciones: movimiento visual hacia la izquierda a 12 px/s, pausa temporal tras interacción manual y respeto por movimiento reducido.

### SEO y redes sociales

- Se definieron títulos, descripciones, canonical, Open Graph y Twitter Cards para las páginas indexables.
- Se creó `sitemap.xml` con las URLs canónicas y sus páginas internas.
- Se creó `robots.txt` y se vinculó el sitemap público.
- Se excluyó el alias `/fpg/` del índice mediante `noindex` para evitar duplicación.

### Festival y modelo 3D

- Se reemplazó la referencia al modelo 3D local por `https://fpg.estudiovune.com/assets/models/FPG2026_t-shirt.glb` para evitar almacenar el archivo pesado en el repositorio.
- Se documentó el requisito CORS `Access-Control-Allow-Origin: https://clubcif.com` y el tipo MIME `model/gltf-binary` para el servidor que aloja el `.glb`.

### Documentación

- Se creó `README.md` con arquitectura, URLs, publicación en `public_html`, configuración de servidor, SEO, dependencias externas, mantenimiento y lista de control.
- Se creó este registro de cambios.

### Pendientes

- Confirmar el destino de Campus en el carrusel principal.
- Completar aclaraciones de pases, recorrido de transporte, dirección y horarios del predio en Vacaciones.
- Revisar información temporal de la temporada 2026/27 antes de futuras publicaciones.
