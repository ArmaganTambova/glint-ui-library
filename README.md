# Glint UI Kit

> Sıradan input'ları canlı arayüzlere çeviren, **saf vanilla, sıfır bağımlılık** bir UI kütüphanesi.
> ASP.NET Core MVC (`asp-for`) ile birebir uyumlu; normal HTML yazarsın, Glint gerisini halleder.

İki bağımsız paket, tek ortak sürüm:

| Paket | Ne işe yarar | Klasör |
| --- | --- | --- |
| **glint-input** | Input, checkbox, radio, switch, segmented, rating, select, tags, OTP, stepper, slider, range, upload, color, **tarih/saat/ay picker**, **telefon (242 ülke)**, **combobox**, **kredi kartı**, **form orkestratörü**, **e-posta yardımcıları** | [`glint-input-library/`](glint-input-library/) |
| **glint-toast** | Bildirim motoru (success/error/warning/info), sunucu köprüsü, akıllı alan-hata köprüsü | [`glint-toast-library/`](glint-toast-library/) |

- 🎯 **Sıfır bağımlılık** — saf JavaScript + CSS, build adımı gerektirmez; **hiçbir bileşen ağ isteği gerektirmez**.
- ⚡ **Tembel (lazy) işleme** — bir bileşen yalnızca sayfada karşılığı varsa çalışır.
- 🌗 **Koyu mod** (`data-bs-theme="dark"`), `prefers-reduced-motion` + runtime `reducedMotion`, tam klavye & ARIA.
- 🧩 **MVC dostu** — native elemanlar DOM'da kalır; `asp-for` ve model binding korunur.
- 📱 **Mobil** — picker'lar bottom-sheet'e döner; dokunmatik hedefler `pointer: coarse`'ta büyür.
- ✨ **Birleşik hareket dili** — imza easing/süre token'ları, FLIP yardımcısı, çizilen kenarlıklar.

---

## Hızlı başlangıç

İki dosya yükle (her paket bağımsız çalışır):

```html
<head>
  <link rel="stylesheet" href="glint-input-library/glint-input.css">
</head>
<body>
  <div class="glint-input-group">
    <input class="glint-input" id="email" type="email">
    <label class="glint-label" for="email">E-posta adresi</label>
  </div>

  <script src="glint-input-library/glint-input.js"></script>
</body>
```

Glint, sayfa yüklenince tüm bileşenleri **otomatik** keşfedip başlatır; bir `MutationObserver`
ile sonradan eklenen alanlar (AJAX/SPA) da kendiliğinden devreye girer.

### Bildirim (glint-toast)

```html
<link rel="stylesheet" href="glint-toast-library/glint-toast.css">
<script src="glint-toast-library/glint-toast.js"></script>
<script>
  Glint.Toast.success("Kaydedildi!");
  Glint.Toast.error("Geçerli bir e-posta girin.", "Email"); // 2. arg → alan köprüsü
</script>
```

İki paket de yüklüyse **akıllı köprü** devreye girer: alan görünürse hata satır içinde,
görünmüyorsa özet toast (+ tıkla → hatalı alana kaydır). Politika:
`Glint.configure({ fieldErrors: "smart" | "inline" | "toast" })`.

---

## Rehberler (canlı dokümantasyon)

Her bileşenin tüm özelliği + varyasyonu, canlı önizleme ve kopyalanabilir HTML/Razor/JS koduyla:

- **Input rehberi:** [`glint-input-library/index.html`](glint-input-library/index.html)
- **Toast rehberi:** [`glint-toast-library/index.html`](glint-toast-library/index.html)
- **Mobil önizleme:** her iki klasörde `mobile-demo.html` (telefondan da açılır)

---

## ASP.NET Core MVC

Glint normal HTML üretildiği sürece çalışır; `asp-for` ile tam uyumludur. İki yaklaşım:

```cshtml
@* 1) Satır içi *@
<div class="glint-input-group">
  <input asp-for="Email" class="glint-input" />
  <label asp-for="Email" class="glint-label"></label>
</div>
```

Yeniden kullanılabilir TagHelper / EditorTemplate örnekleri ve sunucu→toast köprüsü
(`window.__glintToasts`) için rehberlerdeki **MVC** ve **Köprü** bölümlerine bakın.

---

## Sürümleme & build

Sürüm **tek kaynaktan** yönetilir: [`build/version.js`](build/version.js).

```bash
# Sürümü build/version.js'ten değiştir, sonra:
build\minify.cmd            # Windows
node build/scripts/build.mjs
```

Bu, `Glint.version`'ı senkronlar (tüm HTML footer'ları runtime'da okur) ve
sürümlü minify üretir:

```
build/dist/
  glint-input-1.6.0.min.js   glint-input-1.6.0.min.css
  glint-toast-1.6.0.min.js   glint-toast-1.6.0.min.css
```

Minify için [esbuild](https://esbuild.github.io/) kullanılır (`npx` ile otomatik çekilir
ya da `npm i -g esbuild`).

---

## Özelleştirme

Her CSS/JS dosyasının başında **"DÜZENLEYİNİZ"** bölümü vardır: renk/boyut token'ları
(`:root` / CSS değişkenleri) ve config varsayılanları (`Glint.config` / toast `CONFIG`)
tek yerde toplanmıştır — dosyayı kazımadan özelleştir.

---

## Sürüm geçmişi

Bkz. [CHANGELOG.md](CHANGELOG.md). Güncel: **v1.6.0**.

## Lisans

Tüm hakları saklıdır. Bkz. [LICENSE](LICENSE).
