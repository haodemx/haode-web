# HAODE App UI/UX v2

## Principios

- App móvil primero, con apariencia nativa y navegación rápida para técnicos y tiendas.
- Datos reales desde `app/products.json`; no se inventan productos, precios, stock ni especificaciones.
- Pedido por WhatsApp y carrito se mantienen como flujo principal.
- Fondo claro, jerarquía limpia y elementos oscuros solo en Hero o detalle flagship.

## Color y Espaciado

- `--haode-orange: #ff5a0a`
- `--haode-orange-dark: #e74800`
- `--haode-black: #111111`
- `--haode-text: #202124`
- `--haode-muted: #6f7278`
- `--haode-bg: #f6f7f9`
- `--haode-surface: #ffffff`
- `--haode-border: #e8eaed`
- `--haode-success: #16a05d`

La escala de espacio usa 4, 8, 12, 16, 24 y 32 px. Los controles táctiles importantes son de 44 px o más.

## Componentes

- `AppHeader`: barra superior compacta con marca, búsqueda y carrito.
- `SearchButton`: botón de búsqueda que enfoca el catálogo.
- `CartButton`: botón de carrito con contador.
- `HeroBanner`: primer bloque oscuro con producto real y CTA.
- `CategoryRail` / `CategoryCard`: accesos visuales a Pantallas, Micas, AI, Fundas y Accesorios.
- `PremiumChipRail`: chips horizontales para iPhone INCELL, iPhone OLED, Samsung INCELL, Samsung OLED, Samsung TIPO ORIGINAL, Micas, Productos AI y Fundas.
- `PremiumShowcase`: módulo oscuro `Selección premium HAODE` con productos/categorías reales.
- `ProductSection` / `ProductCard`: carriles y grillas con productos reales.
- `TrustBar`: cápsulas compactas para Stock en México, WhatsApp, Calidad HAODE y Envío rápido.
- `AppBottomNavigation`: navegación móvil fija con safe area y espacio final reservado para no tapar CTA.
- `ProductGallery`: galería simple cuando no hay suficientes imágenes para 360.
- `Product360Viewer`: solo se activa con tres o más imágenes únicas reales.
- `ProductBadge`, `ProductSpecGrid`, `QuantityControl`, `StickyProductActions`, `CartItemCard`, `CartSummary`, `EmptyState`, `NetworkErrorState`.

## Estructura

- `#inicio`: Home con Hero, categorías, destacados, selección premium, trust bar y chips de exploración.
- `#lista`: catálogo completo.
- `#grupo/{grupo}`: lista filtrada por grupo visual.
- `#categoria/{categoria}`: lista filtrada por categoría real.
- `#producto/{id}`: detalle del producto dentro del App.
- `#carrito`: estado del carrito y entrada al panel.
- `#contacto`: contacto por WhatsApp.

Los enlaces SEO a categorías oficiales se conservan como URLs reales de `/haode-web/categoria/...`.

## Configuración 360°

La lógica usa:

- `has360`: verdadero solo si el producto tiene tres o más imágenes únicas.
- `frames360`: imágenes únicas del producto.
- `fallbackImage`: imagen principal del producto.

Para X200T hoy existen dos imágenes únicas: `assets/products/cut-machine/x200t/main.jpg` y `assets/products/home-cut-machine/x200t.jpg`. Por esa razón el detalle X200T se muestra como galería normal con la etiqueta `Galería de producto` y no promete 360°. Si se agregan tres o más vistas reales, el visor 360 se activa automáticamente.

## Requisitos de Imágenes

- Usar imágenes confirmadas del producto.
- No repetir una imagen para simular 360°.
- Usar `object-fit: contain` dentro de contenedores de proporción fija.
- Imágenes no críticas usan `loading="lazy"` y `decoding="async"`.

## Fallbacks

- Imagen rota: vuelve a `assets/products/placeholder.svg`.
- Sin resultados: `EmptyState`.
- Error de red o `products.json`: `NetworkErrorState`.
- 360° insuficiente: `ProductGallery`.
- Navegación inferior fija: la página reserva padding inferior adicional para que el último contenido y los CTA no queden cubiertos.

## Mantenimiento

- No cambiar precios desde el UI.
- Agregar datos nuevos en `app/products.json` respetando el esquema actual.
- Para activar 360°, agregar imágenes reales y únicas al producto y mantener la ruta pública `/haode-web/assets/...`.
- Verificar siempre con `npm run build`, `npm run browser-test` y QA visual de `/app/`.
