# Changelog

Glint UI Kit'in tüm önemli değişiklikleri bu dosyada tutulur.
Biçim [Keep a Changelog](https://keepachangelog.com/tr/1.0.0/)'a, sürümleme
[Semantic Versioning](https://semver.org/lang/tr/)'a dayanır.

Sürüm, iki paket için **ortak** tek numaradır (`build/version.js` → `Glint.version`).

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
