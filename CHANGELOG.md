# Changelog

Glint UI Kit'in tüm önemli değişiklikleri bu dosyada tutulur.
Biçim [Keep a Changelog](https://keepachangelog.com/tr/1.0.0/)'a, sürümleme
[Semantic Versioning](https://semver.org/lang/tr/)'a dayanır.

Sürüm, iki paket için **ortak** tek numaradır (`build/version.js` → `Glint.version`).

---

## [1.5.0] — 2026-06-30

İki paketi (glint-input + glint-toast) tek ortak sürüme taşıyan büyük dilim:
çekirdek yaşam döngüsü, akıllı input↔toast köprüsü, kapsamlı bileşen varyasyonları,
yeniden tasarlanan rehberler, mobil önizleme ve optimizasyon.

### Eklenenler

**Çekirdek**
- `Glint.version` (birleşik sürüm), `Glint.config` + `Glint.configure({...})`
  (locale, reducedMotion, autoMount, fieldErrors, fieldErrorText).
- Yaşam döngüsü: `Glint.register/getInstance/unregister/destroy` (WeakMap) — 15
  bileşende `destroy()` + AbortController teardown; observer `removedNodes` ile
  otomatik söküm (MVC partial-view sızıntısı önlenir).
- Ortak durum makinesi `Glint.setState(el, state, msg?)` / `Glint.clearState(el)`
  (`error/success/warning/loading` + `aria-invalid`/`aria-describedby`).
- `Glint.format.thousands(n)` — bileşensiz binlik biçimleme yardımcısı.
- Anlamsal token'lar: `--glint-state-*`, `--glint-radius`, `--glint-motion`.

**Input ↔ Toast akıllı köprüsü** (iki paket bağımsız, ikisi yüklüyse gevşek-bağlı)
- `Glint.config.fieldErrors`: `"smart"` (varsayılan) · `"inline"` · `"toast"`.
  Smart: alan görünürse inline; görünmezse özet toast + tıkla→ilk hatalı alana
  kaydır/odakla. Görünür alanların hepsi inline'lanınca toast hiç gösterilmez.
- `fieldErrorText` (varsayılan kapalı = yazısız: kenarlık/shake).
- Fail-safe: bir hata inline çizilemezse sessizce kaybolmaz, toast'a düşer
  (`visibility:hidden`/`opacity:0` alanlar da görünmez sayılır).

**Bileşen özellikleri & varyasyonları**
- **Input:** otomatik şifre göster/gizle (modern stroke ikon, `data-glint-no-toggle`),
  güç göstergesi (`data-glint-strength`), karakter sayacı (`data-glint-counter`/`maxlength`),
  temizle (`data-glint-clearable`), binlik ayraç (`data-glint-group-thousands`),
  otomatik `inputmode`/`enterkeyhint`.
- **OTP:** `data-type="alnum"`, `data-uppercase`, `data-mask`, `data-group="middle"`,
  Web OTP (SMS otomatik doldurma).
- **Tags:** `data-max-length`/`data-pattern`/`data-transform`/`data-allow-dupes`,
  statik öneri (`data-suggest`/`data-suggest-from`), sürükle-sırala.
- **Select:** `<optgroup>`, eşleşme-vurgu (`<mark>`), çoklu-yapıştırma, `data-creatable`,
  tümünü-seç + sayaç + `data-max-selected`, sanal liste (`data-virtual`).
- **Slider/Range:** `data-min-distance`, balon biçimi (`data-prefix`/`data-suffix`/`data-format`),
  işaretler (`data-marks`/`data-mark-labels`), dikey (`data-orientation="vertical"`).
- **Upload:** `data-max-files` + bilgi ipucu, panodan yapıştırma, sürükle-sırala.
- **Color:** EyeDropper, kalıcı son-kullanılanlar (`data-recents-key`), HEX kopyala,
  isimli/gruplu palet, HEX/RGB/HSL mod, WCAG AA/AAA kontrast rozeti.
- **Kontroller:** checkbox/radio kart & buton varyantı, segmented/switch `--sm`/`--lg`,
  segmented ikon-slotu, switch on/off ikonları, rating yarım-yıldız
  (`data-allow-half`/`data-allow-clear`/`data-icon`).
- **Picker:** ay/yıl hızlı atlama, `data-minute-step`, hazır aralıklar (`data-presets`),
  12 saat (`data-hour-cycle="12"`), ISO hafta numaraları (`data-week-numbers`),
  **çoklu ay** (`data-months="2"|"3"`).

**Rehberler & araçlar**
- `glint-input-library/index.html` ve `glint-toast-library/index.html` — ortak
  premium tasarım dili; her özellik + varyasyon canlı önizleme + HTML/Razor/JS.
- Gerçek **mobil önizleme** bölümü (telefon-çerçeve iframe) + bağımsız
  `mobile-demo.html` (her iki paket).
- `build/` — tek-kaynak sürüm (`build/version.js`) + `minify.cmd`/`build.mjs`:
  esbuild ile `glint-<paket>-<sürüm>.min.js/.css` üretir (çıktı kök klasöre).

### Değişiklikler
- `toast.css`/`toast.js` → **`glint-toast.css`/`glint-toast.js`** (tüm referanslar güncel).
- Sürüm `Glint.version` üzerinden birleşti; HTML footer'ları runtime'da bunu okur.

### Kaldırılanlar
- `data-glint-mask` (telefon/IBAN/kart maskeleme) — biçimleme `Glint.format`'a damıtıldı;
  binlik ayraç `data-glint-group-thousands` ile sunulur. (Telefon ileride ayrı paket.)

### Güvenlik & performans
- XSS denetimi: tüm kullanıcı-verisi `textContent`/property; `innerHTML` yalnız statik
  ikon/etiket. Selector sertleştirme: `CSS.escape(input.id)`.
- Leak düzeltmeleri: spinner-tut interval'i ve Range drag-mid-destroy listener'ları
  `destroy()`'da temizlenir.
- Pasif scroll listener'ları; `.glint-picker-grid`/`-weekdays`/`.glint-select-list`
  CSS `contain` ile reflow/paint izolasyonu.

---

## Geçmiş (1.5.0 öncesi — tek paket öncesi sürümler)

### [1.4] — Input motoru
- **Çok satırlı imleç/metin hizalaması (gerçek çözüm):** karakterler `display:inline`
  (native akış → imleç tam oturur); giriş/çıkış/FLIP animasyonları mutlak-konumlu
  ghost katmanına taşındı.
- **Paylaşılan çekirdek:** `Glint.defineComponent`/`claimGroup`/`refresh` + tek
  MutationObserver ile tüm bileşenler tembel (lazy) başlatılır.

### [1.3] — Karakter overlay taşması
- Overlay `getBoundingClientRect` ile input'un tam metin alanına hizalandı
  (border+padding hariç); track translate edildiğinde taşma fiziksel olarak imkânsız.

### [1.2] — İlk yükleme & toplu silme
- İlk yüklemede kenarlık çizim flash'ı engellendi (transition kapat → dashoffset
  set → reflow → transition aç).
- Toplu silme (Ctrl+A → Delete) sağdan sola animasyonlu.
- Karakter giriş animasyonu (translateY + scale + blur; paste ripple stagger).

### Picker (eski "pdks") v2.0
- min/max, devre dışı günler/hafta günleri, tarih aralığı (range), grid içi tam
  ok-tuşu navigasyonu, mobil bottom-sheet.

[1.5.0]: https://github.com/ArmaganTambova/glint-ui-library/releases/tag/v1.5.0
