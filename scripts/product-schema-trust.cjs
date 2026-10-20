// Keep the existing no-unconfirmed-stock policy consistent for both Offer shapes.
function unconfirmedProductOffers(data) {
  const nodes = Array.isArray(data?.['@graph']) ? data['@graph'] : [data];
  return nodes
    .filter(node => node?.['@type'] === 'Product' || (Array.isArray(node?.['@type']) && node['@type'].includes('Product')))
    .flatMap(node => Array.isArray(node.offers) ? node.offers : [node.offers])
    .filter(offer => offer && typeof offer === 'object' && Object.hasOwn(offer, 'availability'));
}

function stripProductAvailability(jsonSource) {
  let parsed;
  try {
    parsed = JSON.parse(jsonSource.trim());
  } catch {
    return jsonSource;
  }
  const offers = unconfirmedProductOffers(parsed);
  if (!offers.length) return jsonSource;
  for (const offer of offers) delete offer.availability;
  return JSON.stringify(parsed, null, 2);
}

module.exports = { unconfirmedProductOffers, stripProductAvailability };
