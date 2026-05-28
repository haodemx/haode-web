# HAODE Product Structure

Este proyecto se genera automáticamente a partir de la carpeta `assets/products/` y de la hoja de precios Excel.

## Cómo agregar un producto

1. Crea una carpeta dentro de la categoría correcta.
2. Coloca una imagen principal llamada `main.jpg` o `main.png`.
3. Agrega hasta 3 imágenes extra con el formato `gallery-01.jpg`, `gallery-02.jpg`, `gallery-03.jpg`.
4. Si tienes video, usa `video-01.mp4` y `video-02.mp4`.
5. Ejecuta `npm run build-products` para regenerar la base.

## Dónde poner cada cosa

- `assets/products/iphone-incell/<modelo>/`
- `assets/products/iphone-oled/<modelo>/`
- `assets/products/samsung-incell/<modelo>/`
- `assets/products/samsung-oled/<modelo>/`

## Regla de precios

El generador busca automáticamente el precio en el Excel disponible en `/Users/mac/Desktop/haode产品素材/同行报价单` o en `/Users/mac/Desktop/haode产品素材`.
Si un modelo no aparece en la hoja, el sitio mostrará `Consultar`.
