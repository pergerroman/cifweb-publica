# Club CIF — sitio web

Sitio institucional estático de Club CIF. Este repositorio reúne la portada principal, la propuesta Vacaciones en el CIF y el Festival Patagónico de Gimnasia (FPG) en una única publicación.

Repositorio oficial: <https://github.com/pergerroman/cifweb-publica>

No requiere compilación, gestor de paquetes ni base de datos: el contenido de esta carpeta es directamente publicable.

## URLs públicas

| Sección | URL canónica |
| --- | --- |
| Club CIF | https://clubcif.com/ |
| Vacaciones en el CIF | https://clubcif.com/vacaciones/ |
| Festival Patagónico de Gimnasia | https://clubcif.com/festival-patagonico-de-gimnasia/ |
| Qué es el FPG | https://clubcif.com/festival-patagonico-de-gimnasia/que-es/ |
| Ediciones anteriores | https://clubcif.com/festival-patagonico-de-gimnasia/ediciones-anteriores/ |

La ruta corta `https://clubcif.com/fpg/` redirige permanentemente a la URL canónica del Festival. La antigua ruta `/club-cif-vacaciones/` redirige a `/vacaciones/`.

## Estructura

```text
/
├── index.html                         # Portada y carrusel principal
├── styles.css
├── main.js
├── assets/                            # Recursos compartidos y de portada
├── vacaciones/                        # Landing de Vacaciones en el CIF
├── festival-patagonico-de-gimnasia/  # Landing y páginas internas del FPG
├── fpg/                               # Respaldo HTML para el alias corto
├── 404.html                           # Página de error personalizada
├── robots.txt
├── sitemap.xml
├── .htaccess                          # Reglas para Apache/cPanel
└── vercel.json                        # Reglas equivalentes para Vercel
```

Los recursos de cada sección se mantienen dentro de su propia carpeta para evitar colisiones entre estilos, scripts e imágenes que originalmente pertenecían a proyectos separados.

## Desarrollo local

Desde la raíz del proyecto:

```bash
python3 -m http.server 8000
```

Luego abrir `http://localhost:8000/`. Es preferible usar un servidor local en lugar de abrir los HTML con `file://`, porque algunas rutas, fuentes y recursos externos necesitan un origen HTTP.

### Subir cambios al repositorio

El remoto `origin` debe apuntar al repositorio oficial:

```bash
git remote set-url origin https://github.com/pergerroman/cifweb-publica.git
git add .
git commit -m "Actualizar sitio Club CIF"
git push origin main
```

Antes de subir, revisar `git status` y no incluir archivos del sistema como `.DS_Store`.

## Publicación en `public_html`

Copiar **el contenido de esta raíz** dentro de `public_html`, no la carpeta `CIF` completa. El resultado debe ser, por ejemplo:

```text
public_html/index.html
public_html/.htaccess
public_html/vacaciones/index.html
public_html/festival-patagonico-de-gimnasia/index.html
```

Es importante incluir archivos ocultos para que `.htaccess` también se publique.

### Requisitos del servidor Apache

- `mod_rewrite` para redirecciones.
- `mod_headers` y `mod_expires` para las políticas de caché configuradas.
- HTTPS válido para `clubcif.com` y `www.clubcif.com`.
- Permitir que `.htaccess` aplique reglas (`AllowOverride` habilitado por el proveedor).

La configuración actual fuerza:

- HTTP → HTTPS.
- `www.clubcif.com` → `clubcif.com`.
- `/fpg/` → `/festival-patagonico-de-gimnasia/`.
- `/club-cif-vacaciones/` → `/vacaciones/`.

La variante sin `www` es la única versión canónica. No se debe cambiar una redirección sin actualizar también canonical, Open Graph, sitemap y enlaces internos.

### Publicación alternativa en Vercel

`vercel.json` contiene la redirección de `www` al dominio raíz y habilita URLs con barra final. El directorio raíz del proyecto debe seleccionarse como raíz de publicación y no hace falta un comando de build.

## SEO y metadatos

Las páginas indexables incluyen:

- título de pestaña;
- descripción para buscadores;
- URL canónica absoluta;
- Open Graph para compartir en redes;
- Twitter Card;
- imagen social absoluta y texto alternativo.

`sitemap.xml` contiene únicamente URLs canónicas. Al agregar, eliminar o modificar contenido relevante:

1. actualizar la URL y su fecha `lastmod` en `sitemap.xml`;
2. comprobar que `robots.txt` siga apuntando a `https://clubcif.com/sitemap.xml`;
3. verificar que canonical y `og:url` coincidan exactamente;
4. no incluir redirecciones, aliases ni la página 404 en el sitemap.

La página de respaldo `/fpg/` tiene `noindex` y canonical hacia la ruta larga para evitar contenido duplicado.

## Modelo 3D del Festival

El archivo pesado no forma parte de este repositorio. La página del Festival carga:

```text
https://fpg.estudiovune.com/assets/models/FPG2026_t-shirt.glb
```

El origen `fpg.estudiovune.com` debe responder el `.glb` con:

```http
Access-Control-Allow-Origin: https://clubcif.com
Content-Type: model/gltf-binary
```

Configuración sugerida en el `.htaccess` de ese dominio:

```apache
<IfModule mod_headers.c>
  <FilesMatch "\.glb$">
    Header set Access-Control-Allow-Origin "https://clubcif.com"
  </FilesMatch>
</IfModule>

AddType model/gltf-binary .glb
```

La visualización usa `@google/model-viewer` desde un CDN. Si el dominio remoto, el encabezado CORS o el CDN dejan de estar disponibles, el modelo no se mostrará aunque el resto del sitio seguirá funcionando.

## Comportamientos relevantes

- El carrusel principal rota cada 6 segundos y enlaza a Vacaciones y al FPG.
- La opción `campus` permanece sin destino en `main.js` hasta contar con una URL confirmada.
- La galería de Vacaciones avanza automáticamente hacia la izquierda a 24 px/s.
- La galería permite desplazamiento manual, pausa 5 segundos después de la interacción y luego reanuda su recorrido.
- Las animaciones automáticas respetan `prefers-reduced-motion`.
- El Festival incluye un acceso a Club CIF en el header y un botón fijo para volver al inicio de la página.
- La página `404.html` ofrece accesos directos al inicio, Vacaciones y FPG.

La compatibilidad específica del botón fijo con Safari quedó pendiente de una validación dedicada. La versión actual conserva el comportamiento estable probado en navegadores principales, pero no debe considerarse una certificación final para Safari.

## Servicios externos

El sitio depende parcialmente de servicios externos que deben revisarse antes de cada publicación importante:

- `app.clubcif.com`: perfil e inscripción;
- WhatsApp, Instagram, YouTube, Flickr y Google Maps;
- Adobe Fonts (`use.typekit.net`) y Google Fonts;
- UNPKG para `model-viewer`;
- `fpg.estudiovune.com` para el modelo 3D.

## Pendientes editoriales

Hay decisiones que requieren información del Club y no deben completarse por suposición:

- confirmar la URL de la opción Campus del carrusel principal;
- aclarar condiciones de los pases y recorrido del transporte en Vacaciones;
- completar dirección y horarios de acceso al predio en Vacaciones;
- revisar temporada, fechas, precios y promociones antes de cada nueva campaña.

Los pendientes de Vacaciones también están señalados con comentarios dentro de `vacaciones/index.html`.

## Lista de control antes de publicar

- Revisar textos, fechas, precios, teléfonos y enlaces externos.
- Probar portada, Vacaciones, FPG, páginas internas y `404.html` en móvil y escritorio.
- Comprobar desde 320 px de ancho que headers, CTAs y controles fijos permanezcan dentro del viewport y no se superpongan.
- La prueba específica en Safari queda pendiente y no debe marcarse como validada hasta retomarla.
- Confirmar las redirecciones HTTP, `www`, `/fpg/` y la ruta antigua de Vacaciones.
- Verificar canonical, títulos, descripciones e imágenes sociales.
- Abrir directamente el modelo 3D y comprobar CORS desde `clubcif.com`.
- Actualizar `sitemap.xml` y este registro cuando corresponda.
- Publicar también `.htaccess` y comprobar que el servidor lo admita.
- Hacer una prueba en una ventana privada para evitar resultados engañosos por caché.

## Registro de cambios

Las modificaciones funcionales y decisiones de publicación se documentan en [`CHANGELOG.md`](CHANGELOG.md). Toda intervención futura debería agregar una entrada breve con fecha, alcance y cualquier dependencia o pendiente nuevo.
