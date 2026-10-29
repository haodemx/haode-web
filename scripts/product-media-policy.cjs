// Owner-approved MEDIA-01 hold. Only these exact INCELL identities are affected.
// Remove an entry only after SKU, quality and usage rights receive separate approval.
const PENDING_MEDIA = Object.freeze({
  'samsung-incell-note-10-lite': 'SS-NOTE10-LITE-INCELL-FHD',
  'samsung-incell-note-20': 'SS-NOTE-20-INCELL-FHD',
  'samsung-incell-s10-lite': 'SS-S10-LITE-INCELL-FHD',
});
const PENDING_MEDIA_TEXT = 'Foto específica de este modelo pendiente de confirmar.';
const PLACEHOLDER = 'assets/products/placeholder.svg';
function pendingMedia(id) { return Object.hasOwn(PENDING_MEDIA, id || ''); }
function mediaSafeProduct(product, app = false) {
  if (!pendingMedia(product.id)) return product;
  return app ? { ...product, imagen: `/${PLACEHOLDER}` }
    : { ...product, images: [PLACEHOLDER], videos: [] };
}
function mediaSafeHtml(html, id) {
  // M08 has no approved real photo. Its neutral UI placeholder must never be
  // advertised as Product.image, even after price or SEO regeneration.
  if (!pendingMedia(id) && id !== 'gafas-ai-gafas-ai-m08') return html;
  let result = html
    .replace(/<script([^>]*type=["']application\/ld\+json["'][^>]*)>([\s\S]*?)<\/script>/gi, (block, attrs, source) => {
      const data = JSON.parse(source);
      for (const node of data['@graph'] || [data]) {
        const types = [].concat(node?.['@type'] || []);
        if (types.includes('Product')) delete node.image;
      }
      return `<script${attrs}>${JSON.stringify(data, null, 2)}</script>`;
    });
  if (!pendingMedia(id)) return result;
  result = result
    .replace(/\s*<meta\b[^>]*(?:property|name)=["'](?:og:image(?::[^"']+)?|twitter:image(?::[^"']+)?)["'][^>]*>/gi, '')
    .replace(/(<div\b[^>]*\bdata-detail-mobile-preview[^>]*>[\s\S]*?<img\b[^>]*)(>)/gi, (block, image, close) => image.replace(/\s+srcset=["'][^"']*["']/gi, '').replace(/\bsrc=["'][^"']*["']/i, `src="/${PLACEHOLDER}"`) + close)
    .replace(/(<img\b[^>]*\bdata-detail-main-image[^>]*\bsrc=)["'][^"']*["']/gi, `$1"/${PLACEHOLDER}"`)
    .replace(/(<img\b[^>]*\bdata-detail-main-image[^>]*\balt=)["'][^"']*["']/gi, `$1"${PENDING_MEDIA_TEXT}"`)
    .replace(/(<div\b[^>]*\bdata-detail-mobile-preview[^>]*>[\s\S]*?<img\b[^>]*\balt=)["'][^"']*["']/gi, `$1"${PENDING_MEDIA_TEXT}"`)
    .replace(/(<div\b[^>]*\bdata-detail-mobile-preview[^>]*>[\s\S]*?<strong>)[\s\S]*?(<\/strong>)/gi, `$1${PENDING_MEDIA_TEXT}$2`);
  result = result.replace(/(<img\b[^>]*\bdata-detail-main-image[^>]*)(>)/gi, (block, image, close) => image.replace(/\s+srcset=["'][^"']*["']/gi, '') + close);
  result = result.replace(/(<meta\b[^>]*name=["']twitter:card["'][^>]*content=)["'][^"']*["']/gi, '$1"summary"');
  if (!result.includes('data-product-image-status')) {
    result = result.replace(/(<img\b[^>]*\bdata-detail-main-image[^>]*>)/i, `$1\n          <p class="product-image-status" data-product-image-status>${PENDING_MEDIA_TEXT}</p>`);
  } else result = result.replace(/(<[^>]+data-product-image-status[^>]*>)[\s\S]*?(<\/[^>]+>)/, `$1${PENDING_MEDIA_TEXT}$2`);
  return result;
}
module.exports = { PENDING_MEDIA, PENDING_MEDIA_TEXT, PLACEHOLDER, pendingMedia, mediaSafeProduct, mediaSafeHtml };
