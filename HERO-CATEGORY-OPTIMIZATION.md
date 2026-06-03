# HERO-CATEGORY-OPTIMIZATION

Proyecto: `/Users/mac/Documents/haode/HAODE-WEBSITE/haode-web`

## 修改文件

- `productos/index.html`
- `style.css`

## 修改前结构

- Hero 首屏左侧展示 `Pantallas HAODE México`、说明文字和 CTA 按钮。
- 右侧首屏区域留白较多。
- 分类导航位于页面下方 `Filtros` 区块，用户需要滚动后才能看到：
  - Todos
  - iPhone INCELL
  - iPhone OLED
  - Samsung INCELL
  - Samsung OLED

## 修改后结构

PC 端：

- 左侧：
  - `Pantallas HAODE México`
  - Catálogo visual de pantallas con stock local en CDMX...
  - `Contactar por WhatsApp`
  - `Volver al inicio`
- 右侧：
  - 分类导航卡片
  - 标题：`Selecciona una categoría`
  - 副标题：`Accede rápidamente a cada línea de pantallas HAODE.`
  - 快速按钮：Todos / iPhone INCELL / iPhone OLED / Samsung INCELL / Samsung OLED

Mobile 端：

- Hero 自动改为单列。
- 分类导航卡片显示在 Hero 文案下方。
- 按钮单列排列，避免挤压和遮挡。

## 是否提升首屏点击效率

是。分类入口从下方滚动区域移动到首屏右侧后，用户进入 `/productos/` 不需要继续向下滚动，就可以直接选择屏幕分类。

## 验证

- 未修改产品内容。
- 未修改价格。
- 未修改 SEO canonical。
- 原下方重复分类按钮已移除。
- 保留产品列表前的说明区，只显示 catalog 文案，不再重复分类导航。
