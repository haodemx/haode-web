import assert from "node:assert/strict";
import test from "node:test";

import { chooseProduct, ERP_PUBLIC_CATALOG_URL } from "../scripts/generate-daily-ad.mjs";

test("daily ads use the ERP 2.0 catalog endpoint", () => {
  assert.equal(ERP_PUBLIC_CATALOG_URL, "https://erp.haode.com.mx/api/public/catalog");
});

test("daily ads exclude unavailable, price-pending, and out-of-stock products", () => {
  const selected = chooseProduct([
    {
      sku: "PENDING-HERO",
      public_name_es: "Pantalla iPhone 17 Pro pendiente",
      category: "Pantallas iPhone",
      public_price_mxn: null,
      sales_available: false,
      stock_status: "available"
    },
    {
      sku: "OUT-HERO",
      public_name_es: "Pantalla iPhone 17 Pro agotada",
      category: "Pantallas iPhone",
      public_price_mxn: 900,
      sales_available: true,
      stock_status: "out_of_stock"
    },
    {
      sku: "AVAILABLE-11",
      public_name_es: "Pantalla iPhone 11 INCELL",
      category: "Pantallas iPhone",
      public_price_mxn: 300,
      sales_available: true,
      stock_status: "available"
    }
  ], [], "Pantallas iPhone");

  assert.equal(selected.sku, "AVAILABLE-11");
});

test("daily ads keep the local active catalog as an outage fallback", () => {
  const selected = chooseProduct([], [
    { id: "disabled", nombre: "Desactivado", activo: false },
    { id: "active", nombre: "Disponible", activo: true }
  ], "Productos HAODE");

  assert.equal(selected.id, "active");
});
