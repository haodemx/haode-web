const PRODUCT_ID = 'x200t-cortadora-micas';
const ASSET = '/assets/products/cut-machine/x200t/haode-x200t-operacion';
const VIDEO = `${ASSET}-es-mx-v01.mp4`;
const POSTER = `${ASSET}-poster-v01.webp`;
const CAPTIONS = `${ASSET}-es-mx-v01.vtt`;

const SECTION = `<section class="x200t-operation-video" id="operacion-x200t" data-approved-operation-video="x200t-v01" aria-labelledby="x200t-operation-title">
            <h2 id="x200t-operation-title">Cómo funciona una cortadora de micas de hidrogel</h2>
            <p>Conoce la operación de la HAODE X200T: selección del modelo, lámina, corte y revisión de la pieza.</p>
            <video data-x200t-operation controls playsinline preload="none" width="1280" height="720" poster="${POSTER}" aria-label="Demostración de operación de la cortadora HAODE X200T">
              <source src="${VIDEO}" type="video/mp4" />
              <track src="${CAPTIONS}" kind="subtitles" srclang="es-MX" label="Español" />
              Tu navegador no permite reproducir este video. <a href="${VIDEO}">Abrir video de operación</a>.
            </video>
            <p data-x200t-video-error hidden>No se pudo reproducir el video. <a href="${VIDEO}">Abrir video de operación</a>.</p>
          </section>`;

const HEAD = `<style data-x200t-video-style>
    .x200t-operation-video { width: 100%; min-width: 0; margin-top: 24px; padding-top: 20px; border-top: 1px solid #e3e3e3; }
    .x200t-operation-video h2 { font-size: clamp(20px, 2vw, 26px); line-height: 1.3; margin: 0 0 10px; }
    .x200t-operation-video p { font-size: 15px; line-height: 1.6; margin: 0 0 14px; }
    .x200t-operation-video video { display: block; width: 100%; height: auto; aspect-ratio: 16 / 9; object-fit: contain; border-radius: 12px; background: #111; }
    .x200t-operation-video [data-x200t-video-error] { margin-top: 12px; }
    .x200t-operation-video a { text-decoration: underline; }
  </style>
  <script type="application/ld+json" data-x200t-video-schema>${JSON.stringify({
  '@context': 'https://schema.org', '@type': 'VideoObject',
  '@id': 'https://haode.com.mx/producto/x200t-cortadora-micas/#operacion-x200t',
  name: 'Cómo funciona una cortadora de micas de hidrogel | HAODE X200T',
  description: 'Demostración de operación de la cortadora HAODE X200T: selección del modelo, lámina, corte y revisión de la pieza.',
  thumbnailUrl: `https://haode.com.mx${POSTER}`, contentUrl: `https://haode.com.mx${VIDEO}`,
  embedUrl: 'https://haode.com.mx/producto/x200t-cortadora-micas/#operacion-x200t',
  uploadDate: '2026-11-10', duration: 'PT1M', inLanguage: 'es-MX'
})}</script>`;

function withX200tOperationVideo(html, productId) {
  if (productId !== PRODUCT_ID || html.includes('data-approved-operation-video="x200t-v01"')) return html;
  const anchor = /(<div class="detail-video-wrap"[\s\S]*?<\/div><\/div>)/;
  if (!anchor.test(html) || !html.includes('</head>') || !html.includes('</body>')) {
    throw new Error('X200T operation video requires the product media section and document boundaries');
  }
  return html.replace(anchor, `$1\n          ${SECTION}`)
    .replace('</head>', `  ${HEAD}\n</head>`)
    .replace('</body>', '  <script src="/x200t-video.js?v=20261110-v01" defer></script>\n</body>');
}

module.exports = { withX200tOperationVideo };
