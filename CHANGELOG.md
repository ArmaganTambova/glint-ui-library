# Changelog

Glint UI Kit'in tüm önemli değişiklikleri bu dosyada tutulur.
Biçim [Keep a Changelog](https://keepachangelog.com/tr/1.0.0/)'a, sürümleme
[Semantic Versioning](https://semver.org/lang/tr/)'a dayanır.

Sürüm, iki paket için **ortak** tek numaradır (`build/version.js` → `Glint.version`).

---

## [1.7.1] — 2026-07-08

Cila + davranış sürümü: v1.7.0'ın hemen ardından, kullanıcı geri
bildirimlerinin tamamını kapatan paket. Üç kanıtlı animasyon kök nedeni
(multiline ghost yaşam döngüsü, border-draw geometrisi, güç barı) ve yedi
kullanım direktifi (e-posta memory tasarımı, TreeSelect açılışı, Combobox
çoklu seçim, checkbox salınımı, color picker sadeleşmesi, pwgen/IBAN
görünürlüğü) tek sürümde toplandı. v1.7.0 ayrıca yayınlanmadı — bu sürüm
ikisini birlikte taşır.

### Eklenenler

**Combobox — çoklu seçim** (`data-multiple`)
- Seçimler alanın hemen altındaki **chip tepsisinde** birikir (Tags/Select
  chip dili, `--glint-chip-*` token'ları); input serbest ARAMA metni kalır.
- Form binding gizli inputlarla: `data-hidden-name="Cities"`, yoksa inputun
  `name`'i chip'lere devredilir (arama metni asla submit edilmez; MVC'de
  `List<string>` otomatik bağlanır). `data-value="a,b"` başlangıç seçimleri.
- Boş alanda ↓ tam listeyi açar (yerel kaynak); seçimde liste açık kalır,
  seçili satır tik işaretli — tekrar tıklamak seçimi kaldırır (toggle).
  Vurgusuz Enter serbest metni chip yapar; boş inputta Backspace son
  chip'i siler. Liste açıkken popover chip tepsisinin ALTINA demirlenir.
- `aria-multiselectable`; API: `values` · `setValues([...])`; event:
  `glint:combobox-change {values}`.

**Tema Kapağı'na yeni token'lar**
- `--glint-border-width` (2px) — alan kenarlık kalınlığı TEK KAYNAK: gerçek
  border + çizilen SVG stroke + e-posta chip çerçevesi birlikte kalınlaşır.
- `--glint-picker-bw` (1px) — picker panel kenarlığı + açılış aksan çizgisi
  tek kaynaktan (imza güçlendirme ikisini birlikte kalınlaştırır).

### Düzeltilenler (kanıtlı kök nedenler — bağımsız doğrulayıcı 59/59)

- **Multiline "çifte animasyon" jank'i:** kesilen kelime-düşme/giriş
  animasyonlarının ghost'ları rebuild'e bağlı olmadığından aynı metni 2-3
  kopya çizebiliyordu → ghost kayıt defteri + HASAT: kesilen animasyon
  kaldığı pikselden TEK sürekli hareketle devralınır (çifte görüntü 5
  senaryoda 0; wrap tuşu kare süresi 38.6ms → 3.2ms; `_syncOverlaySize`
  çağrıları ~%98 azaldı; IME/bulk-delete/destroy yolları güvenli).
- **İmza border-draw çerçevesi gerçek kenarlıkla örtüşmüyordu:** köşelerde
  Q Bézier ≠ gerçek daire yayı + `||12` fallback'i meşru 0px radius'u
  eziyordu + panel SVG'sinde 1px padding-box ofseti → geometri artık
  `.glint-default-border`'ın computed stilinden türetilir (dört köşe ayrı,
  gerçek `A` yayları, stroke=border kalınlığı); SVG artık yeniden
  kurulmak yerine YERİNDE güncellenir. Piksel doğrulama: örtüşme ≤0.25px
  (dört varyant × light/dark), picker paneli piksel-birebir.
- **Güç barı ani silmede 4 parçaya bölünüyordu:** 340ms süre + 50ms
  stagger fiilen eşzamanlıydı, renk crossfade'i de kademeliydi → dolgu tek
  animasyonlu değere bağlandı (`@property --glint-strength-fill`; her
  segment clamp türevi) — bar fiziksel TEK PARÇA akar, renk tek gövde
  olarak döner. JS değişikliği yok; `@property` desteklemeyen tarayıcıda
  animasyonsuz ama doğru düşüş.
- **Checkbox tik salınımı kaldırıldı** (kullanıcı isteği): işaretlemedeki
  squash-stretch "oturma" animasyonu checkbox'tan (indeterminate dahil)
  söküldü — tik salt stroke çizimiyle gelir, basış antisipasyonu yumuşak
  döner. Radio kendi oturmasını korur.
- **OTP odak guard'ı:** rAF throttling altında (arka plan sekmesi)
  kuyruklanan `select()` başka alanın odağını çalabiliyordu — hücre hâlâ
  odaklıysa çalışır.

### Değişenler

- **E-posta memory "sekme eki" yeniden tasarlandı** (kullanıcı tarifi):
  inputun altına BİTİŞİK ama border'ına BİNMEZ (eski -2px bindirme
  kalktı); sol üst köşe düz, alt köşeler yuvarlak, sağ üstte içbükey kavis
  inputun alt border hizasında biter; sol çizgi inputun sol-alt kavisinin
  altına uzanır. Çerçeve STATİK ve beklemede nötr renktedir — draw-in
  animasyonu ve alt çizgi kıvılcımı kaldırıldı; hover'da çizgi aksan
  rengine döner ve üst kenar hariç yumuşakça parlar. Alttan doğma (clip
  perdesi) ve glif FLIP devri aynen sürer.
- **TreeSelect paneli artık Select/Etiketler gibi açılır** (kullanıcı
  isteği): picker'ın çift-yollu border-draw çizimi panelden kaldırıldı.
- **Ortak dropdown açılış dili:** Select · Combobox · TreeSelect ·
  Tags-öneri popover'ları aynı açılışı paylaşır — kapalı `scale(0.96) +
  translateY(-6px)`, açılışta `--glint-ease-pop` yumuşak yayı.
- **Color picker çekirdek/eklenti ayrımı** (kullanıcı kuralı: çekirdek =
  seçici + HEX + RGB): **kontrast rozeti** artık varsayılan KAPALI
  (`data-contrast` ya da `showContrast: true` ile açılır) ve **HEX kopyala
  butonu** artık otomatik gelmez (`data-copy` ya da `copyButton: true`).
  Pipet zaten opt-in idi (`data-eyedropper`). ESKİ DAVRANIŞA DÖNÜŞ:
  `Glint.Color.config = { showContrast: true, copyButton: true }`.
- Güç barında `.is-decreasing` sınıfı artık davranış taşımıyor (yönlü
  delay merdiveni kalktı; sınıf geriye dönük uyum için basılıyor).
- `.glint-input` artık `box-sizing: border-box` garantili — global reset'i
  olmayan host sayfada görünür kutu değişebilir (eski durum zaten kırıktı).
- Rehber: combobox çoklu seçim bölümü, pwgen "istediğin uzunlukta üret"
  canlı playground'ı, color opt-in araç örnekleri, e-posta memory /
  TreeSelect / güç barı / multiline metinleri yeni davranışlara güncellendi;
  Değişkenler tablosuna yeni token'lar eklendi.

---

## [1.7.0] — 2026-07-08

Büyük özellik sürümü: BEŞ yeni bileşen (IBAN, parola üretici, TreeSelect,
QR üretici, süre girişi), iki pakette de "Tema Kapağı" (tüm özelleştirme
dosya tepesinde), toast'a v1.7 davranış katmanı (yığın modu, kuyruk,
update, grup, klavye erişimi) ve v1.6 denetiminin kanıtladığı kök
nedenlerin kapatılması. Tek-dosya felsefesi ve sıfır bağımlılık korunur.

### Eklenenler

**GlintIban — IBAN girişi** (`data-glint-iban`)
- Canlı 4'lü gruplama; mod-97 doğrulama (geçerli → yeşil onay, geçersiz →
  hata durumu + `aria-invalid`); `glint:iban-complete {valid, country}`.
- `data-countries` (izinli ülkeler), `data-copy` (kopyala butonu),
  `data-raw-name` → boşluksuz IBAN gizli input'u (`data-glint-raw`).

**GlintPwgen — güçlü parola üretici** (`data-glint-generate`)
- Alan içi zar butonu: her sınıftan ≥1 karakter (büyük/küçük/rakam/sembol)
  garantili, muğlak karakterler (O 0 I l 1) hariç üretim.
- Üretim sonrası parola 2 sn görünür kalır, sonra otomatik gizlenir; güç
  barı senkron dolar; `data-generate-length` / `data-generate-charset`;
  `glint:pwgen-generate {length}`.

**GlintTree — hiyerarşik TreeSelect** (`data-glint-tree`)
- Kaynak: `data-options` / `data-options-from`; tekli + çoklu
  (`data-multiple`); `data-expand` ile başlangıç derinliği.
- TR-duyarlı arama: eşleşme `<mark>` vurgusu + ataları görünür kalır;
  `data-display`, `data-placeholder`, `data-empty-text`.
- Tam ARIA `role="tree"` deseni + klavye; mobilde bottom-sheet.
- Events: `glint:tree-open/-change`; API: `Glint.Tree`.

**GlintQR — QR kod üretici** (`data-glint-qr`)
- Encoder SIFIRDAN yazıldı (Reed-Solomon dahil — sıfır bağımlılık, ağ yok):
  `Glint.QR.matrix(text)` → boolean[][], `Glint.QR.toCanvas(matrix, scale,
  quiet)` → canvas/PNG.
- Popover (`role="dialog"` + odak tuzağı): canlı SVG önizleme (debounce
  `data-qr-debounce`), **PNG indir** (her zaman siyah/beyaz + 4 modül quiet
  zone — okuyucu garantisi; `data-qr-filename` / `data-qr-scale`), kopyala.
- Events: `glint:qr-open` / `glint:qr-update {ok, version, size, ecLevel,
  mask, bytes}`.
- Regresyon paketinde bağımsız decoder (jsQR) doğrulaması: PNG ve canlı SVG
  yolları, Türkçe UTF-8 ve 200+ bayt payload'larla birebir çözülüyor.

**GlintDuration — süre girişi** (`data-glint-duration`)
- "1sa 30dk" / "1:30" yazımı → saniye; gizli çıktı `data-glint-seconds`
  (+ `data-raw-name`); `data-units` ("sa,dk,sn" alt kümesi), `data-min/-max`
  (saniye ya da "15dk"/"8sa"/"1:30").
- Overlay `font-variant-numeric` aynası sayesinde tabular hizalı rakamlar.

**Picker**
- `data-inline[="bare"]` — sayfaya gömülü sürekli takvim.
- `data-natural` — Türkçe doğal dil girişi ("yarın", "2 hafta sonra"…).
- `data-badges` / `data-badges-from` — gün rozetleri (etkinlik işaretleri).
- Saat aralığı (TimeRange): time input'ta `data-range` (+ `data-overnight`
  gece devri); `data-hour-cycle="auto"` — yerel saat düzenini izler.

**Select**
- Option ikonları (`data-icon` / `data-icon-html`), async adaptör
  `data-source-fn` (Combobox sözleşmesi — kütüphane asla fetch yapmaz;
  `data-debounce`), `data-empty-text`.

**Input çekirdeği & diğerleri**
- `data-glint-url` — URL'yi segment segment renklendirme (protokol/alan
  adı/yol ayrımı) — `_charDecorator` kancası üzerinden.
- Upload: `data-crop` (free | 1:1 | 4:3 | 16:9 | a:b) dosya kırpma; yükleme
  bitişinde başarı töreni; `fail()` API'si; ilerleme çubuğu `translateX`
  (composite-dostu) animasyona taşındı.
- Color: `data-alpha` şeffaflık şeridi; `data-eyedropper` — pipet artık
  **opt-in**; `data-swatch-save[=anahtar]` kalıcı paletler; 2 satırlı düzen.

**Tema Kapağı (iki pakette)**
- glint-input.css / glint-toast.css TEPESİNDE tek `:root` bloğu: tüm
  renk/boyut/şekil/hareket token'ları bölümlenmiş halde (toast rehberinde
  44-token referans tablosu + canlı marka playground'ı).
- glint-input.js / glint-toast.js tepesinde YAPILANDIRMA ENVANTERİ: tüm
  çalışma-zamanı anahtarları + bileşen başına tam `data-*` kataloğu.

**Çekirdek — runtime hareket kontrolü**
- `Glint.configure({reducedMotion: "auto"|true|false})` artık CANLI:
  köke `data-glint-reduced` basılır, `--glint-motion-scale` güncellenir,
  `glint:motionchange` yayınlanır; anlık sorgu: `Glint.motion()`.

**Toast — v1.7 davranış katmanı**
- `stacking: "stack"` — Sonner tarzı yığın (önde 1, arkada 2 kademeli;
  hover/odakta açılır, hover tüm sayaçları duraklatır).
- `overflow: "queue"` — maxVisible dolunca FIFO kuyruk (varsayılan "evict").
- `group` — aynı türden toast'lar tek kutuda birikir, 5 satırdan sonrası
  "+N daha" (toast bazında `opts.group` ile de).
- `density: "compact"` — tek satır kompakt mod; `pauseAllOnHover`.
- `Glint.Toast.update(el, {type, message, title, duration, sticky, action})`
  — canlı toast'ı yerinde dönüştürür; `promise()` morf'u da bu altyapıda.
- Kapanış nedeni dışa açık: `glint:toast-close {reason: "timeout" | "user"
  | "swipe" | "evict" | "api"}`.
- Aksiyon butonunda `countdown: true` — süreye senkron geri sayım çizgisi
  ("Geri Al" deseni).
- Klavye erişimi: Alt+Shift+T ilk toast'a odak, ↑/↓ toast'lar arası gezinme,
  aksiyonlu toast'lar tabindex'li (Enter/Space çalışır), `:focus-visible`
  halkası.
- Safe-area: çentikli ekranlarda ofsetlere `env(safe-area-inset-*)` eklenir.
- Yığın FLIP: yeni toast girişinde mevcutlar zıplamadan kayar; maxVisible
  tahliyesi artık animasyonlu; hıza duyarlı swipe savurması.

### Düzeltilenler

- **Parola göz butonu caret'i (Chromium kök nedeni):** `type` değişimi
  sonrası tarayıcının ASENKRON selection sıfırlaması senkron restore'u
  eziyordu → üçlü restore (senkron + rAF + setTimeout 0). Ayrıca elle
  yazılmış göster/gizle butonları kütüphanece adopte edilir (çift listener
  gerekmez).
- **Picker taşmaları:** JS'teki sabit genişlik tahminleri (420/520/740)
  gerçek CSS minimumlarının altındaydı → `max-content` ölçümüne geçildi,
  `min-width: 520` kaldırıldı, viewport kenar politikası netleşti.
- Picker 12h görünümü: hardcode İngilizce AM/PM → locale'den ÖÖ/ÖS; ay
  başlığı odometer geçişi; açılış maskesi pinlendi (yeniden konumlanma
  zıplaması bitti).
- **E-posta memory chip'i:** "sekme eki" formu (input'a yapışık), tek
  sürekli FLIP uçuşu, kabul kıvılcımı — şekil/jank şikâyetleri kapandı.
- Telefon ülke seçici düzeltme paketi (açılış konumu, arama, klavye ve
  görsel tutarlılık — v1.6 denetim bulguları).
- Mikro-animasyon yenilemeleri: switch clip-path reveal, checkbox mürekkep
  dolumu, radio yerleşme (settle) animasyonu.
- Çekirdek: UA stylesheet'inin input'a bastığı `font` SHORTHAND'i
  `font-variant-numeric`'i sıfırlıyordu → overlay aynası artık
  `fontVariantNumeric`'i her koşulda izler.
- **Toast (7 kanıtlı hata):** aksiyonlu toast klavyeden erişilemiyordu
  (tabindex yok); prepend'de yığın FLIP eksikti (zıplama); maxVisible
  tahliyesi animasyonsuzdu; hover'da dedupe süre tazelemesi kayboluyordu;
  giriş animasyonunda `fill: forwards` kalıntısı; morph'ta çifte
  hover-pause riski; dedupe title/action'ı ayırt etmiyordu.
- Rehber: elle şifre-göz demosundaki çift listener (`wirePw`) v1.7 adopte
  davranışıyla çakışıp no-op oluyordu → kaldırıldı; `cb-async` mükerrer
  id düzeltildi.

### Değişenler

- Rehberler: input rehberine 5 yeni bileşen bölümü (canlı örnekler +
  HTML/Razor/JS sekmeleri), toast rehberine "v1.7" bölümü (8 canlı demo) +
  Tema Kapağı / 44-token referansı + marka playground'ı; mobil önizlemeye
  IBAN, süre ve çoklu TreeSelect satırları.
- API tablolarına v1.7 satırları (`Glint.Iban/Pwgen/Tree/QR/Duration`,
  `Glint.motion()`).

---

## [1.6.0] — 2026-07-06

Büyük özellik sürümü: iki tam yeni bileşen ailesi (telefon, combobox, kart),
form orkestratörü, e-posta yardımcıları, stepper ve picker'ın görsel yeniden
tasarımı, birleşik hareket dili ve tek tasarım kabuğuna kavuşan rehberler.
Tek-dosya felsefesi korunur: her şey glint-input.js / glint-input.css içinde.
Hiçbir bileşen ağ isteği GEREKTIRMEZ (Ajax zorunluluğu yok — kullanıcı kuralı).

### Eklenenler

**GlintPhone — uluslararası telefon girişi** (`.glint-phone-group`)
- 242 ülke/bölge gömülü veri: TR+EN ad, alan kodu, ulusal maske (93 ülkede
  gerçek format; kalanında uzunluk aralığı), paylaşılan kodlarda öncelik.
- Ülke seçici: aranabilir popover (TR/EN ad + ISO2 + kod), öncelikli ülkeler
  (`data-priority-countries`), klavye navigasyonu, ARIA listbox.
- Bayrak stratejisi `data-flags="auto|badge|none|url:<şablon>"` — auto:
  destekleyen platformda emoji, Windows'ta şık ISO-2 rozeti; `url:` şablonu
  salt OPT-IN (varsayılan tamamen çevrimdışı).
- Maske canlı uygulanır (TR: `536 401 08 26`), caret rakam-sayımıyla korunur;
  `+90` / `0090` / E.164 yapıştırınca ülke otomatik algılanır; trunk `0`
  sessizce atılır; `data-raw-name` ile opt-in gizli E.164 input.
- Events: `glint:phone-countrychange/-input/-validity`; API: `Glint.Phone`.

**GlintCombobox — serbest metinli autocomplete** (`data-glint-combobox`)
- Kaynaklar: inline JSON (`data-options`), `<datalist>`/window yolu
  (`data-options-from`), opsiyonel KULLANICI async fonksiyonu
  (`data-source-fn` — kütüphane asla fetch yapmaz).
- TR-duyarlı filtre + `<mark>` vurgusu, debounce, yarış guard'ı, loading
  durumu, boş-sonuç metni, tam ARIA combobox deseni.
- Events: `glint:combobox-select/-open/-close`; API: `Glint.Combobox`.

**GlintCard — kredi kartı girişi** (`data-glint-card`)
- Marka algılama (Visa/Mastercard/Amex/Troy/Discover/Diners/JCB) + sağda
  monokrom ikon fade-swap; 4-4-4-4 / Amex 4-6-5 / Diners 4-6-4 gruplama.
- Luhn doğrulama (geçerli → yeşil kenar + `glint:card-complete`); kardeş SKT
  (MM/YY, geçmiş tarih reddi) ve CVC (markaya göre 3/4) alanları arası
  otomatik odak akışı; ham rakamlar `data-glint-raw` + opsiyonel gizli input.

**GlintForm — form orkestratörü** (`<form data-glint-form>`)
- Submit'te istemci tarafı toplu doğrulama (native validity + gizli
  zorunlular); geçersizse submit engellenir, hatalar toast köprüsünden
  (fieldErrors politikası) ya da doğrudan inline akar; ilk hatalı alana
  kaydır + odakla; `glint:form-invalid` eventi; `Glint.Form.get(f).validate()`.

**E-posta yardımcıları** (GlintInput, `type=email`, opt-in)
- `data-glint-email-assist`: soluk ghost `@` ve alan adı tamamlama
  (`gmail.com`… — `data-glint-email-domains` ile özelleştirilir); Tab/→
  kabul eder; kabul "mürekkep katılaşması" animasyonuyla (ghost, input
  DEĞERİNE girmez — form asla yanlış değer görmez).
- `data-glint-email-memory`: e-posta YALNIZ başarılı submit'te localStorage'a
  yazılır (maks 5); dönüşte alanın sol altından chip süzülür (alt çizgiden
  doğma + border parıltısı); tıklamada glifler alana FLIP ile uçar; ↓ ile
  chip'e odak, kayıtlar arasında gezinme, Esc oturumluk kapatma;
  `Glint.email.clearMemory(key?)`.

**Picker**
- **Ay modu**: `<input type="month">` — panel doğrudan ay ızgarasıyla açılır,
  ay seçimi commit eder (native `YYYY-MM`, görüntü "Temmuz 2026").
- **Saat snap'i** (v1.5.1'den): yazılan saat commit'te `data-minute-step`'e
  yuvarlanır (13:33→13:35, 13:48→14:00).

**OTP**
- `data-resend="60"`: geri sayımlı "Tekrar gönder" + `glint:otp-resend`.
- `setSuccess()`: hücre hücre yeşil başarı dalgası (shake'in mutlu simetriği).

**Toast (glint-toast) — v1.6 özellik katmanı**
- `Glint.Toast.promise(p, {loading, success, error})`: dönen halka spinner'lı
  yükleme toast'ı, promise çözülünce AYNI kutu sonuca MORF olur (ikon pop +
  renk geçişi; ağ işini kullanıcı yapar — kütüphane fetch etmez).
- Aksiyon butonu: `success(msg, {action:{label:"Geri Al", onClick}})` —
  tıklamada varsayılan kapanır (`keepOpen` ile kalır).
- `opts.duration` / `opts.sticky` — çağrı başına süre; `opts.title`.
- ×N tekrar rozeti (dedupe): aynı tür+metin görünürken yeni istek mevcut
  toast'ın rozetini artırır ve süresini tazeler (bildirim spam'i biter).
- Kaydırarak kapatma (swipe): yatay sürükle → eşikte savrulur; dikey sayfa
  kaydırması bozulmaz (`touch-action: pan-y`).
- Konum sistemi: `Glint.Toast.configure({position: "top-right|top-left|
  top-center|bottom-right|bottom-left"})`; alttakiler aşağıdan süzülür;
  ofset token'ları `--glint-toast-offset-top/-side/-bottom`.
- `configure({maxVisible, staggerDelay, dedupe, swipeToDismiss, autoDismiss})`.
- Entegrasyon eventleri: `glint:toast-open` / `glint:toast-close` (document).
- Hata dışı toast'lar `role="status"` (daha doğru SR semantiği); giriş yayı
  `--glint-ease-pop` ortak token'ında.

**Çekirdek / hareket dili**
- Easing token seti (`--glint-ease-out/in/move/pop/snap/shake`) + 6 kademeli
  süre skalası (`--glint-dur-1..6`) — 40+ kaçak bezier token'a göçtü; toast'ın
  yay girişi `--glint-ease-pop` ile ORTAK dile alındı.
- `Glint.flip(container, mutate, opts)` — genel FLIP yardımcısı.
- `Glint.configure({reducedMotion:true})` artık runtime'da çalışır
  (`.glint-motion-off` kök sınıfı + `--glint-motion-scale`).
- `data-glint-digit-anim`: dış biçimleyiciler için rakam-düzeyi animasyon.
- `data-glint-diagonal`: herhangi bir alanda çapraz border çizimi.

### Değişenler (görsel yeniden tasarım)

- **Stepper REDESIGN:** kapsül + statik odak halkası kaldırıldı — stepper
  artık İMZA çizilen SVG kenarlığı kullanıyor (çizim grubu sarar), −/+
  butonları alan içinde ghost butonlar (hover aksan tint'i, basışta scale),
  rakam değişimi ODOMETER (eski rakam yukarı süzülür, yeni alttan; azalışta
  ters) — "kütüphanenin değilmiş gibi" hissi giderildi.
- **Picker REDESIGN:** border çizimi picker alanlarında SOL ÜSTTEN SAĞ ALTA
  çapraz akar; panel input'un hemen altında (4px), SOL KÖŞELER HİZALI ve
  GENİŞLİK INPUT İLE AYNI (yalnız çoklu-ay ≥520px / preset'li ≥420px tabanı);
  panel çapraz clip-path perdesiyle açılır ve kenarında aynı köşeden akan
  aksan çizgisi bir kez parlayıp söner; mobil bottom-sheet korunur.
- **Mikro-etkileşim paketi:** checkbox snap + 60ms gecikmeli imza çizimi,
  switch varışta squash-stretch, rating seçim pop'u, select değer odometer'ı,
  upload ilerleme shimmer'ı, picker gün seçim halkası.
- **Rehberler:** glint-input ve glint-toast index.html'leri TEK ortak tasarım
  kabuğuna taşındı (kullanıcı direktifi); v1.6 bölümleri eklendi; "ara" ve
  numeric demoları kaldırıldı; mobile-demo'lardan Google Fonts CDN'i çıktı.

### Kaldırılanlar
- glint-phone-library ayrı klasörü (üretim sonrası ana dosyalara birleşti —
  tek-dosya felsefesi, kullanıcı direktifi).
- Stepper kapsül token'ları (`--glint-stepper-surface*`, `-focus-ring`).

---

## [1.5.1] — 2026-07-06

Saf hata-düzeltme sürümü (yalnız kütüphane dosyaları; demo/index.html v1.6'da
elden geçecek). 20 ajanlı tam denetimin doğruladığı 40+ kök neden kapatıldı.

### Düzeltilenler

**GlintInput çekirdeği**
- **Multiline wrap kopması:** `.glint-char { white-space: pre }` span
  seviyesinde soft-wrap'i yasaklıyordu — native textarea alt satıra geçerken
  görüntü ilk satırda kalıyor, imleç/seçim kayıyordu. Span'lar artık track'in
  wrap kurallarını miras alıyor; hazır bekleyen FLIP taşıma animasyonu böylece
  ilk kez devreye girdi (kelime bütün halinde alta süzülür; ardışık aynı-delta
  span'lar tek "kelime ghost'unda" birleştirilir).
- Overlay genişliği artık `clientWidth` tabanlı — scrollbar çıktığında
  (~17px) wrap noktası sapması giderildi.
- Parola göz butonu imleci başa atmıyor (selection kaydedilip geri yükleniyor).
- Güç göstergesi akış dışına alındı (odaksız borderla çakışma bitti; grup
  yüksekliği sabit kaldığından SVG border gerilmesi de düzeldi) + yeni animasyon:
  segment scaleX dolumu, yönlü dalga (artışta soldan, azalışta sağdan),
  skor renginde birlikte crossfade, seviye atlayınca tepe segmentte parıltı.
- Karakter sayacı tüm-metin-seçili silmede (Ctrl+A + Backspace) donuyordu;
  artık harfler uçarken canlı geri sayıyor.
- Binlik ayraç animasyonu rakam-düzeyi diff'e geçti: yalnız yazılan rakam
  animasyon alır, nokta imlece dokunmadan `maxWidth 0→doğal` ile araya süzülür
  (eski "hepsini sil + yeniden yaz" ghost fırtınası bitti).
- `prefers-reduced-motion` açıkken sayaç/güç/etiket/auto-grow tamamen
  donuyordu — işlevsel güncellemeler artık animasyonsuz da çalışıyor.
- Overlay hizalaması `text-align`'ı izliyor (stepper'da sayı gerçekten ortada).
- Overlay tipografisi longhand kopyalanıyor (`font` shorthand'i
  style/stretch'i eziyordu) + webfont geç yüklenirse `fonts.ready`'de resync.
- `destroy()` inline `paddingRight`'ı geri alıyor.
- "ara" (`data-glint-search`) ve numeric (`type=number→inputmode`) modları
  kaldırıldı; stepper kendi `inputmode` güvencesini taşıyor.

**Çekirdek yaşam döngüsü**
- Destroy edilen bileşen aynı elemente bir daha mount olamıyordu
  (`comp.seen` WeakSet hiç temizlenmiyordu) — `Glint.unregister` artık siliyor.
- Odaklı picker DOM'dan kalkınca kalıcı 60fps rAF döngüsü kalıyordu
  (register çakışması iç GlintInput'un destroy'unu ulaşılmaz kılıyordu).
- `form.reset()` sonrası checkbox/radio/switch görsel+ARIA senkronu.
- Select/Slider/Range/Upload `destroy()` artık `Glint.unregister` çağırıyor.
- GlintMask ölü kodu kaldırıldı (~230 satır; mantık `Glint.format`'ta,
  telefon girişi v1.6'da ayrı paket).

**Bileşenler**
- **Stepper:** basılı-tut bırakışındaki fantom +1 adım; elle yazılan değerin
  min/max/step'e kıstırılmaması; runtime `disabled/min/max` senkronu; sınırda
  boşa dönen tekrar zamanlayıcısı; `value` setter NaN guard'ı + change;
  etiket artık hep yukarıda (iniş konumu − butonunun içindeydi), çentik −
  butonunun sağında; sentetik input öncesi beforeinput snapshot'ı.
- **Switch:** metinli varyant (`glint-switch--text`) — track metne göre
  genişler, thumb yolculuğu korunur; ışık temada görünmez off-ikon rengi.
- **Rating:** yarım yıldız düşürülünce kalan dikey çizgi artıkları (stale
  raster) — boş yıldızda dolgu katmanına görünürlük kilidi + kalıcı
  `will-change` kaldırıldı + width transition'ı söküldü; `.is-half` de hover
  pop alıyor.
- **Select:** sanal modda "Tümünü seç" yalnız DOM'daki ~20 satırı seçiyordu;
  arama açılışını tetikleyen ilk harf kayboluyordu.
- **Tags:** sürükle-sıralamada chip her yer değişiminde zıplıyordu (tutuş
  ofseti düzeltmesi cebirsel no-op'tu).
- **Range:** sürükleme boyunca hiç `input`/`glint:rangeinput` çıkmıyordu —
  artık rAF-kısıtlı sürekli input, bırakışta change (native semantik).
- **OTP:** ayraçlı kod yapıştırmada hücre yanması; programatik set / SMS
  autofill'in sayfa odağını çalması; `otp-complete`'in kod doluyken her
  değişimde yeniden ateşlenmesi (dedup) + `data-autosubmit`; RTL sayfada ters
  ok/akış (LTR pin); i18n hücre etiketi (`data-label-cell`); mobil klavye
  hijyeni (spellcheck/autocorrect/autocapitalize); `setError(message)` artık
  ekran okuyucuya konuşuyor; init değeri sanitize; `data-allow-space`.
- **Upload:** liste/dropzone genişlik eşitliği (seçici sertleştirme + scoped
  `box-sizing`); silme animasyonunda çift `finish()`; geçersiz dosyaların
  kota tüketmesi; reorder'ın kendi change'ini yeniden yutması.
- **Color:** giriş satırının 248px paneli taşırması (flex-wrap + min-width:0
  + `size=7`); scoped `box-sizing`; panel `overflow:hidden`; sürüklemede her
  tick'te `change` yayılması (artık bırakışta bir kez); `destroy()` native
  input'u ve DOM'u eski haline döndürüyor.
- **Slider:** `destroy()` balonu ve kendi oluşturduğu wrap'ı geri sarıyor
  (re-init'te çift balon bitti).
- **Picker:** onay tiksiz pickerlarda açılış animasyonunun yarıda sönmesi —
  `.glint-picker-open` çizimi açık yaşam döngüsü boyunca sabitliyor + odak
  restorasyonu `close()`'ta merkezileşti; klavyeyle yazılan saat commit
  anında `data-minute-step`'e oturuyor (13:33→13:35, 13:48→14:00); spinner'da
  dakika taşması saate taşınıyor (13:55+15→14:10); açıkken destroy'da
  body scroll kilidi kalmıyor; `destroy()` native input'u eski haline
  döndürüyor; ters atanmış soluk renk token'ları düzeltildi (iki temada da
  WCAG AA'ya döndü).

**CSS / tema**
- Panel z-index'leri tek skalaya indi (`--glint-z-panel: 1060`): color paneli
  artık toast'ı örtmüyor, tüm paneller Bootstrap modal'ının üzerinde tutarlı.
- Tema uyumlu ince scrollbar: select listesi, tags önerileri, picker paneli,
  multiline textarea (+ koyu panellerde `color-scheme: dark`).
- 18 adet hardcoded `rgba(5,150,105,…)` → `color-mix(… var(--bs-primary) …)`;
  5 adet `#6ee7b7` → `--glint-accent-brighter`; `#34d399` kuralları →
  `--glint-caret-dark` (aksan rengi artık her yerde birlikte değişiyor).
- Hata durumunun tüm sayfayı iten `margin-bottom` animasyonu reduced-motion'da
  kapatıldı; hata metni küçük puntoda AA kontrastlı `--glint-error-text`.
- Aksiyon butonları (×/göz) `--glint-action-color` token'ında — koyu temada
  beyaz; elle yazılmış aksiyon SVG'lerine boyut güvencesi.
- Mobil dokunma hedefleri: tags/upload silme ve alan aksiyonlarına
  `pointer: coarse`'ta ~44px görünmez dokunma halosu.
- Tags önerileri Select popover animasyonuyla hizalandı (drift); kalıcı
  popover `will-change`'leri yalnız açık duruma kapsandı; seg-thumb'daki
  composite edilemeyen `width` hint'i kaldırıldı; OTP `direction: ltr`;
  color picker 10px mikro metinleri 11px'e çıkarıldı; mükerrer koyu-tema
  OTP kuralı birleştirildi.

### Notlar
- `data-glint-search` ve otomatik `type=number→inputmode=numeric` davranışı
  KALDIRILDI (kullanıcı kararı). Stepper mobil sayısal klavyeyi kendisi set
  ediyor; OTP/picker/color kendi `inputmode`'larını zaten taşıyordu.
- Demo (index.html) düzeltmeleri ve GitHub yayını bilinçli olarak v1.6'ya
  bırakıldı.

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

[1.5.0]: https://github.com/ArmaganTambova/glint-ui-library/releases/tag/v1.5.0
