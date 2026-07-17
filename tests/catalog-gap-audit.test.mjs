import assert from 'node:assert/strict';
import test from 'node:test';
import { auditCatalog, formatMarkdown } from '../scripts/audit-erp-catalog-gaps.mjs';

test('clasifica brechas del catálogo sin inventar datos', () => {
  const report = auditCatalog({
    products: [
      {
        sku: 'SKU-OK',
        public_name_es: 'Producto listo',
        category: 'Fundas',
        public_price_mxn: 100,
        price_status: 'CONFIRMED',
        image_url: '/producto.jpg',
        sales_available: true,
        stock_status: 'available',
      },
      {
        sku: 'SKU-PENDING',
        public_name_es: 'Producto pendiente',
        category: 'Pantallas',
        public_price_mxn: null,
        price_status: 'PRICE_PENDING',
        image_url: '',
        sales_available: false,
        stock_status: 'out_of_stock',
      },
    ],
  });

  assert.equal(report.total, 2);
  assert.equal(report.salesAvailable, 1);
  assert.deepEqual(report.pricePending.map((row) => row.sku), ['SKU-PENDING']);
  assert.deepEqual(report.missingImage.map((row) => row.sku), ['SKU-PENDING']);
  assert.deepEqual(report.outOfStock.map((row) => row.sku), ['SKU-PENDING']);
  assert.deepEqual(report.unavailable.map((row) => row.sku), ['SKU-PENDING']);
  assert.deepEqual(report.duplicateSkus, []);
  assert.match(formatMarkdown(report, 'fixture'), /SKU-PENDING/);
});

test('detecta SKU duplicados', () => {
  const report = auditCatalog([
    { sku: 'SKU-1' },
    { sku: 'SKU-1' },
  ]);
  assert.deepEqual(report.duplicateSkus, [{ sku: 'SKU-1', count: 2 }]);
});
