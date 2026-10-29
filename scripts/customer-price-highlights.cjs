const fs = require('fs');
const path = require('path');

// Existing static cards and landing copy must use the same approved facts as details.
function syncPriceHighlights(root, products, sourceLabel) {
  const approved = new Map(products.filter(p => p.priceSource?.startsWith(sourceLabel)).map(p => [p.id, p]));
  const legacy = new Map([
    ['ai-smart-glasses-aimb-g5.html', 'aimb-g5-ai-sports'],
    ['ai-smart-glasses-aimb-g3.html', 'haode-ai-g3-smart-glasses'],
    ['ai-smart-glasses-w610.html', 'haode-ai-w610-smart-glasses'],
    ['ai-smart-glasses-w630.html', 'w630-ai-pro'],
  ]);
  const amount = (id, label) => approved.get(id)?.prices.find(p => p.quantity === label)?.price.replace(/ MXN$/, '');
  const table = p => p.prices.map(t => `<tr><th scope="row">${t.quantity}</th><td>${t.price}</td></tr>`).join('\n');
  const named = (text, p) => {
    for (const tier of p.prices) {
      const label = tier.quantity.includes('VIP') ? '(?:⭐\\s*)?VIP' : tier.quantity;
      text = text.replace(new RegExp(`(${label}\\s*:?\\s*)\\$[0-9,]+(?:\\.[0-9]+)?`, 'gi'), (_match, prefix) => prefix + tier.price.replace(/ MXN$/, ''));
    }
    return text;
  };
  const files = ['index.html', 'micas.html', 'categoria/micas/index.html', 'ai-productos.html',
    'categoria/camaras-inteligentes/index.html', 'pantallas-iphone-11-xr-mayoreo/index.html',
    'pantallas-premium-iphone-samsung-fabrica/index.html', 'categoria/iphone-incell/index.html',
    'categoria/maquinas-de-hidrogel/index.html', 'productos-ai.html', 'productos-ai/index.html',
    'categoria/productos-ai/index.html'];
  const changed = [];
  for (const relative of files) {
    const file = path.join(root, relative);
    if (!fs.existsSync(file)) continue;
    let text = fs.readFileSync(file, 'utf8');
    const before = text;
    text = text.replace(/<article\b[^>]*>[\s\S]*?<\/article>/g, block => {
      const ids = new Set([...block.matchAll(/href="\/producto\/([^/]+)\//g)].map(m => m[1]));
      for (const [route, id] of legacy) if (block.includes(`href="/${route}"`)) ids.add(id);
      // Hydrogel cards have exact, unique existing assets and may lack detail links.
      for (const id of ['mica-hd', 'mica-matte', 'mica-privacidad-hd', 'mica-privacidad-matte']) {
        const p = approved.get(id);
        if (p?.images.some(img => block.includes(`src="/${img}"`))) ids.add(id);
      }
      if (ids.size !== 1) return block;
      const p = approved.get([...ids][0]);
      if (!p) return block;
      block = block.replace(/(<table\b[^>]*>[\s\S]*?<tbody[^>]*>)[\s\S]*?(<\/tbody>)/g, (match, opening, closing) => /price|precio/i.test(opening) ? `${opening}\n${table(p)}\n${closing}` : match);
      return named(block, p);
    });
    text = text.replace(/<a class="c-product-card" href="\/producto\/([^/]+)\/">[\s\S]*?<\/a>/g, (block, id) => {
      const box = amount(id, 'Caja');
      return box ? block.replace(/(Caja · confirmar condiciones: )\$[0-9,]+ MXN/, (_match, prefix) => `${prefix}${box} MXN`) : block;
    });
    const bolsa = amount('iphone-incell-xr-bolsa-protectora', 'Caja');
    const standard = amount('iphone-incell-xr', 'Caja');
    if (bolsa && standard) {
      text = text.replace(/(Bolsa Protectora (?:tiene )?[Cc]aja (?:de )?)\$[0-9,]+/g, (_match, prefix) => prefix + bolsa)
        .replace(/(XR estándar (?:conserva )?[Cc]aja (?:de )?)\$[0-9,]+/g, (_match, prefix) => prefix + standard)
        .replace(/(estándar caja )\$[0-9,]+/g, (_match, prefix) => prefix + standard)
        .replace(/(iPhone 11\/XR desde caja )\$[0-9,]+/g, (_match, prefix) => prefix + bolsa)
        .replace(/(Bolsa Protectora Caja <strong>)\$[0-9,]+/g, (_match, prefix) => prefix + bolsa)
        .replace(/(XR estándar Caja <strong>)\$[0-9,]+/g, (_match, prefix) => prefix + standard);
    }
    if (relative === 'categoria/maquinas-de-hidrogel/index.html' && approved.has('x200t-cortadora-micas')) {
      text = named(text, approved.get('x200t-cortadora-micas'));
    }
    if (['productos-ai.html', 'productos-ai/index.html', 'categoria/productos-ai/index.html'].includes(relative)) {
      const prices = products.filter(p => ['gafas-ai', 'camaras-inteligentes'].includes(p.category))
        .map(p => p.prices.find(t => t.quantity === 'Menudeo')?.price).filter(Boolean)
        .map(p => Number(p.replace(/[^0-9.]/g, '')));
      if (prices.length) text = text.replace(/Desde \$[0-9,]+ MXN menudeo/, `Desde $${Math.min(...prices).toLocaleString('es-MX')} MXN menudeo`);
    }
    if (text !== before) { fs.writeFileSync(file, text); changed.push(relative); }
  }
  return changed;
}

module.exports = { syncPriceHighlights };
