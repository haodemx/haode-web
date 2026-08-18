# HAODE：SEO 修正清單與 Google Maps 資料包

更新日期：2026-08-18（CDMX）
範圍：網站可讀取資料與公開搜尋；本文件不修改、發布或認領任何第三方平台資料。

## 1. 首輪結論

網站的技術索引基礎完整：`sitemap.xml` 有 224 個公開 URL，全部可對應本地頁面，且全部已有 title、H1、meta description 與與 sitemap 相符的 canonical。優先處理內容意圖與產品變體辨識，而非重做 URL 結構。

| 優先級 | 發現 | 數量 | 後續處理 |
| --- | --- | ---: | --- |
| P0 | 同型號、不同技術的產品頁共用 H1 | 25 組 | 讓 H1 清楚包含 INCELL、OLED、Soft OLED 或 TIPO ORIGINAL；不改產品型號、價格或相容性。 |
| P0 | Samsung INCELL 產品頁可讀正文過薄（少於 250 字元） | 9 頁 | 依同一份經確認的產品資料補上「型號、技術、訂購確認方式」；不自行加入規格、庫存、保固或送達承諾。 |
| P1 | 主入口頁覆蓋不完整 | 2 個入口待新增／確認 | 補建 Samsung OLED 與 Samsung 折疊屏主入口；現有 iPhone INCELL、iPhone OLED、Samsung INCELL、Micas 入口保留並強化內鏈。 |
| P1 | 品牌實體訊號不一致風險 | 全站模板範圍 | 重要頁固定使用「HAODE México · Pantallas y Refacciones para Celular · CDMX」作為品牌描述，不把它冒充為 Google 商家正式名稱。 |
| P2 | 月度追蹤缺少單一可執行表 | 1 份 | 以 Search Console、GA4、GBP Insights 的實際數據追蹤，不以預估或零值補空。 |

## 2. URL 稽核結果

- sitemap URL：224
- 找不到對應頁面：0
- 缺少 title：0
- 缺少 H1：0
- 缺少 meta description：0
- 缺少 canonical：0
- canonical 與 sitemap URL 不同：0
- 重複 title：0
- 重複 meta description：0
- 重複 H1：25 組
- 內容少於 250 字元：9 頁

### 需先修的 9 個過薄頁

- `/producto/samsung-incell-s10e/`
- `/producto/samsung-incell-s21-fe/`
- `/producto/samsung-incell-s21-plus/`
- `/producto/samsung-incell-s22/`
- `/producto/samsung-incell-s22-plus/`
- `/producto/samsung-incell-s23/`
- `/producto/samsung-incell-s23-plus/`
- `/producto/samsung-incell-s24/`
- `/producto/samsung-incell-s24-plus/`

### H1 修正規則

目前重複最集中的情形是同一機型同時有 INCELL、OLED 或 TIPO ORIGINAL 頁面，H1 卻只有「Pantalla para [modelo]」。實作時採以下可審核格式：

| 頁面技術 | H1 模板 |
| --- | --- |
| INCELL | `Pantalla INCELL para [modelo]` |
| OLED | `Pantalla OLED para [modelo]` |
| Soft OLED | `Pantalla Soft OLED para [modelo]` |
| TIPO ORIGINAL | `Pantalla TIPO ORIGINAL para [modelo]` |

這只區分已存在於產品頁 URL／title 的技術名稱；任何尺寸、刷新率、亮度、框架、相容性、庫存或保固文字，均須由產品資料確認後才加入。

## 3. 主力關鍵字與入口頁架構

### 已存在且應維持的入口

| 意圖 | Canonical URL | 主目標詞 |
| --- | --- | --- |
| iPhone INCELL | `/pantallas-iphone-incell-mayoreo-mexico/` | `pantallas iPhone INCELL mayoreo México` |
| iPhone OLED | `/pantallas-iphone-oled-mayoreo-mexico/` | `pantallas iPhone OLED mayoreo México` |
| Samsung INCELL | `/pantallas-samsung-incell-mayoreo-mexico/` | `pantallas Samsung INCELL mayoreo México` |
| Micas | `/micas.html` | `micas mayoreo CDMX` |

### 待新增或確認的入口（尚未建立）

| 意圖 | 建議 slug | 主標題草案（ES） | 內鏈目標 |
| --- | --- | --- | --- |
| Samsung OLED | `/pantallas-samsung-oled-mayoreo-mexico/` | `Pantallas Samsung OLED para mayoreo en México` | Samsung INCELL、Samsung general、對應產品頁、採購指南 |
| Samsung 折疊屏 | `/pantallas-samsung-plegables-mayoreo-mexico/` | `Pantallas Samsung Z Flip y Z Fold para compra profesional` | Samsung general、Z Flip／Z Fold 產品頁、採購指南 |

每個入口頁只服務一個採購意圖：型號／技術、數量、城市與報價確認。避免在 title、H1、FAQ 同時反覆堆砌「pantalla iPhone」。

## 4. 內容與內鏈實作順序

1. 先完成 9 頁內容與 25 組 H1 區分。
2. 建立 Samsung OLED、Samsung 折疊屏兩個入口頁；各頁含可讀的選型說明、FAQ、JSON-LD FAQPage 與 canonical。
3. 新增兩篇採購內容：`INCELL vs OLED: cómo elegir para taller`、`Cómo cotizar pantallas por mayoreo desde CDMX`。比較內容只能使用經確認的技術差異；不能推導某款產品的規格或品質。
4. 從首頁、品類頁、產品頁建立三向連結：主入口 → 技術入口 → 產品頁；產品頁 → 技術入口 → 選型指南。
5. 圖片 alt 以「產品／技術／型號」為主，避免用價格、庫存或未證實的宣傳語；維持既有圖片，不替換未確認素材。
6. 檢查重要頁的 Organization／LocalBusiness、FAQPage、Breadcrumb JSON-LD 是否可解析，並以實際域名 `https://haode.com.mx/` 作 canonical。

## 5. Google Business Profile 資料包

### 可直接核對／填入的資料

| 欄位 | 建議值 | 狀態 |
| --- | --- | --- |
| 商家名稱 | `HAODE México` | 既有資料包與網站一致；不得附加關鍵字。 |
| 對外定位語 | `HAODE México · Pantallas y Refacciones para Celular · CDMX` | 僅用於網站／描述文案，不作 Google 商家名稱。 |
| 地址 | `Eje Central Lázaro Cárdenas 87, Piso 2, Local 225, Colonia Centro, Cuauhtémoc, 06070, Ciudad de México, México` | 既有規則檔固定地址；需在地圖釘點及現場再次確認。 |
| 電話 | `+52 56 4586 6014` | 由公開網站讀取；登入 GBP 後需核對仍為門店使用電話。 |
| 網站 | `https://haode.com.mx/` | 網站 sitemap 的部署域名。 |
| 營業時間 | 暫不在此重新主張 | 公開網站顯示週一至週六 10:00–18:00，但本次未由店方確認；登入後再確認。 |

### 建議類別

- 主分類：選 Google 後台最接近「手機配件店／手機零件供應商／批發商」且符合實際主要業務的一項。
- 次分類：僅加入確實提供且 Google 後台可選的類別。
- 不把「手機維修服務」設為類別，除非門店確實提供該服務；供應商不能以維修服務吸引不匹配流量。

### 商家描述（西班牙文草稿）

`HAODE México es proveedor de pantallas para celular, refacciones y accesorios para técnicos, talleres, tiendas y distribuidores. Nuestro catálogo incluye líneas para iPhone y Samsung, opciones INCELL y OLED, micas y accesorios. Atendemos desde CDMX y la disponibilidad, el modelo exacto, la cantidad, el precio final y el envío se confirman antes de cada pedido.`

### 服務／產品欄位（西班牙文草稿）

- `Pantallas para iPhone para compra profesional`
- `Pantallas Samsung INCELL y OLED`
- `Refacciones y accesorios para celular`
- `Micas y soluciones para mostrador`
- `Cotización para técnicos, talleres y distribuidores`

產品名稱、型號、價格、庫存與保固條件應直接以當日可確認資料填入；未確認時不發布。

### 照片與驗證拍攝清單

1. 87 號街道／建築入口（可辨識 Eje Central）。
2. 從入口到二樓的連續路線。
3. 二樓 225 門牌與 HAODE 識別。
4. 店內全景與櫃台。
5. 貨架與包裝區。
6. iPhone、Samsung、Mica 等真實在售／陳列品；畫面避免誤導型號。
7. 員工工作區與可證明店方控制權的區域。
8. 取貨／備貨流程。

Google 如要求影片驗證，店員以一段不中斷的影片依上述順序拍攝；不要剪輯、濾鏡或遮蔽門牌、品牌及工作區。

### 評論邀請訊息（西班牙文）

`Hola, gracias por comprar con HAODE México. Si la atención y el proceso de cotización te resultaron útiles, ¿nos ayudas dejando una reseña en Google? Tu comentario sobre la atención, el proceso de pedido o la experiencia de compra ayuda a otros técnicos y talleres a ubicarnos. Gracias por tu tiempo.`

不提供回饋、折扣、贈品或任何誘因換取評論；不要求客戶給五星。

### 四週 Google Posts 節奏（西班牙文）

| 週次 | 主題 | 文案方向 |
| --- | --- | --- |
| 1 | iPhone INCELL | `Consulta modelo exacto y cantidad para cotización profesional.` |
| 2 | Samsung OLED／INCELL | `Para taller y mostrador: confirma modelo, versión y cantidad antes de pedir.` |
| 3 | Micas | `Opciones para mostrador y compra por volumen; consulta la línea disponible.` |
| 4 | 門店取貨與寄送 | `Atención desde CDMX. Confirma pedido y destino antes de coordinar entrega.` |

每帖搭配當週真實照片，CTA 使用「Cotizar」或「Más información」；發布前由帳戶管理人確認產品、庫存、價格及送貨條件。

## 6. Google Maps 驗證結論與最短下一步

- 公開搜尋可驗證網站及門店地址訊號，但不能可靠證明 GBP 是否已認領、是否有重複檔案，或後台資料是否正確。
- 既有自動化資料顯示 Google Business API 尚未獲批，不能以 API 狀態推論 Maps 商家檔案是否存在。
- 唯一能完成這三項驗證的動作：以 HAODE 管理 Google 帳戶開啟 Business Profile Manager，搜尋 `HAODE México` 與完整地址，檢查「你管理的商家」、重複卡片與通知中的驗證方式。

店方需配合的最小工作：登入或邀請管理人、依 Google 指定方式完成驗證（現場影片、電話或驗證碼）、核對營業時間及可公開電話。其餘文案、照片清單、評論邀請與每週貼文均已準備好。

## 7. 月度追蹤表

| 月份 | GSC 非品牌曝光／點擊 | 主入口查詢 | 主入口自然造訪 | GBP 搜尋／地圖曝光 | GBP 網站／電話／路線動作 | 評論數／平均分 | 已完成頁面 | 備註 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| YYYY-MM | 從 GSC 匯入 | iPhone INCELL / OLED / Samsung / CDMX | 從 GA4 匯入 | 從 GBP Insights 匯入 | 從 GBP Insights 匯入 | GBP 實際值 | URL 清單 | 資料缺口獨立註記 |

不可用的資料填寫 `not_connected` 或 `authorization_required`，不以 `0` 代替。

## 8. 本輪驗證

- `test:seo-technical`：通過（8/8）。
- `test:geo-seo`：通過（4/4）。
- `test:seo-exposure-readiness`：通過（1/1）。
- 224 URL sitemap／本地 metadata 檢查：通過；結果見本文件第 2 節。
- Google Maps 管理權、認領狀態、重複商家、驗證方式：尚未取得帳戶權限，無法在本輪確認。
