# HAODE Owner Confirmation Checklist

Fecha: 2026-06-08

Fuente:
- `reports/product-data-consistency-audit.md`
- `reports/video-missing-audit.md`

Este archivo es una lista de confirmacion para el dueno. No cambia datos de producto, precios, imagenes, videos, rutas ni WhatsApp.

## Price Confirmation

- Confirmar los productos marcados con `Consultar` en el reporte de consistencia antes de publicar precios.
- No auto-corregir precios desde textos, imagenes, proveedores o reportes historicos.
- Mantener manual cualquier cambio de precio publico, precio mayoreo, descuentos o paquetes.

## WhatsApp Confirmation

- Revisar las inconsistencias de texto/numero de WhatsApp reportadas antes de cualquier correccion masiva.
- No cambiar el numero de WhatsApp sin confirmacion explicita del dueno.
- Si se aprueba, corregir en lote pequeno y verificar botones en paginas de categoria y producto.

## Image Confirmation

- Confirmar que cada imagen corresponde al SKU/modelo exacto antes de usarla en producto, categoria o app.
- No reemplazar imagenes existentes sin confirmacion.
- MICA/pelicula requiere confirmacion especial de imagen real del producto.

## Video Confirmation

- Los SKUs listados en `reports/video-missing-audit.md` requieren video del mismo SKU o confirmacion de que el video no es obligatorio.
- No usar videos genericos, de tienda, showcase ni de otro modelo para rellenar productos.
- Solo se puede auto-llenar video despues de que el archivo confirmado exista bajo la carpeta del SKU/modelo correcto.

## SKU / Slug / Route Confirmation

- Revisar rutas legacy y redirects marcados en `reports/product-data-consistency-audit.md`.
- No eliminar rutas legacy sin aprobacion.
- Las correcciones de sitemap, canonical o redirects deben mantener compatibilidad con GitHub Pages.
- Cada nuevo producto debe existir en datos web, `app/products.json`, ruta `producto/<sku>/`, categoria correspondiente y sitemap cuando aplique.

## Safe Auto-Fix Later

- Agregar validaciones de datos y reportes sin modificar productos.
- Corregir sitemap/canonical cuando el SKU objetivo sea obvio y exista pagina estatica verificada.
- Crear redirects legacy no destructivos cuando el destino sea claro y probado.
- Sincronizar website/app solo desde datos confirmados.

## Must Remain Manual

- Cambios de precio.
- Cambios de numero WhatsApp.
- Reemplazo de imagenes.
- Reemplazo o asignacion de videos de producto.
- Eliminacion de productos, rutas, categorias o datos masivos.
- Claims comerciales no confirmados: stock, garantia, descuentos, compatibilidad, origen o calidad no verificada.
