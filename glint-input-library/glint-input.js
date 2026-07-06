/* ════════════════════════════════════════════════════════════════════════
 *  ✎ DÜZENLEYİNİZ — projeye özel değiştirilebilir veriler
 *  ────────────────────────────────────────────────────────────────────────
 *  • Renk/boyut/şekil TOKEN'ları → glint-input.css :root bloğu
 *      --bs-primary · --glint-input-height/-radius/-padding-x/-font-size
 *      --glint-state-* · --glint-radius · --glint-motion · --glint-action-size
 *  • Çalışma zamanı AYARLARI → Glint.config (Glint.configure ile):
 *      locale · reducedMotion · autoMount · fieldErrors · fieldErrorText
 *  • SÜRÜM tek kaynak: ../build/version.js  (→ Glint.version; build/scripts/build.mjs senkronlar)
 *  • Tam sürüm geçmişi: ../CHANGELOG.md
 * ════════════════════════════════════════════════════════════════════════ */

/**
 * Glint UI Kit — TEK PAKET (Bundle) v1.5.0
 * ============================================================================
 * Saf vanilla, sıfır bağımlılık. TÜM bileşenler tek dosyada:
 *   Çekirdek + Input + Checkbox + Controls (Radio/Switch/Segmented/Rating)
 *   + Select/Tags + Fields (OTP/Stepper/Mask) + Slider/Range + Upload
 *   + Color Picker + Date/Time Picker.
 *
 * ── TEMBEL (LAZY) İŞLEME ──────────────────────────────────────────────────
 * Her bileşen çekirdeğe Glint.defineComponent ile KAYDOLUR (sadece diziye
 * ekleme — neredeyse sıfır maliyet). Bir bileşenin asıl kodu (mount: örnek
 * oluşturma, listener/observer bağlama, DOM kurma) YALNIZCA sayfada o
 * bileşene ait bir element VARSA çalışır. Kullanılmayan bileşen sistemi
 * yemez: ne örnek, ne observer, ne DOM. CSS kuralları da eşleşen element
 * yoksa atıl kalır. Tek dosya = tek istek (cache'lenir).
 *
 * Her bölüm bağımsız bir IIFE'dir; ilk bölüm (çekirdek) window.Glint'i kurar.
 *
 * İÇİNDEKİLER
 *   1) Çekirdek (defineComponent/claimGroup/refresh) + Input + Checkbox
 *   2) Controls — Radio · Switch · Segmented · Rating
 *   3) Select & Tags
 *   4) Fields — OTP · Stepper · Mask
 *   5) Slider & Range
 *   6) Upload / Dropzone
 *   7) Color Picker
 *   8) Date / Time / DateTime Picker (v2)
 */


/* ════════════════════════════════════════════════════════════════════════
 *  1) Çekirdek (defineComponent/claimGroup/refresh) + Input + Checkbox
 *     (kaynak modül: glint-input.js)
 * ════════════════════════════════════════════════════════════════════════ */
/**
 * Glint Input Animation Engine v1.5.0
 * Reusable, framework-agnostic input/checkbox UI kit + paylaşılan çekirdek.
 * API:       window.Glint.Input, window.Glint.Checkbox,
 *            window.Glint.defineComponent, window.Glint.claimGroup, window.Glint.refresh
 * Selectors: .glint-input-group, input.glint-checkbox
 *
 * v1.3 → v1.4 Düzeltmeler & Yenilikler:
 *
 *   Multi-line imleç / metin hizalaması (GERÇEK çözüm):
 *     Eski yaklaşım her karakteri `inline-block` ATOM yapıyordu; bu
 *     kutuların alt-piksel yuvarlaması native sürekli-metin dizilişiyle
 *     uyuşmadığından native imleç gördüğün gliften kayıyordu ("a." yazınca
 *     imleç a ile . arasında kalır). v1.4 öncesi denenen "kerning kapat"
 *     yaması yanlış katmandı ve sorunu çözmedi.
 *     YENİ: çok satırlıda karakterler `display: inline` (native ile birebir
 *     akış → imleç tam oturur). inline transform alamadığından giriş/çıkış/
 *     FLIP animasyonları mutlak-konumlu GHOST katmanına taşındı
 *     (_makeGhost / _animateAdditionsGhost / ghost tabanlı FLIP).
 *
 *   YENİ — Paylaşılan çekirdek (Glint.defineComponent / claimGroup / refresh):
 *     Tüm modüller (controls, select, fields, slider, upload, color) tek bir
 *     kayıt + tek MutationObserver üzerinden otomatik başlatılır. Input ve
 *     Checkbox da bu çekirdeğe kaydoldu. claimGroup, bir grubu devralan
 *     modüller için base init'i atlatır (picker ile aynı desen).
 *
 * v1.2 → v1.3 Düzeltmeler:
 *
 *   Karakter Overlay Taşması:
 *     Eski yaklaşım overlay'i input'un BORDER kenarına oturtup
 *     padding'i overlay'e veriyordu. box-sizing belirsizliği +
 *     focus state'te border-color:transparent ile aktarılan
 *     border genişliği farkı nedeniyle, scrollLeft polling ile
 *     track translateX uygulandığında karakterler input'un sol
 *     kenarının dışına taşabiliyordu (overflow:hidden clip
 *     alanı padding'i de kapsadığı için tam clip yapamıyordu).
 *
 *     YENİ yaklaşım: overlay, getBoundingClientRect ile
 *     input'un EXACT text-content alanına (border + padding
 *     hariç) hizalanıyor. Overlay'de padding YOK; clip alanı
 *     = text alanı. Track translate edildiğinde taşma fiziksel
 *     olarak imkânsız.
 *
 * v1.1 → v1.2 Düzeltmeler & Geliştirmeler:
 *
 *   İlk Yükleme Flash:
 *     buildBorderSVG DOM'a append ettikten SONRA path'lerin
 *     transition'ını 'none' yapıp dashoffset'i set ediyor,
 *     sonra getBoundingClientRect() ile reflow zorlayıp
 *     sonraki frame'de transition'ı geri açıyor.
 *     Böylece 0 → totalLength geçiş animasyonu tamamen engellendi.
 *
 *   Toplu Silme Yönü (Ctrl+A → Delete/Backspace):
 *     Bulk silme (count > 1) artık sağdan sola animate oluyor.
 *     Index dizisi ters çevriliyor, stagger da buna göre uygulanıyor.
 *
 *   Karakter Giriş Animasyonu:
 *     translateY + scale + blur kombinasyonu.
 *     Tek karakter: hızlı snap + micro-bounce.
 *     Paste: dalgalanan ripple stagger.
 *     Silme ghost: scale-down + blur ile daha belirgin çıkış.
 *
 *   YENİ: Checkbox Sistemi (GlintCheckbox):
 *     • input[type="checkbox"].glint-checkbox elementlerini otomatik keşfeder.
 *     • SVG checkmark stroke-draw animasyonu ile işaretleme.
 *     • Indeterminate (-) durumu desteklenir.
 *     • Dark mode, keyboard nav, reduced motion desteği.
 */

(function () {
    "use strict";

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── YARDIMCILAR ──

    function svgEl(tag, attrs) {
        const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
        for (const [k, v] of Object.entries(attrs || {})) el.setAttribute(k, v);
        return el;
    }

    function diffStrings(oldStr, newStr) {
        let prefixLen = 0;
        const minLen = Math.min(oldStr.length, newStr.length);
        while (prefixLen < minLen && oldStr[prefixLen] === newStr[prefixLen]) prefixLen++;
        let suffixLen = 0;
        while (
            suffixLen < (oldStr.length - prefixLen) &&
            suffixLen < (newStr.length - prefixLen) &&
            oldStr[oldStr.length - 1 - suffixLen] === newStr[newStr.length - 1 - suffixLen]
        ) suffixLen++;
        return {
            prefixLen, suffixLen,
            removedCount: oldStr.length - prefixLen - suffixLen,
            addedChars: newStr.substring(prefixLen, newStr.length - suffixLen),
            addedStart: prefixLen
        };
    }


    // ══════════════════════════════════════════════════════════════
    //  GlintInput
    // ══════════════════════════════════════════════════════════════

    class GlintInput {

        constructor(group) {
            this.group = group;
            this.input = group.querySelector(".glint-input");
            this.label = group.querySelector(".glint-label");
            if (!this.input) return;

            this.isPassword = this.input.type === "password";
            this.prevValue = this.input.value;
            this.charSpans = [];
            this.savedRects = [];
            this.isComposing = false;
            this._svgBuilt = false;

            // ── MULTI-LINE TESPİT ──
            // Textarea → otomatik multiline; class manuel de eklenebilir.
            // Mode: --fixed yoksa default auto-grow.
            this.isMultiline = this.input.tagName === "TEXTAREA" ||
                group.classList.contains("glint-input-group--multiline");
            if (this.isMultiline) {
                group.classList.add("glint-input-group--multiline");
                this.isFixedHeight = group.classList.contains("glint-input-group--fixed");
                this.isAutoGrow = !this.isFixedHeight;
            } else {
                this.isFixedHeight = false;
                this.isAutoGrow = false;
            }

            const cs = getComputedStyle(this.input);
            this.inputFont = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
            this.inputPaddingLeft = parseFloat(cs.paddingLeft) || 16;
            this.inputPaddingRight = parseFloat(cs.paddingRight) || 16;

            this.buildDOM();
            this.bindEvents();
            this.syncOverlay(false);
            this.updateLabelState();
            this._updateCounter();
            this._updateStrength();
            if (this.isAutoGrow) requestAnimationFrame(() => this._autoGrow());
            group._glintInstance = this;
            Glint.register(group, this);
        }

        // ── DOM ──

        buildDOM() {
            this.defaultBorder = document.createElement("div");
            this.defaultBorder.className = "glint-default-border";
            this.group.appendChild(this.defaultBorder);

            // SVG rAF defer — transition kapalıyken dashoffset set edilir
            requestAnimationFrame(() => {
                this.buildBorderSVG();
                if (this.group.classList.contains("glint-focused")) {
                    this._applyFocusSVGInstant();
                }
            });

            if (!prefersReduced) {
                this.overlay = document.createElement("div");
                this.overlay.className = "glint-char-overlay";

                this.charTrack = document.createElement("div");
                this.charTrack.className = "glint-char-track";

                // Ghost'lar (giriş/çıkış/FLIP) overlay'e eklenir; gerçek input
                // tipografisini miras almaları için longhand kopyalanır
                // (v1.5.1: `font` shorthand'i font-style/stretch'i normal'e
                // sıfırlıyordu — italik/condensed temalarda glif genişliği
                // kayardı; ayrıca webfont geç yüklenirse yeniden senkron
                // gerekir → _syncOverlayFont hem burada hem fonts.ready'de).
                this._syncOverlayFont();
                if (document.fonts && document.fonts.ready) {
                    document.fonts.ready.then(() => {
                        if (this.charTrack) {
                            this._syncOverlayFont();
                            this.syncOverlay(false);
                            this.rebuildSVG();
                        }
                    }).catch(() => { });
                }
                // Multi-line: line-height ve wrap kuralları textarea ile aynı olmalı.
                // (CSS de aynısını veriyor ama inline ile garanti.)
                if (this.isMultiline) {
                    const ics = getComputedStyle(this.input);
                    this.charTrack.style.lineHeight = ics.lineHeight;
                    // KRİTİK: overlay ile native textarea BİREBİR aynı sarmalama
                    // kurallarını kullanmalı; yoksa kelime farklı noktada bölünür
                    // → imleç/seçim kayar, satır arası boşluk oluşur (bilinen bug).
                    // word-break:normal → normal kelimeler BÜTÜN olarak alta iner
                    // (mid-word split olmaz); overflow-wrap:break-word → yalnız
                    // tek başına satıra sığmayan AŞIRI uzun kelime bölünür ve bu
                    // ikisinde de AYNI noktada olur → imleç oturur.
                    this.charTrack.style.whiteSpace = "pre-wrap";
                    this.charTrack.style.overflowWrap = "break-word";
                    this.charTrack.style.wordBreak = "normal";
                    this.charTrack.style.tabSize = ics.tabSize;
                    // Native textarea'yı da AYNI kurallara açıkça sabitle
                    // (varsayılanı tarayıcıya bırakma → tutarlılık garanti).
                    this.input.style.whiteSpace = "pre-wrap";
                    this.input.style.overflowWrap = "break-word";
                    this.input.style.wordBreak = "normal";
                }

                this.overlay.appendChild(this.charTrack);
                this.group.appendChild(this.overlay);

                // Overlay'i input'un exact boyut ve konumuna kilitle
                this._syncOverlaySize();
                // a11y: overlay var → native metni gizleyebiliriz (CSS guard).
                // reduced-motion'da bu blok çalışmaz → metin görünür kalır.
                this.group.classList.add("glint-has-overlay");
            }

            this.errorEl = document.createElement("p");
            this.errorEl.className = "glint-error-msg";
            this.errorEl.setAttribute("aria-live", "polite");
            this.errorEl.setAttribute("role", "alert");
            this.group.appendChild(this.errorEl);

            this._buildExtras();
            this.input.style.borderColor = "transparent";
        }

        // Overlay/track tipografisini input'un computed longhand'lerinden
        // kopyalar. Shorthand `font` KULLANILMAZ (style/stretch/line-height'ı
        // sıfırlar). Webfont geç geldiğinde (FOUT) fonts.ready'den tekrar
        // çağrılır → mirror ile native aynı metrikte kalır.
        _syncOverlayFont() {
            if (!this.overlay || !this.charTrack) return;
            const cs = getComputedStyle(this.input);
            for (const el of [this.overlay, this.charTrack]) {
                el.style.fontFamily = cs.fontFamily;
                el.style.fontSize = cs.fontSize;
                el.style.fontWeight = cs.fontWeight;
                el.style.fontStyle = cs.fontStyle;
                el.style.fontStretch = cs.fontStretch;
                el.style.letterSpacing = cs.letterSpacing;
            }
            if (this.isMultiline) this.charTrack.style.lineHeight = cs.lineHeight;
        }

        // ════════════════════════════════════════════════════════════
        //  v1.5 EKSTRALAR — sayaç · inputmode · clear · parola · binlik · güç
        // ════════════════════════════════════════════════════════════
        _buildExtras() {
            const g = this.group, input = this.input;

            // — inputmode otomatik (yalnız EKSİKSE; mevcut ezilmez) —
            // v1.5.1: "numeric" (type=number) kaldırıldı — sayısal artış için
            // GlintStepper var, o kendi inputmode'unu set ediyor. "ara"
            // (data-glint-search → enterkeyhint) modu da kaldırıldı.
            const t = (input.getAttribute("type") || "text").toLowerCase();
            const addIfMissing = (a, v) => { if (v && !input.hasAttribute(a)) input.setAttribute(a, v); };
            if (t === "email") addIfMissing("inputmode", "email");
            else if (t === "tel") addIfMissing("inputmode", "tel");
            else if (t === "url") addIfMissing("inputmode", "url");

            // — Karakter sayacı (opt-in: data-glint-counter veya maxlength) —
            const ml = parseInt(input.getAttribute("maxlength"), 10);
            this._maxLen = (!isNaN(ml) && ml > 0) ? ml : null;
            if (g.hasAttribute("data-glint-counter") || this._maxLen != null) {
                this.counterEl = document.createElement("div");
                this.counterEl.className = "glint-char-counter";
                this.counterEl.setAttribute("aria-hidden", "true");
                g.appendChild(this.counterEl);
            }

            // — Aksiyon butonları —
            this._actionCount = 0;
            // Modern stroke (çizgi) eye / eye-slash — dolu-blob göz yerine ince, premium çizim
            const ICON_EYE =
                '<svg class="glint-eye-on" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 12s3.6-6.8 9.5-6.8S21.5 12 21.5 12 17.9 18.8 12 18.8 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.6"/></svg>' +
                '<svg class="glint-eye-off" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M10.6 5.3A8.6 8.6 0 0112 5.2c5.9 0 9.5 6.8 9.5 6.8a16 16 0 01-2 2.8M6.2 6.7A15.6 15.6 0 002.5 12s3.6 6.8 9.5 6.8a8.5 8.5 0 004-1M3 3l18 18M10.1 10.1a2.6 2.6 0 003.7 3.7"/></svg>';
            const ICON_CLR =
                '<svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path d="M10 8.6l3.2-3.2 1.4 1.4L11.4 10l3.2 3.2-1.4 1.4L10 11.4l-3.2 3.2-1.4-1.4L8.6 10 5.4 6.8l1.4-1.4z"/></svg>';

            if (this.isPassword && !g.hasAttribute("data-glint-no-toggle")) {
                this.pwBtn = this._addAction("glint-field__action--password", "Parolayı göster/gizle", ICON_EYE, () => this._togglePassword());
                this.pwBtn.setAttribute("aria-pressed", "false");
            }
            if (g.hasAttribute("data-glint-clearable")) {
                this.clearBtn = this._addAction("glint-field__action--clear", "Temizle", ICON_CLR, () => this._clearValue());
            }

            // — Binlik ayraç (değer biçimleme; Glint.format) —
            this._groupThousands = g.hasAttribute("data-glint-group-thousands");

            // — Parola güç göstergesi (opt-in) —
            if (this.isPassword && g.hasAttribute("data-glint-strength")) {
                this.strengthEl = document.createElement("div");
                this.strengthEl.className = "glint-strength-bar";
                this.strengthEl.setAttribute("aria-hidden", "true");
                this.strengthEl.innerHTML = "<i></i><i></i><i></i><i></i>";
                // Bar akış-dışı (absolute) — yer açma margin'i bu sınıfla
                g.classList.add("glint-has-strength");
                g.appendChild(this.strengthEl);
                this.strengthText = document.createElement("span");
                this.strengthText.className = "glint-strength-text";
                this.strengthText.setAttribute("aria-live", "polite");
                g.appendChild(this.strengthText);
            }
        }

        _addAction(cls, aria, svgHtml, onClick) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "glint-field__action " + cls;
            btn.setAttribute("aria-label", aria);
            btn.innerHTML = svgHtml;
            this._actionCount++;
            if (this._actionCount > 1) {
                // İkinci+ aksiyon → sola kaydır + input sağ padding'ini artır (üst üste binme)
                btn.style.right = "calc(var(--glint-action-offset) + " + (this._actionCount - 1) + " * (var(--glint-action-size) + 6px))";
                this.input.style.paddingRight = "calc(var(--glint-action-size) * " + this._actionCount + " + var(--glint-action-offset) + " + (this._actionCount * 8) + "px)";
            }
            btn.addEventListener("click", onClick);
            this.group.appendChild(btn);
            return btn;
        }

        _togglePassword() {
            const reveal = this.input.type === "password";   // şu an gizli → göster
            // Tip değişimi tarayıcıda seçimi sıfırlar (caret 0'a atar);
            // mevcut caret/seçim kaydedilip değişimden sonra geri yüklenir.
            const selStart = this.input.selectionStart;
            const selEnd = this.input.selectionEnd;
            const selDir = this.input.selectionDirection;
            const hadFocus = document.activeElement === this.input;
            this.input.type = reveal ? "text" : "password";
            this.isPassword = !reveal;                        // text iken gerçek char göster
            if (hadFocus) this.input.focus();
            if (selStart != null) {
                try { this.input.setSelectionRange(selStart, selEnd, selDir || "none"); } catch (_) { }
            }
            this.pwBtn.setAttribute("aria-pressed", String(reveal));
            this.pwBtn.classList.toggle("is-revealed", reveal);
            this.syncOverlay(true);                           // overlay • ↔ gerçek karakter
        }

        _clearValue() {
            if (!this.input.value) { this.input.focus(); return; }
            this.input.value = "";
            this.syncOverlay(true);
            this.updateLabelState();
            this._updateCounter();
            this._updateStrength();
            this.input.dispatchEvent(new Event("input", { bubbles: true }));
            this.input.focus();
        }

        _updateCounter() {
            if (!this.counterEl) return;
            const len = this.input.value.length;
            this.counterEl.textContent = this._maxLen != null ? (len + " / " + this._maxLen) : String(len);
            if (this._maxLen != null) {
                this.counterEl.classList.toggle("glint-char-counter--warn", len >= this._maxLen * 0.9 && len < this._maxLen);
                this.counterEl.classList.toggle("glint-char-counter--full", len >= this._maxLen);
            }
        }

        _updateStrength() {
            if (!this.strengthEl) return;
            const v = this.input.value;
            let score = 0;
            if (v.length >= 8) score++;
            if (v.length >= 12) score++;
            if (/[a-z]/.test(v) && /[A-Z]/.test(v)) score++;
            if (/\d/.test(v) && /[^\w\s]/.test(v)) score++;
            score = v ? Math.min(4, score) : 0;
            const prev = this._lastScore || 0;
            if (score !== prev) {
                // Yön sınıfı: azalışta segment gecikmeleri tersine döner
                // (sağdan sola "boşalma" dalgası).
                this.strengthEl.classList.toggle("is-decreasing", score < prev);
                if (score > prev && !prefersReduced) {
                    // Yeni ulaşılan tepe segmentte tek seferlik parıltı.
                    const segs = this.strengthEl.children;
                    for (const s of segs) s.classList.remove("glint-shine");
                    const top = segs[score - 1];
                    if (top) { void top.offsetWidth; top.classList.add("glint-shine"); }
                }
                this._lastScore = score;
            }
            this.strengthEl.dataset.score = String(score);
            if (this.strengthText) {
                const labels = ["", "Zayıf", "Orta", "İyi", "Güçlü"];
                this.strengthText.textContent = v ? ("Parola gücü: " + labels[score]) : "";
            }
        }

        _applyThousands() {
            if (!this._groupThousands || !window.Glint.format) return;
            const input = this.input;
            const oldVal = input.value;
            const oldCaret = input.selectionStart != null ? input.selectionStart : oldVal.length;
            const digits = oldVal.replace(/\D/g, "");
            const formatted = window.Glint.format.thousands(digits);
            if (formatted === oldVal) return;
            input.value = formatted;
            input.setAttribute("data-glint-raw", digits);
            const pos = window.Glint.format.restoreCaret(oldVal, oldCaret, formatted, /\d/);
            try { input.setSelectionRange(pos, pos); } catch (_) { }
        }

        /**
         * v1.5.1 — Binlik ayraçlı alanın hedefli animasyon planı.
         * Değer/caret _applyThousands'ta ZATEN doğru; burada yalnız overlay
         * oynatılır (native metin gizli olduğundan input.value/selection'a
         * hiç dokunulmaz → yazma asla bloklanmaz).
         *   • Yazılan rakam(lar): mevcut snap-in / paste ripple.
         *   • Silinen rakam(lar): mevcut tek-karakter çıkış ghost'u.
         *   • Yeni beliren ayraç: maxWidth 0→doğal + scale/opacity — sağdaki
         *     rakamlar zıplamak yerine açılan boşluğa doğal akışla kayar.
         *   • Kaybolan ayraç: eski konumunda sakin opacity fade (hareket yok).
         * Konumu kayan ama değişmeyen rakamlar hiç animasyon almaz.
         */
        _animateThousands(oldVal, newVal, inputType) {
            const digitRe = /\d/;
            const oldDigits = oldVal.replace(/\D/g, "");
            const newDigits = newVal.replace(/\D/g, "");
            const dDiff = diffStrings(oldDigits, newDigits);
            const remEnd = dDiff.prefixLen + dDiff.removedCount;
            const addedLen = dDiff.addedChars.length;
            const isPaste = inputType === "insertFromPaste" || inputType === "insertFromDrop";

            // Her ayraç için "rakam sınırı" (öncesindeki rakam sayısı) —
            // ayraçlar rakam sınırlarıyla eşlenerek eski↔yeni kimliği bulunur.
            const sepBoundaries = (str) => {
                const res = []; let d = 0;
                for (let i = 0; i < str.length; i++) {
                    if (digitRe.test(str[i])) d++;
                    else res.push({ boundary: d, index: i });
                }
                return res;
            };
            // Eski rakam sınırını yeni ordinal uzayına taşı (silinen bölge → -1)
            const mapOldB = (b) => (b <= dDiff.prefixLen) ? b
                : (b >= remEnd ? b - dDiff.removedCount + addedLen : -1);

            const oldSeps = sepBoundaries(oldVal);
            const newSeps = sepBoundaries(newVal);
            const survivingNewB = new Set(oldSeps.map(s => mapOldB(s.boundary)).filter(b => b >= 0));
            const newSepB = new Set(newSeps.map(s => s.boundary));

            // ── 1) Eski konum ghost'ları (savedRects onBeforeInput'tan) ──
            if (this.savedRects.length && this.overlay) {
                const containerRect = this.overlay.getBoundingClientRect();
                const visible = (r, relLeft) => r && !(relLeft + r.width < 0 || relLeft > containerRect.width);

                // Kaybolan ayraçlar — sakin fade
                oldSeps.forEach(s => {
                    const mb = mapOldB(s.boundary);
                    if (mb >= 0 && newSepB.has(mb)) return;   // ayraç yaşıyor
                    const r = this.savedRects[s.index];
                    const relLeft = r ? r.left - containerRect.left : 0;
                    if (!visible(r, relLeft)) return;
                    const ghost = this._makeGhost(oldVal[s.index], relLeft, r.top - containerRect.top);
                    ghost.animate([{ opacity: 1 }, { opacity: 0 }],
                        { duration: 120, easing: "ease-out", fill: "forwards" })
                        .finished.then(() => ghost.remove()).catch(() => ghost.remove());
                });

                // Silinen rakamlar — mevcut çıkış animasyonunun tek-karakter hali
                if (dDiff.removedCount > 0) {
                    let ord = -1;
                    for (let i = 0; i < oldVal.length; i++) {
                        if (!digitRe.test(oldVal[i])) continue;
                        ord++;
                        if (ord < dDiff.prefixLen || ord >= remEnd) continue;
                        const r = this.savedRects[i];
                        const relLeft = r ? r.left - containerRect.left : 0;
                        if (!visible(r, relLeft)) continue;
                        const ghost = document.createElement("span");
                        ghost.className = "glint-char glint-char-exiting";
                        ghost.textContent = oldVal[i];
                        ghost.style.cssText = "position:absolute;left:" + relLeft + "px;top:" +
                            (r.top - containerRect.top) + "px;pointer-events:none;z-index:10";
                        this.overlay.appendChild(ghost);
                        ghost.animate([
                            { transform: "translateY(0) scale(1)", opacity: 1, filter: "blur(0px)" },
                            { transform: "translateY(5%) scale(1.08)", opacity: 0.85, filter: "blur(0px)", offset: 0.35 },
                            { transform: "translateY(-60%) scale(0.55)", opacity: 0, filter: "blur(3px)" }
                        ], { duration: 230, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" })
                            .finished.then(() => ghost.remove()).catch(() => ghost.remove());
                    }
                }
            }

            // ── 2) Yeni span'lar final konumda → hedefli girişler ──
            this.rebuildSpans(newVal);

            // Yazılan rakamlar
            if (addedLen > 0) {
                let ord = -1, animIdx = 0;
                for (let i = 0; i < newVal.length; i++) {
                    if (!digitRe.test(newVal[i])) continue;
                    ord++;
                    if (ord < dDiff.addedStart || ord >= dDiff.addedStart + addedLen) continue;
                    const span = this.charSpans[i];
                    if (!span) continue;
                    span.animate(isPaste
                        ? [
                            { transform: "translateY(55%) scale(0.5)", opacity: 0, filter: "blur(4px)" },
                            { transform: "translateY(-6%) scale(1.07)", opacity: 1, filter: "blur(0px)", offset: 0.68 },
                            { transform: "translateY(0) scale(1)", opacity: 1, filter: "blur(0px)" }
                        ]
                        : [
                            { transform: "translateY(60%) scale(0.55)", opacity: 0, filter: "blur(3px)" },
                            { transform: "translateY(-5%) scale(1.08)", opacity: 1, filter: "blur(0px)", offset: 0.62 },
                            { transform: "translateY(0) scale(1)", opacity: 1, filter: "blur(0px)" }
                        ], {
                        duration: isPaste ? 310 : 230,
                        delay: isPaste ? (animIdx++) * 28 : 0,
                        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                        fill: "backwards"
                    });
                }
            }

            // Yeni beliren ayraçlar — araya süzülme
            newSeps.forEach(s => {
                if (survivingNewB.has(s.boundary)) return;
                const span = this.charSpans[s.index];
                if (!span) return;
                const w = span.getBoundingClientRect().width;
                span.animate([
                    { maxWidth: "0px", opacity: 0, transform: "scale(0.6)" },
                    { maxWidth: w + "px", opacity: 1, transform: "scale(1)" }
                ], { duration: 160, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
            });
        }

        buildBorderSVG() {
            const rect = this.input.getBoundingClientRect();
            const W = rect.width, H = rect.height;
            if (W === 0 || H === 0) return;

            const R = Math.min(parseFloat(getComputedStyle(this.input).borderRadius) || 12, W / 2, H / 2);
            if (this.svg) { this.svg.remove(); this.svg = null; }

            this.svg = svgEl("svg", {
                class: "glint-border-svg",
                viewBox: `0 0 ${W} ${H}`,
                preserveAspectRatio: "none"
            });

            const S = 1;
            const d1 = [
                `M ${S} ${H / 2}`, `L ${S} ${R + S}`,
                `Q ${S} ${S} ${R + S} ${S}`, `L ${W - R - S} ${S}`,
                `Q ${W - S} ${S} ${W - S} ${R + S}`, `L ${W - S} ${H / 2}`
            ].join(" ");
            const d2 = [
                `M ${S} ${H / 2}`, `L ${S} ${H - R - S}`,
                `Q ${S} ${H - S} ${R + S} ${H - S}`, `L ${W - R - S} ${H - S}`,
                `Q ${W - S} ${H - S} ${W - S} ${H - R - S}`, `L ${W - S} ${H / 2}`
            ].join(" ");

            this.pathTop = svgEl("path", { d: d1, class: "glint-border-path" });
            this.pathBottom = svgEl("path", { d: d2, class: "glint-border-path" });
            this.svg.appendChild(this.pathTop);
            this.svg.appendChild(this.pathBottom);
            this.group.appendChild(this.svg);

            this.pathTopLen = this.pathTop.getTotalLength();
            this.pathBottomLen = this.pathBottom.getTotalLength();

            // ─────────────────────────────────────────────────────
            // Flash Önleme
            // Path append edilince CSS transition aktif.
            // SVG default dashoffset = 0. Biz totalLength set edince
            // tarayıcı 0→totalLength animate eder → görünür flash.
            //
            // Çözüm:
            //   transition = 'none' → değer set et → reflow (getBCR)
            //   → sonraki rAF'ta transition = '' (geri aç)
            // ─────────────────────────────────────────────────────
            this.pathTop.style.transition = "none";
            this.pathBottom.style.transition = "none";

            this.pathTop.style.strokeDasharray = this.pathTopLen;
            this.pathTop.style.strokeDashoffset = this.pathTopLen;
            this.pathBottom.style.strokeDasharray = this.pathBottomLen;
            this.pathBottom.style.strokeDashoffset = this.pathBottomLen;

            // Reflow: tarayıcıya yeni değeri "gör ve kaydet" dedik
            void this.pathTop.getBoundingClientRect();

            requestAnimationFrame(() => {
                if (this.pathTop) this.pathTop.style.transition = "";
                if (this.pathBottom) this.pathBottom.style.transition = "";
            });

            if (this.group.classList.contains("glint-error")) {
                this.pathTop.classList.add("glint-border-path--error");
                this.pathBottom.classList.add("glint-border-path--error");
            }

            this._svgBuilt = true;
        }

        _applyFocusSVGInstant() {
            if (!this.pathTop || !this.pathBottom) return;
            this.pathTop.style.transition = "none";
            this.pathBottom.style.transition = "none";
            this.pathTop.style.strokeDashoffset = "0";
            this.pathBottom.style.strokeDashoffset = "0";
            void this.pathTop.getBoundingClientRect();
            requestAnimationFrame(() => {
                if (this.pathTop) this.pathTop.style.transition = "";
                if (this.pathBottom) this.pathBottom.style.transition = "";
            });
        }

        // ── EVENTS ──

        bindEvents() {
            // Tüm listener'lar tek AbortController sinyaline bağlanır →
            // destroy()'da this._ac.abort() ile hepsi tek seferde sökülür
            // (MVC partial-view / SPA yeniden render'da sızıntı önleme).
            this._ac = new AbortController();
            const sig = { signal: this._ac.signal };

            this.input.addEventListener("focus", () => this.onFocus(), sig);
            this.input.addEventListener("blur", () => this.onBlur(), sig);

            // Aksiyon butonları (.glint-field__action) tıklanınca focus'u
            // input'tan ÇALMASIN — yoksa border-draw animasyonu bir an
            // kapanmaya başlayıp geri açılır (flash). mousedown'da
            // preventDefault focus'u input'ta tutar; click yine çalışır,
            // klavye ile Tab erişimi de bozulmaz. Delegasyon: sonradan
            // eklenen butonlar (ör. picker toggle) da kapsanır.
            this.group.addEventListener("mousedown", (e) => {
                if (e.target.closest && e.target.closest(".glint-field__action")) {
                    e.preventDefault();
                }
            }, sig);

            // v1.5.1 — input/composition dinleyicileri HER ZAMAN bağlanır.
            // Eskiden tüm blok `if (!prefersReduced)` içindeydi; reduced-motion
            // açık makinelerde sayaç, güç göstergesi, floating label ve
            // auto-grow yazarken TAMAMEN donuyordu (animasyon değil, işlev
            // kaybı). Animasyona özgü işler onInput içinde overlay varlığıyla
            // (this.charTrack) kapılanır.
            this.input.addEventListener("input", (e) => this.onInput(e), sig);
            this.input.addEventListener("compositionstart", () => { this.isComposing = true; }, sig);
            this.input.addEventListener("compositionend", () => {
                this.isComposing = false;
                this.syncOverlay(true);
                if (this.isAutoGrow) this._autoGrow();
            }, sig);
            this.input.addEventListener("animationstart", (e) => {
                if (e.animationName === "glint-autofill-detect") {
                    setTimeout(() => { this.syncOverlay(true); this.updateLabelState(); }, 100);
                }
            }, sig);

            // Yalnız overlay'e (animasyon katmanına) hizmet eden dinleyiciler:
            if (!prefersReduced) {
                this.input.addEventListener("beforeinput", () => this.onBeforeInput(), sig);
                this.input.addEventListener("scroll", () => this.syncScroll(), { signal: this._ac.signal, passive: true });
                this.input.addEventListener("select", () => this.syncScroll(), sig);
                this.input.addEventListener("keyup", () => this.syncScroll(), sig);

                // ── CTRL+A + BACKSPACE/DELETE İNTERCEPT ──
                // Tüm metin seçiliyken silme → karakter karakter animasyonlu silme
                this._bulkDeleting = false;
                this.input.addEventListener("keydown", (e) => {
                    if (this._bulkDeleting) { e.preventDefault(); return; }
                    if (e.key === "Backspace" || e.key === "Delete") {
                        const { selectionStart, selectionEnd, value } = this.input;
                        const selectedLen = selectionEnd - selectionStart;
                        if (selectedLen > 1 && selectedLen === value.length) {
                            e.preventDefault();
                            this._bulkDeleteAnimated();
                        }
                    }
                }, sig);
            }

            this._resizeObserver = new ResizeObserver(() => this.rebuildSVG());
            this._resizeObserver.observe(this.input);
        }

        onFocus() {
            this.group.classList.add("glint-focused");
            if (!this._svgBuilt) requestAnimationFrame(() => this._applyFocusSVGInstant());
            // Scroll sync polling — focus boyunca her frame scroll takip.
            // Multi-line'da hem horizontal hem vertical.
            this._scrollPolling = true;
            this._lastScrollLeft = -1;
            this._lastScrollTop = -1;
            const poll = () => {
                if (!this._scrollPolling) return;
                const sl = this.input.scrollLeft;
                const st = this.isMultiline ? this.input.scrollTop : 0;
                if (sl !== this._lastScrollLeft || st !== this._lastScrollTop) {
                    this._lastScrollLeft = sl;
                    this._lastScrollTop = st;
                    if (this.charTrack) {
                        this.charTrack.style.transform = this.isMultiline
                            ? `translate(${-sl}px, ${-st}px)`
                            : `translateX(${-sl}px)`;
                    }
                }
                requestAnimationFrame(poll);
            };
            requestAnimationFrame(poll);
        }

        onBlur() {
            this._scrollPolling = false;
            this.group.classList.remove("glint-focused");
            this.updateLabelState();
            this.syncScroll(); // Son sync
        }

        updateLabelState() {
            this.group.classList.toggle("glint-has-value", this.input.value.length > 0);
        }

        // ── KARAKTER ANİMASYONLARI ──

        onBeforeInput() {
            // Hem single-line (ghost'lar için) hem multi-line (FLIP için)
            // mevcut span rect'lerini kaydet. Multi-line'da ek olarak
            // value snapshot da gerekli (ghost text content).
            this.savedRects = this.charSpans.map(s => {
                const r = s.getBoundingClientRect();
                return { left: r.left, top: r.top, width: r.width, height: r.height };
            });
            if (this.isMultiline) {
                this._flipOldValue = this.input.value;
            }
        }

        onInput(e) {
            if (this.isComposing) return;
            if (this._groupThousands) this._applyThousands();
            const newVal = this.input.value, oldVal = this.prevValue;
            if (newVal === oldVal) return;

            if (this.group.classList.contains("glint-error")) this.clearError();

            // Overlay yoksa (reduced-motion) animasyon katmanı atlanır ama
            // işlevsel güncellemeler (auto-grow, sayaç, güç, label) çalışır.
            if (!this.charTrack) {
                if (this.isAutoGrow) this._autoGrow();
                this.prevValue = newVal;
                this.updateLabelState();
                this._updateCounter();
                this._updateStrength();
                return;
            }

            // v1.5.1 — Binlik ayraçlı alan: generic prefix/suffix diff ayraç
            // kaymasını "toplu sil + yeniden yaz" olarak yorumlayıp ghost
            // fırtınası yaratıyordu ("12.345"+"6" → 4 silme + 5 ekleme).
            // Rakam-düzeyi diff yalnız gerçek değişimi oynatır; ayraçlar
            // caret'e dokunmadan araya süzülür.
            if (this._groupThousands) {
                this._animateThousands(oldVal, newVal, e.inputType || "");
                this.prevValue = newVal;
                this.updateLabelState();
                this._updateCounter();
                this._updateStrength();
                this.syncScroll();
                return;
            }

            const diff = diffStrings(oldVal, newVal);

            if (this.isMultiline) {
                // Multi-line akışı:
                //   1) Silinen karakterler için ghost (eski konumda öl)
                //   2) rebuildSpans → yeni span'lar oluşur
                //   3) AUTO-GROW önce — textarea yüksekliği stabilize olsun
                //      ki FLIP delta hesabı doğru pozisyondan başlasın
                //      (overlay yeni height'a göre clip alır, span'lar
                //      yeni satırda görünür konumda olur).
                //   4) FLIP: konumu değişen mevcut span'ları slide
                //   5) Yeni karakterler için snap-in animasyonu
                if (diff.removedCount > 0) {
                    this.animateRemovals(diff.prefixLen, diff.removedCount, e.inputType || "");
                }
                this.rebuildSpans(newVal);
                if (this.isAutoGrow) this._autoGrow();
                this._flipMoveExistingSpans(diff);
                if (diff.addedChars.length > 0) {
                    this.animateAdditions(diff.addedStart, diff.addedChars.length, e.inputType || "");
                }
            } else {
                // Single-line (mevcut davranış)
                if (diff.removedCount > 0) this.animateRemovals(diff.prefixLen, diff.removedCount, e.inputType || "");
                this.rebuildSpans(newVal);
                if (diff.addedChars.length > 0) this.animateAdditions(diff.addedStart, diff.addedChars.length, e.inputType || "");
            }

            this.prevValue = newVal;
            this.updateLabelState();
            this._updateCounter();
            this._updateStrength();
            this.syncScroll();
        }

        rebuildSpans(value) {
            this.charTrack.innerHTML = "";
            this.charSpans = [];
            const inheritWrap = this.isMultiline;
            for (let i = 0; i < value.length; i++) {
                const span = document.createElement("span");
                span.className = "glint-char";
                // Multi-line'da karakterler inline (native ile birebir akış);
                // single-line'da inline-block (flex hizalama). Her ikisinde de
                // tek karakter atomu — fark sadece CSS display'inde.
                if (inheritWrap) {
                    // CSS'teki inherit kuralının inline emniyet kemeri:
                    // span'lar track'in wrap kurallarını almazsa soft-wrap
                    // hiç oluşmaz (bkz. .glint-input-group--multiline .glint-char).
                    span.style.whiteSpace = "inherit";
                    span.style.overflowWrap = "inherit";
                    span.style.wordBreak = "inherit";
                }
                span.textContent = this.isPassword ? "•" : value[i];
                this.charTrack.appendChild(span);
                this.charSpans.push(span);
            }
        }

        /**
         * Geliştirilmiş Karakter Giriş Animasyonu
         *
         * Tek karakter: translateY + scale(0.6) + blur → snap + micro-bounce
         * Paste: stagger ripple, her karakter biraz gecikmeli + yay
         */
        animateAdditions(startIndex, count, inputType) {
            const isPaste = inputType === "insertFromPaste" || inputType === "insertFromDrop";

            // Multi-line: gerçek karakterler inline → transform almaz.
            // Giriş animasyonu mutlak-konumlu ghost'la yapılır; gerçek
            // karakter animasyon süresince gizlenir, bitince geri açılır.
            if (this.isMultiline) {
                this._animateAdditionsGhost(startIndex, count, isPaste);
                return;
            }

            for (let i = 0; i < count; i++) {
                const span = this.charSpans[startIndex + i];
                if (!span) continue;

                if (isPaste) {
                    span.animate([
                        { transform: "translateY(55%) scale(0.5)", opacity: 0, filter: "blur(4px)" },
                        { transform: "translateY(-6%) scale(1.07)", opacity: 1, filter: "blur(0px)", offset: 0.68 },
                        { transform: "translateY(0) scale(1)", opacity: 1, filter: "blur(0px)" }
                    ], {
                        duration: 310,
                        delay: i * 28,
                        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                        fill: "backwards"
                    });
                } else {
                    // Tek karakter — snap + micro-bounce
                    span.animate([
                        { transform: "translateY(60%) scale(0.55)", opacity: 0, filter: "blur(3px)" },
                        { transform: "translateY(-5%) scale(1.08)", opacity: 1, filter: "blur(0px)", offset: 0.62 },
                        { transform: "translateY(0) scale(1)", opacity: 1, filter: "blur(0px)" }
                    ], {
                        duration: 230,
                        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                        fill: "backwards"
                    });
                }
            }
        }

        /**
         * Mutlak-konumlu geçici ghost span üretir (overlay'e eklenir).
         * Gerçek inline karakter transform alamadığı için tüm hareketli
         * animasyonlar (multi-line giriş / FLIP) bu ghost üzerinde döner.
         * relLeft/relTop overlay'in sol-üst köşesine göredir.
         */
        _makeGhost(text, relLeft, relTop) {
            const ghost = document.createElement("span");
            ghost.className = "glint-char-ghost";
            ghost.textContent = text;
            ghost.style.left = relLeft + "px";
            ghost.style.top = relTop + "px";
            this.overlay.appendChild(ghost);
            return ghost;
        }

        /**
         * Multi-line giriş animasyonu (ghost tabanlı).
         * Yeni karakter zaten inline ve doğru konumda; onu gizleyip aynı
         * konumda bir ghost'u snap-in ile oynatıyoruz, bitince geri açıyoruz.
         */
        _animateAdditionsGhost(startIndex, count, isPaste) {
            if (!this.overlay) return;
            const containerRect = this.overlay.getBoundingClientRect();

            for (let i = 0; i < count; i++) {
                const span = this.charSpans[startIndex + i];
                if (!span) continue;

                const r = span.getBoundingClientRect();
                const relLeft = r.left - containerRect.left;
                const relTop = r.top - containerRect.top;

                // Görünür clip alanı dışındaysa animasyonsuz görünsün
                if (relLeft + r.width < 0 || relLeft > containerRect.width) continue;
                if (relTop + r.height < 0 || relTop > containerRect.height) continue;

                span.style.opacity = "0";
                const ghost = this._makeGhost(span.textContent, relLeft, relTop);
                const reveal = () => { span.style.opacity = ""; ghost.remove(); };

                const keyframes = isPaste
                    ? [
                        { transform: "translateY(55%) scale(0.5)", opacity: 0, filter: "blur(4px)" },
                        { transform: "translateY(-6%) scale(1.07)", opacity: 1, filter: "blur(0px)", offset: 0.68 },
                        { transform: "translateY(0) scale(1)", opacity: 1, filter: "blur(0px)" }
                    ]
                    : [
                        { transform: "translateY(60%) scale(0.55)", opacity: 0, filter: "blur(3px)" },
                        { transform: "translateY(-5%) scale(1.08)", opacity: 1, filter: "blur(0px)", offset: 0.62 },
                        { transform: "translateY(0) scale(1)", opacity: 1, filter: "blur(0px)" }
                    ];

                ghost.animate(keyframes, {
                    duration: isPaste ? 310 : 230,
                    delay: isPaste ? i * 28 : 0,
                    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                    fill: "backwards"
                }).finished.then(reveal).catch(reveal);
            }
        }

        /**
         * Toplu Silme Yönü
         * IMPROVE — Scale + blur ile daha belirgin ghost çıkışı
         *
         * isBulk (count > 1): index dizisi ters çevrilir → sağdan sola
         * Her ghost: scale-down + blur + translateY
         */
        animateRemovals(startIndex, count, inputType) {
            if (!this.savedRects.length || !this.overlay) return;
            const containerRect = this.overlay.getBoundingClientRect();
            const isBulk = count > 1;

            // Bulk silmede sağ → sol için indexleri ters çevir
            const indices = Array.from({ length: count }, (_, i) => startIndex + i);
            if (isBulk) indices.reverse();

            const sourceText = this.isMultiline ? (this._flipOldValue || this.prevValue) : this.prevValue;

            indices.forEach((charIndex, animIndex) => {
                const savedRect = this.savedRects[charIndex];
                if (!savedRect) return;

                const relLeft = savedRect.left - containerRect.left;
                const relTop = savedRect.top - containerRect.top;

                // Görünür alan dışındaki ghost'ları atla.
                // Multi-line'da dikey clip de gerekli (scroll edilmiş kısım).
                if (this.isMultiline) {
                    if (relLeft + savedRect.width < 0 || relLeft > containerRect.width) return;
                    if (relTop + savedRect.height < 0 || relTop > containerRect.height) return;
                } else {
                    if (relLeft + savedRect.width < 0 || relLeft > containerRect.width) return;
                }

                const ghost = document.createElement("span");
                ghost.className = "glint-char glint-char-exiting";
                ghost.textContent = this.isPassword ? "•" : sourceText[charIndex];
                ghost.style.cssText = [
                    "position:absolute",
                    `left:${relLeft}px`,
                    `top:${relTop}px`,
                    "pointer-events:none",
                    "z-index:10"
                ].join(";");
                this.overlay.appendChild(ghost);

                // Giriş animasyonunun simetrik tersi:
                // Giriş: aşağıdan yukarı (translateY(60%) → -5% bounce → 0)
                // Silme: 0 → hafif aşağı bounce → yukarıya çıkış
                if (isBulk) {
                    ghost.animate([
                        { transform: "translateY(0) scale(1)", opacity: 1, filter: "blur(0px)" },
                        { transform: "translateY(6%) scale(1.07)", opacity: 0.85, filter: "blur(0px)", offset: 0.3 },
                        { transform: "translateY(-55%) scale(0.5)", opacity: 0, filter: "blur(4px)" }
                    ], {
                        duration: 250,
                        delay: animIndex * 20,
                        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                        fill: "forwards"
                    }).finished.then(() => ghost.remove()).catch(() => ghost.remove());
                } else {
                    ghost.animate([
                        { transform: "translateY(0) scale(1)", opacity: 1, filter: "blur(0px)" },
                        { transform: "translateY(5%) scale(1.08)", opacity: 0.85, filter: "blur(0px)", offset: 0.35 },
                        { transform: "translateY(-60%) scale(0.55)", opacity: 0, filter: "blur(3px)" }
                    ], {
                        duration: 230,
                        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                        fill: "forwards"
                    }).finished.then(() => ghost.remove()).catch(() => ghost.remove());
                }
            });
        }

        /**
         * Ctrl+A + Backspace/Delete → Karakter karakter hızlı animasyonlu silme
         * Her frame bir karakter silinir (sağdan sola), ~60 karakter/saniye
         */
        _bulkDeleteAnimated() {
            this._bulkDeleting = true;
            if (this.group.classList.contains("glint-error")) this.clearError();

            const deleteNext = () => {
                const val = this.input.value;
                if (val.length === 0) {
                    this._bulkDeleting = false;
                    this.prevValue = "";
                    this.updateLabelState();
                    // Sayaç + güç göstergesi son durumu (0) göstersin —
                    // sentetik input eventi onInput'ta prevValue eşitliğine
                    // takılıp erken döndüğü için burada elle güncellenir.
                    this._updateCounter();
                    this._updateStrength();
                    this.syncScroll();
                    // Multi-line auto-grow: silme bitince textarea küçülür
                    if (this.isAutoGrow) this._autoGrow();
                    // Dışarıya input event fırlat (form validasyon vb.)
                    this.input.dispatchEvent(new Event("input", { bubbles: true }));
                    return;
                }

                // Rect kaydet → son karakter için ghost
                this.onBeforeInput();
                const oldVal = val;
                const newVal = val.slice(0, -1);

                // Sadece son karakter silme animasyonu
                this.animateRemovals(newVal.length, 1, "deleteContentBackward");

                // Input güncelle
                this.input.value = newVal;
                this.rebuildSpans(newVal);
                // Multi-line: her silmede height küçülür → auto-grow
                if (this.isAutoGrow) this._autoGrow();
                this.prevValue = newVal;
                // Harfler uçarken sayaç canlı geri saysın (50/50 → 49/50 ...)
                this._updateCounter();
                this._updateStrength();

                requestAnimationFrame(deleteNext);
            };

            requestAnimationFrame(deleteNext);
        }

        syncOverlay(animate) {
            if (prefersReduced || !this.charTrack) {
                // Overlay yok → yalnız değer takibi güncellenir (composition
                // ve autofill yollarının prevValue'su bayat kalmasın).
                this.prevValue = this.input.value;
                return;
            }
            const val = this.input.value;
            this.rebuildSpans(val);
            if (animate && val.length > 0) {
                this.charSpans.forEach((span, i) => {
                    span.animate([
                        { transform: "translateY(60%) scale(0.55)", opacity: 0, filter: "blur(3px)" },
                        { transform: "translateY(0) scale(1)", opacity: 1, filter: "blur(0px)" }
                    ], {
                        duration: 200, delay: i * 18,
                        easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards"
                    });
                });
            }
            this.prevValue = val;
        }

        syncScroll() {
            if (!this.charTrack) return;
            const doSync = () => {
                if (!this.charTrack) return;
                const sl = this.input.scrollLeft;
                const st = this.isMultiline ? this.input.scrollTop : 0;
                this.charTrack.style.transform = this.isMultiline
                    ? `translate(${-sl}px, ${-st}px)`
                    : `translateX(${-sl}px)`;
            };
            doSync();
            // scrollLeft tarayıcı tarafından geç güncellenir — çoklu zamanlama
            requestAnimationFrame(() => {
                doSync();
                requestAnimationFrame(doSync);
            });
        }

        // ── MULTI-LINE: FLIP MOVE ──────────────────────────────────
        //
        // Yazma/silme sonrası wrap noktaları değişen karakterler için
        // First-Last-Invert-Play tekniği:
        //   1. Eski rect'ler `savedRects`'te (onBeforeInput'tan).
        //   2. rebuildSpans yeni span'ları oluşturdu — yeni rect'ler
        //      DOM'da hesaplanmış halde.
        //   3. Eski → yeni index mapping kur (prefix korunmuş, suffix
        //      added-removed farkı kadar kaymış).
        //   4. Her span için (deltaX, deltaY) = oldRect - newRect.
        //   5. transform: translate(delta) → translate(0) animate et.
        // Sonuç: konumu değişen karakterler eski yerlerinden yeni
        // yerlerine kayıyormuş gibi görünür ("yazıp silme değil,
        // taşıma"). Pozisyonu değişmeyen karakterler hiçbir animasyon
        // tetiklemez (0.5px threshold).
        _flipMoveExistingSpans(diff) {
            if (!this.savedRects || !this.savedRects.length || !this.overlay) return;
            const containerRect = this.overlay.getBoundingClientRect();

            const oldLen = (this._flipOldValue ?? this.prevValue).length;
            const suffixLen = oldLen - diff.prefixLen - diff.removedCount;

            // newIndex → oldIndex eşlemesi (prefix korunur, suffix kayar)
            const moves = [];
            for (let i = 0; i < diff.prefixLen; i++) moves.push({ newIdx: i, oldIdx: i });
            for (let j = 0; j < suffixLen; j++) {
                moves.push({
                    newIdx: diff.prefixLen + diff.addedChars.length + j,
                    oldIdx: diff.prefixLen + diff.removedCount + j
                });
            }

            // v1.5.1 — Ghost birleştirme: ardışık span'lar AYNI (deltaX, deltaY)
            // ile kayıyorsa (tipik durum: satır atlayan kelimenin tamamı —
            // karakter aralıkları sabit olduğundan delta kelime boyunca
            // sabittir) tek ghost olarak taşınır. Hem ghost/animasyon sayısı
            // düşer hem "kelime bütün halinde taşınıyor" hissi verir.
            const runs = [];
            let cur = null;
            moves.forEach(({ newIdx, oldIdx }) => {
                const span = this.charSpans[newIdx];
                if (!span) { cur = null; return; }
                const oldRect = this.savedRects[oldIdx];
                if (!oldRect) { cur = null; return; }
                const newRect = span.getBoundingClientRect();
                const deltaX = oldRect.left - newRect.left;
                const deltaY = oldRect.top - newRect.top;
                // Konumu değişmemişse dokunma → gereksiz ghost üretme
                if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) { cur = null; return; }

                const relLeft = newRect.left - containerRect.left;
                const relTop = newRect.top - containerRect.top;
                // Görünür alan dışındaysa atla (uzun metinde scroll edilmiş kısım)
                if (relTop + newRect.height < 0 || relTop > containerRect.height) { cur = null; return; }

                if (cur && cur.lastIdx === newIdx - 1 &&
                    Math.abs(cur.deltaX - deltaX) < 0.5 && Math.abs(cur.deltaY - deltaY) < 0.5) {
                    cur.spans.push(span);
                    cur.text += span.textContent;
                    cur.lastIdx = newIdx;
                } else {
                    cur = { spans: [span], text: span.textContent, deltaX, deltaY, relLeft, relTop, lastIdx: newIdx };
                    runs.push(cur);
                }
            });

            runs.forEach(run => {
                // Gerçek inline karakterleri gizle; ghost eski→yeni konuma kaysın.
                run.spans.forEach(s => { s.style.opacity = "0"; });
                const ghost = this._makeGhost(run.text, run.relLeft, run.relTop);
                const reveal = () => { run.spans.forEach(s => { s.style.opacity = ""; }); ghost.remove(); };

                ghost.animate([
                    { transform: `translate(${run.deltaX}px, ${run.deltaY}px)` },
                    { transform: "translate(0, 0)" }
                ], {
                    duration: 320,
                    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                    fill: "backwards"
                }).finished.then(reveal).catch(reveal);
            });

            this._flipOldValue = null;
        }

        // ── MULTI-LINE: AUTO-GROW ──────────────────────────────────
        //
        // Textarea yüksekliği scrollHeight'a göre büyür; max-height'a
        // ulaşılınca scroll devreye girer (.glint-at-max → overflow-y:auto).
        _autoGrow() {
            if (!this.isAutoGrow || !this.input) return;
            const input = this.input;
            const cs = getComputedStyle(input);
            const maxHeight = parseFloat(cs.maxHeight);

            // Önce sıfırla ki scrollHeight gerçek içerik yüksekliğini versin
            input.style.height = "auto";
            const target = input.scrollHeight;

            if (!isNaN(maxHeight) && target >= maxHeight) {
                input.style.height = maxHeight + "px";
                input.classList.add("glint-at-max");
            } else {
                input.style.height = target + "px";
                input.classList.remove("glint-at-max");
            }

            // Boyut değişti → overlay'i ve SVG border'ı resync et
            this._syncOverlaySize();
        }

        rebuildSVG() {
            this.buildBorderSVG();
            if (this.group.classList.contains("glint-focused")) this._applyFocusSVGInstant();
            this._syncOverlaySize();
        }

        // ── OVERLAY BOYUT SYNC ──
        // Overlay'i input'un EXACT text-content alanına kilitle.
        //
        // ÖNCEKİ HATALI YAKLAŞIM:
        //   left/top = inp.offsetLeft/Top (border kenarı)
        //   width/height = inp.offsetWidth/Height (toplam boyut)
        //   paddingLeft/Right = inputPaddingLeft/Right (overlay'e eklenen)
        //
        //   Sorun: overflow:hidden clip alanı padding'i de kapsadığı
        //   için track translateX(-scrollLeft) uygulandığında karakter
        //   span'ları input'un sol border'ının dışına çıkabiliyordu.
        //   box-sizing belirsizliği (content-box vs border-box) bunu
        //   şiddetlendiriyordu.
        //
        // YENİ YAKLAŞIM:
        //   Overlay, getBoundingClientRect ile input'un border + padding
        //   ÇIKARILMIŞ text-content alanına TAM oturuyor. Padding 0.
        //   Clip alanı = text alanı; taşma fiziksel olarak imkânsız.
        _syncOverlaySize() {
            if (!this.overlay) return;
            const inp = this.input;
            const cs = getComputedStyle(inp);

            // Konum: input'a göre group koordinatları
            const inpRect = inp.getBoundingClientRect();
            const grpRect = this.group.getBoundingClientRect();

            const borderL = parseFloat(cs.borderLeftWidth) || 0;
            const borderR = parseFloat(cs.borderRightWidth) || 0;
            const borderT = parseFloat(cs.borderTopWidth) || 0;
            const borderB = parseFloat(cs.borderBottomWidth) || 0;
            const padL = parseFloat(cs.paddingLeft) || 0;
            const padR = parseFloat(cs.paddingRight) || 0;
            const padT = parseFloat(cs.paddingTop) || 0;
            const padB = parseFloat(cs.paddingBottom) || 0;

            // Text-content alanı (border + padding hariç) — DİKEY padding de
            // dahil. Aksi halde multiline'da overlay metni padding-top kadar
            // yukarıda render olurdu (single-line'da dikey padding 0 olduğu
            // için davranış değişmez).
            //
            // v1.5.1 — Genişlik/yükseklik client metriklerinden türetilir:
            // getBoundingClientRect() dikey scrollbar'ı DAHİL eder ama native
            // textarea metnini clientWidth içinde sarar. .glint-at-max veya
            // --fixed modda scrollbar çıktığında rect tabanlı overlay ~17px
            // geniş kalıyor ve wrap noktaları yeniden kayıyordu (klasik
            // Windows scrollbar'ında). clientWidth/Height scrollbar'ı zaten
            // dışlar → overlay her durumda native sarma genişliğiyle birebir.
            const left = (inpRect.left - grpRect.left) + borderL + padL;
            const top = (inpRect.top - grpRect.top) + borderT + padT;
            const width = Math.max(0, inp.clientWidth - padL - padR);
            const height = Math.max(0, inp.clientHeight - padT - padB);

            this.overlay.style.boxSizing = "border-box";
            this.overlay.style.left = left + "px";
            this.overlay.style.top = top + "px";
            this.overlay.style.width = width + "px";
            this.overlay.style.height = height + "px";
            // Padding artık overlay'de YOK; CSS'te de temizleniyor
            this.overlay.style.padding = "0";
            this.overlay.style.borderRadius = cs.borderRadius;

            // v1.5.1 — Overlay hizalaması native text-align'ı izler.
            // Stepper (center) ve olası sağa-yaslı alanlar: eskiden overlay
            // hep sola sabitti, `text-align:center` yalnız görünmez native
            // metni ortalıyordu → görünen glifler ile caret ayrışıyordu.
            if (!this.isMultiline) {
                const ta = cs.textAlign;
                this.overlay.style.justifyContent =
                    (ta === "center") ? "center" :
                    (ta === "right" || ta === "end") ? "flex-end" : "flex-start";
            }
        }

        // ── ERROR STATE ──

        setError(message) {
            this.group.classList.add("glint-error");
            this.pathTop?.classList.add("glint-border-path--error");
            this.pathBottom?.classList.add("glint-border-path--error");
            this.input?.setAttribute("aria-invalid", "true");
            if (this.errorEl && message) {
                if (!this.errorEl.id) this.errorEl.id = "glint-err-" + (++_uid);
                this.errorEl.textContent = message;
                // Hata mesajını aria-describedby ile input'a bağla (ekran okuyucu duysun)
                const ids = (this.input.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean);
                if (!ids.includes(this.errorEl.id)) { ids.push(this.errorEl.id); this.input.setAttribute("aria-describedby", ids.join(" ")); }
                this.errorEl.classList.remove("glint-error-msg--visible");
                void this.errorEl.offsetWidth;
                this.errorEl.classList.add("glint-error-msg--visible");
            }
            this.shake();
        }

        clearError() {
            this.group.classList.remove("glint-error");
            this.pathTop?.classList.remove("glint-border-path--error");
            this.pathBottom?.classList.remove("glint-border-path--error");
            this.input?.removeAttribute("aria-invalid");
            if (this.errorEl) {
                if (this.errorEl.id && this.input) {
                    const ids = (this.input.getAttribute("aria-describedby") || "").split(/\s+/).filter(id => id && id !== this.errorEl.id);
                    if (ids.length) this.input.setAttribute("aria-describedby", ids.join(" "));
                    else this.input.removeAttribute("aria-describedby");
                }
                this.errorEl.classList.remove("glint-error-msg--visible");
                const el = this.errorEl;
                const done = () => {
                    if (!this.group.classList.contains("glint-error")) el.textContent = "";
                };
                el.addEventListener("transitionend", done, { once: true });
                setTimeout(done, 400);
            }
        }

        shake() {
            if (prefersReduced) return;
            this.group.classList.remove("glint-error-shake");
            void this.group.offsetWidth;
            this.group.classList.add("glint-error-shake");
            this.group.addEventListener("animationend", () => {
                this.group.classList.remove("glint-error-shake");
            }, { once: true });
        }

        /** Yaşam döngüsü teardown — DOM'dan kalkınca çekirdek otomatik çağırır. */
        destroy() {
            this._scrollPolling = false;
            if (this._ac) { this._ac.abort(); this._ac = null; }
            if (this._resizeObserver) { this._resizeObserver.disconnect(); this._resizeObserver = null; }
            this.defaultBorder?.remove();
            this.overlay?.remove();
            this.svg?.remove();
            this.errorEl?.remove();
            this.counterEl?.remove();
            this.pwBtn?.remove();
            this.clearBtn?.remove();
            this.strengthEl?.remove();
            this.strengthText?.remove();
            if (this.input) {
                this.input.style.borderColor = "";
                // _addAction ikinci+ buton için input'a inline paddingRight
                // yazıyor — destroy'da geri alınmazsa yeniden mount'ta padding
                // birikiyordu (v1.5.1).
                this.input.style.paddingRight = "";
            }
            if (this.group) {
                this.group.classList.remove("glint-has-overlay");
                this.group.classList.remove("glint-has-strength");
                this.group._glintInstance = null;
                this.group._glintInit = false;
                Glint.unregister(this.group);
            }
        }

        static setError(inputEl, msg) { GlintInput._getInstance(inputEl)?.setError(msg); }
        static clearError(inputEl) { GlintInput._getInstance(inputEl)?.clearError(); }
        static _getInstance(inputEl) {
            if (!inputEl) return null;
            const g = inputEl.closest?.(".glint-input-group") ?? inputEl.parentElement;
            return g?._glintInstance ?? null;
        }
    }


    // ══════════════════════════════════════════════════════════════
    //  GlintCheckbox
    // ══════════════════════════════════════════════════════════════
    /**
     * Kullanım:
     *   <label class="glint-checkbox-label">
     *     <input type="checkbox" class="glint-checkbox" id="myCheck">
     *     <span>Metnim</span>
     *   </label>
     *
     *   VEYA ayrı label:
     *   <input type="checkbox" class="glint-checkbox" id="myCheck">
     *   <label for="myCheck">Metnim</label>
     */
    class GlintCheckbox {

        constructor(input) {
            if (input._glintCbInit) return;
            input._glintCbInit = true;
            input._glintCbInstance = this;
            this.input = input;
            this._build();
            this._bind();
            Glint.register(input, this);
        }

        _build() {
            const input = this.input;

            // Custom kutu
            this.box = document.createElement("span");
            this.box.className = "glint-cb-box";
            this.box.setAttribute("aria-hidden", "true");

            // SVG
            const ns = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(ns, "svg");
            svg.setAttribute("viewBox", "0 0 16 16");
            svg.setAttribute("fill", "none");
            svg.setAttribute("class", "glint-cb-svg");

            // Check path: (2,8.5) → (6,12) → (14,4)
            this.checkPath = document.createElementNS(ns, "path");
            this.checkPath.setAttribute("d", "M2.5 8.5 L6 12 L13.5 4");
            this.checkPath.setAttribute("stroke", "currentColor");
            this.checkPath.setAttribute("stroke-width", "2.2");
            this.checkPath.setAttribute("stroke-linecap", "round");
            this.checkPath.setAttribute("stroke-linejoin", "round");
            this.checkPath.setAttribute("class", "glint-cb-check-path");

            // Indeterminate çizgisi
            this.minusPath = document.createElementNS(ns, "line");
            this.minusPath.setAttribute("x1", "3.5");
            this.minusPath.setAttribute("y1", "8");
            this.minusPath.setAttribute("x2", "12.5");
            this.minusPath.setAttribute("y2", "8");
            this.minusPath.setAttribute("stroke", "currentColor");
            this.minusPath.setAttribute("stroke-width", "2.2");
            this.minusPath.setAttribute("stroke-linecap", "round");
            this.minusPath.setAttribute("class", "glint-cb-minus-path");

            svg.appendChild(this.checkPath);
            svg.appendChild(this.minusPath);
            this.box.appendChild(svg);

            // Native'den hemen sonra ekle
            input.insertAdjacentElement("afterend", this.box);

            // Label bul
            this.label = input.closest("label") ||
                (input.id && document.querySelector(`label[for="${CSS.escape(input.id)}"]`)) || null;
            if (this.label) this.label.classList.add("glint-checkbox-label");

            this._syncState(false);
        }

        _bind() {
            this._ac = new AbortController();
            this.input.addEventListener("change", () => this._syncState(true), { signal: this._ac.signal });

            // indeterminate setter intercept
            const proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "indeterminate");
            if (proto) {
                const self = this;
                Object.defineProperty(this.input, "indeterminate", {
                    get: () => proto.get.call(self.input),
                    set(v) { proto.set.call(self.input, v); self._syncState(true); },
                    configurable: true
                });
            }

            // checked setter intercept — programatik `el.checked = true/false`
            // değişiminde de görsel kutu güncellensin. Native `change` eventi
            // yalnızca KULLANICI etkileşiminde tetiklenir; JS ataması sessizdir.
            // (Örn. "tümünü seç" → alt kutuları kodla işaretleme.)
            const cd = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "checked");
            if (cd && cd.configurable !== false) {
                const self2 = this;
                Object.defineProperty(this.input, "checked", {
                    get() { return cd.get.call(self2.input); },
                    set(v) { cd.set.call(self2.input, v); self2._syncState(true); },
                    configurable: true
                });
            }

            // v1.5.1 — form.reset() change DISPATCH ETMEZ ve property
            // intercept'i de bypass eder (native iç durum) → görsel kutu
            // bayat kalıyordu. Select'teki desenle aynı: reset sonrası rAF'ta
            // yeniden senkron. (rAF: reset değeri geri yükledikten SONRA oku.)
            const form = this.input.form;
            if (form) {
                form.addEventListener("reset", () => {
                    requestAnimationFrame(() => this._syncState(false));
                }, { signal: this._ac.signal });
            }
        }

        _syncState(animate) {
            const { input, box } = this;
            const isChecked = input.checked && !input.indeterminate;
            const isIndet = input.indeterminate;

            box.classList.toggle("is-checked", isChecked);
            box.classList.toggle("is-indeterminate", isIndet);
            box.classList.toggle("is-unchecked", !isChecked && !isIndet);

            if (prefersReduced || !animate) {
                // Animasyonsuz: dashoffset'i anında set et
                this._setPathInstant(this.checkPath, isChecked);
                this._setPathInstant(this.minusPath, isIndet);
                return;
            }

            if (isIndet) {
                this._drawPath(this.minusPath, true);
                this._drawPath(this.checkPath, false);
            } else if (isChecked) {
                this._drawPath(this.checkPath, true);
                this._drawPath(this.minusPath, false);
            } else {
                this._drawPath(this.checkPath, false);
                this._drawPath(this.minusPath, false);
            }
        }

        _getLen(path) {
            try { return path.getTotalLength(); }
            catch { return path.tagName === "line" ? 9 : 18; }
        }

        /** Anlık set (animasyonsuz) */
        _setPathInstant(path, visible) {
            const len = this._getLen(path);
            path.style.transition = "none";
            path.style.strokeDasharray = len;
            path.style.strokeDashoffset = visible ? 0 : len;
        }

        /** Stroke-draw animasyonu */
        _drawPath(path, show) {
            const len = this._getLen(path);
            path.style.strokeDasharray = len;

            if (show) {
                // Eğer zaten çiziliyse reset et
                path.style.transition = "none";
                path.style.strokeDashoffset = len;
                void path.getBoundingClientRect();
                path.style.transition = "stroke-dashoffset 0.28s cubic-bezier(0.22, 1, 0.36, 1)";
                path.style.strokeDashoffset = 0;
            } else {
                path.style.transition = "stroke-dashoffset 0.18s ease-in";
                path.style.strokeDashoffset = len;
            }
        }

        /** Yaşam döngüsü teardown — DOM'dan kalkınca çekirdek otomatik çağırır. */
        destroy() {
            if (this._ac) { this._ac.abort(); this._ac = null; }
            // override edilen native property'leri geri al (instance shadow'unu sil)
            try { delete this.input.indeterminate; } catch {}
            try { delete this.input.checked; } catch {}
            this.box?.remove();
            this.label?.classList.remove("glint-checkbox-label");
            this.input._glintCbInit = false;
            this.input._glintCbInstance = null;
            Glint.unregister(this.input);
        }
    }


    // ══════════════════════════════════════════════════════════════
    //  PAYLAŞILAN ÇEKİRDEK — Bileşen kaydı & otomatik tarama
    // ══════════════════════════════════════════════════════════════
    //
    // Tüm Glint modülleri (input, checkbox, select, slider, upload...)
    // kendini `Glint.defineComponent` ile kaydeder. TEK bir
    // MutationObserver hepsini dinler; her modülün kendi observer'ını
    // kurmasına gerek kalmaz. Her bileşen bir kez `mount` edilir
    // (WeakSet guard). Yükleme sırası: önce glint-input.js (çekirdek),
    // sonra diğer modüller.

    const Glint = window.Glint = window.Glint || {};
    Glint._components = Glint._components || [];

    /**
     * Glint.defineComponent(name, def)
     *   def.selector : taranacak CSS seçici (zorunlu)
     *   def.match(el): (opsiyonel) ek koşul — false dönerse element atlanır
     *   def.mount(el): eşleşen her element için TAM BİR KEZ çağrılır
     * Kayıt anında mevcut DOM taranır; sonradan eklenen düğümler için
     * paylaşılan observer devreye girer.
     */
    Glint.defineComponent = function (name, def) {
        const comp = {
            name,
            selector: def.selector,
            match: def.match || null,
            mount: def.mount,
            seen: new WeakSet()
        };
        Glint._components.push(comp);
        if (document.readyState !== "loading") scanComponent(comp, document);
        return comp;
    };

    function mountOne(comp, el) {
        if (comp.seen.has(el)) return;
        if (comp.match && !comp.match(el)) return;
        comp.seen.add(el);
        try { comp.mount(el); }
        catch (e) { console.error("[Glint:" + comp.name + "]", e); }
    }

    function scanComponent(comp, root) {
        // Eklenen düğümün KENDİSİ de eşleşebilir (observer senaryosu)
        if (root.nodeType === 1 && root.matches && root.matches(comp.selector)) {
            mountOne(comp, root);
        }
        if (!root.querySelectorAll) return;
        let els;
        try { els = root.querySelectorAll(comp.selector); }
        catch { return; }
        els.forEach(el => mountOne(comp, el));
    }

    function scanAll(root) {
        const r = root || document;
        for (const comp of Glint._components) scanComponent(comp, r);
    }

    /**
     * Bir grubu/elementi "sahiplenildi" işaretle — base input ve diğer
     * otomatik başlatmalar bu grubu ATLAR. `.glint-input-group`'u tamamen
     * devralan modüller (picker gibi) için. Alanı yalnızca zenginleştiren
     * modüller (masked input, stepper) claim ETMEZ; GlintInput da çalışır.
     */
    Glint.claimGroup = function (el) { if (el) el._glintClaimed = true; };
    Glint.isGroupClaimed = function (el) { return !!(el && el._glintClaimed); };

    /** Dinamik içerik sonrası dışarıdan manuel yeniden tarama. */
    Glint.refresh = function (root) { scanAll(root); };


    // ══════════════════════════════════════════════════════════════
    //  v1.5 ÇEKİRDEK — sürüm · yapılandırma · yaşam döngüsü · durum
    // ══════════════════════════════════════════════════════════════

    /** Birleşik sürüm (input + toast ortak). */
    Glint.version = "1.5.1";

    /**
     * Merkezi yapılandırma. Glint.configure({...}) ile değiştirilir.
     *   locale         : "tr"   (Picker/etiketler)
     *   reducedMotion  : "auto" | true | false   (hareketi zorla/kapat)
     *   autoMount      : true   (false → observer/otomatik tarama kapalı; SSR/test)
     *   fieldErrors    : "smart"| "inline" | "toast"  (input↔toast köprü politikası)
     *                    smart = alan görünürse inline, değilse özet toast (+tıkla-kaydır)
     *                    inline = her zaman alan içi; toast = her zaman özet toast
     *   fieldErrorText : false  (köprüde inline hata YAZISIZ — sadece kenarlık/shake;
     *                    true → inline'da FluentValidation mesajını da göster.
     *                    Kullanıcı varsayılanı: yazısız. Toast tarafı her zaman yazılı.)
     */
    Glint.config = Glint.config || {
        locale: "tr",
        reducedMotion: "auto",
        autoMount: true,
        fieldErrors: "smart",
        fieldErrorText: false
    };
    Glint.configure = function (partial) {
        if (partial && typeof partial === "object") Object.assign(Glint.config, partial);
        return Glint.config;
    };

    // ── Canlı reduced-motion (TEK kaynak; her modül buradan okur) ──
    const _rmQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let _rmSystem = _rmQuery.matches;
    const _onRmChange = e => { _rmSystem = e.matches; };
    if (_rmQuery.addEventListener) _rmQuery.addEventListener("change", _onRmChange);
    else if (_rmQuery.addListener) _rmQuery.addListener(_onRmChange); // eski WebKit
    /** O anki gerçek "hareketi azalt" durumu (config override'ı dahil). */
    Glint.reducedMotion = function () {
        const c = Glint.config.reducedMotion;
        return c === "auto" ? _rmSystem : !!c;
    };

    // ── Örnek kaydı & yaşam döngüsü ────────────────────────────────
    // Bileşen sınıfları kendini Glint.register(el, instance) ile kaydeder.
    // Element (veya atası) DOM'dan kalkınca paylaşılan observer
    // instance.destroy()'u çağırır → listener/observer/DOM sızıntısı önlenir.
    // _instCount === 0 iken teardown taraması hiç çalışmaz (sıfır maliyet).
    const _instances = new WeakMap();
    let _instCount = 0;
    Glint.register = function (el, instance) {
        if (!el) return instance;
        if (!_instances.has(el)) { el.setAttribute("data-glint-mounted", ""); _instCount++; }
        _instances.set(el, instance);
        return instance;
    };
    Glint.getInstance = function (el) { return el ? _instances.get(el) : undefined; };
    Glint.unregister = function (el) {
        if (el && _instances.has(el)) {
            _instances.delete(el);
            el.removeAttribute("data-glint-mounted");
            _instCount--;
        }
        // v1.5.1 — mountOne'ın WeakSet guard'ı da temizlenir: element DOM'a
        // yeniden eklenirse (SPA reparent, MVC partial yenileme) tekrar mount
        // olabilsin. Eskiden seen hiç silinmediği için destroy edilen bir
        // bileşen aynı elementte bir daha ASLA canlanamıyordu.
        if (el) for (const comp of Glint._components) comp.seen.delete(el);
    };

    function teardownEl(el) {
        const inst = _instances.get(el);
        if (!inst) return;
        Glint.unregister(el);   // önce kayıttan düş (idempotent) → destroy içindeki tekrar no-op olur
        try { if (typeof inst.destroy === "function") inst.destroy(); }
        catch (e) { console.error("[Glint:destroy]", e); }
    }
    function teardownTree(root) {
        if (!root || root.nodeType !== 1 || _instCount === 0) return;
        if (root.hasAttribute("data-glint-mounted")) teardownEl(root);
        if (root.querySelectorAll) {
            const nodes = root.querySelectorAll("[data-glint-mounted]");
            for (const el of nodes) teardownEl(el);
        }
    }
    /** Bir alt-ağacı manuel yık (DOM'dan kaldırmadan önce; SPA/partial-view). */
    Glint.destroy = function (root) { teardownTree(root || document.body); };

    // ── Ortak durum makinesi: error/success/warning/loading ────────
    // Sunucu (FluentValidation) sonuçlarını TÜM bileşenlere tek tip API
    // ile basar. Input'un kendi zengin setError'ı (border-draw) ayrı kalır;
    // bu jenerik katman Select/OTP/Upload gibi alanlar içindir.
    let _uid = 0;
    const _STATE_LIST = ["error", "success", "warning", "loading"];
    function _stateGroup(el) {
        return (el.closest && (el.closest(".glint-input-group") || el.closest("[data-glint-field]"))) || el;
    }
    function _stateField(group) {
        return (group.querySelector && group.querySelector("input, textarea, select")) || group;
    }
    function _stateMsgEl(group, create) {
        let el = group.querySelector && group.querySelector(":scope > .glint-state-msg");
        if (!el && create) {
            el = document.createElement("div");
            el.className = "glint-state-msg";
            el.setAttribute("role", "status");
            el.id = "glint-msg-" + (++_uid);
            group.appendChild(el);
        }
        return el || null;
    }
    /**
     * Glint.setState(el, state, message?)
     *   state: "error" | "success" | "warning" | "loading" | null (temizle)
     * aria-invalid + aria-describedby bağını otomatik yönetir.
     */
    Glint.setState = function (el, state, message) {
        if (!el) return null;
        const group = _stateGroup(el);
        const field = _stateField(group);
        for (const s of _STATE_LIST) group.classList.toggle("glint-state-" + s, s === state);

        if (state === "error") field.setAttribute("aria-invalid", "true");
        else field.removeAttribute("aria-invalid");

        const msgEl = _stateMsgEl(group, !!message);
        if (message && msgEl) {
            msgEl.textContent = message;
            msgEl.setAttribute("aria-live", state === "error" ? "assertive" : "polite");
            const ids = (field.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean);
            if (!ids.includes(msgEl.id)) { ids.push(msgEl.id); field.setAttribute("aria-describedby", ids.join(" ")); }
            group.classList.add("glint-has-state-msg");
        } else {
            group.classList.remove("glint-has-state-msg");
            if (msgEl) {
                msgEl.textContent = "";
                const ids = (field.getAttribute("aria-describedby") || "").split(/\s+/).filter(id => id && id !== msgEl.id);
                if (ids.length) field.setAttribute("aria-describedby", ids.join(" "));
                else field.removeAttribute("aria-describedby");
            }
        }
        return group;
    };
    Glint.clearState = function (el) { return Glint.setState(el, null, null); };

    // ── Glint Picker entegrasyonu ──────────────────────────────────
    // date / time / datetime-local içeren gruplar Glint.Picker tarafından
    // yönetilir. Base input bu grupları ATLAR; picker, display input'u
    // enjekte edip `group._glintInit` guard'ı ile Glint.Input'u kendisi
    // başlatır (çift border/overlay önlenir).
    function isPickerGroup(group) {
        return !!group.querySelector(
            "input[type='date'], input[type='time'], input[type='datetime-local']"
        );
    }

    // ── Çekirdek bileşenler: Input grubu + Checkbox ────────────────
    Glint.defineComponent("input-group", {
        selector: ".glint-input-group",
        match: g => !g._glintInit && !isPickerGroup(g) && !Glint.isGroupClaimed(g),
        mount: g => { g._glintInit = true; new GlintInput(g); }
    });

    Glint.defineComponent("checkbox", {
        selector: "input[type='checkbox'].glint-checkbox",
        match: cb => !cb._glintCbInit,
        mount: cb => new GlintCheckbox(cb)
    });

    // ── Başlatma + tek paylaşılan observer (rAF-batch + teardown) ──
    // Eklenen düğümler bir frame boyunca biriktirilip TEK geçişte
    // taranır → büyük bir Razor view tek seferde gelince N×bileşen
    // querySelectorAll patlaması önlenir. Kaldırılan düğümler için
    // kayıtlı örneklerin destroy()'u çağrılır (yaşam döngüsü).
    let _pendingAdded = null;
    let _flushScheduled = false;
    const _raf = window.requestAnimationFrame
        ? window.requestAnimationFrame.bind(window)
        : (fn => setTimeout(fn, 16));
    function _flushAdded() {
        _flushScheduled = false;
        const roots = _pendingAdded;
        _pendingAdded = null;
        if (!roots) return;
        for (const node of roots) {
            if (node.isConnected !== false) scanAll(node);
        }
    }
    const observer = new MutationObserver(mutations => {
        for (const m of mutations) {
            if (m.addedNodes.length) {
                for (const node of m.addedNodes) {
                    if (node.nodeType !== 1) continue;
                    (_pendingAdded || (_pendingAdded = new Set())).add(node);
                }
            }
            if (_instCount && m.removedNodes.length) {
                for (const node of m.removedNodes) teardownTree(node);
            }
        }
        if (_pendingAdded && !_flushScheduled) {
            _flushScheduled = true;
            _raf(_flushAdded);
        }
    });

    function _autoStart() {
        if (Glint.config.autoMount === false) return;
        scanAll(document);
        observer.observe(document.documentElement, { childList: true, subtree: true });
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", _autoStart);
    } else {
        _autoStart();
    }

    Glint.Input = GlintInput;
    Glint.Checkbox = GlintCheckbox;

})();


/* ════════════════════════════════════════════════════════════════════════
 *  2) Controls — Radio · Switch · Segmented · Rating
 *     (kaynak modül: glint-controls.js)
 * ════════════════════════════════════════════════════════════════════════ */
/**
 * Glint Controls v1.0
 * Seçim kontrolleri: Radio, Switch, Segmented, Rating.
 * Sıfır bağımlılık, saf vanilla. Paylaşılan çekirdeğe (glint-input.js)
 * Glint.defineComponent ile kaydolur; kendi MutationObserver'ını KURMAZ.
 *
 * API:
 *   window.Glint.Radio       — input[type=radio].glint-radio
 *   window.Glint.Switch      — label.glint-switch (native checkbox sarar)
 *   window.Glint.Segmented   — .glint-segmented (gizli radio grubu)
 *   window.Glint.Rating      — .glint-rating (gizli input + SVG yıldız)
 *
 * Tasarım dili glint-input ile birebir:
 *   • imza easing cubic-bezier(0.22,1,0.36,1), hareket (0.77,0,0.175,1)
 *   • sadece transform/opacity, <300ms
 *   • :focus-visible halkası, tam ARIA + klavye
 *   • reduced-motion'da hareket kalkar (CSS hallediyor)
 *
 * Form binding (ASP.NET asp-for dostu):
 *   Radio/Switch native input'u DOM'da bırakır (gizlenir, değer korunur).
 *   Segmented gizli radio'lar (aynı name) tutar.
 *   Rating gizli <input> mirror'ı senkron tutar.
 */

(function () {
    "use strict";

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── YARDIMCILAR ───────────────────────────────────────────────

    /** SVG namespace'li element üretici. */
    function svgNS(tag, attrs) {
        const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
        for (const k in attrs) el.setAttribute(k, attrs[k]);
        return el;
    }

    /** İçi dolu yıldız SVG path'i (5 köşe). 24x24 viewBox. */
    const STAR_PATH =
        "M12 2.6l2.7 5.46 6.03.88-4.36 4.25 1.03 6L12 16.9 6.6 19.2l1.03-6L3.27 8.94l6.03-.88L12 2.6z";


    // ══════════════════════════════════════════════════════════════
    //  1) GlintRadio
    // ══════════════════════════════════════════════════════════════
    /**
     * Kullanım:
     *   <label class="glint-radio-label">
     *     <input type="radio" class="glint-radio" name="plan" value="a">
     *     <span>Seçenek A</span>
     *   </label>
     *
     * Native radio ok-tuşu navigasyonunu zaten sağlar. Görsel kutu +
     * iç nokta enjekte edilir; checked durumu senkronlanır. Aynı name'li
     * tüm radio'lar grup olduğundan, bir tanesi seçilince diğerlerinin
     * görseli de güncellenir (input eventi tüm gruba yayılmaz → manuel).
     */
    class GlintRadio {

        constructor(input) {
            if (input._glintRadioInit) return;
            input._glintRadioInit = true;
            input._glintRadioInstance = this;
            this.input = input;
            this._build();
            this._bind();
            window.Glint.register(input, this);
        }

        _build() {
            const input = this.input;

            this.box = document.createElement("span");
            this.box.className = "glint-radio-box";
            this.box.setAttribute("aria-hidden", "true");

            this.dot = document.createElement("span");
            this.dot.className = "glint-radio-dot";
            this.box.appendChild(this.dot);

            // Native'in hemen arkasına ekle
            input.insertAdjacentElement("afterend", this.box);

            // Sarmalayan label varsa class ekle
            this.label = input.closest("label") ||
                (input.id && document.querySelector(`label[for="${CSS.escape(input.id)}"]`)) || null;
            if (this.label) this.label.classList.add("glint-radio-label");

            this._sync();
        }

        _bind() {
            this._ac = new AbortController();
            // Kullanıcı bu radio'yu seçince → tüm grubu senkronla
            this.input.addEventListener("change", () => this._syncGroup(), { signal: this._ac.signal });

            // Programatik `el.checked = ...` değişimini de yakala
            const cd = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "checked");
            if (cd && cd.configurable !== false) {
                const self = this;
                Object.defineProperty(this.input, "checked", {
                    get() { return cd.get.call(self.input); },
                    set(v) { cd.set.call(self.input, v); self._syncGroup(); },
                    configurable: true
                });
            }

            // v1.5.1 — form.reset() sonrası grup görselini senkronla
            // (change eventi ve property intercept reset'te devreye girmez).
            const form = this.input.form;
            if (form) {
                form.addEventListener("reset", () => {
                    requestAnimationFrame(() => this._syncGroup());
                }, { signal: this._ac.signal });
            }
        }

        /** Sadece bu kutunun görselini günceller. */
        _sync() {
            this.box.classList.toggle("is-checked", this.input.checked);
        }

        /**
         * Bu radio'nun adı (name) ile eşleşen tüm grup üyelerini senkronla.
         * Native, aynı name'de yalnızca birini checked tutar ama diğer
         * GlintRadio örneklerine event gitmez → manuel tarama gerekli.
         */
        _syncGroup() {
            this._sync();
            const name = this.input.name;
            if (!name) return;
            const root = this.input.form || document;
            const peers = root.querySelectorAll(
                `input[type="radio"].glint-radio[name="${CSS.escape(name)}"]`
            );
            peers.forEach(p => {
                const inst = p._glintRadioInstance;
                if (inst && inst !== this) inst._sync();
            });
        }

        /** Yaşam döngüsü teardown. */
        destroy() {
            if (this._ac) { this._ac.abort(); this._ac = null; }
            try { delete this.input.checked; } catch {}
            this.box?.remove();
            this.label?.classList.remove("glint-radio-label");
            this.input._glintRadioInit = false;
            this.input._glintRadioInstance = null;
            window.Glint.unregister(this.input);
        }
    }


    // ══════════════════════════════════════════════════════════════
    //  2) GlintSwitch
    // ══════════════════════════════════════════════════════════════
    /**
     * Kullanım:
     *   <label class="glint-switch">
     *     <input type="checkbox" class="glint-switch-input" name="bildirim">
     *     <span class="glint-switch-track"><span class="glint-switch-thumb"></span></span>
     *     <span class="glint-switch-text">Bildirimler</span>   (opsiyonel)
     *   </label>
     *
     * Tüm hareket CSS tarafından (checked seçicisi) yapılır; JS yalnızca
     * eksik track/thumb yapısını tamamlar ve ARIA'yı korur. Native
     * checkbox form binding'i sağlar.
     */
    class GlintSwitch {

        constructor(label) {
            if (label._glintSwitchInit) return;
            label._glintSwitchInit = true;
            label._glintSwitchInstance = this;
            this.label = label;
            this.input = label.querySelector(".glint-switch-input") ||
                label.querySelector('input[type="checkbox"]');
            if (!this.input) return;
            this.input.classList.add("glint-switch-input");
            this._build();
            window.Glint.register(label, this);
        }

        _build() {
            // Track yoksa oluştur; thumb'ı içine al.
            let track = this.label.querySelector(".glint-switch-track");
            if (!track) {
                track = document.createElement("span");
                track.className = "glint-switch-track";
                // Native input'tan hemen sonra yerleştir (CSS ~ kardeş seçicisi)
                this.input.insertAdjacentElement("afterend", track);
                this._ownTrack = true;
            }
            if (!track.querySelector(".glint-switch-thumb")) {
                const thumb = document.createElement("span");
                thumb.className = "glint-switch-thumb";
                track.appendChild(thumb);
            }
            track.setAttribute("aria-hidden", "true");
            this.track = track;
            // ── Opsiyonel on/off ikon slotu ──────────────────────────────
            // data-icons attribute'u VEYA elle eklenmiş .glint-switch-on/off
            // span'leri varsa ikon katmanını kur. İkonlar salt görsel.
            this._buildIcons(track);
            // Native checkbox zaten role=switch'e yakın; switch semantiği ver.
            // Görsel kutu aria-hidden olduğundan native'e role verilir.
            if (!this.input.hasAttribute("role")) this.input.setAttribute("role", "switch");
            this._syncAria();
            this._ac = new AbortController();
            this.input.addEventListener("change", () => this._syncAria(), { signal: this._ac.signal });

            // v1.5.1 — Programatik `el.checked = ...` değişiminde aria-checked
            // güncellensin (checkbox/radio'daki intercept'in switch karşılığı;
            // görsel CSS :checked'ten geldiği için hareket ediyor ama ARIA
            // yalan söylüyordu).
            const cd = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "checked");
            if (cd && cd.configurable !== false) {
                const self = this;
                Object.defineProperty(this.input, "checked", {
                    get() { return cd.get.call(self.input); },
                    set(v) { cd.set.call(self.input, v); self._syncAria(); },
                    configurable: true
                });
            }

            // v1.5.1 — form.reset() sonrası aria senkronu (change gelmez).
            const form = this.input.form;
            if (form) {
                form.addEventListener("reset", () => {
                    requestAnimationFrame(() => this._syncAria());
                }, { signal: this._ac.signal });
            }
        }

        _syncAria() {
            this.input.setAttribute("aria-checked", this.input.checked ? "true" : "false");
        }

        /**
         * Opsiyonel on/off ikon slotunu kurar. Yalnızca şu durumda etkinleşir:
         *   - label[data-icons] varsa, VEYA
         *   - track içinde elle eklenmiş .glint-switch-on / .glint-switch-off varsa.
         * Eksik span'ler enjekte edilir (varsayılan SVG); track'e
         * .glint-switch--icons sınıfı eklenir. İkonlar aria-hidden, salt görsel.
         */
        _buildIcons(track) {
            const existingOn = track.querySelector(".glint-switch-on");
            const existingOff = track.querySelector(".glint-switch-off");
            const wantIcons = this.label.hasAttribute("data-icons") || existingOn || existingOff;
            if (!wantIcons) return;

            // Varsayılan ikon içerikleri (özel: data-icon-on / data-icon-off düz metin).
            const DEF_ON = '<svg viewBox="0 0 16 16" width="100%" height="100%" aria-hidden="true" focusable="false"><path d="M13 4 6.5 11 3 7.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            const DEF_OFF = '<svg viewBox="0 0 16 16" width="100%" height="100%" aria-hidden="true" focusable="false"><path d="M5 5l6 6M11 5l-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

            const thumb = track.querySelector(".glint-switch-thumb");
            const ensure = (sel, cls, customAttr, def) => {
                let span = track.querySelector(sel);
                if (!span) {
                    span = document.createElement("span");
                    span.className = cls;
                    // Özel metin verildiyse textContent (güvenli); değilse varsayılan SVG.
                    const custom = this.label.getAttribute(customAttr);
                    if (custom != null) span.textContent = custom;
                    else span.innerHTML = def;
                    span.setAttribute("aria-hidden", "true");
                    // Thumb'tan ÖNCE ekle ki thumb DOM'da sonra gelsin ve üstte boyansın.
                    track.insertBefore(span, thumb);
                    this._ownIcons = true;
                } else {
                    span.setAttribute("aria-hidden", "true");
                }
                return span;
            };

            this._iconOn = ensure(".glint-switch-on", "glint-switch-on", "data-icon-on", DEF_ON);
            this._iconOff = ensure(".glint-switch-off", "glint-switch-off", "data-icon-off", DEF_OFF);
            track.classList.add("glint-switch--icons");

            // v1.5.1 — METİN varyantı: düz metin etiketler 16px ikon için
            // tasarlanmış sabit kareye basılınca pill'den taşıyor ve thumb'ın
            // altına giriyordu ("KAPALI" ~39px > 11px içerik kutusu). Metin
            // tespit edilirse track auto-width olur; thumb yolculuğu
            // translateX(w−h) sözleşmesi ölçülen genişlik değişkene yazılarak
            // korunur (animasyon koduna sıfır dokunuş).
            const isText = (el) => !!el && !el.querySelector("svg") && el.textContent.trim().length > 0;
            if (isText(this._iconOn) || isText(this._iconOff)) {
                track.classList.add("glint-switch--text");
                requestAnimationFrame(() => {
                    if (track.isConnected) {
                        track.style.setProperty("--glint-switch-w", track.offsetWidth + "px");
                    }
                });
            }
        }

        /** Yaşam döngüsü teardown. */
        destroy() {
            if (this._ac) { this._ac.abort(); this._ac = null; }
            // Enjekte edilen ikon span'lerini temizle (track sahibi değilsek bile).
            // _ownTrack ise track komple silineceğinden ayrı ikon temizliği gereksiz.
            if (this._ownIcons && !this._ownTrack) {
                this._iconOn?.remove();
                this._iconOff?.remove();
                this.track?.classList.remove("glint-switch--icons", "glint-switch--text");
                this.track?.style.removeProperty("--glint-switch-w");
            }
            this._iconOn = this._iconOff = null;
            if (this._ownTrack) this.track?.remove();
            this.input?.removeAttribute("aria-checked");
            // v1.5.1 — checked property intercept'inin instance shadow'unu sil
            try { delete this.input.checked; } catch { }
            this.label._glintSwitchInit = false;
            this.label._glintSwitchInstance = null;
            window.Glint.unregister(this.label);
        }
    }


    // ══════════════════════════════════════════════════════════════
    //  3) GlintSegmented
    // ══════════════════════════════════════════════════════════════
    /**
     * Kullanım:
     *   <div class="glint-segmented" role="radiogroup" aria-label="Görünüm">
     *     <label class="glint-seg-option">
     *       <input type="radio" class="glint-seg-input" name="view" value="list" checked>
     *       <span class="glint-seg-label">Liste</span>
     *     </label>
     *     ...
     *   </div>
     *
     * Gizli radio'lar form binding (aynı name). Kayan thumb aktif segment
     * altında translateX + width ile konumlanır; genişlikler ölçülür.
     * role=radiogroup, ok tuşları ile gezinme, Enter/Space seçer.
     */
    class GlintSegmented {

        constructor(root) {
            if (root._glintSegInit) return;
            root._glintSegInit = true;
            root._glintSegInstance = this;
            this.root = root;
            this.options = Array.from(root.querySelectorAll(".glint-seg-option"));
            this.inputs = this.options
                .map(o => o.querySelector('input[type="radio"]'))
                .filter(Boolean);
            if (this.inputs.length < 2) return;

            this._build();
            this._bind();
            window.Glint.register(root, this);
            // İlk konumlandırma — layout hazır olunca
            requestAnimationFrame(() => {
                this._moveThumb(false);
                this.root.classList.add("glint-seg-ready");
            });
        }

        _build() {
            if (!this.root.hasAttribute("role")) this.root.setAttribute("role", "radiogroup");

            // Kayan thumb
            this.thumb = this.root.querySelector(".glint-seg-thumb");
            if (!this.thumb) {
                this.thumb = document.createElement("span");
                this.thumb.className = "glint-seg-thumb";
                this.thumb.setAttribute("aria-hidden", "true");
                this.root.appendChild(this.thumb);
                this._ownThumb = true;
            }

            // Grup tamamen disabled mı? (her input disabled ise)
            this.disabled = this.inputs.every(i => i.disabled);
            this.root.classList.toggle("glint-seg-disabled", this.disabled);

            // ARIA roller — gizli radio'lar zaten radio; tab yönetimi:
            // sadece seçili (veya ilk) radio tab-stop, diğerleri ok tuşuyla.
            this._updateTabIndex();
        }

        _bind() {
            this._ac = new AbortController();
            const sig = { signal: this._ac.signal };
            this.inputs.forEach((input) => {
                input.addEventListener("change", () => {
                    if (input.checked) this._onSelect(input);
                }, sig);
                // Klavye: ok tuşları ile gezinme
                input.addEventListener("keydown", (e) => this._onKeydown(e, input), sig);
            });

            // Yeniden boyutlanınca thumb'ı yeniden ölç
            this._ro = new ResizeObserver(() => this._moveThumb(false));
            this._ro.observe(this.root);
        }

        _checkedIndex() {
            const i = this.inputs.findIndex(inp => inp.checked);
            return i >= 0 ? i : 0;
        }

        _updateTabIndex() {
            const ci = this._checkedIndex();
            this.inputs.forEach((inp, i) => {
                inp.tabIndex = (i === ci) ? 0 : -1;
            });
        }

        _onSelect(input) {
            this._updateTabIndex();
            this._moveThumb(!prefersReduced);
        }

        _onKeydown(e, input) {
            if (this.disabled) return;
            const idx = this.inputs.indexOf(input);
            let next = -1;
            switch (e.key) {
                case "ArrowRight":
                case "ArrowDown":
                    next = (idx + 1) % this.inputs.length;
                    break;
                case "ArrowLeft":
                case "ArrowUp":
                    next = (idx - 1 + this.inputs.length) % this.inputs.length;
                    break;
                case "Home":
                    next = 0;
                    break;
                case "End":
                    next = this.inputs.length - 1;
                    break;
                default:
                    return; // Enter/Space → native radio davranışı
            }
            e.preventDefault();
            // Devre dışı segmentleri atla
            let guard = 0;
            while (this.inputs[next] && this.inputs[next].disabled && guard < this.inputs.length) {
                next = (next + (e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 1) + this.inputs.length) % this.inputs.length;
                guard++;
            }
            const target = this.inputs[next];
            if (!target || target.disabled) return;
            target.checked = true;
            target.focus();
            // change'i tetikle (programatik atama sessizdir)
            target.dispatchEvent(new Event("change", { bubbles: true }));
        }

        /** Aktif segmentin geometrisine göre thumb'ı konumlandır. */
        _moveThumb(animate) {
            if (!this.thumb) return;
            const idx = this._checkedIndex();
            const opt = this.options[idx];
            if (!opt) return;
            const rootRect = this.root.getBoundingClientRect();
            const optRect = opt.getBoundingClientRect();
            const x = optRect.left - rootRect.left;
            const w = optRect.width;

            if (!animate) {
                const prev = this.thumb.style.transition;
                this.thumb.style.transition = "none";
                this.thumb.style.width = w + "px";
                this.thumb.style.transform = `translateX(${x}px)`;
                // Reflow → sonra geçişi geri aç
                void this.thumb.getBoundingClientRect();
                this.thumb.style.transition = prev || "";
            } else {
                this.thumb.style.width = w + "px";
                this.thumb.style.transform = `translateX(${x}px)`;
            }
        }

        /** Programatik: index ya da value ile seç. */
        select(valueOrIndex) {
            let target = null;
            if (typeof valueOrIndex === "number") {
                target = this.inputs[valueOrIndex];
            } else {
                target = this.inputs.find(i => i.value === valueOrIndex);
            }
            if (target && !target.disabled) {
                target.checked = true;
                target.dispatchEvent(new Event("change", { bubbles: true }));
            }
        }

        /** Yaşam döngüsü teardown. */
        destroy() {
            if (this._ac) { this._ac.abort(); this._ac = null; }
            if (this._ro) { this._ro.disconnect(); this._ro = null; }
            if (this._ownThumb) this.thumb?.remove();
            this.root.classList.remove("glint-seg-ready", "glint-seg-disabled");
            this.inputs.forEach(i => { i.tabIndex = 0; });
            this.root._glintSegInit = false;
            this.root._glintSegInstance = null;
            window.Glint.unregister(this.root);
        }
    }


    // ══════════════════════════════════════════════════════════════
    //  4) GlintRating
    // ══════════════════════════════════════════════════════════════
    /**
     * Kullanım:
     *   <div class="glint-rating" data-value="3" data-max="5"
     *        data-name="puan" aria-label="Puanınız"></div>
     *
     * JS: gizli <input> (form değeri) + SVG yıldızlar enjekte eder.
     * Hover önizleme, tıkla seç, ok tuşları, Home/End. data-name verilirse
     * gizli input'a name atanır (asp-for için). data-readonly / disabled
     * salt-okunur yapar.
     */
    class GlintRating {

        constructor(root) {
            if (root._glintRatingInit) return;
            root._glintRatingInit = true;
            root._glintRatingInstance = this;
            this.root = root;

            this.max = Math.max(1, parseInt(root.dataset.max, 10) || 5);
            this.allowHalf = root.dataset.allowHalf === "true";
            this.allowClear = root.dataset.allowClear === "true";
            this.step = this.allowHalf ? 0.5 : 1;
            this.value = Math.min(this.max, Math.max(0, parseFloat(root.dataset.value) || 0));
            this.iconPath = this._iconPath(root.dataset.icon);
            this.name = root.dataset.name || "";
            this.disabled = root.hasAttribute("disabled") ||
                root.dataset.disabled === "true";
            this.readonly = root.dataset.readonly === "true";
            this.hoverValue = 0;

            this._build();
            if (!this.disabled && !this.readonly) this._bind();
            this._render();
            window.Glint.register(root, this);
        }

        _build() {
            this.root.classList.toggle("glint-rating-disabled", this.disabled);

            // Gizli form input'u (mirror)
            this.hidden = document.createElement("input");
            this.hidden.type = "hidden";
            if (this.name) this.hidden.name = this.name;
            this.hidden.value = String(this.value);
            this.root.appendChild(this.hidden);

            // ARIA — slider semantiği
            this.root.setAttribute("role", "slider");
            this.root.setAttribute("aria-valuemin", "0");
            this.root.setAttribute("aria-valuemax", String(this.max));
            this.root.setAttribute("aria-valuenow", String(this.value));
            if (!this.root.hasAttribute("aria-label")) {
                this.root.setAttribute("aria-label", "Puanlama");
            }
            if (!this.disabled && !this.readonly) {
                this.root.tabIndex = 0;
            }

            // Yıldızlar — iki katman (bg=boş + fgwrap=dolu, soldan kırpılır → yarım yıldız)
            this.stars = [];
            const svgFor = (cls) => {
                const svg = svgNS("svg", { class: cls, viewBox: "0 0 24 24", fill: "currentColor" });
                svg.appendChild(svgNS("path", { d: this.iconPath }));
                return svg;
            };
            for (let i = 1; i <= this.max; i++) {
                const star = document.createElement("span");
                star.className = "glint-rating-star";
                star.dataset.starValue = String(i);
                star.setAttribute("aria-hidden", "true");
                star.appendChild(svgFor("glint-rating-star__bg"));
                const fgWrap = document.createElement("span");
                fgWrap.className = "glint-rating-star__fgwrap";
                fgWrap.appendChild(svgFor("glint-rating-star__fg"));
                star.appendChild(fgWrap);
                this.root.appendChild(star);
                this.stars.push(star);
            }
        }

        _iconPath(name) {
            const ICONS = {
                heart: "M12 21s-7.5-4.6-10-9.3C.6 8.4 2.3 5 5.5 5c1.9 0 3.3 1 4.5 2.6C11.2 6 12.6 5 14.5 5 17.7 5 19.4 8.4 22 11.7 19.5 16.4 12 21 12 21z",
                circle: "M12 2a10 10 0 100 20 10 10 0 000-20z"
            };
            return ICONS[name] || STAR_PATH;
        }

        _bind() {
            this._ac = new AbortController();
            const sig = { signal: this._ac.signal };
            this.stars.forEach((star) => {
                const i = parseInt(star.dataset.starValue, 10);
                const valAt = (e) => this.allowHalf ? this._halfValue(star, i, e) : i;
                star.addEventListener("mousemove", (e) => this._preview(valAt(e)), sig);
                star.addEventListener("click", (e) => this._clickValue(valAt(e)), sig);
            });
            this.root.addEventListener("mouseleave", () => this._preview(0), sig);
            this.root.addEventListener("keydown", (e) => this._onKeydown(e), sig);
        }

        _halfValue(star, i, e) {
            const rect = star.getBoundingClientRect();
            return (e.clientX - rect.left) < rect.width / 2 ? i - 0.5 : i;
        }

        _clickValue(v) {
            if (this.allowClear && this.value === v) v = 0;   // aynı değere tekrar tık → sıfırla
            this._set(v);
        }

        _onKeydown(e) {
            let v = this.value;
            switch (e.key) {
                case "ArrowRight":
                case "ArrowUp":
                    v = Math.min(this.max, this.value + this.step);
                    break;
                case "ArrowLeft":
                case "ArrowDown":
                    v = Math.max(0, this.value - this.step);
                    break;
                case "Home":
                    v = 0;
                    break;
                case "End":
                    v = this.max;
                    break;
                default:
                    return;
            }
            e.preventDefault();
            this._set(v);
        }

        /** Hover önizleme — geçici dolgu (value değişmez). */
        _preview(v) {
            this.hoverValue = v;
            this.root.classList.toggle("is-hovering", v > 0);
            this._render();
        }

        /** Kalıcı seçim. */
        _set(v) {
            this.value = v;
            this.hidden.value = String(v);
            this.root.dataset.value = String(v);
            this.root.setAttribute("aria-valuenow", String(v));
            this.root.setAttribute("aria-valuetext", v + " / " + this.max);
            // Form/dinleyiciler için change yay
            this.hidden.dispatchEvent(new Event("change", { bubbles: true }));
            this._render();
        }

        _render() {
            const active = this.hoverValue > 0 ? this.hoverValue : this.value;
            this.stars.forEach((star, i) => {
                const idx = i + 1;
                let fill = 0;
                if (active >= idx) fill = 1;
                else if (active >= idx - 0.5) fill = 0.5;
                star.style.setProperty("--glint-rating-fill-pct", fill);
                star.classList.toggle("is-filled", fill >= 1);
                star.classList.toggle("is-half", fill === 0.5);
            });
        }

        /** Programatik değer set. */
        setValue(v) {
            let nv = parseFloat(v) || 0;
            if (!this.allowHalf) nv = Math.round(nv);
            nv = Math.min(this.max, Math.max(0, nv));
            this._set(nv);
        }

        getValue() { return this.value; }

        /** Yaşam döngüsü teardown. */
        destroy() {
            if (this._ac) { this._ac.abort(); this._ac = null; }
            this.hidden?.remove();
            this.stars?.forEach(s => s.remove());
            this.root.classList.remove("glint-rating-disabled", "is-hovering");
            this.root.removeAttribute("role");
            ["aria-valuemin", "aria-valuemax", "aria-valuenow"].forEach(a => this.root.removeAttribute(a));
            this.root.removeAttribute("tabindex");
            this.root._glintRatingInit = false;
            this.root._glintRatingInstance = null;
            window.Glint.unregister(this.root);
        }
    }


    // ══════════════════════════════════════════════════════════════
    //  ÇEKİRDEĞE KAYIT — Glint.defineComponent
    // ══════════════════════════════════════════════════════════════
    // Modül kendi MutationObserver'ını kurmaz; paylaşılan çekirdek tarar.
    // Çekirdek henüz yüklenmemişse DOMContentLoaded'da tekrar dene.

    function register() {
        const Glint = window.Glint;

        Glint.defineComponent("radio", {
            selector: 'input[type="radio"].glint-radio',
            match: el => !el._glintRadioInit,
            mount: el => new GlintRadio(el)
        });

        Glint.defineComponent("switch", {
            selector: "label.glint-switch",
            match: el => !el._glintSwitchInit,
            mount: el => new GlintSwitch(el)
        });

        Glint.defineComponent("segmented", {
            selector: ".glint-segmented",
            match: el => !el._glintSegInit,
            mount: el => new GlintSegmented(el)
        });

        Glint.defineComponent("rating", {
            selector: ".glint-rating",
            match: el => !el._glintRatingInit,
            mount: el => new GlintRating(el)
        });

        // Programatik API
        Glint.Radio = GlintRadio;
        Glint.Switch = GlintSwitch;
        Glint.Segmented = GlintSegmented;
        Glint.Rating = GlintRating;
    }

    if (window.Glint && window.Glint.defineComponent) {
        register();
    } else {
        // Çekirdek (glint-input.js) henüz yüklenmediyse: güvenli guard.
        // En geç DOMContentLoaded'da çekirdek hazır olur.
        document.addEventListener("DOMContentLoaded", function () {
            if (window.Glint && window.Glint.defineComponent) {
                register();
                // Kayıt sırasında DOM zaten hazırsa defineComponent kendi
                // tarar; yine de garanti için manuel bir refresh tetikle.
                if (window.Glint.refresh) window.Glint.refresh(document);
            }
        });
    }

})();


/* ════════════════════════════════════════════════════════════════════════
 *  3) Select & Tags
 *     (kaynak modül: glint-select.js)
 * ════════════════════════════════════════════════════════════════════════ */
/**
 * Glint Select & Tags Library v1.0
 * ─────────────────────────────────────────────────────────────
 * glint-input çekirdeğinin (Glint.defineComponent) uzantısı.
 * Sıfır bağımlılık, saf vanilla.
 *
 * İçerik:
 *   1) GlintSelect — native <select class="glint-select"> sarmalar.
 *      Tekli + çoklu (native `multiple`), aranabilir, tam klavye.
 *      Native select DOM'da kalır (gizli) → asp-for / form binding
 *      bozulmaz. Seçenekler native <option>'lardan okunur, seçim
 *      native select.value/selectedOptions ile çift yönlü senkron.
 *
 *   2) GlintTags — <div class="glint-tags"> içinde chip input'u.
 *      Enter / virgül ile chip ekler, Backspace son chip'i siler.
 *      Form için gizli input(lar) ile değer senkron. Tekrar engeli,
 *      data-max ile üst sınır.
 *
 * Kayıt: window.Glint.defineComponent ile otomatik başlar.
 * API:   window.Glint.Select, window.Glint.Tags
 *
 * Animasyon imzası (kontrat):
 *   easing  cubic-bezier(0.22, 1, 0.36, 1)
 *   popover trigger'dan scale-in (scale .95 + opacity 0 → 1), 150-250ms
 *   chip    giriş/çıkış scale(.95) + opacity
 *   :active scale(0.97) (CSS)
 *   prefers-reduced-motion → hareket kalkar, opacity/renk kalır.
 */

(function () {
    "use strict";

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let _uid = 0;
    function uid(prefix) { return (prefix || "glint") + "-" + (++_uid) + "-" + Date.now().toString(36); }

    /** "Türkçe duyarlı" küçültme — filtre eşleştirmesi için (İ/ı/Ş/ç...) */
    function normalize(s) {
        return (s || "")
            .toLocaleLowerCase("tr")
            .replace(/ı/g, "i")
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "");
    }

    // SVG ikon yardımcıları (string → innerHTML)
    const ICON_ARROW =
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
              stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`;
    const ICON_CHECK =
        `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2"
              stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 8.5 L6 12 L13.5 4"/></svg>`;
    const ICON_SEARCH =
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/>
              <path d="M21 21l-4.3-4.3"/></svg>`;
    const ICON_X =
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"
              stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`;


    // ══════════════════════════════════════════════════════════════
    //  GlintSelect
    // ══════════════════════════════════════════════════════════════
    /**
     * Kullanım:
     *   <div class="glint-select-group">
     *     <select class="glint-select" id="city">
     *       <option value="">Seçiniz</option>
     *       <option value="34">İstanbul</option>
     *     </select>
     *     <label class="glint-label" for="city">Şehir</label>
     *   </div>
     *
     *   Çoklu:  <select class="glint-select" multiple>...</select>
     *   Aramayı kapat: data-search="false"
     */
    class GlintSelect {

        constructor(select) {
            if (!select || select._glintSelectInit) return;
            select._glintSelectInit = true;
            this.select = select;
            this.group = select.closest(".glint-select-group") || select.parentElement;
            if (!this.group) return;
            this.group._glintSelectInstance = this;
            window.Glint.register(this.group, this);

            this.multiple = select.multiple;
            this.disabled = select.disabled;
            // data-search="false" → arama input'unu gösterme
            this.searchable = this.group.getAttribute("data-search") !== "false";
            this.creatable = this.group.getAttribute("data-creatable") === "true";
            const ms = parseInt(this.group.getAttribute("data-max-selected"), 10);
            this.maxSelected = (!isNaN(ms) && ms > 0) ? ms : null;
            this.placeholder = this.group.getAttribute("data-placeholder") ||
                this._detectPlaceholder() || "Seçiniz";

            this.isOpen = false;
            this.activeIndex = -1;      // klavyeyle vurgulanan görünür seçenek
            this._typeBuffer = "";
            this._typeTimer = null;

            this._readOptions();
            // ── Sanal liste (windowing) kararı ─────────────────────────
            // Eşik: data-virtual="true" VEYA gerçek (placeholder-dışı) option > 150.
            // GÜVENLİK KAPISI: optgroup veya creatable varsa KAPALI — bu yapılar
            // spacer-tabanlı pencerelemeyle uyumsuz; klasik yol korunur (regresyon yok).
            {
                const realCount = this.options.filter(o => !o.isPlaceholder).length;
                const hasGroups = this.options.some(o => o.group);
                const forced = this.group.getAttribute("data-virtual") === "true";
                const auto = realCount > 150;
                this._virtual = (forced || auto) && !hasGroups && !this.creatable;
                // Satır yüksekliği: önce attr, açılışta ilk gerçek satırdan ölçülür.
                const rh = parseInt(this.group.getAttribute("data-virtual-row-height"), 10);
                this._vRowH = (!isNaN(rh) && rh > 0) ? rh : 40;
                const ov = parseInt(this.group.getAttribute("data-virtual-overscan"), 10);
                this._vOverscan = (!isNaN(ov) && ov >= 0) ? ov : 8;
                this._vModels = [];      // _filter sonucu görünür-model dizisi (kaynak-of-truth)
                this._vStart = 0;        // render edilen pencerenin ilk model indeksi (_vModels içinde)
                this._vEnd = 0;          // render edilen pencerenin son+1 indeksi
                this._vRaf = false;      // scroll rAF-throttle bayrağı
                this._vMeasured = false; // satır yüksekliği bir kez ölçüldü mü
            }
            this._build();
            this._bind();
            this._renderTrigger();
            this._syncOptionStates();
        }

        /** İlk boş-value option'ı placeholder olarak yakala */
        _detectPlaceholder() {
            const first = this.select.options[0];
            if (first && first.value === "" && !this.multiple) return first.textContent.trim();
            return null;
        }

        /** Native <option>'ları model'e oku */
        _readOptions() {
            this.options = [];
            const flat = Array.from(this.select.options);
            const addOpt = (opt, groupLabel) => {
                const i = flat.indexOf(opt);
                // Tekli modda boş-value ilk option placeholder; listede gösterme
                const isPlaceholder = !this.multiple && opt.value === "" && i === 0;
                const label = opt.textContent.trim();
                this.options.push({
                    value: opt.value,
                    label,
                    _norm: normalize(label),   // önceden hesaplı arama anahtarı (perf + tutarlı)
                    disabled: opt.disabled,
                    nativeIndex: i,
                    group: groupLabel || null,
                    isPlaceholder,
                    el: null   // listbox DOM düğümü
                });
            };
            // <optgroup> yapısını koru → liste başlıkları render edilir (MVC kategorili select)
            Array.from(this.select.children).forEach(node => {
                if (node.tagName === "OPTGROUP") {
                    const gl = node.getAttribute("label") || "";
                    Array.from(node.children).forEach(opt => {
                        if (opt.tagName === "OPTION") addOpt(opt, gl);
                    });
                } else if (node.tagName === "OPTION") {
                    addOpt(node, null);
                }
            });
        }

        // ── DOM ─────────────────────────────────────────────────────

        _build() {
            const g = this.group;
            g.classList.add(this.multiple ? "glint-select-group--multiple" : "glint-select-group--single");
            if (this.disabled) g.classList.add("is-disabled");

            // Trigger (button rolünde combobox)
            this.trigger = document.createElement("div");
            this.trigger.className = "glint-select-trigger";
            this.trigger.setAttribute("role", "combobox");
            this.trigger.setAttribute("tabindex", this.disabled ? "-1" : "0");
            this.trigger.setAttribute("aria-haspopup", "listbox");
            this.trigger.setAttribute("aria-expanded", "false");
            this.listId = uid("glint-listbox");
            this.trigger.setAttribute("aria-controls", this.listId);

            // Label association (varsa). Label VARSA placeholder bastırılır
            // (üst üste çakışmayı önle); label YOKSA placeholder kullanılır.
            const lbl = g.querySelector(".glint-label");
            this.hasLabel = !!lbl;
            if (lbl) {
                if (!lbl.id) lbl.id = uid("glint-lbl");
                this.trigger.setAttribute("aria-labelledby", lbl.id);
            } else {
                this.trigger.setAttribute("aria-label", this.placeholder);
            }

            this.valueEl = document.createElement("span");
            this.valueEl.className = "glint-select-value";
            this.trigger.appendChild(this.valueEl);

            this.arrow = document.createElement("span");
            this.arrow.className = "glint-select-arrow";
            this.arrow.setAttribute("aria-hidden", "true");
            this.arrow.innerHTML = ICON_ARROW;
            this.trigger.appendChild(this.arrow);

            // Native select'in hemen ardına trigger
            this.select.insertAdjacentElement("afterend", this.trigger);

            // Popover
            this.popover = document.createElement("div");
            this.popover.className = "glint-select-popover";

            if (this.searchable) {
                const sw = document.createElement("div");
                sw.className = "glint-select-search-wrap";
                const sicon = document.createElement("span");
                sicon.className = "glint-select-search-icon";
                sicon.setAttribute("aria-hidden", "true");
                sicon.innerHTML = ICON_SEARCH;
                this.search = document.createElement("input");
                this.search.type = "text";
                this.search.className = "glint-select-search";
                this.search.placeholder = "Ara...";
                this.search.autocomplete = "off";
                this.search.setAttribute("aria-label", "Seçeneklerde ara");
                this.search.setAttribute("aria-controls", this.listId);
                sw.appendChild(sicon);
                sw.appendChild(this.search);
                this.popover.appendChild(sw);
            }

            this.list = document.createElement("ul");
            this.list.className = "glint-select-list";
            this.list.id = this.listId;
            this.list.setAttribute("role", "listbox");
            if (this.multiple) this.list.setAttribute("aria-multiselectable", "true");
            this.popover.appendChild(this.list);

            this.emptyEl = document.createElement("li");
            this.emptyEl.className = "glint-select-empty";
            this.emptyEl.textContent = "Sonuç yok";
            this.emptyEl.style.display = "none";
            this.list.appendChild(this.emptyEl);

            if (this._virtual) {
                // ── SANAL MOD: li'ler önceden kurulMAZ. Üst/alt spacer + pencere.
                // Her option'ın el'i ihtiyaç anında (_renderWindow) bir kez kurulur
                // ve yeniden kullanılır; pencere dışındakiler DOM'dan ayrılır ama
                // o.el referansı korunur → mevcut _setActive/_syncOptionStates/
                // _choose/_makeChip mantığı (o.el bağımlı) dokunulmadan çalışır.
                this._spacerTop = document.createElement("li");
                this._spacerTop.className = "glint-select-vspacer";
                this._spacerTop.setAttribute("aria-hidden", "true");
                this._spacerBottom = document.createElement("li");
                this._spacerBottom.className = "glint-select-vspacer";
                this._spacerBottom.setAttribute("aria-hidden", "true");
                // DOM sırası: [spacerTop, spacerBottom, emptyEl] → pencere li'leri
                // _renderWindow tarafından spacerBottom ÖNÜNE yerleştirilir.
                this.list.insertBefore(this._spacerTop, this.emptyEl);
                this.list.insertBefore(this._spacerBottom, this.emptyEl);
                // İlk görünür-model dizisi = placeholder-dışı tüm option'lar
                this._vModels = this.options.filter(o => !o.isPlaceholder);
                // Scroll → pencereyi yeniden çiz (rAF-throttle)
                this._onVScroll = () => {
                    if (this._vRaf) return;
                    this._vRaf = true;
                    requestAnimationFrame(() => { this._vRaf = false; this._renderWindow(); });
                };
                this.list.addEventListener("scroll", this._onVScroll, { passive: true });
            } else {
                // Seçenek DOM'ları (+ optgroup başlıkları) — KLASİK YOL
                this._groupHeaders = [];
                let lastGroup = null;
                this.options.forEach((o, idx) => {
                    if (o.isPlaceholder) return;
                    if (o.group && o.group !== lastGroup) {
                        const gh = document.createElement("li");
                        gh.className = "glint-select-optgroup";
                        gh.setAttribute("role", "presentation");
                        gh.textContent = o.group;
                        this.list.insertBefore(gh, this.emptyEl);
                        this._groupHeaders.push({ el: gh, group: o.group });
                        lastGroup = o.group;
                    } else if (!o.group) {
                        lastGroup = null;
                    }
                    this._buildOptionEl(o, idx);
                });
            }

            // Creatable: aranan değer listede yoksa en alta "+ ekle" satırı
            if (this.creatable) {
                this.createEl = document.createElement("li");
                this.createEl.className = "glint-select-create";
                this.createEl.setAttribute("role", "option");
                this.createEl.style.display = "none";
                this.createEl.addEventListener("click", () => {
                    if (this.createEl.dataset.value) this._createOption(this.createEl.dataset.value);
                });
                this.list.insertBefore(this.createEl, this.emptyEl);
            }

            // Çoklu modda: tümünü-seç + sayaç araç çubuğu (search ile list arası)
            if (this.multiple) {
                this.toolbar = document.createElement("div");
                this.toolbar.className = "glint-select-toolbar";
                this.selectAllBtn = document.createElement("button");
                this.selectAllBtn.type = "button";
                this.selectAllBtn.className = "glint-select-selectall";
                this.selectAllBtn.textContent = "Tümünü seç";
                this.selectAllBtn.addEventListener("click", () => this._toggleAll());
                this.selCounter = document.createElement("span");
                this.selCounter.className = "glint-select-counter";
                this.selCounter.setAttribute("aria-hidden", "true");
                this.toolbar.appendChild(this.selectAllBtn);
                this.toolbar.appendChild(this.selCounter);
                this.popover.insertBefore(this.toolbar, this.list);
            }

            document.body.appendChild(this.popover);
        }

        /** Tek bir option <li>'sini üretir (creatable de kullanır). */
        _buildOptionEl(o, idx) {
            const li = document.createElement("li");
            li.className = "glint-select-option";
            li.id = this.listId + "-opt-" + idx;
            li.setAttribute("role", "option");
            li.setAttribute("aria-selected", "false");
            if (o.disabled) li.classList.add("is-disabled");

            const check = document.createElement("span");
            check.className = "glint-select-option__check";
            check.setAttribute("aria-hidden", "true");
            check.innerHTML = ICON_CHECK;

            const label = document.createElement("span");
            label.className = "glint-select-option__label";
            label.textContent = o.label;

            li.appendChild(check);
            li.appendChild(label);
            o.el = li;
            o._optIndex = idx;
            li._optModel = o;
            this.list.insertBefore(li, this.createEl || this.emptyEl);
        }

        // ── SANAL LİSTE (windowing) ─────────────────────────────────

        /** Bir model için li'yi (yoksa) kur. _buildOptionEl emptyEl öncesine ekler;
            asıl konumlandırmayı _renderWindow frag ile spacerBottom önüne taşır. */
        _ensureOptionEl(o) {
            if (o.el) return o.el;
            const idx = (o._optIndex != null) ? o._optIndex : this.options.indexOf(o);
            this._buildOptionEl(o, idx);   // o.el'i kurar
            return o.el;
        }

        /** Görünür-model penceresini scrollTop'a göre yeniden çiz. */
        _renderWindow() {
            if (!this._virtual) return;
            const models = this._vModels;
            const total = models.length;
            const rowH = this._vRowH || 40;
            const viewH = this.list.clientHeight || parseInt(this.list.style.maxHeight, 10) || 280;
            const scrollTop = this.list.scrollTop;
            // Pencere indeks aralığı (+ overscan tampon)
            let start = Math.floor(scrollTop / rowH) - this._vOverscan;
            let count = Math.ceil(viewH / rowH) + this._vOverscan * 2;
            if (start < 0) start = 0;
            let end = start + count;
            if (end > total) end = total;
            if (start > end) start = end;
            // 1) Eski penceredekilerden artık dışarıda kalanları DOM'dan ayır
            for (let i = this._vStart; i < this._vEnd; i++) {
                if (i < start || i >= end) {
                    const o = models[i];
                    if (o && o.el && o.el.parentNode) o.el.remove();
                }
            }
            // 2) Yeni penceredekileri sırayla topla + spacerBottom öncesine yerleştir
            const frag = document.createDocumentFragment();
            for (let i = start; i < end; i++) {
                const o = models[i];
                if (!o) continue;
                this._ensureOptionEl(o);
                frag.appendChild(o.el);   // DOM'daysa frag'a TAŞINIR (sıra korunur)
            }
            this.list.insertBefore(frag, this._spacerBottom);
            // 3) Spacer yükseklikleri → toplam scroll yüksekliği korunur
            this._spacerTop.style.height = (start * rowH) + "px";
            this._spacerBottom.style.height = ((total - end) * rowH) + "px";
            this._vStart = start;
            this._vEnd = end;
        }

        /** İlk gerçek satırdan yükseklik ölç → spacer hesabı isabetli olur. */
        _measureRowH() {
            if (!this._virtual) return;
            const o = this._vModels.find(m => m.el && m.el.parentNode && m.el.offsetHeight);
            if (o) {
                const h = o.el.offsetHeight;
                if (h && Math.abs(h - this._vRowH) > 1) {
                    this._vRowH = h;
                    this._renderWindow();
                }
            }
        }

        /** Bir modeli görünür pencereye getir (klavye/typeahead/scrollIntoView). */
        _scrollModelIntoView(o) {
            if (!this._virtual) { if (o && o.el) o.el.scrollIntoView({ block: "nearest" }); return; }
            const vi = this._vModels.indexOf(o);
            if (vi < 0) return;
            const rowH = this._vRowH || 40;
            const viewH = this.list.clientHeight || 280;
            const top = vi * rowH;
            const bottom = top + rowH;
            if (top < this.list.scrollTop) {
                this.list.scrollTop = top;
            } else if (bottom > this.list.scrollTop + viewH) {
                this.list.scrollTop = bottom - viewH;
            }
            this._renderWindow();   // hedef satırın el'i artık DOM'da + doğru konumda
        }

        /** Creatable: uçuşta yeni option oluştur + seç (native select'e enjekte). */
        _createOption(raw) {
            const v = String(raw).trim();
            if (!v) return;
            const exist = this.options.find(o => !o.isPlaceholder && o._norm === normalize(v));
            if (exist) { this._choose(exist); return; }
            const opt = document.createElement("option");
            opt.value = v;
            opt.textContent = v;
            opt.setAttribute("data-glint-created", "");
            this.select.appendChild(opt);
            const model = {
                value: v, label: v, _norm: normalize(v),
                disabled: false, nativeIndex: this.select.options.length - 1,
                group: null, isPlaceholder: false, el: null
            };
            this.options.push(model);
            this._buildOptionEl(model, this.options.length - 1);
            this._choose(model);
            if (this.search) { this.search.value = ""; this._filter(""); }
        }

        // ── Events ───────────────────────────────────────────────────

        _bind() {
            if (this.disabled) return;

            // Trigger aç/kapa
            this.trigger.addEventListener("click", (e) => {
                if (e.target.closest(".glint-select-chip__remove")) return;
                this.toggle();
            });

            // Trigger klavye (kapalıyken)
            this.trigger.addEventListener("keydown", (e) => this._onTriggerKey(e));

            // Seçenek tıklama (delegasyon)
            this.list.addEventListener("click", (e) => {
                const li = e.target.closest(".glint-select-option");
                if (!li || li.classList.contains("is-disabled")) return;
                this._choose(li._optModel || this._modelForEl(li));
            });
            this.list.addEventListener("mousemove", (e) => {
                const li = e.target.closest(".glint-select-option");
                if (li && !li.classList.contains("is-disabled")) {
                    this._setActive(this._visibleIndexOfEl(li), false);
                }
            });

            // Arama
            if (this.search) {
                // Kırılamaz arama: IME (Çince/aksanlı/emoji) bestelemesi bitene
                // kadar filtreleme → yarım girdiyle yanlış sonuç önlenir.
                this.search.addEventListener("compositionstart", () => { this._composing = true; });
                this.search.addEventListener("compositionend", () => {
                    this._composing = false;
                    this._filter(this.search.value);
                });
                this.search.addEventListener("input", () => {
                    if (this._composing) return;
                    this._filter(this.search.value);
                });
                // Çoklu modda yapıştırarak toplu seçim (Excel/CSV → "a, b, c")
                this.search.addEventListener("paste", (e) => {
                    if (!this.multiple) return;
                    const text = (e.clipboardData || window.clipboardData).getData("text");
                    if (!text || !/[,;\n\t]/.test(text)) return;   // ayraç yoksa normal yapıştır
                    e.preventDefault();
                    const parts = text.split(/[,;\n\t]+/).map(s => normalize(s.trim())).filter(Boolean);
                    let changed = false;
                    parts.forEach(p => {
                        const o = this.options.find(o => !o.isPlaceholder && !o.disabled && o._norm === p);
                        const nat = o && this.select.options[o.nativeIndex];
                        if (nat && !nat.selected) { nat.selected = true; changed = true; }
                    });
                    if (changed) { this._emitNative(); this._syncOptionStates(); this._renderTrigger(); }
                    this.search.value = "";
                    this._filter("");
                });
                this.search.addEventListener("keydown", (e) => this._onListKey(e));
            }

            // Popover içine mousedown → trigger blur'unu/odak kaçışını engelle
            this.popover.addEventListener("mousedown", (e) => {
                if (e.target !== this.search) e.preventDefault();
            });

            // Dışarı tıkla → kapat
            this._outside = (e) => {
                if (!this.isOpen) return;
                if (this.group.contains(e.target) || this.popover.contains(e.target)) return;
                this.close();
            };
            document.addEventListener("mousedown", this._outside);

            // Reposition — rAF-throttle (scroll jank önle) + tek _position/frame
            this._reposScheduled = false;
            this._repos = () => {
                if (!this.isOpen || this._reposScheduled) return;
                this._reposScheduled = true;
                requestAnimationFrame(() => {
                    this._reposScheduled = false;
                    if (this.isOpen) this._position();
                });
            };
            window.addEventListener("resize", this._repos);
            window.addEventListener("scroll", this._repos, { capture: true, passive: true });

            // Popover içeriği (filtre / async yükleme) yüksekliği değişince yeniden
            // konumlan → "panel kayması" kırılganlığı çözülür (rAF üzerinden, güvenli).
            this._popRO = ("ResizeObserver" in window)
                ? new ResizeObserver(() => this._repos())
                : null;

            // Native select dışarıdan değişirse (JS ile value atama + change
            // dispatch) durumu senkronla. DİKKAT: _readOptions() ÇAĞIRMA —
            // option DOM yapısı değişmediği için modelleri sıfırdan kurmak
            // listbox el referanslarını koparır ve dropdown'ı bozar. Sadece
            // seçili/aktif durumlar + trigger metni güncellenir.
            this._onNativeChange = () => {
                if (this._suppressNative) return;
                this._syncOptionStates();
                this._renderTrigger();
            };
            this.select.addEventListener("change", this._onNativeChange);

            // Form reset: <form>.reset() select üzerinde `change` DISPATCH ETMEZ.
            // Bu yüzden host <form>'a reset dinleyicisi ekle; reset bir tick
            // sonra uygulandığından rAF ile senkronla.
            this._form = this.select.form;
            if (this._form) {
                this._onFormReset = () => {
                    requestAnimationFrame(() => {
                        if (this._suppressNative) return;
                        this._syncOptionStates();
                        this._renderTrigger();
                    });
                };
                this._form.addEventListener("reset", this._onFormReset);
            }
        }

        _modelForEl(li) {
            return this.options.find(o => o.el === li);
        }

        _onTriggerKey(e) {
            switch (e.key) {
                case "ArrowDown":
                case "ArrowUp":
                case "Enter":
                case " ":
                    e.preventDefault();
                    if (!this.isOpen) this.open();
                    else if (e.key !== " ") this._onListKey(e);
                    break;
                case "Escape":
                    if (this.isOpen) { e.preventDefault(); this.close(); }
                    break;
                default:
                    // Harf yazınca aç + typeahead
                    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                        if (!this.isOpen) this.open();
                        if (!this.search) {
                            this._typeahead(e.key);
                            e.preventDefault();
                        } else {
                            // v1.5.1 — Açılışı tetikleyen İLK harf kayboluyordu:
                            // arama kutusu bir frame sonra odaklandığından harf
                            // hiçbir yere yazılmıyordu. Harf elle tohumlanır ve
                            // filtre hemen çalıştırılır.
                            e.preventDefault();
                            this.search.value += e.key;
                            this.search.dispatchEvent(new Event("input", { bubbles: true }));
                        }
                    }
            }
        }

        /** Liste açıkken (arama input'unda veya trigger'da) klavye */
        _onListKey(e) {
            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    this._move(+1);
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    this._move(-1);
                    break;
                case "Home":
                    // Arama input'unda metin varsa native caret hareketine izin ver
                    if (this.search && document.activeElement === this.search && this.search.value) break;
                    e.preventDefault();
                    this._setActive(this._firstSelectable(), true);
                    break;
                case "End":
                    if (this.search && document.activeElement === this.search && this.search.value) break;
                    e.preventDefault();
                    this._setActive(this._lastSelectable(), true);
                    break;
                case "Enter":
                    e.preventDefault();
                    {
                        const vis = this._visibleOptions();
                        const m = vis[this.activeIndex];
                        if (m) this._choose(m);
                    }
                    break;
                case "Escape":
                    e.preventDefault();
                    this.close();
                    this.trigger.focus();
                    break;
                case "Tab":
                    this.close();
                    break;
                default:
                    // Arama yoksa typeahead (trigger açıkken harf)
                    if (!this.search && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                        this._typeahead(e.key);
                        e.preventDefault();
                    }
            }
        }

        // ── Görünür seçenek yönetimi ────────────────────────────────

        _visibleOptions() {
            // Sanal modda görünürlük DOM (is-hidden) değil, filtre sonucu _vModels'tır.
            if (this._virtual) return this._vModels;
            return this.options.filter(o => o.el && !o.el.classList.contains("is-hidden"));
        }

        _visibleIndexOfEl(li) {
            return this._visibleOptions().findIndex(o => o.el === li);
        }

        _firstSelectable() {
            const vis = this._visibleOptions();
            return vis.findIndex(o => !o.disabled);
        }

        _lastSelectable() {
            const vis = this._visibleOptions();
            for (let i = vis.length - 1; i >= 0; i--) if (!vis[i].disabled) return i;
            return -1;
        }

        _move(delta) {
            const vis = this._visibleOptions();
            if (!vis.length) return;
            let i = this.activeIndex;
            for (let step = 0; step < vis.length; step++) {
                i = (i + delta + vis.length) % vis.length;
                if (!vis[i].disabled) { this._setActive(i, true); return; }
            }
        }

        _setActive(visIndex, scroll) {
            const vis = this._visibleOptions();
            this.activeIndex = visIndex;
            const m = vis[visIndex];
            if (this._virtual) {
                // Hedefi pencereye getir (el DOM'da olmayabilir/yanlış konumda olabilir).
                // _scrollModelIntoView idempotent: görünürse scrollTop'a dokunmaz,
                // her durumda _renderWindow ile el'i doğru konuma yerleştirir.
                if (m) this._scrollModelIntoView(m);
                // is-active'i yalnız DOM'daki (kurulu) el'ler üzerinde uygula.
                vis.forEach((o, i) => {
                    if (o.el) o.el.classList.toggle("is-active", i === visIndex);
                });
                if (m && m.el) {
                    this.trigger.setAttribute("aria-activedescendant", m.el.id);
                    if (this.search) this.search.setAttribute("aria-activedescendant", m.el.id);
                } else {
                    this.trigger.removeAttribute("aria-activedescendant");
                    if (this.search) this.search.removeAttribute("aria-activedescendant");
                }
                return;
            }
            vis.forEach((o, i) => {
                const on = i === visIndex;
                o.el.classList.toggle("is-active", on);
            });
            if (m) {
                this.trigger.setAttribute("aria-activedescendant", m.el.id);
                if (this.search) this.search.setAttribute("aria-activedescendant", m.el.id);
                if (scroll) m.el.scrollIntoView({ block: "nearest" });
            } else {
                this.trigger.removeAttribute("aria-activedescendant");
                if (this.search) this.search.removeAttribute("aria-activedescendant");
            }
        }

        _typeahead(ch) {
            clearTimeout(this._typeTimer);
            this._typeBuffer += normalize(ch);
            this._typeTimer = setTimeout(() => { this._typeBuffer = ""; }, 700);
            const vis = this._visibleOptions();
            const start = Math.max(0, this.activeIndex);
            // mevcut konumdan sonra eşleşeni ara, sonra baştan
            const order = vis.map((_, i) => (start + 1 + i) % vis.length);
            // buffer tek karakterse mevcut da dahil olsun
            if (this._typeBuffer.length <= 1) order.unshift(start);
            for (const i of order) {
                const o = vis[i];
                if (o && !o.disabled && normalize(o.label).startsWith(this._typeBuffer)) {
                    this._setActive(i, true);
                    return;
                }
            }
        }

        // ── Filtre ──────────────────────────────────────────────────

        /** Eşleşen alt-dizgiyi <mark> ile vurgula (node-tabanlı → XSS yok). */
        _highlight(labelEl, original, nq) {
            if (!nq) { labelEl.textContent = original; return; }
            // orijinal → normalize char-map (NFD/ı dönüşümleri index kaydırabilir)
            let norm = "";
            const map = [];
            for (let oi = 0; oi < original.length; oi++) {
                const n = normalize(original[oi]);
                for (let k = 0; k < n.length; k++) { norm += n[k]; map.push(oi); }
            }
            const pos = norm.indexOf(nq);
            if (pos < 0) { labelEl.textContent = original; return; }
            const s = map[pos];
            const e = (pos + nq.length < map.length) ? map[pos + nq.length] : original.length;
            labelEl.textContent = "";
            if (s > 0) labelEl.appendChild(document.createTextNode(original.slice(0, s)));
            const mark = document.createElement("mark");
            mark.className = "glint-select-hl";
            mark.textContent = original.slice(s, e);
            labelEl.appendChild(mark);
            if (e < original.length) labelEl.appendChild(document.createTextNode(original.slice(e)));
        }

        _filter(q) {
            if (!this.options) return;
            const nq = normalize(typeof q === "string" ? q.trim() : "");
            if (this._virtual) { this._filterVirtual(nq); return; }
            let anyVisible = false;
            this.options.forEach(o => {
                if (!o.el) return;
                const show = !nq || o._norm.includes(nq);
                o.el.classList.toggle("is-hidden", !show);
                if (show) {
                    anyVisible = true;
                    const lbl = o.el.querySelector(".glint-select-option__label");
                    if (lbl) this._highlight(lbl, o.label, nq);
                }
            });
            // Creatable: tam eşleşme yoksa ve sorgu varsa "+ ekle" satırını göster
            if (this.createEl) {
                const exact = !!nq && this.options.some(o => !o.isPlaceholder && o._norm === nq);
                if (nq && !exact) {
                    const q = this.search ? this.search.value.trim() : "";
                    this.createEl.textContent = '+ "' + q + '" ekle';
                    this.createEl.dataset.value = q;
                    this.createEl.style.display = "";
                    anyVisible = true;
                } else {
                    this.createEl.style.display = "none";
                }
            }
            // optgroup başlıkları: o gruba ait görünür option yoksa gizle
            if (this._groupHeaders) {
                this._groupHeaders.forEach(h => {
                    const hasVisible = this.options.some(o =>
                        o.group === h.group && o.el && !o.el.classList.contains("is-hidden"));
                    h.el.classList.toggle("is-hidden", !hasVisible);
                });
            }
            if (this.emptyEl) this.emptyEl.style.display = anyVisible ? "none" : "block";
            // İlk görünür seçilebilir öğeye vurgu taşı
            this._setActive(this._firstSelectable(), false);
        }

        /** Sanal modda filtre: görünür-model dizisini kur + pencereyi sıfırla. */
        _filterVirtual(nq) {
            // 1) Görünür-model dizisi = eşleşen placeholder-dışı option'lar
            this._vModels = this.options.filter(o =>
                !o.isPlaceholder && (!nq || o._norm.includes(nq)));
            // 2) Eski penceredeki tüm el'leri DOM'dan ayır (yeni listeyle çakışmasın)
            this.options.forEach(o => { if (o.el && o.el.parentNode) o.el.remove(); });
            this._vStart = 0; this._vEnd = 0;
            // 3) Scroll'u başa al + pencereyi çiz
            this.list.scrollTop = 0;
            this._renderWindow();
            // 4) Pencerede görünen el'lerin <mark> vurgusunu uygula
            if (nq) {
                for (let i = this._vStart; i < this._vEnd; i++) {
                    const o = this._vModels[i];
                    if (!o || !o.el) continue;
                    const lbl = o.el.querySelector(".glint-select-option__label");
                    if (lbl) this._highlight(lbl, o.label, nq);
                }
            }
            // 5) Boş sonuç + seçili durum senkronu (yeni kurulan pencere el'leri için)
            if (this.emptyEl) this.emptyEl.style.display = this._vModels.length ? "none" : "block";
            this._syncOptionStates();
            this._setActive(this._firstSelectable(), false);
            // İlk ölçümden sonra gerçek satır yüksekliğini yakala (bir kez yeterli)
            if (!this._vMeasured && this._vModels.length) {
                this._vMeasured = true;
                requestAnimationFrame(() => this._measureRowH());
            }
        }

        // ── Seçim ───────────────────────────────────────────────────

        _choose(model) {
            if (!model || model.disabled) return;
            const nativeOpt = this.select.options[model.nativeIndex];
            if (!nativeOpt) return;

            if (this.multiple) {
                // max-seçim sınırı: yeni seçim sınırı aşacaksa engelle + uyar
                if (!nativeOpt.selected && this.maxSelected != null &&
                    this._selectedModels().length >= this.maxSelected) {
                    this._flashMax();
                    return;
                }
                nativeOpt.selected = !nativeOpt.selected;
                this._emitNative();
                this._syncOptionStates();
                this._renderTrigger();
                // Açık kal — kullanıcı birden çok seçebilsin (ara-seç-ara-seç).
                // Arama varsa odağı input'ta tut ki yazmaya devam edebilsin;
                // filtre korunur, aktif satır _setActive ile yerinde kalır.
                if (this.search) {
                    this.search.focus({ preventScroll: true });
                    const vis = this._visibleOptions();
                    const idx = vis.indexOf(model);
                    if (idx >= 0) this._setActive(idx, false);
                } else {
                    this.trigger.focus({ preventScroll: true });
                }
            } else {
                Array.from(this.select.options).forEach(op => { op.selected = false; });
                nativeOpt.selected = true;
                this._emitNative();
                this._syncOptionStates();
                this._renderTrigger();
                this.close();
                this.trigger.focus();
            }
        }

        /** Çoklu modda bir değeri kaldır (chip x) */
        _deselect(model) {
            const nativeOpt = this.select.options[model.nativeIndex];
            if (!nativeOpt) return;
            nativeOpt.selected = false;
            this._emitNative();
            this._syncOptionStates();
            this._renderTrigger();
        }

        _emitNative() {
            this._suppressNative = true;
            this.select.dispatchEvent(new Event("input", { bubbles: true }));
            this.select.dispatchEvent(new Event("change", { bubbles: true }));
            this._suppressNative = false;
        }

        _selectedModels() {
            return this.options.filter(o =>
                !o.isPlaceholder && this.select.options[o.nativeIndex]?.selected
            );
        }

        _syncOptionStates() {
            // o.el null olabilir (sanal modda henüz kurulmamış satır) → guard yeterli;
            // pencere yeniden çizildikçe yeni kurulan el'ler doğru sınıfı alır.
            this.options.forEach(o => {
                if (!o.el) return;
                const sel = !!this.select.options[o.nativeIndex]?.selected;
                o.el.classList.toggle("is-selected", sel);
                o.el.setAttribute("aria-selected", sel ? "true" : "false");
            });
        }

        // ── Trigger render ──────────────────────────────────────────

        /**
         * v1.5.1 — Seçilebilir + görünür seçenekler TEK yardımcıdan gelir.
         * Sanal modda görünürlük DOM'a değil _vModels'a (filtre sonucu)
         * bakmalı: pencere dışındaki satırların el'i null olduğundan
         * el-tabanlı filtre 500 seçenekli listede "tümünü seç"i ~20
         * seçenekte bırakıyor, arama sonrası da filtre dışı satırları
         * seçebiliyordu.
         */
        _selectableVisible() {
            const vis = this._virtual
                ? this._vModels
                : this.options.filter(o => o.el && !o.el.classList.contains("is-hidden"));
            return vis.filter(o => !o.isPlaceholder && !o.disabled);
        }

        _toggleAll() {
            const vis = this._selectableVisible();
            const allSel = vis.length > 0 && vis.every(o => this.select.options[o.nativeIndex]?.selected);
            vis.forEach(o => {
                const nat = this.select.options[o.nativeIndex];
                if (!nat) return;
                if (allSel) { nat.selected = false; return; }
                if (!nat.selected && this.maxSelected != null && this._selectedModels().length >= this.maxSelected) return;
                nat.selected = true;
            });
            this._emitNative();
            this._syncOptionStates();
            this._renderTrigger();
        }

        _updateToolbar() {
            if (!this.toolbar) return;
            const total = this.options.filter(o => !o.isPlaceholder).length;
            const sel = this._selectedModels().length;
            const cap = this.maxSelected != null ? this.maxSelected : total;
            this.selCounter.textContent = sel + " / " + cap + " seçili";
            const vis = this._selectableVisible();
            const allSel = vis.length > 0 && vis.every(o => this.select.options[o.nativeIndex]?.selected);
            this.selectAllBtn.textContent = allSel ? "Temizle" : "Tümünü seç";
        }

        _flashMax() {
            if (!this.selCounter) return;
            this.selCounter.classList.add("is-max");
            clearTimeout(this._maxTimer);
            this._maxTimer = setTimeout(() => this.selCounter.classList.remove("is-max"), 700);
        }

        _renderTrigger() {
            const selected = this._selectedModels();
            const hasValue = selected.length > 0;
            this.group.classList.toggle("glint-has-value", hasValue);
            this._updateToolbar();

            if (this.multiple) {
                this.valueEl.innerHTML = "";
                this.valueEl.classList.remove("is-placeholder");
                if (!hasValue) {
                    // Label varsa o placeholder görevi görür → valueEl boş (çakışma yok)
                    if (this.hasLabel) {
                        this.valueEl.textContent = "";
                    } else {
                        this.valueEl.classList.add("is-placeholder");
                        this.valueEl.textContent = this.placeholder;
                    }
                    return;
                }
                selected.forEach(m => this.valueEl.appendChild(this._makeChip(m)));
            } else {
                if (!hasValue) {
                    if (this.hasLabel) {
                        this.valueEl.classList.remove("is-placeholder");
                        this.valueEl.textContent = "";
                    } else {
                        this.valueEl.classList.add("is-placeholder");
                        this.valueEl.textContent = this.placeholder;
                    }
                } else {
                    this.valueEl.classList.remove("is-placeholder");
                    this.valueEl.textContent = selected[0].label;
                }
            }
        }

        _makeChip(model) {
            const chip = document.createElement("span");
            chip.className = "glint-select-chip";

            const label = document.createElement("span");
            label.className = "glint-select-chip__label";
            label.textContent = model.label;

            const x = document.createElement("button");
            x.type = "button";
            x.className = "glint-select-chip__remove";
            x.setAttribute("aria-label", model.label + " kaldır");
            x.innerHTML = ICON_X;
            x.addEventListener("click", (e) => {
                e.stopPropagation();
                this._deselect(model);
            });

            chip.appendChild(label);
            chip.appendChild(x);

            if (!prefersReduced) {
                chip.animate(
                    [
                        { transform: "scale(0.95)", opacity: 0 },
                        { transform: "scale(1)", opacity: 1 }
                    ],
                    { duration: 160, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" }
                );
            }
            return chip;
        }

        // ── Open / Close ────────────────────────────────────────────

        open() {
            if (this.isOpen || this.disabled) return;
            this.isOpen = true;
            this.group.classList.add("glint-select-open");
            this.trigger.setAttribute("aria-expanded", "true");

            if (this.search) { this.search.value = ""; this._filter(""); }
            else if (this._virtual) {
                // Aramasız sanal select: pencereyi açılışta bir kez çiz, sonra aktif.
                this._vModels = this.options.filter(o => !o.isPlaceholder);
                this._vStart = 0; this._vEnd = 0;
                this.list.scrollTop = 0;
                this._renderWindow();
                this._setActive(this._firstSelectable(), false);
                if (!this._vMeasured && this._vModels.length) {
                    this._vMeasured = true;
                    requestAnimationFrame(() => this._measureRowH());
                }
            }
            else this._setActive(this._firstSelectable(), false);

            // İlk seçili öğeye vurguyu götür (varsa)
            const selected = this._selectedModels();
            if (selected.length) {
                const vis = this._visibleOptions();
                const idx = vis.indexOf(selected[0]);
                if (idx >= 0) this._setActive(idx, false);
            }

            this._position();
            if (this._popRO) this._popRO.observe(this.popover);
            requestAnimationFrame(() => {
                this.popover.classList.add("is-open");
                // scrollIntoView ancak görünür olunca anlamlı
                const vis = this._visibleOptions();
                const m = vis[this.activeIndex];
                if (m) m.el.scrollIntoView({ block: "nearest" });
            });

            if (this.search) requestAnimationFrame(() => this.search.focus());
        }

        close() {
            if (!this.isOpen) return;
            this.isOpen = false;
            if (this._popRO) this._popRO.unobserve(this.popover);
            this.popover.classList.remove("is-open");
            this.group.classList.remove("glint-select-open");
            this.trigger.setAttribute("aria-expanded", "false");
            this.trigger.removeAttribute("aria-activedescendant");
        }

        toggle() { this.isOpen ? this.close() : this.open(); }

        _position() {
            const rect = this.trigger.getBoundingClientRect();
            this.popover.classList.remove("glint-select-popover--flip-up");
            this.popover.style.minWidth = rect.width + "px";

            const popH = this.popover.offsetHeight || 280;
            const margin = 6;
            const vpH = window.innerHeight;

            let top = rect.bottom + margin;
            let flip = false;
            if (top + popH > vpH - 12 && rect.top - margin - popH > 12) {
                top = rect.top - popH - margin;
                flip = true;
            }
            let left = rect.left;
            const popW = this.popover.offsetWidth || rect.width;
            const vpW = window.innerWidth;
            if (left + popW > vpW - 12) left = Math.max(12, vpW - popW - 12);
            if (left < 12) left = 12;

            this.popover.style.top = (window.scrollY + top) + "px";
            this.popover.style.left = (window.scrollX + left) + "px";
            this.popover.classList.toggle("glint-select-popover--flip-up", flip);
        }

        // ── Programatik API ─────────────────────────────────────────

        /** Değer(ler)i kod ile ayarla. Tekli: string; çoklu: string[] */
        setValue(val) {
            const vals = this.multiple ? (Array.isArray(val) ? val : [val]) : [val];
            Array.from(this.select.options).forEach(op => {
                op.selected = vals.includes(op.value);
            });
            this._emitNative();
            this._syncOptionStates();
            this._renderTrigger();
        }

        getValue() {
            if (this.multiple) {
                return Array.from(this.select.selectedOptions).map(o => o.value);
            }
            return this.select.value;
        }

        destroy() {
            document.removeEventListener("mousedown", this._outside);
            window.removeEventListener("resize", this._repos);
            window.removeEventListener("scroll", this._repos, true);
            if (this._virtual && this._onVScroll) this.list.removeEventListener("scroll", this._onVScroll);
            if (this._popRO) this._popRO.disconnect();
            // Native select'e bağlı dinleyicileri sök (bellek sızıntısı + re-mount engeli)
            if (this._onNativeChange) this.select.removeEventListener("change", this._onNativeChange);
            if (this._form && this._onFormReset) this._form.removeEventListener("reset", this._onFormReset);
            clearTimeout(this._typeTimer);
            this.popover.remove();
            this.trigger.remove();
            // Init guard'ları temizle ki aynı select yeniden mount edilebilsin
            delete this.select._glintSelectInit;
            if (this.group) delete this.group._glintSelectInstance;
            // v1.5.1 — kayıt düşülmezse data-glint-mounted takılı kalıyor ve
            // doğrudan destroy() sonrası DOM kaldırımı ikinci teardown yapıyordu
            window.Glint.unregister(this.group);
        }

        static get(el) {
            const g = el?.closest?.(".glint-select-group") || el;
            return g?._glintSelectInstance || null;
        }
    }


    // ══════════════════════════════════════════════════════════════
    //  GlintTags
    // ══════════════════════════════════════════════════════════════
    /**
     * Kullanım:
     *   <div class="glint-tags" data-name="Etiketler" data-max="8"
     *        data-value="alfa,beta"></div>
     *
     *   data-name   → gizli input name'i (ASP.NET model binding).
     *                 Yoksa tek gizli input + data-hidden-name gerekmez;
     *                 birden çok input modu için data-multi="true".
     *   data-max    → maksimum chip sayısı.
     *   data-value  → virgülle ayrılmış başlangıç değerleri.
     *   data-placeholder → input placeholder'ı.
     *   data-multi="true" → her tag için ayrı <input name="X"> üretir
     *                       (varsayılan: tek input, virgülle birleşik).
     */
    class GlintTags {

        constructor(host) {
            if (!host || host._glintTagsInit) return;
            host._glintTagsInit = true;
            host._glintTagsInstance = this;
            this.host = host;

            this.name = host.getAttribute("data-name") || "";
            this.max = parseInt(host.getAttribute("data-max"), 10);
            if (isNaN(this.max)) this.max = Infinity;
            this.multi = host.getAttribute("data-multi") === "true";
            this.disabled = host.hasAttribute("data-disabled") || host.classList.contains("is-disabled");
            this.placeholder = host.getAttribute("data-placeholder") || "Etiket ekle...";
            // v1.5: etiket başına kurallar
            const mlAttr = parseInt(host.getAttribute("data-max-length"), 10);
            this.maxLength = (!isNaN(mlAttr) && mlAttr > 0) ? mlAttr : null;
            this.transform = (host.getAttribute("data-transform") || "").toLowerCase();  // lower|upper|trim
            this.allowDupes = host.getAttribute("data-allow-dupes") === "true";
            this._pattern = null;
            const pat = host.getAttribute("data-pattern");
            if (pat) { try { this._pattern = new RegExp(pat); } catch (_) { this._pattern = null; } }

            this.tags = [];     // {value, el}
            this._armed = false; // backspace ile son chip silme aday durumu
            // v1.6: sürükle-sırala (varsayılan açık; data-reorder="false" ile kapat)
            this.reorder = host.getAttribute("data-reorder") !== "false";
            this._drag = null;  // aktif sürükleme durumu {tag, el, startX, startY, dx, dy, active, w, h, pointerId}

            // ── Öneri (suggest) yapılandırması ──────────────────────
            this._collectSuggestions();           // this.suggestions = [{value,_norm}]
            const sMin = parseInt(host.getAttribute("data-suggest-min"), 10);
            this.sugMin = (!isNaN(sMin) && sMin >= 0) ? sMin : 1;
            const sMax = parseInt(host.getAttribute("data-suggest-max"), 10);
            this.sugMax = (!isNaN(sMax) && sMax > 0) ? sMax : 8;
            this.sugPop = null;     // dropdown elemanı (lazy, body'ye taşınır)
            this.sugList = null;    // role=listbox UL
            this.sugItems = [];     // {value, el}
            this._sugIdx = -1;      // vurgulu öneri indeksi (aria-activedescendant)
            this._sugOpen = false;
            this._sugId = uid("glint-tags-sug");  // modül-yerel uid() (satır 2308) — benzersiz aria id

            this._build();
            this._bind();
            this._seedInitial();
            window.Glint.register(host, this);
        }

        _build() {
            this.host.innerHTML = "";
            if (this.disabled) this.host.classList.add("is-disabled");

            this.input = document.createElement("input");
            this.input.type = "text";
            this.input.className = "glint-tags__input";
            this.input.placeholder = this.placeholder;
            this.input.autocomplete = "off";
            this.input.setAttribute("aria-label", this.name || "Etiketler");
            if (this.disabled) this.input.disabled = true;
            this.host.appendChild(this.input);

            // Tek-input modu için gizli alan
            if (!this.multi) {
                this.hidden = document.createElement("input");
                this.hidden.type = "hidden";
                if (this.name) this.hidden.name = this.name;
                this.host.appendChild(this.hidden);
            } else {
                // multi modda gizli input'lar dinamik üretilir (_syncForm)
                this.hiddenWrap = document.createElement("span");
                this.hiddenWrap.style.display = "none";
                this.host.appendChild(this.hiddenWrap);
            }
        }

        _seedInitial() {
            const raw = this.host.getAttribute("data-value") || "";
            raw.split(",").map(s => s.trim()).filter(Boolean).forEach(v => this._addTag(v, false));
            this._syncForm();
        }

        /** Öneri kaynaklarını topla. Öncelik: data-suggest → data-suggest-from → inline datalist. */
        _collectSuggestions() {
            let raw = [];
            const attr = this.host.getAttribute("data-suggest");
            if (attr) {
                raw = attr.split(",");
            } else {
                const fromId = this.host.getAttribute("data-suggest-from");
                let dl = fromId ? document.getElementById(fromId) : this.host.querySelector("datalist");
                if (dl && dl.tagName === "DATALIST") {
                    raw = Array.from(dl.querySelectorAll("option"))
                        .map(o => o.getAttribute("value") != null ? o.getAttribute("value") : o.textContent);
                }
            }
            const seen = new Set();
            this.suggestions = [];
            raw.map(s => (s || "").trim()).filter(Boolean).forEach(v => {
                const n = normalize(v);
                if (seen.has(n)) return;
                seen.add(n);
                this.suggestions.push({ value: v, _norm: n });
            });
        }

        /** Programatik: öneri listesini değiştir. */
        setSuggestions(arr) {
            const seen = new Set();
            this.suggestions = [];
            (arr || []).map(s => String(s).trim()).filter(Boolean).forEach(v => {
                const n = normalize(v);
                if (seen.has(n)) return;
                seen.add(n);
                this.suggestions.push({ value: v, _norm: n });
            });
            if (this._sugOpen) this._filterSuggest();
        }

        /** Öneri dropdown'unu lazy kur (body'ye taşı). */
        _ensureSugPop() {
            if (this.sugPop) return;
            const pop = document.createElement("div");
            pop.className = "glint-tags-suggest";
            pop.id = this._sugId;
            const ul = document.createElement("ul");
            ul.className = "glint-tags-suggest__list";
            ul.setAttribute("role", "listbox");
            ul.setAttribute("aria-label", (this.name || "Etiket") + " önerileri");
            pop.appendChild(ul);
            document.body.appendChild(pop);
            this.sugPop = pop;
            this.sugList = ul;
            // a11y: combobox bağlama
            this.input.setAttribute("role", "combobox");
            this.input.setAttribute("aria-autocomplete", "list");
            this.input.setAttribute("aria-expanded", "false");
            this.input.setAttribute("aria-controls", this._sugId);
            // Liste tıklamasında blur'dan önce seçimi yakala
            ul.addEventListener("mousedown", (e) => {
                const li = e.target.closest(".glint-tags-suggest__item");
                if (!li) return;
                e.preventDefault(); // input blur olmasın
                const idx = this.sugItems.findIndex(it => it.el === li);
                if (idx > -1) this._chooseSug(idx);
            }, { signal: this._ac.signal });
        }

        /** Mevcut input metnine göre önerileri süz + aç/kapat. */
        _filterSuggest() {
            if (!this.suggestions || !this.suggestions.length) { this._closeSug(); return; }
            if (this.input.value.trim().length < this.sugMin) { this._closeSug(); return; }
            if (this.tags.length >= this.max) { this._closeSug(); return; }
            const q = normalize(this.input.value.trim());
            const taken = new Set(this.tags.map(t => normalize(t.value)));
            const matches = [];
            for (const s of this.suggestions) {
                if (taken.has(s._norm)) continue;
                if (q && s._norm.indexOf(q) === -1) continue;
                matches.push(s);
                if (matches.length >= this.sugMax) break;
            }
            if (!matches.length) { this._closeSug(); return; }
            this._renderSug(matches, q);
            this._openSug();
        }

        _renderSug(matches, q) {
            this._ensureSugPop();
            this.sugList.innerHTML = "";
            this.sugItems = [];
            matches.forEach((s, i) => {
                const li = document.createElement("li");
                li.className = "glint-tags-suggest__item";
                li.id = this._sugId + "-opt-" + i;
                li.setAttribute("role", "option");
                li.setAttribute("aria-selected", "false");
                const idx = q ? s._norm.indexOf(q) : -1;
                if (q && idx > -1) {
                    li.appendChild(document.createTextNode(s.value.slice(0, idx)));
                    const mark = document.createElement("mark");
                    mark.className = "glint-tags-suggest__match";
                    mark.textContent = s.value.slice(idx, idx + q.length);
                    li.appendChild(mark);
                    li.appendChild(document.createTextNode(s.value.slice(idx + q.length)));
                } else {
                    li.textContent = s.value;
                }
                this.sugList.appendChild(li);
                this.sugItems.push({ value: s.value, el: li });
            });
            this._sugIdx = -1;
            this.input.removeAttribute("aria-activedescendant");
        }

        _openSug() {
            this._ensureSugPop();
            this._positionSug();
            this._sugOpen = true;
            this.sugPop.classList.add("is-open");
            this.input.setAttribute("aria-expanded", "true");
        }

        _closeSug() {
            if (this.input && this.input.setAttribute) this.input.setAttribute("aria-expanded", "false");
            if (!this._sugOpen) return;
            this._sugOpen = false;
            this._sugIdx = -1;
            if (this.sugPop) this.sugPop.classList.remove("is-open");
            if (this.input) this.input.removeAttribute("aria-activedescendant");
        }

        _positionSug() {
            const rect = this.host.getBoundingClientRect();
            this.sugPop.classList.remove("glint-tags-suggest--flip-up");
            this.sugPop.style.minWidth = rect.width + "px";
            const popH = this.sugPop.offsetHeight || 200;
            const margin = 6;
            let top = rect.bottom + margin;
            let flip = false;
            if (top + popH > window.innerHeight - 12 && rect.top - margin - popH > 12) {
                top = rect.top - popH - margin;
                flip = true;
            }
            let left = rect.left;
            const popW = this.sugPop.offsetWidth || rect.width;
            if (left + popW > window.innerWidth - 12) left = Math.max(12, window.innerWidth - popW - 12);
            if (left < 12) left = 12;
            this.sugPop.style.top = (window.scrollY + top) + "px";
            this.sugPop.style.left = (window.scrollX + left) + "px";
            this.sugPop.classList.toggle("glint-tags-suggest--flip-up", flip);
        }

        /** Vurguyu dir kadar oynat (klavye, döngüsel). */
        _moveSug(dir) {
            const n = this.sugItems.length;
            if (!n) return;
            if (this._sugIdx > -1 && this.sugItems[this._sugIdx]) {
                this.sugItems[this._sugIdx].el.classList.remove("is-active");
                this.sugItems[this._sugIdx].el.setAttribute("aria-selected", "false");
            }
            this._sugIdx = (this._sugIdx + dir + n) % n;
            const it = this.sugItems[this._sugIdx];
            it.el.classList.add("is-active");
            it.el.setAttribute("aria-selected", "true");
            it.el.scrollIntoView({ block: "nearest" });
            this.input.setAttribute("aria-activedescendant", it.el.id);
        }

        /** Öneriyi seç → tag ekle. */
        _chooseSug(idx) {
            const it = this.sugItems[idx];
            if (!it) return;
            this._disarm();
            if (this._tryAdd(it.value)) this.input.value = "";
            this._closeSug();
            this.input.focus();
        }

        _bind() {
            if (this.disabled) return;
            this._ac = new AbortController();
            const sig = { signal: this._ac.signal };

            // Host'a tıkla → input'a odak
            this.host.addEventListener("mousedown", (e) => {
                if (e.target === this.input) return;
                if (e.target.closest(".glint-tag__remove")) return;
                e.preventDefault();
                this.input.focus();
            }, sig);

            this.input.addEventListener("focus", () => {
                this.host.classList.add("is-focused");
                this._filterSuggest();
            }, sig);
            this.input.addEventListener("blur", () => {
                this.host.classList.remove("is-focused");
                this._disarm();
                this._closeSug();
                // Blur'da bekleyen metni tag yap (UX kolaylığı)
                this._commitBuffer();
            }, sig);

            this.input.addEventListener("keydown", (e) => this._onKey(e), sig);

            // Virgül yazımını anında yakala (input event — paste de dahil)
            this.input.addEventListener("input", () => {
                if (this.input.value.includes(",")) {
                    const parts = this.input.value.split(",");
                    const tail = parts.pop();
                    parts.map(p => p.trim()).filter(Boolean).forEach(v => this._tryAdd(v));
                    this.input.value = tail;
                }
                // Yazdıkça önerileri süz
                this._filterSuggest();
            }, sig);

            // Açık öneriyi yeniden konumla (kaydır/yeniden boyutlandır)
            this._sugRepos = () => { if (this._sugOpen) this._positionSug(); };
            window.addEventListener("resize", this._sugRepos, sig);
            window.addEventListener("scroll", this._sugRepos, { signal: this._ac.signal, capture: true, passive: true });

            // Chip x (delegasyon)
            this.host.addEventListener("click", (e) => {
                const btn = e.target.closest(".glint-tag__remove");
                if (!btn) return;
                const chip = btn.closest(".glint-tag");
                const t = this.tags.find(t => t.el === chip);
                if (t) this._removeTag(t);
            }, sig);

            // Sürükle-sırala: belge düzeyi pointer takibi (gate: this._drag)
            // AbortController sinyaline bağlı → destroy()'da otomatik sökülür.
            if (this.reorder) {
                document.addEventListener("pointermove", (e) => this._onDragMove(e), sig);
                document.addEventListener("pointerup", (e) => this._endDrag(e), sig);
                document.addEventListener("pointercancel", (e) => this._endDrag(e), sig);
            }
        }

        /** Yaşam döngüsü teardown. */
        destroy() {
            if (this._ac) { this._ac.abort(); this._ac = null; }
            // body'ye taşınan öneri dropdown'unu temizle
            if (this.sugPop) { this.sugPop.remove(); this.sugPop = null; this.sugList = null; this.sugItems = []; }
            this.host.innerHTML = "";
            this.host.classList.remove("is-focused");
            this.host._glintTagsInit = false;
            this.host._glintTagsInstance = null;
            window.Glint.unregister(this.host);
        }

        _onKey(e) {
            // ── Öneri navigasyonu (açıkken klavyeyi kapsar) ────────
            if (this._sugOpen && this.sugItems.length) {
                if (e.key === "ArrowDown") { e.preventDefault(); this._moveSug(1); return; }
                if (e.key === "ArrowUp") { e.preventDefault(); this._moveSug(-1); return; }
                if (e.key === "Escape") { e.preventDefault(); this._closeSug(); return; }
                if ((e.key === "Enter" || e.key === "Tab") && this._sugIdx > -1) {
                    e.preventDefault();
                    this._chooseSug(this._sugIdx);
                    return;
                }
            }
            if (e.key === "Enter") {
                e.preventDefault();
                this._commitBuffer();
                this._disarm();
                this._closeSug();
            } else if (e.key === "Backspace" && this.input.value === "" && this.tags.length) {
                // İki aşamalı: önce arm (vurgula), tekrar Backspace → sil
                if (!this._armed) {
                    e.preventDefault();
                    this._arm();
                } else {
                    e.preventDefault();
                    this._removeTag(this.tags[this.tags.length - 1]);
                    this._disarm();
                }
            } else {
                this._disarm();
            }
        }

        _commitBuffer() {
            const v = this.input.value.trim();
            if (v) {
                if (this._tryAdd(v)) this.input.value = "";
            }
        }

        _arm() {
            this._armed = true;
            const last = this.tags[this.tags.length - 1];
            if (last) last.el.classList.add("is-armed");
        }

        _disarm() {
            if (!this._armed) return;
            this._armed = false;
            this.tags.forEach(t => t.el.classList.remove("is-armed"));
        }

        /** Doğrulama + ekleme. Başarılıysa true. */
        _tryAdd(value) {
            let v = value.trim();
            // Dönüşüm (commit'te uygula)
            if (this.transform === "lower") v = v.toLowerCase();
            else if (this.transform === "upper") v = v.toUpperCase();
            if (!v) return false;
            // Etiket başına maks. uzunluk
            if (this.maxLength != null && v.length > this.maxLength) { this._reject(); return false; }
            // İzinli desen (RegExp)
            if (this._pattern && !this._pattern.test(v)) { this._reject(); return false; }
            // Tekrar engeli (büyük/küçük harf duyarsız) — data-allow-dupes ile kapatılabilir
            if (!this.allowDupes) {
                const exists = this.tags.some(t => normalize(t.value) === normalize(v));
                if (exists) { this._reject(); return false; }
            }
            // Toplam adet sınırı
            if (this.tags.length >= this.max) { this._reject(); return false; }
            this._addTag(v, true);
            this._syncForm();
            return true;
        }

        _addTag(value, animate) {
            const chip = document.createElement("span");
            chip.className = "glint-tag";

            const label = document.createElement("span");
            label.className = "glint-tag__label";
            label.textContent = value;

            const x = document.createElement("button");
            x.type = "button";
            x.className = "glint-tag__remove";
            x.setAttribute("aria-label", value + " kaldır");
            x.innerHTML = ICON_X;

            chip.appendChild(label);
            chip.appendChild(x);

            // input'tan ÖNCE ekle (input her zaman en sonda kalsın)
            this.host.insertBefore(chip, this.input);

            const tag = { value, el: chip };
            this.tags.push(tag);

            // Sürükle-sırala başlatıcısı (kapalı/disabled ise pasif).
            // _addTag her zaman _bind'den SONRA çağrılır (kurucu: _build→_bind→_seedInitial),
            // bu yüzden this._ac mevcuttur; yine de guard'lı bağlanır.
            if (this.reorder && !this.disabled && this._ac) {
                chip.classList.add("is-draggable");
                chip.addEventListener("pointerdown", (e) => this._startDrag(e, tag), { signal: this._ac.signal });
            }

            if (animate && !prefersReduced) {
                chip.animate(
                    [
                        { transform: "scale(0.95)", opacity: 0 },
                        { transform: "scale(1)", opacity: 1 }
                    ],
                    { duration: 170, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" }
                );
            }

            this._updateFullState();
        }

        _removeTag(tag) {
            const idx = this.tags.indexOf(tag);
            if (idx === -1) return;
            this.tags.splice(idx, 1);

            const done = () => { tag.el.remove(); };
            if (!prefersReduced) {
                tag.el.animate(
                    [
                        { transform: "scale(1)", opacity: 1 },
                        { transform: "scale(0.95)", opacity: 0 }
                    ],
                    { duration: 150, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" }
                ).finished.then(done).catch(done);
            } else {
                done();
            }

            this._syncForm();
            this._updateFullState();
            this.input.focus();
        }

        // ── Sürükle-sırala ──────────────────────────────────────────

        /** Chip üzerinde basıldı → sürükleme adayı kur (eşik aşılınca aktifleşir). */
        _startDrag(e, tag) {
            // Yalnız sol tık / tek dokunuş; remove butonu sürüklemez; zaten süren sürükleme varsa yok say
            if (e.button != null && e.button !== 0) return;
            if (e.target.closest(".glint-tag__remove")) return;
            if (this.disabled || !this.reorder || this._drag) return;
            const el = tag.el;
            const rect = el.getBoundingClientRect();
            this._drag = {
                tag, el,
                startX: e.clientX, startY: e.clientY,
                dx: 0, dy: 0,
                w: rect.width, h: rect.height,
                active: false,
                pointerId: e.pointerId
            };
        }

        /** Eşik aşıldıysa sürüklemeyi aktifleştir + komşularla yer değiştir. */
        _onDragMove(e) {
            const d = this._drag;
            if (!d) return;
            // Yalnız sürüklemeyi başlatan pointer'ı dinle (çoklu dokunuş güvenliği)
            if (d.pointerId != null && e.pointerId !== d.pointerId) return;
            d.dx = e.clientX - d.startX;
            d.dy = e.clientY - d.startY;

            // 4px eşik: küçük titreşim/tıklama sürüklemeye dönüşmesin (click→remove korunur)
            if (!d.active) {
                if (Math.abs(d.dx) < 4 && Math.abs(d.dy) < 4) return;
                d.active = true;
                d.el.classList.add("is-dragging");
                this.host.classList.add("is-reordering");
                try { d.el.setPointerCapture(d.pointerId); } catch (_) {}
            }

            // Görsel takip
            d.el.style.transform = "translate(" + d.dx + "px, " + d.dy + "px)";

            // İmleç altındaki başka bir chip'i bul ve gerekiyorsa yer değiştir
            const x = e.clientX, y = e.clientY;
            const chips = this.tags.map(t => t.el);
            for (let i = 0; i < chips.length; i++) {
                const other = chips[i];
                if (other === d.el) continue;
                const r = other.getBoundingClientRect();
                if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
                    const before = (x < r.left + r.width / 2);
                    // v1.5.1 — Taşımadan ÖNCEKİ rect: insertBefore chip'in akış
                    // tabanını kaydırır; taban deltası bilinmeden tutuş ofseti
                    // korunamaz. (Eski kod baseLeft hesaplayıp üç kez üst üste
                    // startX = x - dx yazıyordu — cebirsel no-op → chip her yer
                    // değişiminde taban deltası kadar ışınlanıyordu.)
                    const or = d.el.getBoundingClientRect();
                    // Sürüklenen chip'i other'ın önüne/arkasına taşı (input her zaman en sonda kalır)
                    if (before) {
                        if (other.previousElementSibling !== d.el) {
                            this.host.insertBefore(d.el, other);
                        }
                    } else {
                        const ref = other.nextElementSibling;
                        if (ref !== d.el) {
                            this.host.insertBefore(d.el, ref);
                        }
                    }
                    // Taban deltası = (aynı transform uygulu) yeni rect − eski rect.
                    // startX/Y bu delta kadar kaydırılır → dx/dy yeni tabana göre
                    // yeniden hesaplanır ve chip imlecin altında kalır.
                    const nr = d.el.getBoundingClientRect();
                    d.startX += (nr.left - or.left);
                    d.startY += (nr.top - or.top);
                    d.dx = x - d.startX;
                    d.dy = y - d.startY;
                    d.el.style.transform = "translate(" + d.dx + "px, " + d.dy + "px)";
                    break;
                }
            }
            this._syncTagsToDom();
        }

        /** Sürüklemeyi bitir → pointer capture serbest, inline stil temizle, formu yaz. */
        _endDrag(e) {
            const d = this._drag;
            if (!d) return;
            if (e && e.pointerId != null && d.pointerId != null && e.pointerId !== d.pointerId) return;
            this._drag = null;
            try { d.el.releasePointerCapture(d.pointerId); } catch (_) {}
            d.el.style.transform = "";
            d.el.classList.remove("is-dragging");
            this.host.classList.remove("is-reordering");
            if (d.active) {
                this._syncTagsToDom();
                this._syncForm();
            }
        }

        /** this.tags dizisini DOM sırasına göre yeniden dizer (gizli input wrap'ı .glint-tag değil). */
        _syncTagsToDom() {
            const order = Array.from(this.host.querySelectorAll(".glint-tag"));
            this.tags.sort((a, b) => order.indexOf(a.el) - order.indexOf(b.el));
        }

        _reject() {
            if (prefersReduced) return;
            this.host.classList.remove("is-reject");
            void this.host.offsetWidth;
            this.host.classList.add("is-reject");
            this.host.addEventListener("animationend", () => {
                this.host.classList.remove("is-reject");
            }, { once: true });
        }

        _updateFullState() {
            this.host.classList.toggle("is-full", this.tags.length >= this.max);
        }

        /** Form değerini gizli input(lar)a yaz */
        _syncForm() {
            const values = this.tags.map(t => t.value);
            if (this.multi) {
                this.hiddenWrap.innerHTML = "";
                values.forEach(v => {
                    const inp = document.createElement("input");
                    inp.type = "hidden";
                    if (this.name) inp.name = this.name;
                    inp.value = v;
                    this.hiddenWrap.appendChild(inp);
                });
            } else if (this.hidden) {
                this.hidden.value = values.join(",");
            }
            // Dış dinleyiciler için olay
            this.host.dispatchEvent(new CustomEvent("glint:tagschange", {
                bubbles: true, detail: { values }
            }));
        }

        // ── Programatik API ─────────────────────────────────────────

        getValues() { return this.tags.map(t => t.value); }

        setValues(arr) {
            this.tags.slice().forEach(t => { t.el.remove(); });
            this.tags = [];
            (arr || []).forEach(v => this._addTag(String(v), false));
            this._syncForm();
            this._updateFullState();
        }

        add(value) { return this._tryAdd(String(value)); }

        clear() { this.setValues([]); }

        static get(el) {
            const h = el?.closest?.(".glint-tags") || el;
            return h?._glintTagsInstance || null;
        }
    }


    // ══════════════════════════════════════════════════════════════
    //  KAYIT — paylaşılan çekirdeğe (Glint.defineComponent)
    // ══════════════════════════════════════════════════════════════
    // Çekirdek (glint-input.js) henüz yüklenmemişse guard: API açılır
    // açılmaz veya DOMContentLoaded'da kaydolur. Modül KENDİ
    // MutationObserver'ını KURMAZ — tarama çekirdeğe aittir.

    function register() {
        const G = window.Glint;
        G.Select = GlintSelect;
        G.Tags = GlintTags;

        G.defineComponent("select", {
            selector: "select.glint-select",
            match: s => !s._glintSelectInit,
            mount: s => new GlintSelect(s)
        });

        G.defineComponent("tags", {
            selector: ".glint-tags",
            match: h => !h._glintTagsInit,
            mount: h => new GlintTags(h)
        });
    }

    // Çekirdek hazırsa hemen kaydol; değilse API'yi yine de aç ve
    // DOMContentLoaded'da çekirdek varsa kaydet.
    if (window.Glint && window.Glint.defineComponent) {
        register();
    } else {
        // En azından sınıfları erişilebilir kıl (çekirdek gelmese bile)
        window.Glint = window.Glint || {};
        window.Glint.Select = GlintSelect;
        window.Glint.Tags = GlintTags;
        document.addEventListener("DOMContentLoaded", () => {
            if (window.Glint && window.Glint.defineComponent) register();
        });
    }

})();


/* ════════════════════════════════════════════════════════════════════════
 *  4) Fields — OTP · Stepper · Mask
 *     (kaynak modül: glint-fields.js)
 * ════════════════════════════════════════════════════════════════════════ */
/**
 * Glint Fields v1.0
 * Saf vanilla, sıfır bağımlılık alan (field) bileşenleri.
 *
 * API:       window.Glint.Otp, window.Glint.Stepper
 * Selectors: .glint-otp,
 *            input.glint-stepper
 *
 * Bileşenler:
 *   1) Glint OTP / PIN     — N kutu + tam kodu tutan gizli <input> (form/asp-for).
 *   2) Glint Number Stepper — −/+ buton, basılı tutunca hızlanan tekrar, bump anim.
 *   (GlintMask v1.5.1'de kaldırıldı; biçimleme mantığı Glint.format'ta,
 *    telefon girişi v1.6'da ayrı paket olarak geliyor.)
 *
 * Tasarım imzası (kontrat): easing cubic-bezier(0.22,1,0.36,1), süre <300ms,
 *   sadece transform/opacity animasyonu, :active scale, focus-visible ring,
 *   dark mode [data-bs-theme="dark"], reduced-motion'da hareket kalkar.
 *
 * Çekirdek: kendi MutationObserver'ını KURMAZ; Glint.defineComponent ile
 *   kaydolur ve paylaşılan tarayıcıya güvenir. Glint henüz yoksa
 *   DOMContentLoaded'da kaydolur.
 */

(function () {
    "use strict";

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

    // ── YARDIMCILAR ──

    /** SVG ikon (stepper −/+) üretir. */
    function svgIcon(paths) {
        const ns = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(ns, "svg");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("fill", "none");
        svg.setAttribute("aria-hidden", "true");
        for (const d of paths) {
            const p = document.createElementNS(ns, "path");
            p.setAttribute("d", d);
            p.setAttribute("stroke", "currentColor");
            p.setAttribute("stroke-width", "2.2");
            p.setAttribute("stroke-linecap", "round");
            svg.appendChild(p);
        }
        return svg;
    }

    function clamp(n, min, max) {
        if (min != null && n < min) return min;
        if (max != null && n > max) return max;
        return n;
    }


    // ══════════════════════════════════════════════════════════════
    //  1) GlintOtp — OTP / PIN
    // ══════════════════════════════════════════════════════════════
    /**
     * Kullanım:
     *   <div class="glint-otp" data-length="6" data-type="number"
     *        data-name="otp" aria-label="Doğrulama kodu">
     *   </div>
     * JS: N adet tek-karakter display <input> + tam kodu tutan gizli
     *     <input name="otp"> enjekte eder. asp-for için root'a data-name
     *     veya zaten içte <input name=".."> verilebilir.
     */
    class GlintOtp {

        constructor(root) {
            if (root._glintOtpInit) return;
            root._glintOtpInit = true;
            root._glintOtpInstance = this;
            this.root = root;

            this.length = Math.max(1, parseInt(root.getAttribute("data-length"), 10) || 6);
            const dt = (root.getAttribute("data-type") || "number").toLowerCase();
            this.type = (dt === "text" || dt === "alnum") ? dt : "number";  // number | text | alnum
            this.uppercase = root.hasAttribute("data-uppercase");
            this.masked = root.hasAttribute("data-mask");
            // v1.5.1 — text tipinde boşluk artık VARSAYILAN dışı (yapıştırılan
            // "AB CD" hücreye boşluk yazıyordu); data-allow-space ile açılır.
            this._allowSpace = root.hasAttribute("data-allow-space");
            // v1.5.1 — kod tamamlanınca formu otomatik gönder (opt-in).
            this.autoSubmit = root.hasAttribute("data-autosubmit");
            this._lastComplete = null;
            this._groupRaw = (root.getAttribute("data-group") || "").trim();
            this.groupSize = parseInt(this._groupRaw, 10) || 0;
            // data-group="middle" → uzunluk çiftse TAM ortaya tek ayraç koy
            this.midSep = (this._groupRaw.toLowerCase() === "middle" && this.length % 2 === 0)
                ? this.length / 2 : 0;

            this.cells = [];
            this._build();
            this._bind();
            window.Glint.register(root, this);
            this._setupWebOtp();
        }

        /** Web OTP API — destekleyen mobil tarayıcıda SMS kodunu otomatik doldur. */
        _setupWebOtp() {
            if (this.type === "text") return;          // SMS OTP genelde sayısal/alnum
            if (!("OTPCredential" in window) || !navigator.credentials) return;
            try {
                this._otpAbort = new AbortController();
                navigator.credentials.get({
                    otp: { transport: ["sms"] },
                    signal: this._otpAbort.signal
                }).then(cred => {
                    // v1.5.1 — SMS başka bir alanda yazarken gelirse sayfanın
                    // odağını ÇALMASIN; yalnız odak zaten OTP'deyse ilerlet.
                    if (cred && cred.code) {
                        this._distribute(cred.code, 0, {
                            focus: this.root.contains(document.activeElement)
                        });
                    }
                }).catch(() => { /* iptal / desteksiz → sessiz */ });
            } catch (_) { /* sessiz */ }
        }

        _build() {
            const root = this.root;

            // Gizli form input'u (tam kod). Varsa mevcut <input>'u kullan,
            // yoksa data-name'den üret → asp-for / model binding çalışır.
            this.hidden = root.querySelector("input[type='hidden']");
            if (!this.hidden) {
                this.hidden = document.createElement("input");
                this.hidden.type = "hidden";
                const name = root.getAttribute("data-name");
                if (name) this.hidden.name = name;
                root.appendChild(this.hidden);
                this._ownHidden = true;
            }
            // Önceden bir değer varsa kutulara dağıt.
            // v1.5.1 — sunucudan gelen değer de sanitize edilir: "12 45" gibi
            // ham değer hücrelere olduğu gibi inip hidden'a geri yazılıyordu.
            const initial = (this.hidden.value || "").split("")
                .map(c => this._sanitize(c))
                .filter(c => c !== "" && (c !== " " || this._allowSpace))
                .slice(0, this.length);

            // v1.5.1 — Doğrulama kodları evrensel olarak LTR okunur; RTL
            // sayfada flex sırası ters dönüp ok tuşları/auto-advance görsel
            // olarak tersine işliyordu. Bileşen kendini LTR'ye sabitler.
            if (!root.hasAttribute("dir")) root.setAttribute("dir", "ltr");

            // ARIA — grup rolü
            if (!root.hasAttribute("role")) root.setAttribute("role", "group");
            if (!root.hasAttribute("aria-label") && !root.hasAttribute("aria-labelledby")) {
                root.setAttribute("aria-label", this.type === "number" ? "Tek kullanımlık kod" : "Doğrulama kodu");
            }
            // v1.5.1 — hücre etiketi i18n şablonu: data-label-cell="Digit {n}/{len}"
            this._cellLabel = root.getAttribute("data-label-cell") || "{n}. hane";

            for (let i = 0; i < this.length; i++) {
                const needSep = (this.groupSize && i > 0 && i % this.groupSize === 0)
                    || (this.midSep && i === this.midSep);
                if (needSep) {
                    const sep = document.createElement("span");
                    sep.className = "glint-otp-sep";
                    sep.setAttribute("aria-hidden", "true");
                    root.appendChild(sep);
                }
                const cell = document.createElement("input");
                cell.className = "glint-otp-cell";
                cell.type = this.masked ? "password" : (this.type === "number" ? "tel" : "text");
                // inputmode=numeric varsayılan (number tipinde)
                cell.setAttribute("inputmode", this.type === "number" ? "numeric" : "text");
                cell.setAttribute("autocomplete", i === 0 ? "one-time-code" : "off");
                cell.setAttribute("maxlength", "1");
                cell.setAttribute("aria-label",
                    this._cellLabel.replace("{n}", String(i + 1)).replace("{len}", String(this.length)));
                cell.setAttribute("data-index", String(i));
                // v1.5.1 — mobil klavye hijyeni: yazım denetimi/otomatik
                // düzeltme/büyük harf önerisi kod girişinde devre dışı.
                cell.setAttribute("spellcheck", "false");
                cell.setAttribute("autocorrect", "off");
                cell.setAttribute("autocapitalize", this.uppercase ? "characters" : "off");
                if (root.hasAttribute("disabled")) cell.disabled = true;
                if (initial[i] != null && initial[i] !== "") {
                    cell.value = initial[i];
                    cell.classList.add("glint-otp-cell--filled");
                }
                root.appendChild(cell);
                this.cells.push(cell);
            }

            this._syncHidden(false);
        }

        _bind() {
            this._ac = new AbortController();
            const sig = { signal: this._ac.signal };
            this.cells.forEach((cell, i) => {
                cell.addEventListener("input", (e) => this._onInput(e, i), sig);
                cell.addEventListener("keydown", (e) => this._onKeydown(e, i), sig);
                cell.addEventListener("focus", () => this._onFocus(i), sig);
                cell.addEventListener("blur", () => cell.classList.remove("glint-otp-cell--active"), sig);
                cell.addEventListener("paste", (e) => this._onPaste(e, i), sig);
            });
        }

        /** Yaşam döngüsü teardown. */
        destroy() {
            if (this._ac) { this._ac.abort(); this._ac = null; }
            if (this._otpAbort) { this._otpAbort.abort(); this._otpAbort = null; }
            this.cells.forEach(c => c.remove());
            this.cells = [];
            this.root.querySelectorAll(".glint-otp-sep").forEach(s => s.remove());
            if (this._liveEl) { this._liveEl.remove(); this._liveEl = null; }
            if (this._ownHidden) this.hidden?.remove();
            this.root._glintOtpInit = false;
            this.root._glintOtpInstance = null;
            window.Glint.unregister(this.root);
        }

        _onFocus(i) {
            const cell = this.cells[i];
            cell.classList.add("glint-otp-cell--active");
            // Odaklanınca içeriği seç → üzerine yazma kolay
            requestAnimationFrame(() => { try { cell.select(); } catch (_) { } });
        }

        _sanitize(ch) {
            if (this.type === "number") return /\d/.test(ch) ? ch : "";
            if (this.type === "alnum") {
                if (!/[a-zA-Z0-9]/.test(ch)) return "";
                return this.uppercase ? ch.toUpperCase() : ch;
            }
            return ch;
        }

        _onInput(e, i) {
            const cell = this.cells[i];
            let v = cell.value;

            // Birden fazla karakter geldiyse (autofill/IME) → dağıt
            if (v.length > 1) {
                this._distribute(v, i);
                return;
            }

            v = this._sanitize(v);
            cell.value = v;

            if (v) {
                this._pop(cell);
                cell.classList.add("glint-otp-cell--filled");
                // Otomatik sonraki kutuya geç
                if (i < this.length - 1) this.cells[i + 1].focus();
            } else {
                cell.classList.remove("glint-otp-cell--filled");
            }
            this._clearError();
            this._syncHidden(true);
        }

        _onKeydown(e, i) {
            const cell = this.cells[i];
            switch (e.key) {
                case "Backspace":
                    if (!cell.value && i > 0) {
                        // Boş kutuda backspace → öncekine git ve sil
                        e.preventDefault();
                        const prev = this.cells[i - 1];
                        prev.value = "";
                        prev.classList.remove("glint-otp-cell--filled");
                        prev.focus();
                        this._syncHidden(true);
                    } else if (cell.value) {
                        // Dolu kutuyu temizle (default davranış + sync)
                        // input event zaten tetiklenecek
                    }
                    break;
                case "Delete":
                    cell.value = "";
                    cell.classList.remove("glint-otp-cell--filled");
                    this._syncHidden(true);
                    break;
                case "ArrowLeft":
                    e.preventDefault();
                    if (i > 0) this.cells[i - 1].focus();
                    break;
                case "ArrowRight":
                    e.preventDefault();
                    if (i < this.length - 1) this.cells[i + 1].focus();
                    break;
                case "Home":
                    e.preventDefault();
                    this.cells[0].focus();
                    break;
                case "End":
                    e.preventDefault();
                    this.cells[this.length - 1].focus();
                    break;
                default:
                    // number tipinde rakam dışı tuşları engelle (yön/kontrol hariç)
                    if (this.type === "number" && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                        if (!/\d/.test(e.key)) e.preventDefault();
                    }
            }
        }

        _onPaste(e, i) {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData("text") || "";
            this._distribute(text, i);
        }

        /**
         * Yapıştırılan/çoklu metni kutulara i'den itibaren dağıtır.
         * v1.5.1 — ÖNCE sanitize, SONRA dağıt: "AB1-2C3" gibi ayraçlı kodda
         * tire/boşluk hem hücre yakıyor hem hedef hücreyi siliyordu (son
         * karakter düşüyordu). opts.focus=false → programatik set / WebOTP
         * sayfa odağını çalmaz.
         */
        _distribute(text, startIndex, opts) {
            const doFocus = !opts || opts.focus !== false;
            const chars = String(text).split("")
                .map(c => this._sanitize(c))
                .filter(c => c !== "" && (c !== " " || this._allowSpace));

            let idx = startIndex;
            for (let k = 0; k < chars.length && idx < this.length; k++, idx++) {
                const cell = this.cells[idx];
                cell.value = chars[k];
                cell.classList.add("glint-otp-cell--filled");
                this._pop(cell);
            }
            if (doFocus) {
                // İlk boş kutuya ya da sona odaklan
                const focusIdx = Math.min(idx, this.length - 1);
                this.cells[focusIdx].focus();
            }
            this._clearError();
            this._syncHidden(true);
        }

        _pop(cell) {
            if (prefersReduced) return;
            cell.classList.remove("glint-otp-cell--pop");
            void cell.offsetWidth;
            cell.classList.add("glint-otp-cell--pop");
            cell.addEventListener("animationend", () => {
                cell.classList.remove("glint-otp-cell--pop");
            }, { once: true });
        }

        /** Kutulardan tam kodu derler, gizli input'a yazar, event fırlatır. */
        _syncHidden(fireEvent) {
            const code = this.cells.map(c => c.value || "").join("");
            this.hidden.value = code;
            // v1.5.1 — kod eksildiğinde complete-dedup sıfırlanır
            if (code.length < this.length) this._lastComplete = null;
            if (fireEvent) {
                this.hidden.dispatchEvent(new Event("input", { bubbles: true }));
                this.hidden.dispatchEvent(new Event("change", { bubbles: true }));
                // v1.5.1 — dedup: kod doluyken tek hane değiştirmek her input'ta
                // otp-complete'i YENİDEN ateşliyordu (sunucu doğrulaması olan
                // dinleyiciler mükerrer istek atıyordu). Aynı kod bir kez.
                if (code.length === this.length && code !== this._lastComplete) {
                    this._lastComplete = code;
                    this.root.dispatchEvent(new CustomEvent("glint:otp-complete", {
                        bubbles: true, detail: { value: code }
                    }));
                    // v1.5.1 — data-autosubmit: formu native doğrulamaya saygılı
                    // biçimde gönder (requestSubmit yoksa submit fallback).
                    if (this.autoSubmit) {
                        const form = this.root.closest("form");
                        if (form) {
                            if (typeof form.requestSubmit === "function") form.requestSubmit();
                            else form.submit();
                        }
                    }
                }
            }
        }

        // ── Programatik API ──

        get value() { return this.cells.map(c => c.value || "").join(""); }

        set value(v) {
            this.clear();
            // v1.5.1 — programatik set sayfa odağını çalmaz
            this._distribute(String(v || ""), 0, { focus: false });
        }

        clear() {
            this.cells.forEach(c => {
                c.value = "";
                c.classList.remove("glint-otp-cell--filled");
            });
            this._clearError();
            this._syncHidden(false);
        }

        focus() { this.cells[0]?.focus(); }

        /**
         * v1.5.1 — setError(message?) artık ekran okuyucuya da konuşur:
         * hücrelere aria-invalid basılır, mesaj varsa görünmez aria-live
         * bölgesinden duyurulur (eskiden hata tamamen görseldi).
         */
        setError(message) {
            this.root.classList.add("glint-otp--error");
            this.cells.forEach(c => c.setAttribute("aria-invalid", "true"));
            if (message) {
                if (!this._liveEl) {
                    this._liveEl = document.createElement("div");
                    this._liveEl.className = "glint-sr-only";
                    this._liveEl.setAttribute("aria-live", "assertive");
                    this.root.appendChild(this._liveEl);
                }
                this._liveEl.textContent = message;
            }
            if (!prefersReduced) {
                this.root.classList.remove("glint-otp--shake");
                void this.root.offsetWidth;
                this.root.classList.add("glint-otp--shake");
                this.root.addEventListener("animationend", () => {
                    this.root.classList.remove("glint-otp--shake");
                }, { once: true });
            }
        }

        _clearError() {
            this.root.classList.remove("glint-otp--error");
            this.cells.forEach(c => c.removeAttribute("aria-invalid"));
            if (this._liveEl) this._liveEl.textContent = "";
        }
        clearError() { this._clearError(); }

        static _instance(el) {
            const root = el?.closest?.(".glint-otp");
            return root?._glintOtpInstance || null;
        }
    }


    // ══════════════════════════════════════════════════════════════
    //  2) GlintStepper — Number Stepper
    // ══════════════════════════════════════════════════════════════
    /**
     * Kullanım (tercihen .glint-input-group içinde; GlintInput de çalışır):
     *   <div class="glint-input-group">
     *     <input type="number" class="glint-stepper glint-input"
     *            min="0" max="10" step="1" value="1">
     *     <label class="glint-label">Adet</label>
     *   </div>
     * Grup CLAIM EDİLMEZ. −/+ butonları input'un yanına enjekte edilir.
     * Basılı tutunca hızlanan tekrar; rakam değişiminde translateY bump.
     */
    class GlintStepper {

        constructor(input) {
            if (input._glintStepperInit) return;
            input._glintStepperInit = true;
            input._glintStepperInstance = this;
            this.input = input;
            this.group = input.closest(".glint-input-group") || input.parentElement;

            this.min = input.hasAttribute("min") ? parseFloat(input.min) : null;
            this.max = input.hasAttribute("max") ? parseFloat(input.max) : null;
            this.step = parseFloat(input.step) || 1;
            // Ondalık hane sayısı (step'e göre yuvarlama için)
            this.decimals = (String(this.step).split(".")[1] || "").length;

            this._repeatTimer = null;
            this._repeatRAF = null;
            this._didRepeat = false;

            // v1.5.1 — inputmode güvencesi: çekirdekteki genel type=number→
            // numeric kuralı kaldırıldı; stepper mobil sayısal klavyeyi
            // kendisi garanti eder (mevcut attribute asla ezilmez).
            if (!input.hasAttribute("inputmode")) input.setAttribute("inputmode", "numeric");

            this._build();
            this._bind();
            this._updateButtons();
            window.Glint.register(input, this);
        }

        _build() {
            if (this.group) this.group.classList.add("glint-input-group--stepper");

            this.btnMinus = this._makeButton("minus");
            this.btnPlus = this._makeButton("plus");

            // − solda, + sağda; input'u ortala
            this.input.insertAdjacentElement("beforebegin", this.btnMinus);
            this.input.insertAdjacentElement("afterend", this.btnPlus);

            // Buton enjeksiyonu input'u SAĞA kaydırır ama genişliğini
            // değiştirmez; GlintInput yalnız input'u gözleyen ResizeObserver'ı
            // tetiklenmeyebilir → .glint-char-overlay eski X konumunda kalıp
            // native metinle çakışır. Yükleme sırası (input.js önce, fields.js
            // sonra) bunu garanti eder. Çözüm: layout oturduktan sonra
            // GlintInput örneğine overlay'i yeniden kilitlemesini söyle.
            this._resyncOverlay();
        }

        /** Stepper layout'u değiştirdiğinde GlintInput overlay'ini resync eder. */
        _resyncOverlay() {
            const apply = () => {
                const inst = (this.group && this.group._glintInstance) || null;
                if (inst && typeof inst.rebuildSVG === "function") {
                    try { inst.rebuildSVG(); } catch (_) { }
                }
            };
            // İki rAF: ilk frame'de buton genişlikleri/flex yerleşir, ikincide
            // getBoundingClientRect kararlı okunur.
            requestAnimationFrame(() => requestAnimationFrame(apply));
        }

        _makeButton(kind) {
            const btn = document.createElement("button");
            btn.type = "button"; // form submit etmesin
            btn.className = "glint-stepper-btn glint-stepper-btn--" + kind;
            btn.setAttribute("aria-label", kind === "plus" ? "Artır" : "Azalt");
            btn.tabIndex = -1; // klavye: ok tuşları native input üzerinde
            btn.appendChild(kind === "plus"
                ? svgIcon(["M12 5 V19", "M5 12 H19"])
                : svgIcon(["M5 12 H19"]));
            if (this.input.disabled) btn.disabled = true;
            return btn;
        }

        _bind() {
            this._ac = new AbortController();
            const sig = { signal: this._ac.signal };
            // Tek tık — click bırakışta (pointerup SONRASI) geldiği için,
            // basılı-tut tekrarı çalıştıysa bu click fantom +1 üretiyordu;
            // _didRepeat bayrağı o son adımı yutar (v1.5.1).
            const onClick = (dir) => {
                if (this._didRepeat) { this._didRepeat = false; return; }
                this._nudge(dir);
            };
            this.btnMinus.addEventListener("click", () => onClick(-1), sig);
            this.btnPlus.addEventListener("click", () => onClick(1), sig);

            // Basılı tutma (pointer) — hızlanan tekrar
            this._bindHold(this.btnMinus, -1, sig);
            this._bindHold(this.btnPlus, 1, sig);

            // Native değer değişince butonları (min/max sınır) güncelle
            this.input.addEventListener("input", () => this._updateButtons(), sig);
            // v1.5.1 — change'de (blur/Enter) elle yazılan değeri min/max'a
            // kıstır ve step ızgarasına yuvarla; eskiden max=10'ken 999
            // olduğu gibi kalıyordu.
            this.input.addEventListener("change", () => {
                this._clampTyped();
                this._updateButtons();
            }, sig);

            // v1.5.1 — runtime'da input.disabled/min/max değişirse butonlar ve
            // sınırlar senkron kalsın (attribute değişimi event üretmez).
            this._mo = new MutationObserver(() => {
                this.min = this.input.hasAttribute("min") ? parseFloat(this.input.min) : null;
                this.max = this.input.hasAttribute("max") ? parseFloat(this.input.max) : null;
                this._updateButtons();
            });
            this._mo.observe(this.input, { attributes: true, attributeFilter: ["disabled", "min", "max"] });
        }

        /** Elle yazılan değeri sınırlara/step'e oturt (change anında). */
        _clampTyped() {
            const cur = parseFloat(this.input.value);
            if (isNaN(cur)) return;
            let c = clamp(this._round(cur), this.min, this.max);
            // Step ızgarası (min tabanlı); ör. min=0 step=5 iken 13 → 15
            if (this.step > 0) {
                const base = this.min != null ? this.min : 0;
                c = clamp(this._round(base + Math.round((c - base) / this.step) * this.step), this.min, this.max);
            }
            if (c !== cur) {
                this.input.value = c;
                this.input.dispatchEvent(new Event("input", { bubbles: true }));
            }
        }

        /** Yaşam döngüsü teardown. */
        destroy() {
            if (this._ac) { this._ac.abort(); this._ac = null; }
            if (this._mo) { this._mo.disconnect(); this._mo = null; }
            this._stopRepeat();
            this.btnMinus?.remove();
            this.btnPlus?.remove();
            this.group?.classList.remove("glint-input-group--stepper");
            this.input._glintStepperInit = false;
            this.input._glintStepperInstance = null;
            window.Glint.unregister(this.input);
        }

        _bindHold(btn, dir, sig) {
            // Pointer capture aktifken pointerleave ile DURMA.
            // Aksi halde basılı tutarken imleç/parmak butonun kenarından biraz
            // kayınca erkenden durur ve capture'ın amacı (dışarı çıksa da yakala)
            // boşa gider. Capture alındığında bayrağı set et; durdurmayı yalnız
            // pointerup/pointercancel'a bağla. pointerleave yalnız capture
            // YOKSA (fallback) durdurur.
            let captured = false;
            let capturedId = null;

            const start = (e) => {
                if (btn.disabled) return;
                // Sadece birincil işaretçi/dokunma
                if (e.type === "pointerdown" && e.button !== 0) return;
                this._startRepeat(dir);
                // pointer capture: parmak/imleç dışarı çıksa da bitiş yakalanır
                captured = false;
                capturedId = null;
                if (e.pointerId != null && btn.setPointerCapture) {
                    try {
                        btn.setPointerCapture(e.pointerId);
                        captured = true;
                        capturedId = e.pointerId;
                    } catch (_) { captured = false; }
                }
            };
            const stop = () => {
                this._stopRepeat();
                if (captured && capturedId != null && btn.releasePointerCapture) {
                    try { btn.releasePointerCapture(capturedId); } catch (_) { }
                }
                captured = false;
                capturedId = null;
            };
            btn.addEventListener("pointerdown", start, sig);
            btn.addEventListener("pointerup", stop, sig);
            btn.addEventListener("pointercancel", stop, sig);
            // pointerleave yalnız capture YOKSA durdurur (eski/fallback davranış).
            btn.addEventListener("pointerleave", () => { if (!captured) this._stopRepeat(); }, sig);
            // Erişilebilirlik: klavye Enter/Space ile basılı tutma yok,
            // tek nudge click event'i hallediyor.
        }

        _startRepeat(dir) {
            this._stopRepeat();
            this._didRepeat = false;
            // İlk adım bırakıştaki click'ten gelir (kısa basış); tekrar
            // gecikmeli başlar. Tekrar ÇALIŞTIYSA _didRepeat=true → bırakışta
            // gelen click yutulur (fantom adım düzeltmesi, v1.5.1).
            let delay = 380;       // ilk tekrar gecikmesi
            const minDelay = 45;   // en hızlı
            const accel = 0.82;    // her turda hızlan
            const tick = () => {
                this._didRepeat = true;
                const changed = this._nudge(dir);
                // Sınıra dayandıysak boşa tıklamaya devam etme (v1.5.1)
                if (!changed) { this._repeatTimer = null; return; }
                delay = Math.max(minDelay, delay * accel);
                this._repeatTimer = setTimeout(tick, delay);
            };
            this._repeatTimer = setTimeout(tick, delay);
        }

        _stopRepeat() {
            if (this._repeatTimer) { clearTimeout(this._repeatTimer); this._repeatTimer = null; }
        }

        _round(n) {
            // step'e göre yuvarla (kayan nokta hatalarını temizle)
            if (this.decimals > 0) return parseFloat(n.toFixed(this.decimals));
            return Math.round(n);
        }

        _nudge(dir) {
            const cur = parseFloat(this.input.value);
            const base = isNaN(cur) ? (this.min != null ? this.min : 0) : cur;
            let next = this._round(base + dir * this.step);
            next = clamp(next, this.min, this.max);
            if (next === cur) { this._updateButtons(); return false; }

            // v1.5.1 — Sentetik input eventi beforeinput ÜRETMEZ: GlintInput'un
            // savedRects anlık görüntüsü bayat kalıyor ve çıkış ghost'ları
            // yanlış koordinattan uçabiliyordu. Değeri değiştirmeden önce
            // snapshot'ı elle tetikle (GlintInput yoksa sıfır maliyet).
            const inst = this.group && this.group._glintInstance;
            if (inst && typeof inst.onBeforeInput === "function") {
                try { inst.onBeforeInput(); } catch (_) { }
            }

            this.input.value = next;
            this._bump(dir);
            this._updateButtons();
            // GlintInput overlay'i + form validasyon için input/change yay
            this.input.dispatchEvent(new Event("input", { bubbles: true }));
            this.input.dispatchEvent(new Event("change", { bubbles: true }));
            return true;
        }

        _bump(dir) {
            if (prefersReduced) return;
            // Artarken yukarıdan, azalırken aşağıdan kayar
            this.input.style.setProperty("--glint-stepper-bump-dir", dir > 0 ? "22%" : "-22%");
            this.input.classList.remove("glint-stepper--bump");
            void this.input.offsetWidth;
            this.input.classList.add("glint-stepper--bump");
            this.input.addEventListener("animationend", () => {
                this.input.classList.remove("glint-stepper--bump");
                // Bump, input'a transform uygular; overlay takip etmez.
                // Animasyon bitince input rect'i tekrar nötr; overlay'i resync et
                // ki hızlı ardışık tıklamada birikmiş desync kalmasın.
                this._resyncOverlay();
            }, { once: true });
        }

        _updateButtons() {
            const cur = parseFloat(this.input.value);
            const disabled = this.input.disabled;
            const atMin = !disabled && this.min != null && !isNaN(cur) && cur <= this.min;
            const atMax = !disabled && this.max != null && !isNaN(cur) && cur >= this.max;
            this.btnMinus.disabled = disabled || atMin;
            this.btnPlus.disabled = disabled || atMax;
        }

        // ── Programatik API ──
        get value() { return parseFloat(this.input.value); }
        set value(v) {
            const n = parseFloat(v);
            // v1.5.1 — NaN guard: eskiden `s.value = undefined` input'a
            // literal "NaN" yazıyordu (type=number bunu boşa çevirir ama
            // görsel/valite karmaşası doğar). Geçersiz girdi alanı temizler.
            this.input.value = isNaN(n) ? "" : clamp(this._round(n), this.min, this.max);
            this._updateButtons();
            this.input.dispatchEvent(new Event("input", { bubbles: true }));
            this.input.dispatchEvent(new Event("change", { bubbles: true }));
        }
        stepUp() { this._nudge(1); }
        stepDown() { this._nudge(-1); }

        static _instance(el) {
            const inp = el?.closest?.(".glint-input-group")?.querySelector?.("input.glint-stepper") || el;
            return inp?._glintStepperInstance || null;
        }
    }


    // ══════════════════════════════════════════════════════════════
    //  3) GlintMask — v1.5.1'de KALDIRILDI (ölü kod temizliği)
    // ══════════════════════════════════════════════════════════════
    // Sınıf v1.5'te kayıttan çıkarılmıştı (dormant); ~230 satır bundle'da
    // boşuna taşınıyordu. Biçimleme/caret mantığı Glint.format'ta yaşıyor;
    // ülke-maskeli telefon girişi v1.6'da AYRI paket (glint-phone) olarak
    // gelecek. Eski uygulama gerekirse git geçmişinde: v1.5.0 etiketi.


    // ══════════════════════════════════════════════════════════════
    //  GlintFormat — Mask'tan damıtılan yeniden kullanılabilir biçimleyiciler
    // ══════════════════════════════════════════════════════════════
    // Binlik ayraç + caret koruma. Mask bileşeni v1.5'te kaldırıldı; bu saf
    // fonksiyonlar Faz 2 "binlik-ayraç input" özelliği ve ileride AYRI telefon
    // paketi tarafından kullanılacak (test edilmiş mantık kaybolmasın).
    const GlintFormat = {
        /** Tamsayı → TR binlik ayraçlı: "1234567" → "1.234.567". */
        thousands(intStr, sep) {
            const s = String(intStr == null ? "" : intStr).replace(/\D/g, "");
            return s.replace(/\B(?=(\d{3})+(?!\d))/g, sep || ".");
        },
        /**
         * Yeniden biçimlenen input'ta caret'i "anlamlı karakter" sayısına göre
         * korur (grup ayracı/sembol sayım dışı). → yeni caret konumu döndürür.
         */
        restoreCaret(oldValue, oldCaret, newValue, valueRe) {
            const re = valueRe || /[0-9A-Za-z]/;
            const before = String(oldValue).slice(0, oldCaret);
            let significant = 0;
            for (let k = 0; k < before.length; k++) if (re.test(before[k])) significant++;
            let count = 0, pos = 0;
            while (pos < newValue.length && count < significant) {
                if (re.test(newValue[pos])) count++;
                pos++;
            }
            return pos;
        }
    };
    window.Glint = window.Glint || {};
    window.Glint.format = window.Glint.format || GlintFormat;


    // ══════════════════════════════════════════════════════════════
    //  ÇEKİRDEĞE KAYIT (Glint.defineComponent) + API
    // ══════════════════════════════════════════════════════════════

    function register() {
        const G = window.Glint;

        // 1) OTP / PIN
        G.defineComponent("otp", {
            selector: ".glint-otp",
            match: el => !el._glintOtpInit,
            mount: el => new GlintOtp(el)
        });

        // 2) Number Stepper — grubu CLAIM ETMEZ; GlintInput de çalışır.
        G.defineComponent("stepper", {
            selector: "input.glint-stepper",
            match: el => !el._glintStepperInit,
            mount: el => new GlintStepper(el)
        });

        // 3) Masked Input — v1.5'te KALDIRILDI (kullanıcı isteği, "şu anlık").
        //    Kayıt yok → hiçbir elemana mount olmaz; G.Mask API'si de kaldırıldı.
        //    Biçimleme/caret mantığı Glint.format'a damıtıldı (aşağıda). Geri
        //    almak için bu bloğu ve G.Mask'ı yeniden eklemek yeterli.

        // Programatik API
        G.Otp = GlintOtp;
        G.Stepper = GlintStepper;
    }

    // Güvenli yükleme-sırası guard'ı: çekirdek (glint-input.js) önce
    // yüklenmiş olmalı. Değilse DOMContentLoaded'da tekrar dene.
    if (window.Glint && window.Glint.defineComponent) {
        register();
    } else {
        document.addEventListener("DOMContentLoaded", function onReady() {
            if (window.Glint && window.Glint.defineComponent) register();
        });
    }

})();


/* ════════════════════════════════════════════════════════════════════════
 *  5) Slider & Range
 *     (kaynak modül: glint-slider.js)
 * ════════════════════════════════════════════════════════════════════════ */
/**
 * Glint Slider / Range Library v1.0
 * ─────────────────────────────────────────────────────────────
 * glint-input.js çekirdeğinin (Glint.defineComponent) uzantısı.
 * Sıfır bağımlılık, saf vanilla. İki bileşen sağlar:
 *
 *   1) Glint.Slider — native <input type="range" class="glint-slider">
 *      stilize eder. ARIA & klavye native'den gelir; JS yalnızca
 *      sol dolgu yüzdesini (--glint-fill-pct) ve değer balonunu yönetir.
 *
 *   2) Glint.Range — çift uçlu (aralık) kaydırıcı.
 *      <div class="glint-slider glint-slider--range"
 *           data-min data-max data-from data-to data-step>
 *      İki thumb, aralarında fill, iki gizli native range input
 *      (from/to) ile form senkronu (asp-for dostu). Pointer capture
 *      ile drag (dokunmatik dahil), ok tuşlarıyla seçili thumb hareketi,
 *      thumb'lar birbirini geçemez. role=slider + aria-valuenow/min/max/text.
 *
 * Animasyon: yalnızca transform/opacity. Fill `transform: translateX+scaleX`,
 * thumb `transform: translateX` (layout-thrash YOK). Easing imzaları
 * CSS değişkenlerinden (--glint-slider-ease-*).
 *
 * Kayıt: Glint.defineComponent ile çekirdeğe bağlanır; modül KENDİ
 * MutationObserver'ını kurmaz. Çekirdek yoksa DOMContentLoaded guard'ı.
 *
 * Sınırlamalar (v1):
 *   - Tek/çift dışında çok-thumb (3+) yok.
 *   - Dikey (vertical) yönelim yok.
 *   - İşaretli (tick) ölçek/etiket yok.
 */

(function () {
    "use strict";

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── YARDIMCILAR ──────────────────────────────────────────────

    function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

    function num(value, fallback) {
        const n = parseFloat(value);
        return Number.isFinite(n) ? n : fallback;
    }

    // step'e yuvarla; min ofsetli grid üzerinde.
    function snap(value, min, max, step) {
        if (!(step > 0)) return clamp(value, min, max);
        const snapped = Math.round((value - min) / step) * step + min;
        // Kayan-nokta artığını step'in ondalık hassasiyetine göre temizle.
        const decimals = (String(step).split(".")[1] || "").length;
        const fixed = decimals ? parseFloat(snapped.toFixed(decimals)) : snapped;
        return clamp(fixed, min, max);
    }

    // 0..1 normalleştirilmiş oran.
    function ratio(value, min, max) {
        if (max === min) return 0;
        return clamp((value - min) / (max - min), 0, 1);
    }


    // ══════════════════════════════════════════════════════════════
    //  GlintSlider — tekli native input[type=range]
    // ══════════════════════════════════════════════════════════════

    class GlintSlider {

        constructor(input) {
            if (input._glintSliderInit) return;
            input._glintSliderInit = true;
            input._glintSliderInstance = this;
            window.Glint.register(input, this);
            this.input = input;

            // Native min/max/step (yoksa makul varsayılan)
            this.min = num(input.min, 0);
            this.max = num(input.max, 100);
            this.step = num(input.step, 1);
            // v1.5: balon değer biçimi (prefix/suffix/binlik)
            this.prefix = input.getAttribute("data-prefix") || "";
            this.suffix = input.getAttribute("data-suffix") || "";
            this.fmtThousands = input.getAttribute("data-format") === "thousands";
            // Dikey yön: data-orientation="vertical" → CSS sınıfı + render ekseni
            this.vertical = input.getAttribute("data-orientation") === "vertical";

            // v1.5: işaretler (marks). data-marks="0,25,50,75,100" | "step"/"auto".
            // data-mark-labels="a,b,c" (sırayla, opsiyonel). _parseMarks doldurur.
            // (min/max/step yukarıda zaten set edildi — _parseMarks onları kullanır.)
            this.marks = this._parseMarks(
                input.getAttribute("data-marks"),
                input.getAttribute("data-mark-labels")
            );

            // thumb-size'ı bir kez oku (her render'da getComputedStyle pahalı).
            this.thumbSize = num(
                getComputedStyle(input).getPropertyValue("--glint-slider-thumb-size"),
                20
            );

            this._build();
            this._bind();
            this._render();
        }

        _build() {
            const input = this.input;

            // Balon için input'u .glint-slider-wrap ile sar (DOM'da kalır).
            if (input.parentElement &&
                input.parentElement.classList.contains("glint-slider-wrap")) {
                this.wrap = input.parentElement;
                this._ownWrap = false;
            } else {
                this.wrap = document.createElement("div");
                this.wrap.className = "glint-slider-wrap";
                input.insertAdjacentElement("beforebegin", this.wrap);
                this.wrap.appendChild(input);
                this._ownWrap = true;   // v1.5.1 — destroy'da geri sarılacak
            }

            // Dikey modda sarmalayıcı + native input'a sınıf ekle (CSS yönü çevirir).
            if (this.vertical) {
                this.wrap.classList.add("glint-slider-wrap--vertical");
                input.classList.add("glint-slider--vertical");
            }

            // Balon HER ZAMAN oluşturulur — reduced-motion'da yalnız animasyon
            // kapanır, değer GÖRÜNÜR kalır (analizdeki "reduced-motion'da değer
            // kayboluyor" hatasının düzeltmesi). Statik modda hep görünür.
            this.bubble = document.createElement("div");
            this.bubble.className = "glint-slider__bubble";
            this.bubble.setAttribute("aria-hidden", "true");
            if (prefersReduced) this.bubble.classList.add("glint-slider__bubble--static");
            this.wrap.appendChild(this.bubble);

            // İşaret katmanı (varsa) — wrap içine, salt görsel (pointer-events kapalı).
            this._buildMarks();
        }

        // İşaret katmanını oluştur. this.marks boşsa hiçbir şey yapmaz.
        // Her işaret oranı (--glint-mark-r) CSS değişkeniyle konumlanır; böylece
        // genişlik değişiminde JS re-render gerekmez (CSS calc ile uyar).
        _buildMarks() {
            if (!this.marks || !this.marks.length) return;
            const layer = document.createElement("div");
            layer.className = "glint-slider__marks";
            layer.setAttribute("aria-hidden", "true");
            this.marks.forEach(m => {
                const r = ratio(m.value, this.min, this.max);
                const mark = document.createElement("span");
                mark.className = "glint-slider__mark";
                mark.style.setProperty("--glint-mark-r", r);
                mark.dataset.value = String(m.value);
                const dot = document.createElement("span");
                dot.className = "glint-slider__mark-dot";
                mark.appendChild(dot);
                if (m.label) {
                    const lab = document.createElement("span");
                    lab.className = "glint-slider__mark-label";
                    lab.textContent = m.label;
                    mark.appendChild(lab);
                }
                layer.appendChild(mark);
            });
            // Etiket varsa wrap'a alt boşluk sınıfı (CSS padding ekler).
            if (this.marks.some(m => m.label)) {
                this.wrap.classList.add("glint-slider-wrap--has-mark-labels");
            }
            this.wrap.appendChild(layer);
            this.marksLayer = layer;
        }

        // data-marks ve data-mark-labels'i {value,label} dizisine çevir.
        // "step"/"auto" → min..max step adımları (en çok 50 nokta).
        _parseMarks(rawMarks, rawLabels) {
            if (rawMarks == null) return [];
            const labels = (rawLabels || "")
                .split(",").map(s => s.trim());
            const out = [];
            const trimmed = String(rawMarks).trim().toLowerCase();
            if (trimmed === "step" || trimmed === "auto") {
                const st = this.step > 0 ? this.step : 1;
                const count = (this.max - this.min) / st;
                // Aşırı yoğun grid'i önle (perf + okunabilirlik).
                if (count <= 50) {
                    let i = 0;
                    for (let v = this.min; v <= this.max + 1e-9; v += st, i++) {
                        out.push({ value: clamp(v, this.min, this.max), label: labels[i] || "" });
                    }
                }
            } else {
                String(rawMarks).split(",").forEach((tok, i) => {
                    const v = num(tok, NaN);
                    if (Number.isFinite(v)) {
                        out.push({ value: clamp(v, this.min, this.max), label: labels[i] || "" });
                    }
                });
            }
            return out;
        }

        _bind() {
            const input = this.input;
            const render = () => this._render();
            const show = () => this._showBubble(true);
            const hide = () => this._showBubble(false);
            const leave = () => {
                // Odaktaysa balonu açık tut
                if (document.activeElement !== input) hide();
            };

            // destroy() için sökülecek dinleyicileri sakla.
            this._listeners = [
                ["input", render], ["change", render],
                ["pointerdown", show], ["pointerup", hide], ["pointercancel", hide],
                ["mouseenter", show], ["mouseleave", leave],
                ["focus", show], ["blur", hide]
            ];
            this._listeners.forEach(([type, fn]) => input.addEventListener(type, fn));

            // Boyut değişince balon konumu yeniden hesaplansın
            if (typeof ResizeObserver !== "undefined") {
                this._ro = new ResizeObserver(render);
                this._ro.observe(input);
            }
        }

        // Bellek temizliği — SPA'da dinamik kaldırmada sızıntı önler.
        destroy() {
            if (this.marksLayer) { this.marksLayer.remove(); this.marksLayer = null; }
            // v1.5.1 — balon her destroy'da sökülür; yoksa re-init mevcut
            // wrap'ı yeniden kullanıp İKİNCİ balon ekliyordu. Kendi
            // oluşturduğumuz wrap da geri sarılır (upload deseniyle aynı).
            if (this.bubble) { this.bubble.remove(); this.bubble = null; }
            if (this.wrap) this.wrap.classList.remove("glint-slider-wrap--has-mark-labels");
            if (this._ownWrap && this.wrap && this.wrap.parentNode) {
                this.wrap.replaceWith(this.input);
                this.wrap = null;
            }
            if (this._ro) { this._ro.disconnect(); this._ro = null; }
            if (this._listeners) {
                this._listeners.forEach(([type, fn]) =>
                    this.input.removeEventListener(type, fn));
                this._listeners = null;
            }
            delete this.input._glintSliderInit;
            delete this.input._glintSliderInstance;
            window.Glint.unregister(this.input);   // v1.5.1 — kayıt sızıntısı
        }

        _showBubble(on) {
            if (!this.bubble) return;
            // Statik (reduced-motion) balon hep görünür kalır
            if (this.bubble.classList.contains("glint-slider__bubble--static")) {
                this.bubble.style.opacity = "1";
                return;
            }
            this.bubble.style.opacity = on ? "1" : "";
            this.bubble.style.transform = on
                ? "translateX(-50%) translateY(0) scale(1)"
                : "";
        }

        _format(v) {
            let s = String(v);
            if (this.fmtThousands && window.Glint.format) {
                const parts = s.split(".");
                parts[0] = window.Glint.format.thousands(parts[0]);
                s = parts.join(",");
            }
            return this.prefix + s + this.suffix;
        }

        _render() {
            const value = clamp(num(this.input.value, this.min), this.min, this.max);
            const r = ratio(value, this.min, this.max);

            // Sol dolgu yüzdesi (CSS gradient için)
            this.input.style.setProperty("--glint-fill-pct", (r * 100) + "%");

            // İşaretler: dolgunun solunda kalanları .is-filled, değere tam oturanı
            // .is-active yap (salt görsel; değer/native bozulmaz).
            if (this.marksLayer) {
                const eps = (this.step > 0 ? this.step : 1) / 2;
                const kids = this.marksLayer.children;
                for (let i = 0; i < kids.length; i++) {
                    const mv = num(kids[i].dataset.value, NaN);
                    kids[i].classList.toggle("is-filled", mv <= value);
                    kids[i].classList.toggle("is-active", Math.abs(mv - value) < eps);
                }
            }

            if (this.bubble) {
                this.bubble.textContent = this._format(this.input.value);
                const thumb = this.thumbSize;
                if (this.vertical) {
                    // Dikey: min altta, max üstte → top = pad + (1 - r) * (yükseklik - thumb).
                    const h = this.input.clientHeight;
                    // Layout henüz yoksa (gizli/sekme dışı) negatif konum üretme.
                    if (h <= 0) return;
                    const py = (thumb / 2) + (1 - r) * (h - thumb);
                    this.wrap.style.setProperty("--glint-bubble-top", py + "px");
                } else {
                    // Thumb merkezini hesapla: track, thumb yarıçapı kadar
                    // iki yandan içeride. left = pad + r * (genişlik - thumb).
                    const w = this.input.clientWidth;
                    // Layout henüz yoksa (gizli/sekme dışı) negatif konum üretme.
                    if (w <= 0) return;
                    const px = (thumb / 2) + r * (w - thumb);
                    this.wrap.style.setProperty("--glint-bubble-left", px + "px");
                }
            }
        }

        // Programatik API
        get value() { return num(this.input.value, this.min); }
        set value(v) {
            this.input.value = snap(num(v, this.min), this.min, this.max, this.step);
            this._render();
            this.input.dispatchEvent(new Event("input", { bubbles: true }));
        }

        static _getInstance(el) { return el && el._glintSliderInstance || null; }
    }


    // ══════════════════════════════════════════════════════════════
    //  GlintRange — çift uçlu (aralık)
    // ══════════════════════════════════════════════════════════════

    class GlintRange {

        constructor(root) {
            if (root._glintRangeInit) return;
            root._glintRangeInit = true;
            root._glintRangeInstance = this;
            window.Glint.register(root, this);
            this.root = root;

            this.min = num(root.dataset.min, 0);
            this.max = num(root.dataset.max, 100);
            this.step = num(root.dataset.step, 1);
            this.from = snap(num(root.dataset.from, this.min), this.min, this.max, this.step);
            this.to = snap(num(root.dataset.to, this.max), this.min, this.max, this.step);
            if (this.from > this.to) { const t = this.from; this.from = this.to; this.to = t; }
            // v1.5: min-distance + balon değer biçimi
            this.minDist = num(root.dataset.minDistance, 0);
            this.prefix = root.dataset.prefix || "";
            this.suffix = root.dataset.suffix || "";
            this.fmtThousands = root.dataset.format === "thousands";
            // Dikey yön: data-orientation="vertical" → CSS sınıfı + _xToValue ekseni
            this.vertical = root.dataset.orientation === "vertical";

            // İsimler — gizli native input'ların name'i (form binding)
            this.nameFrom = root.dataset.nameFrom || "from";
            this.nameTo = root.dataset.nameTo || "to";
            this.disabled = root.hasAttribute("data-disabled") ||
                root.classList.contains("is-disabled");

            // thumb-size'ı bir kez oku (her _trackMetrics çağrısında pahalı).
            this.thumbSize = num(
                getComputedStyle(root).getPropertyValue("--glint-slider-thumb-size"),
                20
            );

            this._dragWhich = null;     // "from" | "to" | null
            this._build();
            this._bind();
            this._render();
        }

        _build() {
            const root = this.root;
            if (this.disabled) root.classList.add("is-disabled");
            // Dikey modda CSS sınıfı (yön çevrimi tamamen CSS + _render ekseni ile).
            if (this.vertical) root.classList.add("glint-slider--vertical");

            this.track = document.createElement("div");
            this.track.className = "glint-slider__track";

            this.fill = document.createElement("div");
            this.fill.className = "glint-slider__fill";

            this.thumbFrom = this._makeThumb("from");
            this.thumbTo = this._makeThumb("to");

            // Gizli native form input'ları (asp-for / model binding).
            this.inputFrom = this._makeNative(this.nameFrom, this.from);
            this.inputTo = this._makeNative(this.nameTo, this.to);

            root.appendChild(this.track);
            root.appendChild(this.fill);
            root.appendChild(this.thumbFrom);
            root.appendChild(this.thumbTo);
            root.appendChild(this.inputFrom);
            root.appendChild(this.inputTo);
        }

        _makeThumb(which) {
            const thumb = document.createElement("div");
            thumb.className = "glint-slider__thumb";
            thumb.dataset.which = which;
            thumb.setAttribute("role", "slider");
            thumb.setAttribute("aria-valuemin", this.min);
            thumb.setAttribute("aria-valuemax", this.max);
            thumb.setAttribute("aria-orientation", this.vertical ? "vertical" : "horizontal");
            thumb.setAttribute("tabindex", this.disabled ? "-1" : "0");
            thumb.setAttribute("aria-label",
                which === "from" ? "Alt sınır" : "Üst sınır");

            const bubble = document.createElement("div");
            bubble.className = "glint-slider__bubble";
            bubble.setAttribute("aria-hidden", "true");
            thumb.appendChild(bubble);
            thumb._bubble = bubble;
            return thumb;
        }

        _makeNative(name, value) {
            const inp = document.createElement("input");
            inp.type = "range";
            inp.className = "glint-slider__native";
            inp.min = this.min;
            inp.max = this.max;
            inp.step = this.step > 0 ? this.step : "any";
            inp.value = value;
            if (name) inp.name = name;
            inp.tabIndex = -1;
            inp.setAttribute("aria-hidden", "true");
            // Disabled range'de bile değer FORM ile gönderilmeli (asp-for).
            // disabled input'lar gönderilmez → readonly mantığını kullan:
            // input zaten görünmez + pointer-events:none + tab-dışı olduğundan
            // kullanıcı etkileşimi yok; değer kaybı yaşanmasın diye enabled bırak.
            return inp;
        }

        _bind() {
            if (this.disabled) return;

            // destroy() için sökülecek dinleyicileri sakla.
            this._listeners = [];
            const on = (el, type, fn) => {
                el.addEventListener(type, fn);
                this._listeners.push([el, type, fn]);
            };

            // Pointer drag (pointer capture → dokunmatik + fare birleşik).
            [this.thumbFrom, this.thumbTo].forEach((thumb) => {
                on(thumb, "pointerdown", (e) => this._onPointerDown(e, thumb));
                on(thumb, "keydown", (e) => this._onKeyDown(e, thumb));
                on(thumb, "focus", () => this._setCurrent(thumb));
            });

            // Track'e tıklama → en yakın thumb'ı oraya getir + sürüklemeyi başlat.
            on(this.root, "pointerdown", (e) => {
                if (e.target === this.thumbFrom || e.target === this.thumbTo) return;
                if (this.thumbFrom.contains(e.target) || this.thumbTo.contains(e.target)) return;
                this._onTrackPointerDown(e);
            });

            if (typeof ResizeObserver !== "undefined") {
                this._ro = new ResizeObserver(() => this._render());
                this._ro.observe(this.root);
            }
        }

        // Bellek temizliği — SPA'da dinamik kaldırmada sızıntı önler.
        destroy() {
            if (this._ro) { this._ro.disconnect(); this._ro = null; }
            if (this._inputRAF) { cancelAnimationFrame(this._inputRAF); this._inputRAF = null; }
            if (this._dragCleanup) this._dragCleanup();   // aktif sürükleme listener'larını sök
            if (this._listeners) {
                this._listeners.forEach(([el, type, fn]) =>
                    el.removeEventListener(type, fn));
                this._listeners = null;
            }
            delete this.root._glintRangeInit;
            delete this.root._glintRangeInstance;
            window.Glint.unregister(this.root);   // v1.5.1 — kayıt sızıntısı
        }

        // Sürüklenebilir genişlik/yükseklik (thumb yarıçapları çıkarılmış).
        // Dikey ve yatayda ortak: 'usable' eksen boyu; 'width' alanı layout-var-mı
        // kontrolü için kenar boyutu (dikeyde rect.height) olarak doldurulur.
        _trackMetrics() {
            const rect = this.root.getBoundingClientRect();
            const thumb = this.thumbSize;
            const padL = thumb / 2;
            if (this.vertical) {
                const usable = Math.max(1, rect.height - thumb);
                return { left: rect.left, top: rect.top, padL, usable, thumb, width: rect.height };
            }
            const usable = Math.max(1, rect.width - thumb);
            return { left: rect.left, top: rect.top, padL, usable, thumb, width: rect.width };
        }

        // Ekran koordinatı → değer (snap'li). Dikeyde clientY + ters oran.
        // İmza geriye dönük: yatay çağrılarda 2. arg (clientY) yok sayılır.
        _xToValue(clientX, clientY) {
            const m = this._trackMetrics();
            let r;
            if (this.vertical) {
                // Üst kenar = max, alt kenar = min → oran ters çevrilir.
                r = clamp(1 - (clientY - m.top - m.padL) / m.usable, 0, 1);
            } else {
                r = clamp((clientX - m.left - m.padL) / m.usable, 0, 1);
            }
            return snap(this.min + r * (this.max - this.min), this.min, this.max, this.step);
        }

        _setCurrent(thumb) {
            this.thumbFrom.classList.toggle("is-current", thumb === this.thumbFrom);
            this.thumbTo.classList.toggle("is-current", thumb === this.thumbTo);
        }

        _onTrackPointerDown(e) {
            const v = this._xToValue(e.clientX, e.clientY);
            // Hangi thumb daha yakınsa onu seç
            const thumb = Math.abs(v - this.from) <= Math.abs(v - this.to)
                ? this.thumbFrom : this.thumbTo;
            thumb.focus();
            this._beginDrag(e, thumb);
            this._applyValue(thumb, v);
        }

        _onPointerDown(e, thumb) {
            thumb.focus();
            this._beginDrag(e, thumb);
        }

        _beginDrag(e, thumb) {
            e.preventDefault();
            this._dragWhich = thumb.dataset.which;
            this._setCurrent(thumb);
            thumb.classList.add("is-active");
            this.root.classList.add("is-dragging");

            // Pointer capture'ı dene. Track tıklamasında pointer henüz thumb
            // üzerinde olmadığından, capture başarısız olursa pointermove
            // thumb'a HİÇ düşmeyebilir (ilk hareket kaybı). Bu yüzden
            // dinleyiciyi capture'ın gerçekten tuttuğu hedefe bağla; capture
            // yoksa window'a düş → her durumda hareket yakalanır.
            let captured = false;
            try {
                thumb.setPointerCapture(e.pointerId);
                captured = thumb.hasPointerCapture
                    ? thumb.hasPointerCapture(e.pointerId)
                    : true;
            } catch (_) { captured = false; }

            const target = captured ? thumb : window;

            const move = (ev) => {
                this._applyValue(thumb, this._xToValue(ev.clientX, ev.clientY));
            };
            // Faz6: destroy-mid-drag'de (target=window fallback) listener sızmasın →
            // cleanup'ı instance'a kaydet; destroy() çağırır.
            const cleanup = () => {
                target.removeEventListener("pointermove", move);
                target.removeEventListener("pointerup", up);
                target.removeEventListener("pointercancel", up);
                this._dragCleanup = null;
            };
            const up = (ev) => {
                cleanup();
                try { thumb.releasePointerCapture(ev.pointerId); } catch (_) { }
                thumb.classList.remove("is-active");
                this.root.classList.remove("is-dragging");
                this._dragWhich = null;
                this._emitChange();
            };
            this._dragCleanup = cleanup;

            target.addEventListener("pointermove", move);
            target.addEventListener("pointerup", up);
            target.addEventListener("pointercancel", up);
        }

        _onKeyDown(e, thumb) {
            const big = (this.max - this.min) / 10;
            const stepUnit = this.step > 0 ? this.step : 1;
            let delta = 0, abs = null;

            switch (e.key) {
                case "ArrowRight":
                case "ArrowUp": delta = stepUnit; break;
                case "ArrowLeft":
                case "ArrowDown": delta = -stepUnit; break;
                case "PageUp": delta = Math.max(stepUnit, big); break;
                case "PageDown": delta = -Math.max(stepUnit, big); break;
                case "Home": abs = this.min; break;
                case "End": abs = this.max; break;
                default: return;
            }
            e.preventDefault();

            const which = thumb.dataset.which;
            const cur = which === "from" ? this.from : this.to;
            const next = abs !== null ? abs : cur + delta;
            this._applyValue(thumb, snap(next, this.min, this.max, this.step));
            this._emitChange();
        }

        // Thumb için yeni değeri uygula; thumb'lar birbirini geçemez.
        _applyValue(thumb, value) {
            const which = thumb.dataset.which;
            const md = this.minDist || 0;   // thumb'lar arası minimum mesafe
            if (which === "from") {
                this.from = clamp(value, this.min, Math.max(this.min, this.to - md));
            } else {
                this.to = clamp(value, Math.min(this.max, this.from + md), this.max);
            }
            this._render();
            this._syncNative();
            // v1.5.1 — input eventi HER değer değişiminde yayılır (native
            // range semantiği: input=sürekli, change=commit). Eskiden
            // sürükleme boyunca hiç input/glint:rangeinput çıkmıyordu; canlı
            // fiyat etiketi gibi tüketiciler bırakışa kadar kör kalıyordu.
            // Sürüklemede rAF ile kare başına bire indirgenir.
            if (!this._dragWhich) {
                this._emitInput();
            } else if (!this._inputRAF) {
                this._inputRAF = requestAnimationFrame(() => {
                    this._inputRAF = null;
                    this._emitInput();
                });
            }
        }

        _syncNative() {
            if (this.inputFrom.value !== String(this.from)) this.inputFrom.value = this.from;
            if (this.inputTo.value !== String(this.to)) this.inputTo.value = this.to;
        }

        _emitInput() {
            this.inputFrom.dispatchEvent(new Event("input", { bubbles: true }));
            this.inputTo.dispatchEvent(new Event("input", { bubbles: true }));
            this.root.dispatchEvent(new CustomEvent("glint:rangeinput", {
                bubbles: true, detail: { from: this.from, to: this.to }
            }));
        }

        _emitChange() {
            this._syncNative();
            this.inputFrom.dispatchEvent(new Event("change", { bubbles: true }));
            this.inputTo.dispatchEvent(new Event("change", { bubbles: true }));
            this.root.dispatchEvent(new CustomEvent("glint:rangechange", {
                bubbles: true, detail: { from: this.from, to: this.to }
            }));
        }

        _render() {
            const m = this._trackMetrics();
            // Layout henüz yoksa (display:none / gizli sekme) hesaplama atla.
            if (m.width <= 0) return;
            const rFrom = ratio(this.from, this.min, this.max);
            const rTo = ratio(this.to, this.min, this.max);

            // Thumb konumları — yalnız --glint-x CSS değişkenine yazılır.
            // Konum CSS'te translate(var(--glint-x)) ile; scale (hover/active)
            // ayrı CSS kurallarından gelir → pseudo-class geçişleri çalışır.
            if (this.vertical) {
                // Dikey: alt kenar = min, üst kenar = max. usable boyu tepe→dip
                // ölçüldüğünden, üstten uzaklık = (1 - r) * usable.
                const yFrom = (1 - rFrom) * m.usable;
                const yTo = (1 - rTo) * m.usable;
                this.thumbFrom.style.setProperty("--glint-y", yFrom + "px");
                this.thumbTo.style.setProperty("--glint-y", yTo + "px");
                // Fill: üst kenarı to'da (daha büyük değer yukarıda), yükseklik = from-to.
                this.fill.style.setProperty("--glint-y", yTo + "px");
                this.fill.style.height = Math.max(0, yFrom - yTo) + "px";
            } else {
                const xFrom = rFrom * m.usable;
                const xTo = rTo * m.usable;

                this.thumbFrom.style.setProperty("--glint-x", xFrom + "px");
                this.thumbTo.style.setProperty("--glint-x", xTo + "px");

                // Fill: sol kenarı from'da, sağ kenarı to'da.
                // Sol konumu --glint-x ile, genişliği px olarak ver. transform
                // yalnız translateY(-50%) — scaleX karmaşası yok, resize'da tutarlı.
                this.fill.style.setProperty("--glint-x", xFrom + "px");
                this.fill.style.width = Math.max(0, xTo - xFrom) + "px";
            }

            // ARIA + balon metni
            this._setThumbAria(this.thumbFrom, this.from);
            this._setThumbAria(this.thumbTo, this.to);
        }

        _format(v) {
            let s = String(v);
            if (this.fmtThousands && window.Glint.format) {
                const parts = s.split(".");
                parts[0] = window.Glint.format.thousands(parts[0]);
                s = parts.join(",");
            }
            return this.prefix + s + this.suffix;
        }

        _setThumbAria(thumb, value) {
            thumb.setAttribute("aria-valuenow", value);
            thumb.setAttribute("aria-valuetext", this._format(value));
            if (thumb._bubble) thumb._bubble.textContent = this._format(value);
        }

        // ── Programatik API ──
        getValues() { return { from: this.from, to: this.to }; }
        setValues(from, to) {
            let f = snap(num(from, this.from), this.min, this.max, this.step);
            let t = snap(num(to, this.to), this.min, this.max, this.step);
            if (f > t) { const tmp = f; f = t; t = tmp; }
            this.from = f; this.to = t;
            this._render();
            this._syncNative();
            this._emitInput();
            this._emitChange();
        }

        static _getInstance(el) { return el && el._glintRangeInstance || null; }
    }


    // ══════════════════════════════════════════════════════════════
    //  ÇEKİRDEĞE KAYIT (Glint.defineComponent) + güvenli yükleme guard'ı
    // ══════════════════════════════════════════════════════════════

    function register() {
        const Glint = window.Glint;

        // Tekli — native range; range--range taşıyıcısını DIŞLA
        Glint.defineComponent("slider", {
            selector: "input[type='range'].glint-slider",
            match: el => !el._glintSliderInit,
            mount: el => new GlintSlider(el)
        });

        // Çift uçlu — div taşıyıcı
        Glint.defineComponent("range", {
            selector: ".glint-slider--range",
            match: el => !el._glintRangeInit,
            mount: el => new GlintRange(el)
        });

        // Programatik API
        Glint.Slider = GlintSlider;
        Glint.Range = GlintRange;
    }

    if (window.Glint && window.Glint.defineComponent) {
        register();
    } else {
        // Çekirdek henüz yüklenmemiş — DOMContentLoaded'da tekrar dene.
        document.addEventListener("DOMContentLoaded", function () {
            if (window.Glint && window.Glint.defineComponent) {
                register();
            }
        });
    }

})();


/* ════════════════════════════════════════════════════════════════════════
 *  6) Upload / Dropzone
 *     (kaynak modül: glint-upload.js)
 * ════════════════════════════════════════════════════════════════════════ */
/**
 * Glint Upload / Dropzone Library v1.0
 * ─────────────────────────────────────────────────────────────
 * glint-input.js çekirdeğinin uzantısı. Native <input type="file">
 * elementlerini sarmalayıp tutarlı bir dropzone + dosya listesi UI'ı
 * sağlar. Saf vanilla, sıfır bağımlılık.
 *
 * Kullanım — kullanıcı yalnızca native input yazar:
 *
 *   <input type="file" class="glint-upload"
 *          multiple accept="image/*" data-max-size="2097152">
 *
 * Kütüphane otomatik tespit eder ve şunu yapar:
 *   1. Native input'u görsel olarak gizler ama DOM'da TUTAR
 *      (ASP.NET asp-for / model binding korunur).
 *   2. Çevresine dropzone + dosya listesi enjekte eder.
 *   3. Sürükle-bırak edilen dosyaları DataTransfer ile native
 *      input.files'a YAZAR → form submit'te dosyalar gönderilir.
 *   4. Görsel dosyalar için FileReader ile küçük önizleme üretir.
 *   5. İlerleme çubuğunu transform: scaleX ile simüle eder (gerçek
 *      upload bağlanmadıysa görsel doldurma; API ile dışarıdan da
 *      sürülebilir → Glint.Upload.setProgress).
 *
 * Özellikler:
 *   • multiple — birden çok dosya; tek dosyalıda yeni seçim öncekini değiştirir
 *   • accept   — uzantı/MIME filtresi (geçersiz dosya işaretlenir)
 *   • data-max-size — bayt cinsinden tavan; aşılırsa dosya işaretlenir
 *   • dragenter/over/leave/drop highlight (emerald kenar)
 *   • klavye: dropzone Tab ile odaklanır, Enter/Space dosya seçtirir
 *   • kaldırma chip-out animasyonu, dark mode, reduced motion
 *
 * API (window.Glint.Upload):
 *   Glint.Upload                          → sınıf (otomatik mount)
 *   Glint.Upload.get(inputEl)             → örnek
 *   instance.setProgress(file, 0..1)      → gerçek upload ilerlemesi
 *   instance.complete(file)               → %100 + done state
 *   instance.clear()                      → tüm dosyaları kaldır
 *   instance.getFiles()                   → mevcut geçerli File[] dizisi
 *
 * Sınırlamalar (v1):
 *   - Gerçek XHR/fetch upload BAĞLAMAZ; ilerleme varsayılan olarak
 *     simüledir. Gerçek upload için setProgress/complete API'sini kullan.
 *   - accept yalnızca uzantı + basit MIME (tip/*) eşleştirir.
 */

(function () {
    "use strict";

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── İKON SVG'leri (inline, bağımlılık yok) ──
    const ICON_CLOUD =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M12 13v8"/><path d="m8 17 4-4 4 4"/>' +
        '<path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 4 16.25"/></svg>';

    const ICON_FILE =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
        '<path d="M14 2v6h6"/></svg>';

    const ICON_X =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

    // Sürükle-sırala tutamacı (6 nokta — "grip")
    const ICON_GRIP =
        '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
        '<circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/>' +
        '<circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/>' +
        '<circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>';

    // ── Türkçe metin sözlüğü (override edilebilir) ──
    const TEXT = {
        titleA: "Dosyaları buraya sürükleyin veya ",
        browse: "gözat",
        hintMultiple: "Birden çok dosya seçebilirsiniz",
        hintSingle: "Tek dosya seçin",
        errSize: "Dosya çok büyük",
        errType: "Tür desteklenmiyor"
    };

    // ── YARDIMCILAR ──

    /** Bayt → okunabilir boyut (1.4 MB gibi). */
    function formatSize(bytes) {
        if (bytes === 0) return "0 B";
        const units = ["B", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        const v = bytes / Math.pow(1024, i);
        return (i === 0 ? v : v.toFixed(v < 10 ? 1 : 0)) + " " + units[i];
    }

    /**
     * accept attribute'una göre dosya uygun mu?
     * Örn: "image/*,.pdf,application/json"
     */
    function matchesAccept(file, accept) {
        if (!accept) return true;
        const tokens = accept.split(",").map(t => t.trim().toLowerCase()).filter(Boolean);
        if (!tokens.length) return true;
        const name = (file.name || "").toLowerCase();
        const type = (file.type || "").toLowerCase();
        return tokens.some(tok => {
            if (tok.startsWith(".")) return name.endsWith(tok);
            if (tok.endsWith("/*")) return type.startsWith(tok.slice(0, -1)); // "image/"
            return type === tok;
        });
    }

    function isImage(file) {
        return /^image\//.test(file.type || "");
    }

    /** İki dosya aynı mı? (ad + boyut + son değişiklik) */
    function sameFile(a, b) {
        return a.name === b.name &&
            a.size === b.size &&
            a.lastModified === b.lastModified;
    }


    // ══════════════════════════════════════════════════════════════
    //  GlintUpload
    // ══════════════════════════════════════════════════════════════

    class GlintUpload {

        constructor(input) {
            if (input._glintUploadInit) return;
            input._glintUploadInit = true;
            input._glintUploadInstance = this;
            window.Glint.register(input, this);

            this.input = input;
            this.multiple = input.hasAttribute("multiple");
            this.accept = input.getAttribute("accept") || "";
            const ms = parseInt(input.getAttribute("data-max-size"), 10);
            this.maxSize = (!isNaN(ms) && ms > 0) ? ms : null;
            const mf = parseInt(input.getAttribute("data-max-files"), 10);
            this.maxFiles = (!isNaN(mf) && mf > 0) ? mf : null;
            // Sürükle-sırala: yalnız çoklu modda anlamlı; data-no-reorder ile kapatılır.
            this.reorderable = this.multiple && !input.hasAttribute("data-no-reorder");
            this._dragEntry = null;   // o an sürüklenen kayıt

            // Aktif dosya kayıtları: { file, valid, error, row, bar, instId }
            this.entries = [];
            this._idSeq = 0;

            this._build();
            this._bind();
            // Sayfa yüklenirken input zaten doluysa (geri/ileri, server render) işle.
            if (this.input.files && this.input.files.length) {
                this._ingest(Array.from(this.input.files), false);
            }
        }

        // ── DOM KURULUMU ──

        _build() {
            const input = this.input;

            // Sarmalayıcı — native input'un yerine geçer, input'u içine alır.
            this.wrap = document.createElement("div");
            this.wrap.className = "glint-upload-wrap";
            input.parentNode.insertBefore(this.wrap, input);
            this.wrap.appendChild(input);

            // Native file input görsel olarak gizli ve tab dışı tutulur:
            // tek tab durağı dropzone olsun (kontrat §5, çift durak/erişilebilirlik).
            // İlerideki disabled değişimlerinde de zone tabindex'i yönetilir,
            // input her zaman tab dışında kalır.
            input.setAttribute("tabindex", "-1");

            if (input.disabled) this.wrap.classList.add("glint-upload-wrap--disabled");

            // Dropzone — klavye odaklanabilir buton gibi davranır.
            this.zone = document.createElement("div");
            this.zone.className = "glint-upload-zone";
            this.zone.setAttribute("role", "button");
            this.zone.setAttribute("tabindex", input.disabled ? "-1" : "0");
            this.zone.setAttribute("aria-label", this.multiple
                ? "Dosya yükleme alanı, dosya seçmek için etkinleştirin"
                : "Dosya yükleme alanı, dosya seçmek için etkinleştirin");

            this.zone.innerHTML =
                '<span class="glint-upload-zone__icon">' + ICON_CLOUD + '</span>' +
                '<span class="glint-upload-zone__title">' +
                    TEXT.titleA +
                    '<span class="glint-upload-zone__browse">' + TEXT.browse + '</span>' +
                '</span>' +
                '<span class="glint-upload-zone__hint">' +
                    (this.multiple ? TEXT.hintMultiple : TEXT.hintSingle) +
                '</span>';

            this.wrap.appendChild(this.zone);

            // Hint'i desteklenen tip / boyut / adet özetiyle doldur (kullanıcıyı
            // hata öncesi yönlendir): "PNG, JPG · max 2 MB · en çok 5".
            this.hintEl = this.zone.querySelector(".glint-upload-zone__hint");
            if (this.hintEl) {
                this._defaultHint = this._hintText();
                this.hintEl.textContent = this._defaultHint;
            }

            // Seçilen dosya listesi (aria-live → eklenen/çıkan dosya duyurulur)
            this.list = document.createElement("ul");
            this.list.className = "glint-upload-list";
            this.list.setAttribute("aria-live", "polite");
            this.wrap.appendChild(this.list);
        }

        /** Hint metni: desteklenen tip · boyut · adet özeti. */
        _hintText() {
            const parts = [];
            const acc = this._acceptLabel();
            if (acc) parts.push(acc);
            if (this.maxSize != null) parts.push("max " + formatSize(this.maxSize));
            if (this.multiple && this.maxFiles != null) parts.push("en çok " + this.maxFiles);
            if (!parts.length) return this.multiple ? TEXT.hintMultiple : TEXT.hintSingle;
            return parts.join(" · ");
        }

        /** accept attribute'unu okunur etikete çevirir ("image/*,.pdf" → "IMAGE, PDF"). */
        _acceptLabel() {
            if (!this.accept) return "";
            return this.accept.split(",")
                .map(s => s.trim().replace(/^\./, "").replace("/*", "").toUpperCase())
                .filter(Boolean)
                .join(", ");
        }

        /** Adet sınırı aşılınca hint'i kısa süre uyarıya çevirir. */
        _flashLimit() {
            if (!this.hintEl) return;
            this.hintEl.textContent = "En fazla " + this.maxFiles + " dosya seçebilirsiniz";
            this.zone.classList.add("glint-upload-zone--limit");
            clearTimeout(this._limitTimer);
            this._limitTimer = setTimeout(() => {
                this.zone.classList.remove("glint-upload-zone--limit");
                if (this.hintEl) this.hintEl.textContent = this._defaultHint;
            }, 2400);
        }

        // ── OLAYLAR ──

        _bind() {
            const input = this.input;

            // Teardown (destroy) için tüm dinleyicileri kaydet → temiz sökme.
            this._listeners = [];
            const on = (target, type, handler, opts) => {
                target.addEventListener(type, handler, opts);
                this._listeners.push({ target, type, handler, opts });
            };

            // Native dosya seçimi (gözat / klavye)
            on(input, "change", () => {
                // v1.5.1 — reorder/reindex'in kendi yaydığı change'i yeniden
                // yutma: boşa dedupe turu + slotların yarısı doluyken sahte
                // "en fazla N dosya" uyarısı üretiyordu.
                if (this._suppressChange) return;
                if (input.files && input.files.length) {
                    this._ingest(Array.from(input.files), true);
                }
            });

            // Dropzone tıklama → native input'u aç
            on(this.zone, "click", () => {
                if (this.input.disabled) return;
                this.input.click();
            });

            // Klavye: Enter / Space → dosya seçtir
            on(this.zone, "keydown", (e) => {
                if (this.input.disabled) return;
                if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
                    e.preventDefault();
                    this.input.click();
                }
            });

            // Pano yapıştırma (ekran görüntüsü vb.) — zone odaktayken
            on(this.zone, "paste", (e) => {
                if (this.input.disabled) return;
                const files = e.clipboardData && e.clipboardData.files;
                if (files && files.length) {
                    e.preventDefault();
                    this._ingest(Array.from(files), true);
                }
            });

            // ── Sürükle-bırak ──
            // Hedef WRAP'tır (zone + dosya listesini kapsar). Böylece kullanıcı
            // dosyayı liste alanına (zone dışına) bıraksa da yakalanır; aksi
            // halde tarayıcı varsayılanı devreye girer ve dosya kaybolurdu.
            // dragenter/over: highlight + drop'a izin ver. dragleave: yalnızca
            // gerçekten wrap'tan çıkıldıysa kaldır (alt elementler arası geçişte
            // tetiklenen sahte leave'leri sayaçla filtrele).
            this._dragDepth = 0;

            on(this.wrap, "dragenter", (e) => {
                if (this.input.disabled) return;
                e.preventDefault();
                this._dragDepth++;
                this.zone.classList.add("glint-upload-zone--dragover");
            });

            on(this.wrap, "dragover", (e) => {
                if (this.input.disabled) return;
                e.preventDefault();
                e.stopPropagation();
                if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
            });

            on(this.wrap, "dragleave", (e) => {
                if (this.input.disabled) return;
                e.preventDefault();
                this._dragDepth = Math.max(0, this._dragDepth - 1);
                if (this._dragDepth === 0) {
                    this.zone.classList.remove("glint-upload-zone--dragover");
                }
            });

            on(this.wrap, "drop", (e) => {
                if (this.input.disabled) return;
                e.preventDefault();
                e.stopPropagation();
                this._dragDepth = 0;
                this.zone.classList.remove("glint-upload-zone--dragover");
                const dt = e.dataTransfer;
                if (dt && dt.files && dt.files.length) {
                    this._ingest(Array.from(dt.files), true);
                }
            });

            // ── Sürükle-sırala (HTML5 DnD, liste üzerinde delegasyon) ──
            // Dinleyiciler this.list'e bağlı → on() ile kaydedildiğinden destroy'da
            // otomatik sökülür. Satır draggable'ı yalnız tutamaçtan açılır (_renderRow).
            // KRİTİK: tüm iç DnD olaylarında stopPropagation çağrılır; aksi halde
            // olaylar wrap'a baloncuklanır, wrap'ın dosya-bırakma highlight'ı
            // (--dragover) ve _dragDepth sayacı reorder sırasında tetiklenir.
            if (this.reorderable) {
                on(this.list, "dragstart", (e) => {
                    if (this.input.disabled) return;
                    const li = e.target.closest && e.target.closest(".glint-upload-item");
                    if (!li || !li.draggable) return;
                    this._dragEntry = this.entries.find(en => en.row === li) || null;
                    if (!this._dragEntry) return;
                    e.stopPropagation();
                    li.classList.add("glint-upload-item--dragging");
                    if (e.dataTransfer) {
                        e.dataTransfer.effectAllowed = "move";
                        try { e.dataTransfer.setData("text/plain", ""); } catch (_) { }
                    }
                });

                // Reorder sürerken wrap'ın dragenter highlight'ını engelle.
                on(this.list, "dragenter", (e) => {
                    if (this._dragEntry) { e.preventDefault(); e.stopPropagation(); }
                });

                on(this.list, "dragover", (e) => {
                    if (this.input.disabled || !this._dragEntry) return;
                    e.preventDefault();      // drop'a izin ver
                    e.stopPropagation();     // wrap dragover'ına ulaşmasın (dropEffect/copy ezmesin)
                    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
                    const overLi = e.target.closest && e.target.closest(".glint-upload-item");
                    const dragLi = this._dragEntry.row;
                    if (!overLi || overLi === dragLi) return;
                    const rect = overLi.getBoundingClientRect();
                    const after = (e.clientY - rect.top) > rect.height / 2;
                    if (after) {
                        if (overLi.nextSibling !== dragLi) this.list.insertBefore(dragLi, overLi.nextSibling);
                    } else {
                        if (overLi.previousSibling !== dragLi) this.list.insertBefore(dragLi, overLi);
                    }
                });

                on(this.list, "drop", (e) => {
                    if (this.input.disabled || !this._dragEntry) return;
                    e.preventDefault();
                    e.stopPropagation();     // wrap'taki dosya-ingest drop handler'ını tetikleme
                });

                on(this.list, "dragend", () => {
                    if (this._dragEntry && this._dragEntry.row) {
                        this._dragEntry.row.classList.remove("glint-upload-item--dragging");
                        this._dragEntry.row.draggable = false;
                    }
                    this._dragEntry = null;
                    this._reindexFromDOM();
                });
            }

            // NOT: Kontrat §1 gereği modül KENDİ MutationObserver'ını KURMAZ.
            // disabled değişimi, çekirdeğin yeniden tarayışında ya da harici
            // kodun _syncDisabled() çağrısıyla yansıtılır; senkronu programatik
            // tetiklemek için public syncDisabled() açıyoruz.
        }

        // ── SÜRÜKLE-SIRALA YARDIMCILARI ──

        /** DOM satır sırasına göre this.entries'i yeniden dizer, native files'ı senkronlar. */
        _reindexFromDOM() {
            const rows = Array.from(this.list.querySelectorAll(".glint-upload-item"));
            const ordered = [];
            for (const li of rows) {
                const en = this.entries.find(e => e.row === li);
                if (en) ordered.push(en);
            }
            for (const en of this.entries) {
                if (ordered.indexOf(en) === -1) ordered.push(en);
            }
            const changed = ordered.some((en, i) => en !== this.entries[i]);
            this.entries = ordered;
            if (changed) {
                this._syncNativeFiles();
                this._suppressChange = true;
                try { this.input.dispatchEvent(new Event("change", { bubbles: true })); } catch (_) { }
                this._suppressChange = false;
            }
        }

        /** Klavye ile satır taşıma: ↑/↓ bir adım, Home/End uçlara. */
        _handleReorderKey(e, entry) {
            if (this.input.disabled) return;
            const k = e.key;
            const last = this.entries.length - 1;
            const from = this.entries.indexOf(entry);
            if (from < 0) return;
            let to = from;
            if (k === "ArrowUp") to = from - 1;
            else if (k === "ArrowDown") to = from + 1;
            else if (k === "Home") to = 0;
            else if (k === "End") to = last;
            else return;
            e.preventDefault();
            if (to < 0 || to > last || to === from) return;
            this.reorder(from, to);
            // reorder() satırları appendChild ile taşır → odak kaybolur; geri ver.
            const handle = entry.row && entry.row.querySelector(".glint-upload-item__handle");
            if (handle) handle.focus();
        }

        /** Native input.disabled durumunu görsel katmana yansıt (public). */
        syncDisabled() {
            this._syncDisabled();
        }

        _syncDisabled() {
            const d = this.input.disabled;
            this.wrap.classList.toggle("glint-upload-wrap--disabled", d);
            // Input her zaman tab dışında (-1). Tek tab durağı dropzone'dur;
            // disabled iken zone da tab dışına alınır.
            this.zone.setAttribute("tabindex", d ? "-1" : "0");
        }

        // ── DOSYA ALIMI ──

        /**
         * Yeni dosyaları kaydeder. animate=true ise chip giriş animasyonu.
         * Tekil (multiple yok) modda yeni seçim öncekileri TAMAMEN değiştirir.
         */
        _ingest(files, animate) {
            if (!this.multiple) {
                // Tek dosya: önceki kayıtları temizle, yalnızca ilkini al.
                this._clearRows();
                files = files.slice(0, 1);
            } else if (this.maxFiles != null) {
                // Adet sınırı: kalan boş slot kadar al, fazlasını reddet + uyar.
                // v1.5.1 — yalnız GEÇERLİ kayıtlar kota tüketir: reddedilen
                // (hatalı) chip'ler slotları kilitleyip kullanıcıyı elle
                // temizlik yapmaya zorluyordu.
                const used = this.entries.filter(en => en.valid).length;
                const slots = Math.max(0, this.maxFiles - used);
                if (files.length > slots) {
                    files = files.slice(0, slots);
                    this._flashLimit();
                }
            }

            for (const file of files) {
                // Çoklu modda aynı dosyayı tekrar ekleme
                if (this.multiple && this.entries.some(en => sameFile(en.file, file))) {
                    continue;
                }
                this._addEntry(file, animate);
            }

            this._syncNativeFiles();
        }

        _addEntry(file, animate) {
            const valid = this._validate(file);
            const entry = {
                id: ++this._idSeq,
                file,
                valid: valid.ok,
                error: valid.error,
                row: null,
                bar: null,
                progress: 0
            };
            this.entries.push(entry);
            this._renderRow(entry, animate);

            // Geçerli dosyalar için ilerleme simülasyonu (gerçek upload yoksa).
            if (entry.valid) this._simulateProgress(entry);
        }

        _validate(file) {
            if (this.maxSize != null && file.size > this.maxSize) {
                return { ok: false, error: TEXT.errSize + " (max " + formatSize(this.maxSize) + ")" };
            }
            if (!matchesAccept(file, this.accept)) {
                return { ok: false, error: TEXT.errType };
            }
            return { ok: true, error: "" };
        }

        // ── SATIR (CHIP) RENDER ──

        _renderRow(entry, animate) {
            const li = document.createElement("li");
            li.className = "glint-upload-item";
            if (!entry.valid) li.classList.add("glint-upload-item--invalid");
            if (animate && !prefersReduced) li.classList.add("glint-upload-item--entering");

            // Thumbnail kabı
            const thumb = document.createElement("span");
            thumb.className = "glint-upload-item__thumb";
            thumb.innerHTML = ICON_FILE;

            // Gövde (ad + boyut + ilerleme/hata)
            const body = document.createElement("div");
            body.className = "glint-upload-item__body";

            const meta = document.createElement("div");
            meta.className = "glint-upload-item__meta";

            const name = document.createElement("span");
            name.className = "glint-upload-item__name";
            name.textContent = entry.file.name;
            name.title = entry.file.name;

            const size = document.createElement("span");
            size.className = "glint-upload-item__size";
            size.textContent = formatSize(entry.file.size);

            meta.appendChild(name);
            meta.appendChild(size);
            body.appendChild(meta);

            if (entry.valid) {
                // İlerleme çubuğu
                const prog = document.createElement("div");
                prog.className = "glint-upload-item__progress";
                const bar = document.createElement("div");
                bar.className = "glint-upload-item__progress-bar";
                prog.appendChild(bar);
                body.appendChild(prog);
                entry.bar = bar;
            } else {
                // Hata mesajı
                const err = document.createElement("div");
                err.className = "glint-upload-item__error";
                err.textContent = entry.error;
                body.appendChild(err);
            }

            // Kaldır butonu
            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "glint-upload-item__remove";
            remove.setAttribute("aria-label", entry.file.name + " dosyasını kaldır");
            remove.innerHTML = ICON_X;
            remove.addEventListener("click", () => this._removeEntry(entry));

            // ── Sürükle-sırala tutamacı ──
            // Sadece çoklu + reorderable modda eklenir. li.draggable yalnızca
            // tutamaca basıldığında açılır → metin seçimi ve kaldır butonu
            // çakışmaz. Klavye ile ok tuşları satırı taşır.
            if (this.reorderable) {
                li.classList.add("glint-upload-item--reorderable");
                const handle = document.createElement("button");
                handle.type = "button";
                handle.className = "glint-upload-item__handle";
                handle.setAttribute("draggable", "true");
                handle.setAttribute("aria-label", entry.file.name + " sırasını değiştir (ok tuşlarıyla taşıyın)");
                handle.setAttribute("aria-keyshortcuts", "ArrowUp ArrowDown Home End");
                handle.innerHTML = ICON_GRIP;
                // Tutamaca basınca satırı sürüklenebilir yap; sürükleme/bırakma
                // bitince (pointerup ya da dragend) tekrar kapatılır.
                handle.addEventListener("pointerdown", () => { if (!this.input.disabled) li.draggable = true; });
                handle.addEventListener("pointerup", () => { li.draggable = false; });
                handle.addEventListener("dragstart", (e) => {
                    if (this.input.disabled) { e.preventDefault(); }
                });
                // Klavye ile taşıma: ↑/↓/Home/End.
                handle.addEventListener("keydown", (e) => this._handleReorderKey(e, entry));
                li.appendChild(handle);
            }

            li.appendChild(thumb);
            li.appendChild(body);
            li.appendChild(remove);

            entry.row = li;
            this.list.appendChild(li);

            // Giriş animasyonu bitince entering sınıfını temizle
            if (animate && !prefersReduced) {
                li.addEventListener("animationend", () => {
                    li.classList.remove("glint-upload-item--entering");
                }, { once: true });
            }

            // Görsel önizleme (FileReader) — asenkron
            if (entry.valid && isImage(entry.file)) {
                this._loadThumb(entry, thumb);
            }
        }

        _loadThumb(entry, thumb) {
            // FileReader(base64) yerine objectURL → çok daha az bellek + hızlı
            // decode (tarayıcıya devredilir). URL, satır kalkınca revoke edilir.
            let url;
            try { url = URL.createObjectURL(entry.file); }
            catch (e) { return; }   // desteksiz → ikon kalır
            entry._objUrl = url;
            if (!entry.row || !entry.row.isConnected) { this._revokeThumb(entry); return; }
            const img = document.createElement("img");
            img.className = "glint-upload-item__thumb";
            img.alt = entry.file.name;
            img.loading = "lazy";
            img.decoding = "async";
            img.onerror = () => { this._revokeThumb(entry); };
            img.src = url;
            thumb.replaceWith(img);
        }

        _revokeThumb(entry) {
            if (entry && entry._objUrl) {
                try { URL.revokeObjectURL(entry._objUrl); } catch (_) { }
                entry._objUrl = null;
            }
        }

        // ── İLERLEME ──

        /** Simüle ilerleme: scaleX 0 → 1, küçük adımlarla (gerçek upload yoksa). */
        _simulateProgress(entry) {
            if (prefersReduced) {
                // Hareket yok → anında doldur
                this._applyProgress(entry, 1);
                this._markDone(entry);
                return;
            }
            let p = 0;
            const tick = () => {
                if (!entry.row || !entry.row.isConnected) return;
                if (entry._manualProgress) return; // dışarıdan setProgress devraldı
                p += 0.04 + Math.random() * 0.10;
                if (p >= 1) {
                    this._applyProgress(entry, 1);
                    this._markDone(entry);
                    return;
                }
                this._applyProgress(entry, p);
                entry._timer = setTimeout(tick, 90 + Math.random() * 70);
            };
            entry._timer = setTimeout(tick, 120);
        }

        _applyProgress(entry, ratio) {
            // Public API (setProgress) dışarıdan NaN/undefined/string alabilir.
            // Sayısallaştır + sonlu değilse 0'a düş → "scaleX(NaN)" üretme.
            let r = Number(ratio);
            if (!isFinite(r)) r = 0;
            entry.progress = Math.max(0, Math.min(1, r));
            if (entry.bar) entry.bar.style.transform = "scaleX(" + entry.progress + ")";
        }

        _markDone(entry) {
            if (entry.row) entry.row.classList.add("glint-upload-item--done");
        }

        // ── KALDIRMA ──

        _removeEntry(entry) {
            if (this.input.disabled) return;
            if (entry._timer) clearTimeout(entry._timer);
            this._revokeThumb(entry);

            const idx = this.entries.indexOf(entry);
            if (idx > -1) this.entries.splice(idx, 1);

            const li = entry.row;
            if (!li) { this._syncNativeFiles(); return; }

            // v1.5.1 — finish tek sefer koşar: eskiden animationend VE 320ms
            // güvenlik ağı birbirini iptal etmiyordu → li.remove +
            // _syncNativeFiles (DataTransfer yeniden kurulumu) iki kez
            // çalışıyordu.
            let done = false;
            const finish = () => {
                if (done) return;
                done = true;
                li.remove();
                this._syncNativeFiles();
            };

            if (prefersReduced) {
                finish();
            } else {
                li.classList.add("glint-upload-item--leaving");
                const t = setTimeout(finish, 320);   // animationend gelmezse güvenlik ağı
                li.addEventListener("animationend", () => { clearTimeout(t); finish(); }, { once: true });
            }
        }

        _clearRows() {
            for (const en of this.entries) {
                if (en._timer) clearTimeout(en._timer);
                this._revokeThumb(en);
                if (en.row) en.row.remove();
            }
            this.entries = [];
        }

        // ── NATIVE input.files SENKRONU ──
        //
        // Drop edilen dosyalar native input'a otomatik girmez. DataTransfer
        // ile input.files'ı yeniden kurarız ki form submit'te (ASP.NET) tüm
        // (geçerli) dosyalar gitsin. Geçersiz dosyalar form'a yazılmaz.
        _syncNativeFiles() {
            // DataTransfer bazı tarayıcılarda kısıtlı olabilir → guard.
            let dt;
            try { dt = new DataTransfer(); }
            catch (e) { return; }

            for (const en of this.entries) {
                if (en.valid) {
                    try { dt.items.add(en.file); } catch (e) { /* sessiz */ }
                }
            }
            try { this.input.files = dt.files; }
            catch (e) { /* bazı tarayıcılar reddedebilir; sessiz geç */ }
        }

        // ══════════════════════════════════════════════════════════
        //  PROGRAMATİK API
        // ══════════════════════════════════════════════════════════

        _findEntry(file) {
            return this.entries.find(en => en.file === file || sameFile(en.file, file)) || null;
        }

        /** Gerçek upload ilerlemesi: ratio 0..1. Simülasyonu devralır. */
        setProgress(file, ratio) {
            const en = this._findEntry(file);
            if (!en || !en.valid) return;
            en._manualProgress = true;
            if (en._timer) { clearTimeout(en._timer); en._timer = null; }
            this._applyProgress(en, ratio);
            if (en.progress >= 1) this._markDone(en);
        }

        /** Upload tamamlandı → %100 + done state. */
        complete(file) {
            const en = this._findEntry(file);
            if (!en || !en.valid) return;
            en._manualProgress = true;
            if (en._timer) { clearTimeout(en._timer); en._timer = null; }
            this._applyProgress(en, 1);
            this._markDone(en);
        }

        /** Tüm dosyaları kaldır. */
        clear() {
            this._clearRows();
            this._syncNativeFiles();
        }

        /** Mevcut geçerli File nesneleri. */
        getFiles() {
            return this.entries.filter(en => en.valid).map(en => en.file);
        }

        /**
         * Programatik sıralama: fromIndex'teki kaydı toIndex konumuna taşır.
         * DOM + this.entries + native files birlikte güncellenir.
         */
        reorder(fromIndex, toIndex) {
            const last = this.entries.length - 1;
            if (fromIndex < 0 || fromIndex > last || toIndex < 0 || toIndex > last) return;
            if (fromIndex === toIndex) return;
            const en = this.entries.splice(fromIndex, 1)[0];
            this.entries.splice(toIndex, 0, en);
            for (const e of this.entries) {
                if (e.row) this.list.appendChild(e.row);
            }
            this._syncNativeFiles();
            this._suppressChange = true;
            try { this.input.dispatchEvent(new Event("change", { bubbles: true })); } catch (_) { }
            this._suppressChange = false;
        }

        /** Geçerli/geçersiz tüm dosya adları görsel sırayla. */
        getOrder() {
            return this.entries.map(en => en.file.name);
        }

        /**
         * Örneği tamamen söker: tüm dinleyiciler kaldırılır, timer'lar
         * temizlenir, satırlar silinir, wrap DOM'dan çıkarılıp native input
         * orijinal konumuna geri konur ve init işaretleri silinir. Wrap/input
         * DOM'dan kaldırıldığında bellek sızıntısını önlemek için çağrılmalı.
         */
        destroy() {
            // Dinleyicileri sök
            if (this._listeners) {
                for (const l of this._listeners) {
                    l.target.removeEventListener(l.type, l.handler, l.opts);
                }
                this._listeners = null;
            }
            // Timer'ları durdur + satırları kaldır
            clearTimeout(this._limitTimer);
            this._clearRows();

            // Native input'u tab akışına geri al ve wrap yerine koy
            this.input.removeAttribute("tabindex");
            if (this.wrap && this.wrap.parentNode) {
                this.wrap.replaceWith(this.input);
            }

            // İşaretleri sil → çekirdek tekrar tarayabilir / GC serbest
            delete this.input._glintUploadInit;
            delete this.input._glintUploadInstance;
            window.Glint.unregister(this.input);   // v1.5.1 — kayıt sızıntısı
        }

        static get(inputEl) {
            if (!inputEl) return null;
            if (inputEl._glintUploadInstance) return inputEl._glintUploadInstance;
            const inp = inputEl.closest?.(".glint-upload-wrap")?.querySelector?.(".glint-upload");
            return inp?._glintUploadInstance ?? null;
        }
    }


    // ══════════════════════════════════════════════════════════════
    //  ÇEKİRDEĞE KAYIT  (kontrat §1)
    // ══════════════════════════════════════════════════════════════
    //
    // Modül KENDİ MutationObserver'ını KURMAZ — çekirdek tarar.
    // Yükleme sırası guard'ı: Glint hazırsa hemen kaydol, değilse
    // DOMContentLoaded'da tekrar dene.

    function register() {
        const Glint = window.Glint;
        Glint.defineComponent("upload", {
            selector: "input[type='file'].glint-upload",
            match: el => !el._glintUploadInit,
            mount: el => new GlintUpload(el)
        });
        Glint.Upload = GlintUpload;
    }

    function tryRegister() {
        if (window.Glint && window.Glint.defineComponent) {
            register();
            window.Glint.refresh && window.Glint.refresh(document);
            return true;
        }
        return false;
    }

    if (window.Glint && window.Glint.defineComponent) {
        register();
    } else {
        // Çekirdek henüz yüklenmemiş — DOMContentLoaded'da tekrar dene.
        document.addEventListener("DOMContentLoaded", function once() {
            if (tryRegister()) return;
            // Çekirdek bu script'ten hemen sonra geç yüklenmiş olabilir →
            // bir microtask sonra son bir kez dene (picker deseniyle hizalı).
            Promise.resolve().then(function () {
                if (tryRegister()) return;
                // Hâlâ yoksa: sessiz bırakılır (kontrat: console.log yok).
                // Çekirdek sonradan yüklenip Glint.refresh çağırırsa, selector
                // bazlı tarama bu modülü tek başına başlatamaz; bu bilinen,
                // dokümante sınırdır.
            });
        });
    }

})();


/* ════════════════════════════════════════════════════════════════════════
 *  7) Color Picker
 *     (kaynak modül: glint-color.js)
 * ════════════════════════════════════════════════════════════════════════ */
/**
 * Glint Color Picker v1.0
 * ─────────────────────────────────────────────────────────────
 * glint-input kütüphanesinin uzantısı. Native renk input'larını
 * (`<input type="color" class="glint-color">` veya bir metin input'u)
 * sarmalayıp tutarlı bir renk seçici UI sağlar.
 *
 * Kullanım — kullanıcı normal markup yazar:
 *
 *   <input type="color" class="glint-color" asp-for="ThemeColor"
 *          value="#059669">
 *
 *   ya da metin değeri ile (HEX string form alanı):
 *
 *   <input type="text" class="glint-color" asp-for="ThemeColor"
 *          value="#059669">
 *
 * Kütüphane otomatik tespit eder ve şunu yapar:
 *   1. Native input'u görsel olarak gizler ama DOM'da TUTAR
 *      (form binding / asp-for korunur, submit'te değer gider).
 *   2. Yanına swatch trigger (renk göstergesi + HEX metni) enjekte eder.
 *   3. Trigger'a tıklanınca trigger'dan origin-aware açılan popover gelir:
 *        • Saturation/Value kare alanı (pointer drag, dairesel imleç)
 *        • Hue slider (yatay, ok tuşu desteği)
 *        • HEX girişi (+ ops. R/G/B)
 *        • Hazır palet satırı (preset)
 *        • Son kullanılanlar (opsiyonel)
 *   4. Her seçimde native input.value (#rrggbb) güncellenir ve
 *      'input' + 'change' eventleri yayılır.
 *
 * Erişilebilirlik: ARIA, tam klavye (SV alanı + hue ok tuşları,
 * Enter/Space ile aç, Escape ile kapat), :focus-visible ring,
 * dokunmatik (Pointer Events). prefers-reduced-motion'da hareket
 * kaldırılır, opacity/renk kalır.
 *
 * Çekirdek: Glint.defineComponent ile kaydolur (kendi observer'ını
 * kurmaz). Global API: window.Glint.Color.
 *
 * Sınırlamalar (v1):
 *   - Alpha (RGBA/şeffaflık) kanalı desteklenmiyor — yalnız #rrggbb.
 *     Swatch'taki checkerboard ileride alpha için hazır görsel altyapı.
 *   - HSL giriş alanı yok (HEX + RGB). HSV dahili kullanılır.
 */

(function () {
    "use strict";

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ══════════════════════════════════════════════════════════════
    //  YAPILANDIRMA (override edilebilir)
    // ══════════════════════════════════════════════════════════════

    // Varsayılan hazır palet — Tailwind/Bootstrap dengesi, 18 ton.
    const DEFAULT_PRESETS = [
        "#111827", "#374151", "#6b7280", "#9ca3af", "#d1d5db", "#f3f4f6", "#ffffff",
        "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e", "#059669",
        "#14b8a6", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#ec4899"
    ];

    const DEFAULTS = {
        presets: DEFAULT_PRESETS,
        showRgb: true,        // HEX'in yanında R/G/B alanları göster
        showHsl: true,        // HSL mod toggle (RGB ile birlikte → HEX/RGB/HSL geçişi)
        defaultMode: "rgb",   // başlangıç sayısal modu: "rgb" | "hsl"
        showContrast: true,   // seçili renge karşı beyaz/siyah WCAG kontrast rozeti
        showRecents: true,    // son kullanılanlar satırı
        maxRecents: 9,
        labels: {
            hex: "HEX",
            r: "R", g: "G", b: "B",
            h: "H", s: "S", l: "L",
            modeRgb: "RGB", modeHsl: "HSL",
            contrastTitle: "Kontrast",
            contrastWhite: "Beyaz",
            contrastBlack: "Siyah",
            presetsTitle: "Hazır Renkler",
            recentsTitle: "Son Kullanılanlar",
            triggerAria: "Renk seç",
            svAria: "Doygunluk ve parlaklık",
            hueAria: "Renk tonu"
        }
    };

    function getConfig() {
        const ext = (window.Glint && window.Glint.Color && window.Glint.Color.config) || {};
        const labels = Object.assign({}, DEFAULTS.labels, ext.labels || {});
        return Object.assign({}, DEFAULTS, ext, { labels });
    }


    // ══════════════════════════════════════════════════════════════
    //  RENK DÖNÜŞÜMLERİ — HEX <-> RGB <-> HSV
    // ══════════════════════════════════════════════════════════════
    //
    // HSV: h ∈ [0,360), s ∈ [0,100], v ∈ [0,100]
    // RGB: r,g,b ∈ [0,255]

    function clamp(n, lo, hi) {
        return n < lo ? lo : (n > hi ? hi : n);
    }

    function pad2hex(n) {
        const s = clamp(Math.round(n), 0, 255).toString(16);
        return s.length === 1 ? "0" + s : s;
    }

    /** "#rgb" / "#rrggbb" (büyük/küçük, # opsiyonel) → {r,g,b} | null */
    function parseHex(str) {
        if (typeof str !== "string") return null;
        let s = str.trim().replace(/^#/, "");
        if (/^[0-9a-fA-F]{3}$/.test(s)) {
            s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
        }
        if (!/^[0-9a-fA-F]{6}$/.test(s)) return null;
        return {
            r: parseInt(s.slice(0, 2), 16),
            g: parseInt(s.slice(2, 4), 16),
            b: parseInt(s.slice(4, 6), 16)
        };
    }

    /** {r,g,b} → "#rrggbb" (küçük harf) */
    function rgbToHex(r, g, b) {
        return "#" + pad2hex(r) + pad2hex(g) + pad2hex(b);
    }

    /** {r,g,b} (0-255) → {h,s,v} (0-360, 0-100, 0-100) */
    function rgbToHsv(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const d = max - min;
        let h = 0;
        if (d !== 0) {
            if (max === r) h = ((g - b) / d) % 6;
            else if (max === g) h = (b - r) / d + 2;
            else h = (r - g) / d + 4;
            h *= 60;
            if (h < 0) h += 360;
        }
        const s = max === 0 ? 0 : d / max;
        const v = max;
        return { h, s: s * 100, v: v * 100 };
    }

    /** {h,s,v} → {r,g,b} (0-255) */
    function hsvToRgb(h, s, v) {
        h = ((h % 360) + 360) % 360;
        s = clamp(s, 0, 100) / 100;
        v = clamp(v, 0, 100) / 100;
        const c = v * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = v - c;
        let r = 0, g = 0, b = 0;
        if (h < 60) { r = c; g = x; b = 0; }
        else if (h < 120) { r = x; g = c; b = 0; }
        else if (h < 180) { r = 0; g = c; b = x; }
        else if (h < 240) { r = 0; g = x; b = c; }
        else if (h < 300) { r = x; g = 0; b = c; }
        else { r = c; g = 0; b = x; }
        return {
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255)
        };
    }

    function hsvToHex(h, s, v) {
        const { r, g, b } = hsvToRgb(h, s, v);
        return rgbToHex(r, g, b);
    }

    /** Salt hue (s=100,v=100) → hex; hue slider/SV zemin için */
    function hueToHex(h) {
        return hsvToHex(h, 100, 100);
    }

    // ── HSL dönüşümleri (mod toggle için) ──────────────────────────
    //
    // HSL: h ∈ [0,360), s ∈ [0,100], l ∈ [0,100]

    /** {r,g,b} (0-255) → {h,s,l} (0-360, 0-100, 0-100) */
    function rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const d = max - min;
        const l = (max + min) / 2;
        let h = 0, s = 0;
        if (d !== 0) {
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            if (max === r) h = ((g - b) / d) % 6;
            else if (max === g) h = (b - r) / d + 2;
            else h = (r - g) / d + 4;
            h *= 60;
            if (h < 0) h += 360;
        }
        return { h, s: s * 100, l: l * 100 };
    }

    /** {h,s,l} → {r,g,b} (0-255) */
    function hslToRgb(h, s, l) {
        h = ((h % 360) + 360) % 360;
        s = clamp(s, 0, 100) / 100;
        l = clamp(l, 0, 100) / 100;
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = l - c / 2;
        let r = 0, g = 0, b = 0;
        if (h < 60) { r = c; g = x; b = 0; }
        else if (h < 120) { r = x; g = c; b = 0; }
        else if (h < 180) { r = 0; g = c; b = x; }
        else if (h < 240) { r = 0; g = x; b = c; }
        else if (h < 300) { r = x; g = 0; b = c; }
        else { r = c; g = 0; b = x; }
        return {
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255)
        };
    }

    // ── WCAG kontrast (relative luminance) ─────────────────────────

    /** Tek sRGB kanalını (0-255) lineerleştir */
    function srgbLin(c) {
        c /= 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    }

    /** {r,g,b} → relative luminance (0-1) — WCAG 2.x */
    function relLuminance(r, g, b) {
        return 0.2126 * srgbLin(r) + 0.7152 * srgbLin(g) + 0.0722 * srgbLin(b);
    }

    /** İki renk ({r,g,b}) arası WCAG kontrast oranı (1..21) */
    function contrastRatio(rgb1, rgb2) {
        const l1 = relLuminance(rgb1.r, rgb1.g, rgb1.b);
        const l2 = relLuminance(rgb2.r, rgb2.g, rgb2.b);
        const hi = Math.max(l1, l2), lo = Math.min(l1, l2);
        return (hi + 0.05) / (lo + 0.05);
    }

    /** Oran → WCAG seviyesi rozeti {label, cls} */
    function contrastLevel(ratio) {
        if (ratio >= 7)   return { label: "AAA", cls: "aaa" };
        if (ratio >= 4.5) return { label: "AA",  cls: "aa" };
        if (ratio >= 3)   return { label: "AA+", cls: "aalarge" };
        return { label: "Fail", cls: "fail" };
    }


    // ══════════════════════════════════════════════════════════════
    //  GlintColor
    // ══════════════════════════════════════════════════════════════

    class GlintColor {

        constructor(input) {
            if (input._glintColorInit) return;
            input._glintColorInit = true;
            input._glintColorInstance = this;
            window.Glint.register(input, this);

            this.input = input;
            this.cfg = getConfig();
            this.isOpen = false;
            // Aktif sayısal giriş modu: "rgb" | "hsl" (HEX her zaman görünür)
            this.mode = (this.cfg.defaultMode === "hsl" && this.cfg.showHsl) ? "hsl" : "rgb";

            // Dahili durum HSV'de tutulur (SV/hue kayıpsız gezsin diye:
            // HEX'e yuvarlamak gri/siyahta hue'yu kaybettirir).
            this.hsv = { h: 0, s: 0, v: 0 };

            // Son kullanılanlar — örnek başına ayrı liste (opsiyonel kalıcı)
            this.recents = [];
            this.recentsKey = this.input.getAttribute("data-recents-key") || (this.cfg && this.cfg.recentsKey) || null;
            this._loadRecents();

            this._initialFromInput();
            this._build();
            this._bindEvents();
            this._renderAll();
        }

        // ── Başlangıç durumu ───────────────────────────────────────

        _initialFromInput() {
            const rgb = parseHex(this.input.value) || parseHex("#000000");
            this.hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
            // Native input.value'yu normalize et (#rrggbb küçük harf)
            const norm = rgbToHex(rgb.r, rgb.g, rgb.b);
            if (this.input.value !== norm) {
                // type=color zaten normalize eder; metin input için garanti
                if (this.input.type !== "color") this.input.value = norm;
            }
        }

        // ── DOM kurulumu ───────────────────────────────────────────

        _build() {
            const input = this.input;

            // 1. Sarmalayıcı field — native input'u içine al
            this.field = document.createElement("span");
            this.field.className = "glint-color-field";
            if (input.classList.contains("glint-color--square")) {
                this.field.classList.add("glint-color-field--square");
            }
            input.parentNode.insertBefore(this.field, input);
            this.field.appendChild(input);

            // Native input'u erişilebilirlik akışından çıkar — trigger button
            // odak alır. hidden DEĞİL (form submit değeri korunur).
            input.tabIndex = -1;
            input.setAttribute("aria-hidden", "true");

            // 2. Swatch trigger
            this.trigger = document.createElement("button");
            this.trigger.type = "button";
            this.trigger.className = "glint-color-trigger";
            this.trigger.setAttribute("aria-haspopup", "dialog");
            this.trigger.setAttribute("aria-expanded", "false");
            this.trigger.setAttribute("aria-label", this.cfg.labels.triggerAria);

            this.swatch = document.createElement("span");
            this.swatch.className = "glint-color-swatch";
            this.swatch.setAttribute("aria-hidden", "true");

            this.valueText = document.createElement("span");
            this.valueText.className = "glint-color-value";

            const caret = document.createElement("span");
            caret.className = "glint-color-caret";
            caret.setAttribute("aria-hidden", "true");
            caret.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14"
                fill="none" stroke="currentColor" stroke-width="2.4"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 9l6 6 6-6"/></svg>`;

            this.trigger.appendChild(this.swatch);
            this.trigger.appendChild(this.valueText);
            this.trigger.appendChild(caret);
            this.field.appendChild(this.trigger);

            // Disabled mirror
            if (input.disabled) this.field.classList.add("is-disabled");

            // 3. Popover (+ backdrop)
            this._buildPopover();
            this._buildBackdrop();
        }

        _buildPopover() {
            const L = this.cfg.labels;
            this.popover = document.createElement("div");
            this.popover.className = "glint-color-popover";
            this.popover.setAttribute("role", "dialog");
            this.popover.setAttribute("aria-label", L.triggerAria);

            // ── SV alanı ──
            this.sv = document.createElement("div");
            this.sv.className = "glint-color-sv";
            this.sv.setAttribute("role", "slider");
            this.sv.setAttribute("tabindex", "0");
            this.sv.setAttribute("aria-label", L.svAria);
            this.svThumb = document.createElement("div");
            this.svThumb.className = "glint-color-sv-thumb";
            this.sv.appendChild(this.svThumb);
            this.popover.appendChild(this.sv);

            // ── Hue slider ──
            this.hue = document.createElement("div");
            this.hue.className = "glint-color-hue";
            this.hue.setAttribute("role", "slider");
            this.hue.setAttribute("tabindex", "0");
            this.hue.setAttribute("aria-label", L.hueAria);
            this.hue.setAttribute("aria-valuemin", "0");
            this.hue.setAttribute("aria-valuemax", "360");
            this.hueThumb = document.createElement("div");
            this.hueThumb.className = "glint-color-hue-thumb";
            this.hue.appendChild(this.hueThumb);
            this.popover.appendChild(this.hue);

            // ── Giriş alanları (HEX + ops. RGB) ──
            const inputs = document.createElement("div");
            inputs.className = "glint-color-inputs";

            const hexWrap = this._buildField("hex", L.hex, "glint-color-input-wrap--hex");
            this.hexInput = hexWrap.input;
            this.hexInput.maxLength = 7;
            // v1.5.1 — intrinsic min-content ~175px'i öldür: hex alanı flex
            // içinde gerçekten daralabilsin (satır 248px paneli taşırıyordu).
            this.hexInput.size = 7;
            inputs.appendChild(hexWrap.wrap);

            // EyeDropper (ekrandan renk al) — destekleyen tarayıcıda görünür
            if ("EyeDropper" in window) {
                this.eyedropBtn = document.createElement("button");
                this.eyedropBtn.type = "button";
                this.eyedropBtn.className = "glint-color-tool glint-color-eyedrop";
                this.eyedropBtn.setAttribute("aria-label", "Ekrandan renk seç");
                this.eyedropBtn.innerHTML = '<svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path d="M14.5 2.3a2.3 2.3 0 013.2 3.2l-1.6 1.6 1 1-1.4 1.4-1-1-6.2 6.2c-.2.2-.5.4-.8.4l-3 .8.8-3c.1-.3.2-.6.4-.8l6.2-6.2-1-1L13 4.5l1 1 .5-.5-1-1 1-1.7z"/></svg>';
                inputs.appendChild(this.eyedropBtn);
                this.eyedropBtn.addEventListener("click", () => {
                    try {
                        new window.EyeDropper().open()
                            .then(r => { if (r && r.sRGBHex) this._pickHex(r.sRGBHex, true); })
                            .catch(() => { });
                    } catch (_) { }
                });
            }
            // HEX kopyala
            this.copyBtn = document.createElement("button");
            this.copyBtn.type = "button";
            this.copyBtn.className = "glint-color-tool glint-color-copy";
            this.copyBtn.setAttribute("aria-label", "HEX kopyala");
            this.copyBtn.innerHTML = '<svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path d="M7 2h7a2 2 0 012 2v9a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2zm0 2v9h7V4H7zM3 6v10a2 2 0 002 2h8v-2H5V6H3z"/></svg>';
            inputs.appendChild(this.copyBtn);
            this.copyBtn.addEventListener("click", () => {
                const hex = this._currentHex();
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(hex).then(() => {
                        this.copyBtn.classList.add("is-copied");
                        setTimeout(() => this.copyBtn.classList.remove("is-copied"), 1200);
                    }).catch(() => { });
                }
            });

            if (this.cfg.showRgb) {
                const rWrap = this._buildField("r", L.r, "glint-color-input-wrap--rgb glint-color-input-wrap--num glint-color-input-wrap--rgbgrp");
                const gWrap = this._buildField("g", L.g, "glint-color-input-wrap--rgb glint-color-input-wrap--num glint-color-input-wrap--rgbgrp");
                const bWrap = this._buildField("b", L.b, "glint-color-input-wrap--rgb glint-color-input-wrap--num glint-color-input-wrap--rgbgrp");
                this.rInput = rWrap.input;
                this.gInput = gWrap.input;
                this.bInput = bWrap.input;
                this._rgbWraps = [rWrap.wrap, gWrap.wrap, bWrap.wrap];
                [this.rInput, this.gInput, this.bInput].forEach(i => {
                    i.maxLength = 3;
                    i.inputMode = "numeric";
                });
                inputs.appendChild(rWrap.wrap);
                inputs.appendChild(gWrap.wrap);
                inputs.appendChild(bWrap.wrap);
            } else if (this.mode === "rgb") {
                // RGB kapalıysa moddan da düş
                this.mode = this.cfg.showHsl ? "hsl" : "rgb";
            }

            if (this.cfg.showHsl) {
                const hWrap = this._buildField("h", L.h, "glint-color-input-wrap--rgb glint-color-input-wrap--num glint-color-input-wrap--hslgrp");
                const sWrap = this._buildField("s", L.s, "glint-color-input-wrap--rgb glint-color-input-wrap--num glint-color-input-wrap--hslgrp");
                const lWrap = this._buildField("l", L.l, "glint-color-input-wrap--rgb glint-color-input-wrap--num glint-color-input-wrap--hslgrp");
                this.hInput = hWrap.input;
                this.sInput = sWrap.input;
                this.lInput = lWrap.input;
                this._hslWraps = [hWrap.wrap, sWrap.wrap, lWrap.wrap];
                this.hInput.maxLength = 3; this.hInput.inputMode = "numeric";
                this.sInput.maxLength = 3; this.sInput.inputMode = "numeric";
                this.lInput.maxLength = 3; this.lInput.inputMode = "numeric";
                inputs.appendChild(hWrap.wrap);
                inputs.appendChild(sWrap.wrap);
                inputs.appendChild(lWrap.wrap);
            }
            this.popover.appendChild(inputs);

            // ── Mod toggle (RGB/HSL) — yalnız RGB+HSL birlikte açıksa ──
            if (this.cfg.showRgb && this.cfg.showHsl) {
                this.modeToggle = document.createElement("div");
                this.modeToggle.className = "glint-color-modes";
                this.modeToggle.setAttribute("role", "tablist");
                this.modeToggle.setAttribute("aria-label", "Renk modu");
                [["rgb", L.modeRgb], ["hsl", L.modeHsl]].forEach(([m, lbl]) => {
                    const b = document.createElement("button");
                    b.type = "button";
                    b.className = "glint-color-mode";
                    b.dataset.mode = m;
                    b.setAttribute("role", "tab");
                    b.textContent = lbl;
                    b.addEventListener("click", () => this._setMode(m));
                    this.modeToggle.appendChild(b);
                });
                this.popover.appendChild(this.modeToggle);
            }

            // ── WCAG kontrast rozetleri ──
            if (this.cfg.showContrast) {
                this.contrastEl = document.createElement("div");
                this.contrastEl.className = "glint-color-contrast";
                this.contrastEl.setAttribute("aria-live", "polite");
                this.popover.appendChild(this.contrastEl);
            }

            // ── Hazır palet (düz dizi VEYA gruplu {name,colors[]}) ──
            if (this.cfg.presets && this.cfg.presets.length) {
                // Tek presets kabı: gruplar başlıklı alt-satırlar üretir.
                this.presetsWrap = document.createElement("div");
                this.presetsWrap.className = "glint-color-presets-wrap";
                // Geriye uyum: düz dizi → başlıklı tek grup (presetsTitle)
                const groups = this._normalizePresetGroups(this.cfg.presets, L.presetsTitle);
                // Tüm preset swatch'larını ortak referansta tut (_renderPresetActive)
                this.presetsEl = this.presetsWrap; // querySelectorAll kapsayıcısı
                groups.forEach(grp => {
                    if (grp.name) {
                        const pt = document.createElement("div");
                        pt.className = "glint-color-section-title";
                        pt.textContent = grp.name;
                        this.presetsWrap.appendChild(pt);
                    }
                    const row = document.createElement("div");
                    row.className = "glint-color-presets";
                    grp.colors.forEach(hex => {
                        const btn = document.createElement("button");
                        btn.type = "button";
                        btn.className = "glint-color-preset";
                        btn.dataset.color = hex;
                        btn.style.setProperty("--glint-color-preset-bg", hex);
                        btn.setAttribute("aria-label", hex);
                        btn.addEventListener("click", () => this._pickHex(hex, true));
                        row.appendChild(btn);
                    });
                    this.presetsWrap.appendChild(row);
                });
                this.popover.appendChild(this.presetsWrap);
            }

            // ── Son kullanılanlar ──
            if (this.cfg.showRecents) {
                this.recentsTitle = document.createElement("div");
                this.recentsTitle.className = "glint-color-section-title";
                this.recentsTitle.textContent = L.recentsTitle;
                this.popover.appendChild(this.recentsTitle);

                this.recentsEl = document.createElement("div");
                this.recentsEl.className = "glint-color-recents";
                this.popover.appendChild(this.recentsEl);
            }

            document.body.appendChild(this.popover);

            // Popover içine tıklama: outside-click handler'a ulaşmasın +
            // trigger focus'unu KORU (text input'ları hariç — yazılabilsin).
            this.popover.addEventListener("pointerdown", (e) => {
                const isTextField = e.target.classList &&
                    e.target.classList.contains("glint-color-text-input");
                if (!isTextField) e.preventDefault();
                e.stopPropagation();
            });
        }

        _buildField(key, labelText, wrapClass) {
            const wrap = document.createElement("div");
            wrap.className = "glint-color-input-wrap " + wrapClass;

            const lbl = document.createElement("label");
            lbl.className = "glint-color-input-label";
            if (key === "hex") lbl.classList.add("glint-color-input-label--hex");
            lbl.textContent = labelText;

            const input = document.createElement("input");
            input.type = "text";
            input.className = "glint-color-text-input glint-color-text-input--" + key;
            input.autocomplete = "off";
            input.spellcheck = false;
            input.setAttribute("aria-label", labelText);

            const id = (this.input.id || "glintcolor") + "__" + key + "__" +
                Math.random().toString(36).slice(2, 7);
            input.id = id;
            lbl.setAttribute("for", id);

            wrap.appendChild(lbl);
            wrap.appendChild(input);
            return { wrap, input };
        }

        _buildBackdrop() {
            this.backdrop = document.createElement("div");
            this.backdrop.className = "glint-color-backdrop";
            document.body.appendChild(this.backdrop);
        }

        // ── Preset gruplarını normalize et ─────────────────────────
        // Girdi: ["#fff", {name, colors[]}, ...] → [{name, colors[]}]
        // Düz HEX'ler defaultTitle'lı tek gruba toplanır (geriye uyum).
        _normalizePresetGroups(presets, defaultTitle) {
            const groups = [];
            let flat = null;
            presets.forEach(item => {
                if (item && typeof item === "object" && Array.isArray(item.colors)) {
                    groups.push({ name: item.name || "", colors: item.colors.slice() });
                } else if (typeof item === "string") {
                    if (!flat) { flat = { name: defaultTitle, colors: [] }; groups.push(flat); }
                    flat.colors.push(item);
                }
            });
            return groups;
        }

        // ── Mod (RGB/HSL) geçişi ───────────────────────────────────
        _setMode(mode) {
            if (mode !== "rgb" && mode !== "hsl") return;
            if (mode === "rgb" && !this.cfg.showRgb) return;
            if (mode === "hsl" && !this.cfg.showHsl) return;
            this.mode = mode;
            this._applyMode();
            // Aktif moda göre alanları doldur
            if (mode === "hsl") this._renderHsl(); else this._renderRgb();
        }

        _applyMode() {
            const showRgb = this.mode === "rgb";
            if (this._rgbWraps) this._rgbWraps.forEach(w => w.classList.toggle("is-hidden", !showRgb));
            if (this._hslWraps) this._hslWraps.forEach(w => w.classList.toggle("is-hidden", showRgb));
            if (this.modeToggle) {
                this.modeToggle.querySelectorAll(".glint-color-mode").forEach(b => {
                    const on = b.dataset.mode === this.mode;
                    b.classList.toggle("is-active", on);
                    b.setAttribute("aria-selected", on ? "true" : "false");
                });
            }
        }

        // ── Event bağlama ──────────────────────────────────────────

        _bindEvents() {
            // Trigger aç/kapa
            this.trigger.addEventListener("click", (e) => {
                e.stopPropagation();
                this.toggle();
            });

            // SV alanı — pointer drag
            this._bindSvDrag();
            // Hue slider — pointer drag
            this._bindHueDrag();
            // Klavye — SV ve hue
            this._bindSvKeyboard();
            this._bindHueKeyboard();

            // HEX girişi
            this.hexInput.addEventListener("input", () => this._onHexInput());
            this.hexInput.addEventListener("blur", () => this._onHexBlur());
            this.hexInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter") { e.preventDefault(); this._onHexBlur(); }
            });

            // RGB girişleri
            if (this.cfg.showRgb) {
                [this.rInput, this.gInput, this.bInput].forEach(inp => {
                    inp.addEventListener("input", () => this._onRgbInput());
                    inp.addEventListener("blur", () => this._onRgbBlur());
                    inp.addEventListener("keydown", (e) => {
                        if (e.key === "Enter") { e.preventDefault(); this._onRgbBlur(); }
                        else if (e.key === "ArrowUp") { e.preventDefault(); this._nudgeRgb(inp, +1); }
                        else if (e.key === "ArrowDown") { e.preventDefault(); this._nudgeRgb(inp, -1); }
                    });
                });
            }

            // HSL girişleri
            if (this.cfg.showHsl) {
                const hslMax = inp => (inp === this.hInput ? 360 : 100);
                [this.hInput, this.sInput, this.lInput].forEach(inp => {
                    inp.addEventListener("input", () => this._onHslInput());
                    inp.addEventListener("blur", () => this._onHslBlur());
                    inp.addEventListener("keydown", (e) => {
                        if (e.key === "Enter") { e.preventDefault(); this._onHslBlur(); }
                        else if (e.key === "ArrowUp") { e.preventDefault(); this._nudgeHsl(inp, +1, hslMax(inp)); }
                        else if (e.key === "ArrowDown") { e.preventDefault(); this._nudgeHsl(inp, -1, hslMax(inp)); }
                    });
                });
            }

            // Başlangıç modunu uygula (RGB/HSL satır görünürlüğü + toggle aktif durumu)
            this._applyMode();

            // Dış tıklama → kapat
            this._outsideHandler = (e) => {
                if (!this.isOpen) return;
                if (this.field.contains(e.target)) return;
                if (this.popover.contains(e.target)) return;
                this.close();
            };
            document.addEventListener("pointerdown", this._outsideHandler);

            // Escape → kapat
            this._keyHandler = (e) => {
                if (this.isOpen && e.key === "Escape") {
                    e.preventDefault();
                    this.close();
                    this.trigger.focus();
                }
            };
            document.addEventListener("keydown", this._keyHandler);

            // Backdrop (mobil) → kapat
            this.backdrop.addEventListener("click", () => this.close());

            // Yeniden konumlandır (desktop)
            this._reposHandler = () => {
                if (this.isOpen && window.innerWidth > 768) this._positionPopover();
            };
            window.addEventListener("resize", this._reposHandler);
            window.addEventListener("scroll", this._reposHandler, { capture: true, passive: true });

            // Native input dışarıdan değişirse (form reset, JS atama) senkronla
            this._nativeChangeHandler = () => {
                if (this._suppressNative) return;
                const rgb = parseHex(this.input.value);
                if (rgb) {
                    this.hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
                    this._renderAll();
                }
                // disabled durumu da değişmiş olabilir
                this.field.classList.toggle("is-disabled", this.input.disabled);
            };
            this.input.addEventListener("change", this._nativeChangeHandler);
        }

        // ── SV alanı: pointer drag ─────────────────────────────────

        _bindSvDrag() {
            const onMove = (clientX, clientY) => {
                const rect = this.sv.getBoundingClientRect();
                const x = clamp(clientX - rect.left, 0, rect.width);
                const y = clamp(clientY - rect.top, 0, rect.height);
                this.hsv.s = rect.width ? (x / rect.width) * 100 : 0;
                this.hsv.v = rect.height ? (1 - y / rect.height) * 100 : 0;
                this._renderAll();
                this._commit(false);   // canlı input; change bırakışta
            };
            this._dragArea(this.sv, onMove);
        }

        _bindHueDrag() {
            const onMove = (clientX) => {
                const rect = this.hue.getBoundingClientRect();
                const x = clamp(clientX - rect.left, 0, rect.width);
                this.hsv.h = rect.width ? (x / rect.width) * 360 : 0;
                this._renderAll();
                this._commit(false);   // canlı input; change bırakışta
            };
            this._dragArea(this.hue, (cx) => onMove(cx), true);
        }

        /**
         * Bir alan için Pointer Events tabanlı drag bağla.
         * horizontalOnly=true → yalnız X kullanılır (hue slider).
         * Pointer capture ile dokunmatik + fare birleşik; alan dışına
         * sürüklense de takip eder.
         */
        _dragArea(el, onMove, horizontalOnly) {
            let dragging = false;

            const move = (e) => {
                if (!dragging) return;
                if (horizontalOnly) onMove(e.clientX);
                else onMove(e.clientX, e.clientY);
            };

            el.addEventListener("pointerdown", (e) => {
                if (e.button != null && e.button !== 0) return;
                dragging = true;
                el.classList.add("is-dragging");
                try { el.setPointerCapture(e.pointerId); } catch (err) { /* yoksay */ }
                e.preventDefault();
                if (horizontalOnly) onMove(e.clientX);
                else onMove(e.clientX, e.clientY);
            });
            el.addEventListener("pointermove", move);
            const end = (e) => {
                if (!dragging) return;
                dragging = false;
                el.classList.remove("is-dragging");
                try { el.releasePointerCapture(e.pointerId); } catch (err) { /* yoksay */ }
                // Drag bitti → değeri son kullanılanlara ekle + bekleyen change
                this._pushRecent(this._currentHex());
                this._commit(true);
            };
            el.addEventListener("pointerup", end);
            el.addEventListener("pointercancel", end);
        }

        // ── Klavye desteği ─────────────────────────────────────────

        _bindSvKeyboard() {
            this.sv.addEventListener("keydown", (e) => {
                const big = e.shiftKey ? 10 : 2;
                let handled = true;
                switch (e.key) {
                    case "ArrowLeft":  this.hsv.s = clamp(this.hsv.s - big, 0, 100); break;
                    case "ArrowRight": this.hsv.s = clamp(this.hsv.s + big, 0, 100); break;
                    case "ArrowUp":    this.hsv.v = clamp(this.hsv.v + big, 0, 100); break;
                    case "ArrowDown":  this.hsv.v = clamp(this.hsv.v - big, 0, 100); break;
                    case "Home":       this.hsv.s = 0; break;
                    case "End":        this.hsv.s = 100; break;
                    default: handled = false;
                }
                if (handled) {
                    e.preventDefault();
                    this._renderAll();
                    this._commit();
                    this._pushRecent(this._currentHex());
                }
            });
        }

        _bindHueKeyboard() {
            this.hue.addEventListener("keydown", (e) => {
                const step = e.shiftKey ? 15 : 3;
                let handled = true;
                switch (e.key) {
                    case "ArrowLeft":
                    case "ArrowDown":  this.hsv.h = (this.hsv.h - step + 360) % 360; break;
                    case "ArrowRight":
                    case "ArrowUp":    this.hsv.h = (this.hsv.h + step) % 360; break;
                    case "Home":       this.hsv.h = 0; break;
                    case "End":        this.hsv.h = 359; break;
                    default: handled = false;
                }
                if (handled) {
                    e.preventDefault();
                    this._renderAll();
                    this._commit();
                    this._pushRecent(this._currentHex());
                }
            });
        }

        // ── HEX / RGB giriş işleyicileri ───────────────────────────

        _onHexInput() {
            const rgb = parseHex(this.hexInput.value);
            this.hexInput.classList.toggle("is-invalid", !rgb && this.hexInput.value.trim() !== "");
            if (!rgb) return;
            // Geçerli → HSV güncelle ama hue/SV'yi kayıpsız tut:
            // gri/siyah HEX hue'yu sıfırlar; mevcut hue'yu koru.
            const newHsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
            if (newHsv.s === 0) newHsv.h = this.hsv.h;       // gri → hue koru
            if (newHsv.v === 0 || newHsv.s === 0) {
                // siyah/gri → hue koru (yukarıdaki gibi)
            }
            this.hsv = newHsv;
            // HEX input'una dokunmadan diğer alanları render et
            this._renderSwatch();
            this._renderSv();
            this._renderHue();
            this._renderRgb();
            this._commit();
        }

        _onHexBlur() {
            const rgb = parseHex(this.hexInput.value);
            if (rgb) {
                this._pushRecent(rgbToHex(rgb.r, rgb.g, rgb.b));
            }
            // Geçersiz ya da değil — kanonik değere geri yaz
            this.hexInput.classList.remove("is-invalid");
            this._renderHexInput();
        }

        _onRgbInput() {
            if (!this.cfg.showRgb) return;
            const r = this._readRgbField(this.rInput);
            const g = this._readRgbField(this.gInput);
            const b = this._readRgbField(this.bInput);
            if (r == null || g == null || b == null) return;
            const newHsv = rgbToHsv(r, g, b);
            if (newHsv.s === 0) newHsv.h = this.hsv.h;
            this.hsv = newHsv;
            this._renderSwatch();
            this._renderSv();
            this._renderHue();
            this._renderHexInput();
            if (this.cfg.showContrast) this._renderContrast();
            this._commit();
        }

        _readRgbField(inp) {
            const v = inp.value.trim();
            if (v === "" || !/^\d{1,3}$/.test(v)) return null;
            const n = parseInt(v, 10);
            if (n > 255) return null;
            return n;
        }

        _onRgbBlur() {
            this._pushRecent(this._currentHex());
            this._renderRgb();
        }

        // ── HSL giriş işleyicileri ─────────────────────────────────

        _readHslField(inp, max) {
            const v = inp.value.trim();
            if (v === "" || !/^\d{1,3}$/.test(v)) return null;
            const n = parseInt(v, 10);
            if (n > max) return null;
            return n;
        }

        _onHslInput() {
            if (!this.cfg.showHsl) return;
            const h = this._readHslField(this.hInput, 360);
            const s = this._readHslField(this.sInput, 100);
            const l = this._readHslField(this.lInput, 100);
            if (h == null || s == null || l == null) return;
            const rgb = hslToRgb(h, s, l);
            const newHsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
            // Gri/siyahta hue kayıpsızlığı: kullanıcının yazdığı H'yi koru
            newHsv.h = h;
            this.hsv = newHsv;
            this._renderSwatch();
            this._renderSv();
            this._renderHue();
            this._renderHexInput();
            this._renderRgb();
            if (this.cfg.showContrast) this._renderContrast();
            this._renderPresetActive();
            this._commit();
        }

        _onHslBlur() {
            this._pushRecent(this._currentHex());
            this._renderHsl();
        }

        _nudgeHsl(inp, delta, max) {
            const cur = parseInt(inp.value, 10);
            const base = isNaN(cur) ? 0 : cur;
            inp.value = String(clamp(base + delta, 0, max));
            this._onHslInput();
        }

        _nudgeRgb(inp, delta) {
            const cur = parseInt(inp.value, 10);
            const base = isNaN(cur) ? 0 : cur;
            inp.value = String(clamp(base + delta, 0, 255));
            this._onRgbInput();
        }

        // ── Seçim / commit ─────────────────────────────────────────

        _currentHex() {
            return hsvToHex(this.hsv.h, this.hsv.s, this.hsv.v);
        }

        /** Bir HEX'i doğrudan seç (palet / preset / son kullanılan). */
        _pickHex(hex, pushRecent) {
            const rgb = parseHex(hex);
            if (!rgb) return;
            const newHsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
            if (newHsv.s === 0) newHsv.h = this.hsv.h; // hue koru
            this.hsv = newHsv;
            this._renderAll();
            this._commit();
            if (pushRecent) this._pushRecent(rgbToHex(rgb.r, rgb.g, rgb.b));
        }

        /** Dahili durumu native input'a yaz + event yay. */
        /**
         * v1.5.1 — change semantiği düzeltildi: sürükleme sırasında her
         * pointermove tick'i change YAYMAZ (input yayar — canlı önizleme);
         * change bırakışta bir kez gider (native input type=color gibi).
         * fireChange=false → change ertelenir (_pendingChange), drag sonunda
         * _commit(true) bekleyeni boşaltır.
         */
        _commit(fireChange = true) {
            const hex = this._currentHex();
            this._suppressNative = true;
            if (this.input.value !== hex) {
                this.input.value = hex;
                this.input.dispatchEvent(new Event("input", { bubbles: true }));
                if (fireChange) {
                    this.input.dispatchEvent(new Event("change", { bubbles: true }));
                    this._pendingChange = false;
                } else {
                    this._pendingChange = true;
                }
            } else if (fireChange && this._pendingChange) {
                this.input.dispatchEvent(new Event("change", { bubbles: true }));
                this._pendingChange = false;
            }
            this._suppressNative = false;
        }

        // ── Son kullanılanlar ──────────────────────────────────────

        _pushRecent(hex) {
            if (!this.cfg.showRecents || !hex) return;
            hex = hex.toLowerCase();
            // Tekrarları kaldır, başa ekle, sınırla
            this.recents = this.recents.filter(c => c !== hex);
            this.recents.unshift(hex);
            if (this.recents.length > this.cfg.maxRecents) {
                this.recents.length = this.cfg.maxRecents;
            }
            this._renderRecents();
            this._saveRecents();
        }

        _loadRecents() {
            if (!this.recentsKey) return;
            const max = (this.cfg && this.cfg.maxRecents) || 9;
            try {
                const raw = localStorage.getItem("glint-color:" + this.recentsKey);
                if (raw) {
                    const arr = JSON.parse(raw);
                    if (Array.isArray(arr)) this.recents = arr.filter(c => typeof c === "string").slice(0, max);
                }
            } catch (_) { /* gizli mod / kota → sessiz */ }
        }

        _saveRecents() {
            if (!this.recentsKey) return;
            try { localStorage.setItem("glint-color:" + this.recentsKey, JSON.stringify(this.recents)); }
            catch (_) { /* sessiz */ }
        }

        // ── Render ─────────────────────────────────────────────────

        _renderAll() {
            this._renderSwatch();
            this._renderSv();
            this._renderHue();
            this._renderHexInput();
            this._renderRgb();
            this._renderHsl();
            this._renderContrast();
            this._renderPresetActive();
        }

        _renderSwatch() {
            const hex = this._currentHex();
            this.swatch.style.setProperty("--glint-color-current", hex);
            this.valueText.textContent = hex.toUpperCase();
        }

        _renderSv() {
            // Zemin = salt hue
            this.sv.style.setProperty("--glint-color-hue-bg", hueToHex(this.hsv.h));
            // Thumb konumu
            const x = clamp(this.hsv.s, 0, 100);
            const y = 100 - clamp(this.hsv.v, 0, 100);
            this.svThumb.style.left = x + "%";
            this.svThumb.style.top = y + "%";
            this.svThumb.style.setProperty("--glint-color-current", this._currentHex());
            // ARIA
            this.sv.setAttribute("aria-valuetext",
                `Doygunluk ${Math.round(this.hsv.s)}%, Parlaklık ${Math.round(this.hsv.v)}%`);
        }

        _renderHue() {
            const hueHex = hueToHex(this.hsv.h);
            this.hue.style.setProperty("--glint-color-hue-bg", hueHex);
            this.hueThumb.style.left = (clamp(this.hsv.h, 0, 360) / 360 * 100) + "%";
            this.hueThumb.style.setProperty("--glint-color-hue-bg", hueHex);
            this.hue.setAttribute("aria-valuenow", String(Math.round(this.hsv.h)));
        }

        _renderHexInput() {
            if (document.activeElement === this.hexInput) return;
            this.hexInput.value = this._currentHex().toUpperCase();
            this.hexInput.classList.remove("is-invalid");
        }

        _renderRgb() {
            if (!this.cfg.showRgb) return;
            const { r, g, b } = hsvToRgb(this.hsv.h, this.hsv.s, this.hsv.v);
            if (document.activeElement !== this.rInput) this.rInput.value = String(r);
            if (document.activeElement !== this.gInput) this.gInput.value = String(g);
            if (document.activeElement !== this.bInput) this.bInput.value = String(b);
        }

        _renderHsl() {
            if (!this.cfg.showHsl) return;
            const rgb = hsvToRgb(this.hsv.h, this.hsv.s, this.hsv.v);
            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
            // Gri/siyahta HSL.h tanımsız → dahili HSV hue'yu göster (tutarlılık)
            const hShown = (hsl.s === 0) ? this.hsv.h : hsl.h;
            if (document.activeElement !== this.hInput) this.hInput.value = String(Math.round(hShown));
            if (document.activeElement !== this.sInput) this.sInput.value = String(Math.round(hsl.s));
            if (document.activeElement !== this.lInput) this.lInput.value = String(Math.round(hsl.l));
        }

        // ── WCAG kontrast rozetleri ────────────────────────────────
        _renderContrast() {
            if (!this.cfg.showContrast || !this.contrastEl) return;
            const L = this.cfg.labels;
            const rgb = hsvToRgb(this.hsv.h, this.hsv.s, this.hsv.v);
            const vsWhite = contrastRatio(rgb, { r: 255, g: 255, b: 255 });
            const vsBlack = contrastRatio(rgb, { r: 0, g: 0, b: 0 });
            const fmt = n => (Math.round(n * 100) / 100).toFixed(2);
            const rows = [
                { txt: "#ffffff", label: L.contrastWhite, ratio: vsWhite },
                { txt: "#000000", label: L.contrastBlack, ratio: vsBlack }
            ];
            this.contrastEl.innerHTML = "";
            const title = document.createElement("div");
            title.className = "glint-color-section-title glint-color-contrast-title";
            title.textContent = L.contrastTitle;
            this.contrastEl.appendChild(title);
            const curHex = this._currentHex();
            rows.forEach(row => {
                const lvl = contrastLevel(row.ratio);
                const item = document.createElement("div");
                item.className = "glint-color-contrast-row";
                // Önizleme: seçili renk zemininde örnek metin
                const sample = document.createElement("span");
                sample.className = "glint-color-contrast-sample";
                sample.style.backgroundColor = curHex;
                sample.style.color = row.txt;
                sample.textContent = "Aa";
                sample.setAttribute("aria-hidden", "true");
                const meta = document.createElement("span");
                meta.className = "glint-color-contrast-meta";
                const name = document.createElement("span");
                name.className = "glint-color-contrast-name";
                name.textContent = row.label;
                const ratioEl = document.createElement("span");
                ratioEl.className = "glint-color-contrast-ratio";
                ratioEl.textContent = fmt(row.ratio) + ":1";
                meta.appendChild(name);
                meta.appendChild(ratioEl);
                const badge = document.createElement("span");
                badge.className = "glint-color-contrast-badge glint-color-contrast-badge--" + lvl.cls;
                badge.textContent = lvl.label;
                item.appendChild(sample);
                item.appendChild(meta);
                item.appendChild(badge);
                item.setAttribute("aria-label",
                    row.label + " metin kontrastı " + fmt(row.ratio) + " birde 1, " + lvl.label);
                this.contrastEl.appendChild(item);
            });
        }

        _renderPresetActive() {
            if (!this.presetsEl) return;
            const cur = this._currentHex().toLowerCase();
            this.presetsEl.querySelectorAll(".glint-color-preset").forEach(btn => {
                const match = (btn.dataset.color || "").toLowerCase() === cur;
                btn.classList.toggle("is-active", match);
            });
        }

        _renderRecents() {
            if (!this.recentsEl) return;
            this.recentsEl.innerHTML = "";
            this.recents.forEach(hex => {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "glint-color-preset";
                btn.dataset.color = hex;
                btn.style.setProperty("--glint-color-preset-bg", hex);
                btn.setAttribute("aria-label", hex);
                btn.addEventListener("click", () => this._pickHex(hex, false));
                this.recentsEl.appendChild(btn);
            });
            // Boşsa başlığı gizle
            if (this.recentsTitle) {
                this.recentsTitle.style.display = this.recents.length ? "" : "none";
            }
        }

        // ── Aç / kapat ─────────────────────────────────────────────

        open() {
            if (this.isOpen || this.input.disabled) return;
            this.isOpen = true;
            this.field.classList.add("is-open");
            this.trigger.setAttribute("aria-expanded", "true");
            this._renderAll();
            this._renderRecents();

            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                this.backdrop.classList.add("is-open");
                this._prevBodyOverflow = document.body.style.overflow;
                document.body.style.overflow = "hidden";
                // Mobil: ekranın altına ortala (bottom-sheet benzeri)
                this._positionMobile();
            } else {
                this._positionPopover();
            }

            requestAnimationFrame(() => this.popover.classList.add("is-open"));
        }

        close() {
            if (!this.isOpen) return;
            this.isOpen = false;
            this.field.classList.remove("is-open");
            this.trigger.setAttribute("aria-expanded", "false");
            this.popover.classList.remove("is-open");
            this.backdrop.classList.remove("is-open");
            if (this._prevBodyOverflow !== undefined) {
                document.body.style.overflow = this._prevBodyOverflow;
                this._prevBodyOverflow = undefined;
            }
        }

        toggle() {
            this.isOpen ? this.close() : this.open();
        }

        // ── Konumlandırma ──────────────────────────────────────────

        _positionPopover() {
            const rect = this.trigger.getBoundingClientRect();
            const popH = this.popover.offsetHeight || 360;
            const popW = this.popover.offsetWidth || 248;
            const vpH = window.innerHeight;
            const vpW = window.innerWidth;
            const margin = 8;

            // Dikey: aşağı sığmazsa yukarı çevir (origin de buna göre)
            let top = rect.bottom + margin;
            let originY = "top";
            if (top + popH > vpH - 12 && rect.top - margin - popH > 12) {
                top = rect.top - popH - margin;
                originY = "bottom";
            }

            // Yatay: sağa taşarsa sola hizala
            let left = rect.left;
            let originX = "left";
            if (left + popW > vpW - 12) {
                left = rect.right - popW;
                originX = "right";
                if (left < 12) left = vpW - popW - 12;
            }
            if (left < 12) left = 12;

            this.popover.style.top = (window.scrollY + top) + "px";
            this.popover.style.left = (window.scrollX + left) + "px";
            // Trigger'dan origin-aware scale-in
            this.popover.style.transformOrigin = `${originY} ${originX}`;
        }

        _positionMobile() {
            // Ekran altına yatay ortalanmış sabit konum
            const popW = this.popover.offsetWidth || 248;
            const left = Math.max(12, (window.innerWidth - popW) / 2);
            this.popover.style.top = (window.scrollY + window.innerHeight - (this.popover.offsetHeight || 360) - 16) + "px";
            this.popover.style.left = (window.scrollX + left) + "px";
            this.popover.style.transformOrigin = "bottom center";
        }

        // ── Temizlik ───────────────────────────────────────────────

        destroy() {
            document.removeEventListener("pointerdown", this._outsideHandler);
            document.removeEventListener("keydown", this._keyHandler);
            window.removeEventListener("resize", this._reposHandler);
            window.removeEventListener("scroll", this._reposHandler, true);
            this.input.removeEventListener("change", this._nativeChangeHandler);
            this.popover.remove();
            this.backdrop.remove();
            // v1.5.1 — native input eski haline döner ve görsel katman söker:
            // eskiden trigger + field wrap DOM'da kalıyor (tıklayınca kopuk
            // popover'ı "açan" hayalet buton), input ise tabIndex=-1 +
            // aria-hidden ile erişilemez kalıyordu. Upload'daki replaceWith
            // deseniyle aynı.
            this.input.removeAttribute("aria-hidden");
            this.input.removeAttribute("tabindex");
            if (this.field && this.field.parentNode) {
                this.field.replaceWith(this.input);
            }
            delete this.input._glintColorInit;
            delete this.input._glintColorInstance;
            window.Glint.unregister(this.input);
        }

        // ── Statik yardımcılar (programatik API) ───────────────────

        static _getInstance(el) {
            return el && el._glintColorInstance ? el._glintColorInstance : null;
        }
        /** Programatik renk ata: Glint.Color.setValue(inputEl, "#ff0000") */
        static setValue(el, hex) {
            const inst = GlintColor._getInstance(el);
            if (inst) inst._pickHex(hex, false);
        }
        /** Mevcut HEX'i oku */
        static getValue(el) {
            const inst = GlintColor._getInstance(el);
            return inst ? inst._currentHex() : (el ? el.value : null);
        }
    }


    // ══════════════════════════════════════════════════════════════
    //  ÇEKİRDEĞE KAYIT (Glint.defineComponent) + GÜVENLİ YÜKLEME GUARD'I
    // ══════════════════════════════════════════════════════════════

    function register() {
        const Glint = window.Glint;
        Glint.defineComponent("color", {
            selector: "input.glint-color",
            match: el => !el._glintColorInit,
            mount: el => new GlintColor(el)
        });
        // Global API + dönüşüm yardımcıları (test/entegrasyon için açık)
        Glint.Color = GlintColor;
        Glint.Color.config = Glint.Color.config || null;
        Glint.Color.utils = { parseHex, rgbToHex, rgbToHsv, hsvToRgb, hsvToHex, hueToHex, rgbToHsl, hslToRgb, relLuminance, contrastRatio, contrastLevel };
    }

    if (window.Glint && window.Glint.defineComponent) {
        register();
    } else {
        // Çekirdek (glint-input.js) henüz yüklenmediyse DOMContentLoaded'da dene.
        // O ana kadar yüklenmemişse minimal bir fallback observer kur.
        document.addEventListener("DOMContentLoaded", () => {
            if (window.Glint && window.Glint.defineComponent) {
                register();
            } else {
                // Çekirdek yok — bağımsız fallback: kendi taraması.
                window.Glint = window.Glint || {};
                const scan = (root) => {
                    (root.querySelectorAll
                        ? root.querySelectorAll("input.glint-color")
                        : []).forEach(el => { if (!el._glintColorInit) new GlintColor(el); });
                };
                scan(document);
                window.Glint.Color = GlintColor;
                window.Glint.Color.utils = { parseHex, rgbToHex, rgbToHsv, hsvToRgb, hsvToHex, hueToHex, rgbToHsl, hslToRgb, relLuminance, contrastRatio, contrastLevel };
            }
        });
    }

})();


/* ════════════════════════════════════════════════════════════════════════
 *  8) Date / Time / DateTime Picker (v2)
 *     (kaynak modül: glint-picker.js)
 * ════════════════════════════════════════════════════════════════════════ */
/**
 * Glint Picker Library v2.0
 * ─────────────────────────────────────────────────────────────
 * glint-input kütüphanesinin uzantısı. Native HTML5 date/time/
 * datetime-local input'larını sarmalayıp tutarlı bir picker UI
 * sağlar.
 *
 * Kullanım — kullanıcı normal markup yazar:
 *
 *   <div class="glint-input-group">
 *     <input type="date" asp-for="StartDate" class="glint-input"
 *            placeholder=" ">
 *     <label asp-for="StartDate" class="glint-label">
 *       Başlangıç Tarihi
 *     </label>
 *   </div>
 *
 * Kütüphane otomatik tespit eder ve şunu yapar:
 *   1. Native input'u hidden yapar (form binding korunur).
 *   2. Yerine display input enjekte eder (.glint-input class'lı).
 *   3. glint-input kütüphanesini display input üstünde init eder.
 *   4. Toggle button + popover yaratır.
 *
 * Native input'un form değerini sürekli senkron tutar — ASP.NET
 * model binding'i doğrudan çalışır.
 *
 * ─────────────────────────────────────────────────────────────
 * v2.0 YENİLİKLERİ (geriye dönük uyumlu — yeni attr'ler opsiyonel):
 *
 *   1) min/max — native input'ta data-min / data-max ("YYYY-MM-DD")
 *      veya HTML5 min / max attribute'ü. Aralık dışı günler
 *      devre dışı (tıklanamaz, .is-disabled).
 *
 *   2) Devre dışı günler:
 *        • data-disabled="2026-01-01,2026-12-31" (virgüllü liste)
 *        • data-disabled-weekdays="0,6" (0=Paz ... 6=Cmt)
 *
 *   3) Tarih ARALIĞI seçimi (range varyantı):
 *        • Tek input'ta data-range:
 *            <input type="date" data-range ...>
 *          Native input "YYYY-MM-DD/YYYY-MM-DD" formatında saklar,
 *          display "dd.MM.yyyy – dd.MM.yyyy" gösterir. İsteğe bağlı
 *          data-range-end="EndModel" ile ikinci bir hidden input'a
 *          bitiş ayrıca yazılır (asp-for için).
 *        • İki bağlı input:
 *            <input type="date" data-range data-range-end="#endInput">
 *          (range-end bir CSS seçici ise o native input bitişi tutar)
 *      İlk tık başlangıç, ikinci tık bitiş; aradaki günler vurgulanır;
 *      seçim tamamken yeni tık sıfırlar.
 *
 *   4) Grid içi TAM ok-tuşu navigasyonu:
 *        ← → ↑ ↓  gün odağı taşır (sınırda ay değişir)
 *        PageUp/PageDown      ay
 *        Shift+PageUp/Down    yıl
 *        Home / End           hafta başı / sonu
 *        Enter / Space        seç
 *        Escape               kapat
 *      Roving tabindex + aria-selected/disabled.
 *
 * Lokalizasyon — TR default. Değiştirmek için:
 *
 *   window.Glint = window.Glint || {};
 *   window.Glint.Picker.locale = { months: [...], weekdays: [...], ... };
 *
 * Sınırlamalar (v2):
 *   - Range yalnızca date / datetime-local takvim kısmında geçerli;
 *     time-only'de anlamsız (yok sayılır). Range'de min/max saat
 *     bileşeni yok sayılır (yalnız tarih bazlı sınır).
 *   - datetime-local (tekil): min/max saat bileşeni de uygulanır —
 *     sınır gününde seçilen/girilen saat min/max altına/üstüne kaçarsa
 *     otomatik olarak sınır saatine kelepçelenir.
 *   - Yıl/ay açılır listesi (dropdown) henüz yok (başlık tıkı bugüne atlar).
 */

(function () {
    "use strict";

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ══════════════════════════════════════════════════════════════
    //  LOCALE
    // ══════════════════════════════════════════════════════════════

    const LOCALE_TR = {
        months: [
            "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
            "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
        ],
        // Pazartesi haftanın ilk günü
        weekdays: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"],
        weekStart: 1, // 0=Paz, 1=Pzt
        today: "Bugün",
        clear: "Temizle",
        ok: "Tamam",
        rangeSep: "–", // başlangıç – bitiş ayracı
        // Range preset etiketleri (data-presets etkinse sol/üst dikey liste)
        presets: {
            today: "Bugün",
            last7: "Son 7 gün",
            last30: "Son 30 gün",
            thisMonth: "Bu ay",
            lastMonth: "Geçen ay"
        }
    };

    function getLocale() {
        return (window.Glint && window.Glint.Picker && window.Glint.Picker.locale) || LOCALE_TR;
    }


    // ══════════════════════════════════════════════════════════════
    //  YARDIMCILAR — Date format/parse
    // ══════════════════════════════════════════════════════════════

    function pad2(n) {
        return String(n).padStart(2, "0");
    }

    /** "yyyy-MM-dd" → Date (yerel zaman, 00:00) */
    function parseISODate(str) {
        if (!str) return null;
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
        if (!m) return null;
        const d = new Date(+m[1], +m[2] - 1, +m[3]);
        return isNaN(d) ? null : d;
    }

    /** "HH:mm" → { h, m } */
    function parseISOTime(str) {
        if (!str) return null;
        const m = /^(\d{2}):(\d{2})/.exec(str);
        if (!m) return null;
        const h = +m[1], mi = +m[2];
        if (h < 0 || h > 23 || mi < 0 || mi > 59) return null;
        return { h, m: mi };
    }

    /** "yyyy-MM-ddTHH:mm" → Date */
    function parseISODateTime(str) {
        if (!str) return null;
        const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(str);
        if (!m) return null;
        const d = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
        return isNaN(d) ? null : d;
    }

    function formatISODate(d) {
        return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    }

    function formatISOTime(h, m) {
        return `${pad2(h)}:${pad2(m)}`;
    }

    function formatISODateTime(d) {
        return `${formatISODate(d)}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
    }

    /** TR display: "dd.MM.yyyy" */
    function formatDisplayDate(d) {
        return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`;
    }

    /** "dd.MM.yyyy HH:mm" */
    function formatDisplayDateTime(d) {
        return `${formatDisplayDate(d)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
    }

    /** Bir ay grid'ini hesapla — 6 satır × 7 sütun.
     *  Önceki ay/sonraki ay overflow günleri (is-outside) dahil. */
    function buildMonthGrid(year, month, weekStart) {
        // month: 0-indexed (Jan=0)
        const firstOfMonth = new Date(year, month, 1);
        const firstWeekday = firstOfMonth.getDay(); // 0=Sun..6=Sat
        // weekStart'a göre kaç gün geri gitmemiz lazım
        let leadingDays = (firstWeekday - weekStart + 7) % 7;
        // Grid başlangıç tarihi
        const start = new Date(year, month, 1 - leadingDays);

        const days = [];
        for (let i = 0; i < 42; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            days.push(d);
        }
        // 5 vs 6 satır toggle — basitlik için her zaman 6 satır.
        return days;
    }

    function isSameDay(a, b) {
        if (!a || !b) return false;
        return a.getFullYear() === b.getFullYear() &&
               a.getMonth() === b.getMonth() &&
               a.getDate() === b.getDate();
    }

    /** ISO 8601 hafta numarası (1..53). Hafta Pazartesi başlar; bir haftanın
     *  ait olduğu yıl, o haftanın Perşembe'sinin yılıdır. Yerel saat dilimi
     *  bağımsız olması için tarihi UTC'ye kopyalayıp hesaplarız. */
    function getISOWeek(date) {
        // Tarihin saat/zaman kısmını at, UTC gün olarak al
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        // ISO: Pazartesi=1 .. Pazar=7
        const dayNum = (d.getUTCDay() + 6) % 7;
        // Bu haftanın Perşembe'sine kaydır (yıl aidiyetini belirler)
        d.setUTCDate(d.getUTCDate() - dayNum + 3);
        // O yılın ilk Perşembe'si
        const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
        const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
        firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
        // Aradaki hafta farkı + 1
        const diffMs = d - firstThursday;
        return 1 + Math.round(diffMs / (7 * 24 * 3600 * 1000));
    }

    /** Sadece tarih kısmı (00:00'a normalize) — karşılaştırmalar için */
    function dayKey(d) {
        return d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate();
    }

    /** a < b (gün bazında) */
    function dayBefore(a, b) {
        return dayKey(a) < dayKey(b);
    }

    /** a, [min,max] aralığında mı (sınırlar dahil; null = sınırsız) */
    function inRange(d, min, max) {
        const k = dayKey(d);
        if (min && k < dayKey(min)) return false;
        if (max && k > dayKey(max)) return false;
        return true;
    }


    // ══════════════════════════════════════════════════════════════
    //  GlintPicker
    // ══════════════════════════════════════════════════════════════

    class GlintPicker {

        constructor(group, nativeInput) {
            this.group = group;
            this.nativeInput = nativeInput;
            this.type = nativeInput.type; // "date" | "time" | "datetime-local"
            this.locale = getLocale();
            this.isOpen = false;

            // ── v2: Kısıt & varyant okuma (attribute'lar) ──
            this._readConstraints();

            // Current state — Date object or null
            // time-only için Date'in tarih kısmı önemsiz, sadece h/m
            this.value = null;
            // Range varyantında: başlangıç + bitiş
            this.rangeStart = null;
            this.rangeEnd = null;
            // Ok-tuşu navigasyonu için odaklı gün (Date) ve roving tabindex
            this.focusDate = null;

            // Görüntülenen ay (takvim navigation için)
            this.viewYear = null;
            this.viewMonth = null;

            // ÖNEMLİ: state'i constructor'da hesapla ve display.value'yu
            // Glint.Input init'inden ÖNCE set et.
            this._calculateInitialState();

            this._build();
            this._bindEvents();
            this._renderAll();
            group._glintPickerInstance = this;
            window.Glint.register(group, this);
        }

        // ── v2: Kısıtları oku ─────────────────────────────────────

        _readConstraints() {
            const el = this.nativeInput;

            // min/max — data-min/data-max öncelikli, sonra HTML5 min/max
            const minRaw = el.getAttribute("data-min") || el.getAttribute("min") || "";
            const maxRaw = el.getAttribute("data-max") || el.getAttribute("max") || "";
            // datetime-local min/max "YYYY-MM-DDTHH:mm" da olabilir → tarih kısmı al
            this.minDate = parseISODate(minRaw.slice(0, 10));
            this.maxDate = parseISODate(maxRaw.slice(0, 10));

            // datetime-local için min/max'ın SAAT bileşenini de sakla; gün
            // seçildikten sonra value saatini bu sınıra kelepçelemek için.
            // (inRange yalnız tarih bazında çalışır; sınır gününde saatin
            //  min/max altına/üstüne kaçmasını seçim sonrası düzeltiriz.)
            this.minDateTime = this.type === "datetime-local" ? parseISODateTime(minRaw) : null;
            this.maxDateTime = this.type === "datetime-local" ? parseISODateTime(maxRaw) : null;

            // Devre dışı tek tarihler — Set<dayKey>
            this.disabledDays = new Set();
            const disRaw = el.getAttribute("data-disabled") || "";
            disRaw.split(",").forEach(s => {
                const d = parseISODate(s.trim());
                if (d) this.disabledDays.add(dayKey(d));
            });

            // Devre dışı hafta günleri — Set<0..6> (0=Paz, JS getDay ile uyumlu)
            this.disabledWeekdays = new Set();
            const wdRaw = el.getAttribute("data-disabled-weekdays") || "";
            wdRaw.split(",").forEach(s => {
                const n = parseInt(s.trim(), 10);
                if (!isNaN(n) && n >= 0 && n <= 6) this.disabledWeekdays.add(n);
            });

            // Hafta numaraları — sırf görsel; her grid satırı başına ISO hafta no
            this.showWeekNumbers = el.hasAttribute("data-week-numbers");

            // Çoklu-ay görünümü — yan yana N ay paneli (yalnız takvim tipleri).
            // data-months=2|3 → birden çok ay aynı anda; aralık seçiminde özellikle
            // kullanışlı. Eksik/1/0 → tek ay (varsayılan, mevcut davranış). Üst
            // sınır 3 (popover genişliği). Tek-ay kod yolu bundan etkilenmez.
            this.monthCount = 1;
            if (this.type === "date" || this.type === "datetime-local") {
                const mc = parseInt(el.getAttribute("data-months"), 10);
                if (!isNaN(mc) && mc >= 2) this.monthCount = Math.min(mc, 3);
            }

            // Range varyantı — yalnızca date / datetime-local için anlamlı
            this.isRange = el.hasAttribute("data-range") &&
                (this.type === "date" || this.type === "datetime-local");

            // 12 saat (AM/PM) GÖRÜNÜMÜ — yalnız saat içeren tiplerde anlamlı.
            // İç değer (this.value) HER ZAMAN 24h kalır; native ISO çıktı
            // (formatISOTime / formatISODateTime) bozulmaz. Sadece hourField'in
            // görünür rakamı 1-12'ye çevrilir + AM/PM toggle eklenir.
            this.is12h = (el.getAttribute("data-hour-cycle") === "12") &&
                (this.type === "time" || this.type === "datetime-local");
            // Geçerli meridiem ("AM"/"PM") — _renderTime iç saatten yeniden türetir.
            // Başlangıç "AM" yalnız placeholder; ilk _renderAll → _renderMeridiem
            // gerçek değere göre düzeltir.
            this.meridiem = "AM";

            // Preset aralıklar — yalnız range modunda anlamlı (data-presets).
            // Boş/işaret değer → tüm presetler; virgüllü liste → alt küme & sıra.
            this.presetKeys = null;
            if (this.isRange && el.hasAttribute("data-presets")) {
                const ALL = ["today", "last7", "last30", "thisMonth", "lastMonth"];
                const raw = (el.getAttribute("data-presets") || "").trim();
                if (!raw) {
                    this.presetKeys = ALL.slice();
                } else {
                    const want = raw.split(",").map(s => s.trim()).filter(Boolean);
                    this.presetKeys = want.filter(k => ALL.indexOf(k) !== -1);
                    if (!this.presetKeys.length) this.presetKeys = null;
                }
            }

            // data-range-end: bir CSS seçici (#id) ise harici native input'a
            // bitiş yazılır; aksi halde aynı input'a "/" ile gömülür ve
            // istenirse model adı string olarak hidden mirror üretilir.
            this.rangeEndTarget = null;     // harici native input (varsa)
            this.rangeEndMirrorName = null; // hidden mirror name (varsa)
            if (this.isRange) {
                const rEnd = el.getAttribute("data-range-end");
                if (rEnd) {
                    let target = null;
                    try { target = document.querySelector(rEnd); } catch (e) { target = null; }
                    if (target && target.tagName === "INPUT") {
                        this.rangeEndTarget = target;
                    } else {
                        // Seçici eşleşmedi → model adı kabul et, hidden mirror üret
                        this.rangeEndMirrorName = rEnd;
                    }
                }
            }
        }

        /** Bir tarih seçilebilir mi? (min/max + disabled gün/hafta günü) */
        _isSelectable(d) {
            if (!d) return false;
            if (!inRange(d, this.minDate, this.maxDate)) return false;
            if (this.disabledWeekdays.has(d.getDay())) return false;
            if (this.disabledDays.has(dayKey(d))) return false;
            return true;
        }

        /** datetime-local: value'nun SAAT bileşenini min/max sınırına kelepçele.
         *  Sınır gününde (aynı gün) saat min/max altına/üstüne kaçarsa düzeltir.
         *  Diğer günlerde tarih zaten inRange ile garanti olduğundan dokunmaz. */
        _clampTimeToBounds(d) {
            if (this.type !== "datetime-local" || !d) return d;
            if (this.minDateTime && isSameDay(d, this.minDateTime) && d < this.minDateTime) {
                d.setHours(this.minDateTime.getHours(), this.minDateTime.getMinutes(), 0, 0);
            }
            if (this.maxDateTime && isSameDay(d, this.maxDateTime) && d > this.maxDateTime) {
                d.setHours(this.maxDateTime.getHours(), this.maxDateTime.getMinutes(), 0, 0);
            }
            return d;
        }

        /** En yakın seçilebilir günü bul (yön: +1 ileri, -1 geri). Sınır guard'lı. */
        _nearestSelectable(d, dir) {
            const probe = new Date(d);
            for (let i = 0; i < 366; i++) {
                if (this._isSelectable(probe)) return new Date(probe);
                probe.setDate(probe.getDate() + dir);
                // min/max dışına tamamen taştıysak vazgeç
                if (dir < 0 && this.minDate && dayBefore(probe, this.minDate)) break;
                if (dir > 0 && this.maxDate && dayBefore(this.maxDate, probe)) break;
            }
            return null;
        }

        /** Native input value'sundan state hesapla — DOM dokunmaz */
        _calculateInitialState() {
            const raw = this.nativeInput.value;

            if (this.isRange) {
                // "YYYY-MM-DD/YYYY-MM-DD" veya tek tarih
                const parts = raw.split("/");
                this.rangeStart = parseISODate((parts[0] || "").slice(0, 10));
                // Harici bitiş input'u varsa ondan, yoksa "/" sonrası
                let endRaw = parts[1] || "";
                if (this.rangeEndTarget) endRaw = this.rangeEndTarget.value || endRaw;
                this.rangeEnd = parseISODate(endRaw.slice(0, 10));
                const ref = this.rangeStart || new Date();
                this.viewYear = ref.getFullYear();
                this.viewMonth = ref.getMonth();
                this.focusDate = this.rangeStart || this._defaultFocus();
                return;
            }

            let d = null;
            if (this.type === "date") {
                d = parseISODate(raw);
            } else if (this.type === "time") {
                const t = parseISOTime(raw);
                if (t) {
                    d = new Date();
                    d.setHours(t.h, t.m, 0, 0);
                }
            } else if (this.type === "datetime-local") {
                d = parseISODateTime(raw);
            }
            this.value = d;
            const ref = d || new Date();
            this.viewYear = ref.getFullYear();
            this.viewMonth = ref.getMonth();
            this.focusDate = d || this._defaultFocus();
        }

        /** Odak başlangıcı: bugün seçilebilirse bugün, değilse en yakın seçilebilir */
        _defaultFocus() {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (this._isSelectable(today)) return today;
            const fwd = this._nearestSelectable(today, +1);
            if (fwd) return fwd;
            const back = this._nearestSelectable(today, -1);
            return back || today;
        }

        /** Display input için ilk formatlanmış değeri döndür */
        _initialDisplayValue() {
            if (this.isRange) return this._formatRangeDisplay();
            if (!this.value) return "";
            if (this.type === "date") return formatDisplayDate(this.value);
            if (this.type === "time") return formatISOTime(this.value.getHours(), this.value.getMinutes());
            return formatDisplayDateTime(this.value);
        }

        _formatRangeDisplay() {
            const s = this.rangeStart ? formatDisplayDate(this.rangeStart) : "";
            const e = this.rangeEnd ? formatDisplayDate(this.rangeEnd) : "";
            if (!s && !e) return "";
            if (s && !e) return `${s} ${this.locale.rangeSep} …`;
            return `${s} ${this.locale.rangeSep} ${e}`;
        }

        // ── DOM Build ─────────────────────────────────────────────

        _build() {
            // 1. Native input'u gizle — hidden formdan VERİ göndermeyi engellemez.
            this.nativeInput.hidden = true;
            this.nativeInput.tabIndex = -1;
            this.nativeInput.setAttribute("aria-hidden", "true");
            this.nativeInput.classList.remove("glint-input");

            // 2. Group'u sınıflandır
            this.group.classList.add("glint-input-group--picker");
            const typeClass = this.type === "datetime-local" ? "datetime" : this.type;
            this.group.classList.add(`glint-input-group--${typeClass}`);
            if (this.isRange) this.group.classList.add("glint-input-group--range");

            // v2: Bu grubu çekirdek için "sahiplenilmiş" işaretle — base
            // GlintInput yeniden başlatmaya çalışmasın (guard zinciri).
            if (window.Glint && window.Glint.claimGroup) {
                window.Glint.claimGroup(this.group);
            }

            // 3. Display input — görsel olarak gözüken ama readonly
            this.display = document.createElement("input");
            this.display.type = "text";
            this.display.className = "glint-input";
            this.display.readOnly = true;
            this.display.placeholder = " ";
            this.display.autocomplete = "off";
            this.display.inputMode = "none";
            this.display.value = this._initialDisplayValue();

            // Label asociation — native input'tan id'yi al, display'e ver
            const lbl = this.group.querySelector(".glint-label");
            const oldId = this.nativeInput.id;
            if (oldId) {
                this.display.id = oldId + "__display";
                if (lbl) lbl.setAttribute("for", this.display.id);
            }

            // Native input'tan hemen sonra ekle
            this.nativeInput.insertAdjacentElement("afterend", this.display);

            // v2: Range hidden mirror (asp-for için ayrı bitiş alanı)
            this._buildRangeMirror();

            // 4. Toggle button — sağdaki ikon
            this.toggleBtn = document.createElement("button");
            this.toggleBtn.type = "button";
            this.toggleBtn.className = "glint-field__action glint-picker-toggle";
            this.toggleBtn.setAttribute("aria-label", "Seçici aç");
            this.toggleBtn.setAttribute("aria-haspopup", "dialog");
            this.toggleBtn.setAttribute("aria-expanded", "false");
            this.toggleBtn.innerHTML = this._getToggleIcon();
            this.group.appendChild(this.toggleBtn);

            // 5. Glint.Input'u display üstünde init et
            if (window.Glint && window.Glint.Input && !this.group._glintInit) {
                this.group._glintInit = true;
                new window.Glint.Input(this.group);
            }

            // 6. Popover — body'ye eklenir
            this._buildPopover();
            // 7. Backdrop — mobile bottom-sheet için
            this._buildBackdrop();
        }

        /** Range: harici hedef yoksa ama model adı verildiyse, bitişi taşıyan
         *  gizli (hidden) bir native input üret — asp-for / model binding için. */
        _buildRangeMirror() {
            if (!this.isRange) return;
            if (this.rangeEndTarget) return; // harici input zaten var
            if (!this.rangeEndMirrorName) return;

            this.rangeEndMirror = document.createElement("input");
            this.rangeEndMirror.type = "hidden";
            this.rangeEndMirror.name = this.rangeEndMirrorName;
            this.rangeEndMirror.value = this.rangeEnd ? formatISODate(this.rangeEnd) : "";
            this.nativeInput.insertAdjacentElement("afterend", this.rangeEndMirror);
        }

        _getToggleIcon() {
            // Date/datetime → takvim, time → saat
            if (this.type === "time") {
                return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                              stroke-width="2" stroke-linecap="round"
                              stroke-linejoin="round">
                            <circle cx="12" cy="12" r="9"/>
                            <path d="M12 7v5l3 2"/>
                        </svg>`;
            }
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          stroke-width="2" stroke-linecap="round"
                          stroke-linejoin="round">
                        <rect x="3" y="5" width="18" height="16" rx="2"/>
                        <path d="M3 9h18M8 3v4M16 3v4"/>
                    </svg>`;
        }

        _buildPopover() {
            this.popover = document.createElement("div");
            this.popover.className = "glint-picker-popover";
            this.popover.setAttribute("role", "dialog");
            this.popover.setAttribute("aria-modal", "false");
            this.popover.setAttribute("aria-label",
                this.isRange ? "Tarih aralığı seçici" : "Tarih seçici");

            // Preset aralık sidebar'ı varsa popover'ı yatay düzene al:
            // [ presets | ana sütun (takvim + saat) ] + altta footer.
            let calHost = this.popover;
            if (this.presetKeys) {
                this.popover.classList.add("glint-picker-popover--with-presets");
                const body = document.createElement("div");
                body.className = "glint-picker-body";
                this._buildPresets(body);
                const main = document.createElement("div");
                main.className = "glint-picker-main";
                body.appendChild(main);
                this.popover.appendChild(body);
                calHost = main;
            }

            // Date/datetime → takvim bölümü
            if (this.type === "date" || this.type === "datetime-local") {
                this._buildCalendar(calHost);
            }
            // Time/datetime → saat bölümü
            if (this.type === "time" || this.type === "datetime-local") {
                this._buildTimeSection(calHost);
            }

            // Footer (her zaman popover'ın doğrudan altında — tam genişlik)
            this._buildFooter(this.popover);

            // Body'ye ekle
            document.body.appendChild(this.popover);

            this.popover.addEventListener("mousedown", (e) => {
                const isTimeField = e.target === this.hourField?.input
                                 || e.target === this.minuteField?.input;
                if (!isTimeField) e.preventDefault();
                e.stopPropagation();
            });
        }

        _buildCalendar(parent) {
            const cal = document.createElement("div");
            cal.className = "glint-picker-calendar";
            this.calEl = cal;

            // Ay/Yıl atlama görünümü — tüm tiplerde ortak, gün görünümünün yerine
            // geçer. Çoklu-ayda panellerin tümünü kaplar (tek altGrid).
            this.altGrid = document.createElement("div");
            this.altGrid.className = "glint-picker-altgrid";
            this.altGrid.style.display = "none";

            // altGrid'in DOM yeri tek/çoklu-ay'a göre değişir: tek-ayda takvimin
            // sonuna, çoklu-ayda panel 0'ın içine (başlık görünür kalsın diye) —
            // yerleştirmeyi ilgili builder yapar.
            if (this.monthCount > 1) {
                this._buildMultiCalendar(cal);
            } else {
                this._buildSingleCalendar(cal);
            }

            parent.appendChild(cal);
        }

        /** Prev/next nav butonu (yön: "prev" | "next") */
        _makeNavBtn(dir) {
            const b = document.createElement("button");
            b.type = "button";
            b.className = "glint-picker-nav glint-picker-nav--" + dir;
            b.setAttribute("aria-label", dir === "prev" ? "Önceki ay" : "Sonraki ay");
            b.innerHTML = dir === "prev"
                ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                       <path d="M15 18l-6-6 6-6"/></svg>`
                : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                       <path d="M9 18l6-6-6-6"/></svg>`;
            return b;
        }

        /** Header dengesi için görünmez nav yer tutucu (çoklu-ay) */
        _makeNavSpacer() {
            const s = document.createElement("span");
            s.className = "glint-picker-nav glint-picker-nav--spacer";
            s.setAttribute("aria-hidden", "true");
            return s;
        }

        /** Tek bir weekday başlık satırı (hafta-no köşesi opsiyonel) */
        _buildWeekdaysRow() {
            const wk = document.createElement("div");
            wk.className = "glint-picker-weekdays";
            if (this.showWeekNumbers) {
                const corner = document.createElement("div");
                corner.className = "glint-picker-weekdays__wk";
                corner.setAttribute("aria-hidden", "true");
                wk.appendChild(corner);
            }
            this.locale.weekdays.forEach(w => {
                const cell = document.createElement("div");
                cell.textContent = w;
                wk.appendChild(cell);
            });
            return wk;
        }

        /** Tek bir gün grid'i (role=grid) */
        _buildDaysGrid() {
            const grid = document.createElement("div");
            grid.className = "glint-picker-grid";
            grid.setAttribute("role", "grid");
            grid.setAttribute("aria-label", "Takvim");
            return grid;
        }

        /** Tek-ay takvim (mevcut davranış — DOM birebir korunur) */
        _buildSingleCalendar(cal) {
            const header = document.createElement("div");
            header.className = "glint-picker-header";
            this.prevBtn = this._makeNavBtn("prev");
            this.titleBtn = document.createElement("button");
            this.titleBtn.type = "button";
            this.titleBtn.className = "glint-picker-title";
            this.titleBtn.textContent = "—";
            this.nextBtn = this._makeNavBtn("next");
            header.appendChild(this.prevBtn);
            header.appendChild(this.titleBtn);
            header.appendChild(this.nextBtn);
            cal.appendChild(header);

            // Hafta numarası modunda takvim 8 sütuna geçer (CSS host sınıfı)
            if (this.showWeekNumbers) cal.classList.add("has-week-numbers");

            const wk = this._buildWeekdaysRow();
            cal.appendChild(wk);
            this.weekdaysRow = wk;
            this.weekdayRows = [wk];

            const grid = this._buildDaysGrid();
            cal.appendChild(grid);
            cal.appendChild(this.altGrid);   // gün görünümünün yerine geçer
            this.daysGrid = grid;
            this.dayGrids = [grid];
            this.panelEls = null;
        }

        /** Çoklu-ay takvim: yan yana N panel. İlk panelde prev + tıklanır başlık
         *  (ay/yıl atlama), son panelde next; aradakiler statik başlık + spacer.
         *  Tüm paneller tek focusDate/klavye/atlama mantığını paylaşır. */
        _buildMultiCalendar(cal) {
            cal.classList.add("glint-picker-calendar--dual");
            if (this.showWeekNumbers) cal.classList.add("has-week-numbers");

            this.dayGrids = [];
            this.weekdayRows = [];
            this.panelEls = [];
            this.panelTitles = [];   // [0] = tıklanır titleBtn, diğerleri statik

            for (let i = 0; i < this.monthCount; i++) {
                const panel = document.createElement("div");
                panel.className = "glint-picker-panel";

                const header = document.createElement("div");
                header.className = "glint-picker-header";

                // Sol: ilk panelde prev, diğerlerinde spacer
                if (i === 0) {
                    this.prevBtn = this._makeNavBtn("prev");
                    header.appendChild(this.prevBtn);
                } else {
                    header.appendChild(this._makeNavSpacer());
                }

                // Orta: ilk panelde tıklanır başlık, diğerlerinde statik metin
                if (i === 0) {
                    this.titleBtn = document.createElement("button");
                    this.titleBtn.type = "button";
                    this.titleBtn.className = "glint-picker-title";
                    this.titleBtn.textContent = "—";
                    header.appendChild(this.titleBtn);
                    this.panelTitles.push(this.titleBtn);
                } else {
                    const st = document.createElement("div");
                    st.className = "glint-picker-title--static";
                    st.textContent = "—";
                    header.appendChild(st);
                    this.panelTitles.push(st);
                }

                // Sağ: son panelde next, diğerlerinde spacer
                if (i === this.monthCount - 1) {
                    this.nextBtn = this._makeNavBtn("next");
                    header.appendChild(this.nextBtn);
                } else {
                    header.appendChild(this._makeNavSpacer());
                }

                panel.appendChild(header);

                const wk = this._buildWeekdaysRow();
                panel.appendChild(wk);
                this.weekdayRows.push(wk);

                const grid = this._buildDaysGrid();
                panel.appendChild(grid);
                this.dayGrids.push(grid);

                cal.appendChild(panel);
                this.panelEls.push(panel);
            }

            // Geriye dönük referanslar (truthiness + fallback için)
            this.daysGrid = this.dayGrids[0];
            this.weekdaysRow = this.weekdayRows[0];

            // Ay/yıl atlama görünümü panel 0'ın İÇİNE (header'ın altına): atlama
            // sırasında panel 0'ın başlığı (yıl + prev/next) görünür kalır →
            // tek-ay davranışıyla birebir. Diğer paneller bu sırada gizlenir.
            this.panelEls[0].appendChild(this.altGrid);
        }

        _buildTimeSection(parent) {
            const t = document.createElement("div");
            t.className = "glint-picker-time";

            // 12h modunda saat alanı 1-12 aralığını gösterir (blur clamp ve
            // beforeinput >max guard'ı bu min/max'ı kullanır). İç değer yine 24h.
            this.hourField = this._buildTimeField("hour", this.is12h ? 1 : 0, this.is12h ? 12 : 23);
            this.minuteField = this._buildTimeField("minute", 0, 59);

            const sep = document.createElement("span");
            sep.className = "glint-picker-time__sep";
            sep.textContent = ":";

            t.appendChild(this.hourField.wrap);
            t.appendChild(sep);
            t.appendChild(this.minuteField.wrap);

            // AM/PM segmented toggle (yalnız 12h görünümünde)
            if (this.is12h) {
                this._buildMeridiemToggle(t);
            }

            parent.appendChild(t);
        }

        _buildTimeField(role, min, max) {
            const wrap = document.createElement("div");
            wrap.className = "glint-picker-time__field";

            const up = document.createElement("button");
            up.type = "button";
            up.className = "glint-picker-time__btn glint-picker-time__btn--up";
            up.setAttribute("aria-label", role === "hour" ? "Saati artır" : "Dakikayı artır");
            up.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 15l6-6 6 6"/></svg>`;

            const input = document.createElement("input");
            input.type = "text";
            input.className = "glint-picker-time__input";
            input.maxLength = 2;
            input.inputMode = "numeric";
            input.value = "00";
            input.setAttribute("aria-label", role === "hour" ? "Saat" : "Dakika");

            const down = document.createElement("button");
            down.type = "button";
            down.className = "glint-picker-time__btn glint-picker-time__btn--down";
            down.setAttribute("aria-label", role === "hour" ? "Saati azalt" : "Dakikayı azalt");
            down.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 9l6 6 6-6"/></svg>`;

            wrap.appendChild(up);
            wrap.appendChild(input);
            wrap.appendChild(down);

            return { wrap, up, down, input, min, max };
        }

        // ── 12h AM/PM toggle ──────────────────────────────────────
        //
        // İç değer 24h kalır; bu toggle yalnız GÖRÜNÜMÜ ve
        // _commitTimeFromInputs dönüşümünü etkiler. İki düğme + aria-pressed.
        _buildMeridiemToggle(parent) {
            const seg = document.createElement("div");
            seg.className = "glint-picker-meridiem";
            seg.setAttribute("role", "group");
            seg.setAttribute("aria-label", "AM/PM seçimi");

            const mk = (val) => {
                const b = document.createElement("button");
                b.type = "button";
                b.className = "glint-picker-meridiem__btn";
                b.dataset.meridiem = val;
                b.textContent = val;
                b.setAttribute("aria-pressed", "false");
                b.setAttribute("aria-label", val === "AM" ? "Öğleden önce" : "Öğleden sonra");
                seg.appendChild(b);
                return b;
            };

            this.amBtn = mk("AM");
            this.pmBtn = mk("PM");
            this.meridiemSeg = seg;
            parent.appendChild(seg);
        }

        /** 24h saat → görünür [1-12] saat */
        _hourTo12(h) {
            const hh = h % 12;
            return hh === 0 ? 12 : hh;
        }

        /** Görünür [1-12] saat + meridiem → 24h saat */
        _hourTo24(display, meridiem) {
            let h = display % 12;            // 12 → 0
            if (meridiem === "PM") h += 12;  // PM 12 → 12, PM 1 → 13 ...
            return h;                        // AM 12 → 0, AM 1 → 1 ...
        }

        /** AM/PM düğmelerinin görsel/aria durumunu iç saate göre yenile */
        _renderMeridiem() {
            if (!this.amBtn) return;
            const h = this.value ? this.value.getHours() : 0;
            this.meridiem = h >= 12 ? "PM" : "AM";
            const isAm = this.meridiem === "AM";
            this.amBtn.classList.toggle("is-active", isAm);
            this.pmBtn.classList.toggle("is-active", !isAm);
            this.amBtn.setAttribute("aria-pressed", isAm ? "true" : "false");
            this.pmBtn.setAttribute("aria-pressed", !isAm ? "true" : "false");
        }

        /** Kullanıcı AM/PM'e bastı → görünür saati koru, 24h iç değeri flip et */
        _setMeridiem(meridiem) {
            if (meridiem === this.meridiem) return;
            // Görünür [1-12] saati input'tan (yoksa iç değerden) al, yeni
            // meridiem ile 24h'e çevir. Native ISO çıktı _commit'te yine 24h.
            let display = parseInt(this.hourField.input.value, 10);
            if (isNaN(display)) display = this.value ? this._hourTo12(this.value.getHours()) : 12;
            const m = this.value ? this.value.getMinutes() : 0;
            const h24 = this._hourTo24(display, meridiem);
            const d = this.value ? new Date(this.value) : new Date();
            d.setHours(h24, m, 0, 0);
            this._clampTimeToBounds(d);
            this.value = d;
            this._renderTime();
            this._commit();
        }

        _buildFooter(parent) {
            const f = document.createElement("div");
            f.className = "glint-picker-footer";

            this.todayBtn = document.createElement("button");
            this.todayBtn.type = "button";
            this.todayBtn.className = "glint-picker-action glint-picker-action--primary";
            this.todayBtn.textContent = this.locale.today;
            // Bugün seçilemezse (min/max/devre dışı) butonu pasifleştir → sessiz no-op olmasın
            const _today = new Date(); _today.setHours(0, 0, 0, 0);
            if (!this._isSelectable(_today)) this.todayBtn.disabled = true;

            this.clearBtn = document.createElement("button");
            this.clearBtn.type = "button";
            this.clearBtn.className = "glint-picker-action glint-picker-action--ghost";
            this.clearBtn.textContent = this.locale.clear;

            f.appendChild(this.todayBtn);
            f.appendChild(this.clearBtn);

            // Onay (✓) — time/datetime VE range için. Range artık ikinci tıkta
            // OTOMATİK KAPANMAZ (kullanıcı isteği): aralığı gözden geçirip ✓ ile
            // onaylayınca kapanır.
            if (this.type === "time" || this.type === "datetime-local" || this.isRange) {
                this.okBtn = document.createElement("button");
                this.okBtn.type = "button";
                this.okBtn.className = "glint-picker-action glint-picker-confirm";
                this.okBtn.setAttribute("aria-label", this.locale.ok || "Tamam");
                this.okBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2.6" stroke-linecap="round"
                    stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
                f.appendChild(this.okBtn);
            }

            parent.appendChild(f);
        }

        _buildBackdrop() {
            this.backdrop = document.createElement("div");
            this.backdrop.className = "glint-picker-backdrop";
            document.body.appendChild(this.backdrop);
        }

        /** Range preset aralık sidebar'ı — Bugün / Son 7 gün / … dikey liste.
         *  Her buton tıkında ilgili [start,end] aralığını set eder, görünen ayı
         *  başlangıca taşır ve _commit() çağırır (popover açık kalır; ✓ ile onay). */
        _buildPresets(parent) {
            const aside = document.createElement("div");
            aside.className = "glint-picker-presets";
            aside.setAttribute("role", "group");
            aside.setAttribute("aria-label", "Hazır tarih aralıkları");

            const L = (this.locale && this.locale.presets) || LOCALE_TR.presets;
            this.presetBtns = [];

            this.presetKeys.forEach(key => {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "glint-picker-preset";
                btn.dataset.preset = key;
                btn.textContent = (L && L[key]) || LOCALE_TR.presets[key] || key;
                btn.addEventListener("click", () => this._applyPreset(key));
                aside.appendChild(btn);
                this.presetBtns.push(btn);
            });

            this.presetsAside = aside;
            parent.appendChild(aside);
        }

        /** Bir preset anahtarını [start,end] aralığına çevir (yerel, 00:00). */
        _presetRange(key) {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            let s, e;
            switch (key) {
                case "today":
                    s = new Date(today); e = new Date(today); break;
                case "last7":
                    // Bugün dahil son 7 gün
                    e = new Date(today);
                    s = new Date(today); s.setDate(s.getDate() - 6); break;
                case "last30":
                    e = new Date(today);
                    s = new Date(today); s.setDate(s.getDate() - 29); break;
                case "thisMonth":
                    s = new Date(now.getFullYear(), now.getMonth(), 1);
                    e = new Date(now.getFullYear(), now.getMonth() + 1, 0); break;
                case "lastMonth":
                    s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    e = new Date(now.getFullYear(), now.getMonth(), 0); break;
                default:
                    return null;
            }
            return { start: s, end: e };
        }

        /** Preset uygula: aralığı set et, görünen ayı başlangıca taşı, commit et. */
        _applyPreset(key) {
            const r = this._presetRange(key);
            if (!r) return;
            this.rangeStart = r.start;
            this.rangeEnd = r.end;
            this._hoverDate = null;
            this.focusDate = new Date(r.start);
            // Başlangıcın ayına git (aralık başını görünür kıl)
            this.viewYear = r.start.getFullYear();
            this.viewMonth = r.start.getMonth();
            // Aktif preset görsel işareti
            if (this.presetBtns) {
                this.presetBtns.forEach(b =>
                    b.classList.toggle("is-active", b.dataset.preset === key));
            }
            this._renderAll();
            this._commit();
            // Popover açık kalır — kullanıcı footer'daki ✓ ile onaylar (range akışı).
        }

        // ── Events ────────────────────────────────────────────────

        _bindEvents() {
            const openHandler = (e) => {
                e.stopPropagation();
                this.toggle();
            };
            this.display.addEventListener("click", openHandler);
            this.toggleBtn.addEventListener("click", openHandler);

            // Klavye: display'e tab ile geldiğinde Enter/Space/ArrowDown ile aç
            this.display.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
                    e.preventDefault();
                    if (!this.isOpen) this.open();
                } else if (e.key === "Escape" && this.isOpen) {
                    e.preventDefault();
                    this.close();
                } else if (/^[0-9]$/.test(e.key) && this.type !== "time") {
                    // Numarik klavyeyle tarih yaz: gerekiyorsa aç, rakamı işle (DDMMYYYY)
                    e.preventDefault();
                    if (!this.isOpen) this.open();
                    this._typeDate(e.key);
                }
            });

            // Calendar nav
            if (this.prevBtn) {
                this.prevBtn.addEventListener("click", () => this._onPrev());
                this.nextBtn.addEventListener("click", () => this._onNext());
                this.titleBtn.addEventListener("click", () => this._onTitle());

                // v2: Grid içi tam klavye navigasyonu + range hover (delegasyon).
                // Çoklu-ayda her panel ayrı grid → hepsine bağla (tek-ay = 1 grid).
                (this.dayGrids || [this.daysGrid]).forEach(grid => {
                    grid.addEventListener("keydown", (e) => this._onGridKeydown(e));
                    // Fare ile bir hücreye geçince odak günü de güncellensin
                    grid.addEventListener("mouseover", (e) => {
                        if (!this.isRange) return;
                        const cell = e.target.closest(".glint-picker-day");
                        if (cell && cell._date) this._onRangeHover(cell._date);
                    });
                });
            }

            // Time field events
            if (this.hourField) this._bindTimeField(this.hourField, "hour");
            if (this.minuteField) this._bindTimeField(this.minuteField, "minute");

            // AM/PM toggle olayları (yalnız 12h). Düğmeler popover içinde olduğu
            // için destroy()'daki this.popover.remove() ile birlikte sökülür
            // (anonim listener, ayrı removeEventListener gerekmez).
            if (this.amBtn) {
                this.amBtn.addEventListener("click", () => this._setMeridiem("AM"));
                this.pmBtn.addEventListener("click", () => this._setMeridiem("PM"));
            }

            // Footer
            this.todayBtn.addEventListener("click", () => this._setToToday());
            this.clearBtn.addEventListener("click", () => this._clear());
            if (this.okBtn) {
                this.okBtn.addEventListener("click", () => {
                    // v1.5.1 — klavyeyle yazılmış saat onay anında step
                    // ızgarasına oturtulur (13:33 → step=5'te 13:35).
                    if (this.hourField && this.minuteField) this._commitTimeFromInputs(true);
                    this.close();   // odak restorasyonu close() içinde merkezi
                });
            }

            // Outside click → close
            this._outsideClickHandler = (e) => {
                if (!this.isOpen) return;
                if (this.group.contains(e.target)) return;
                if (this.popover.contains(e.target)) return;
                this.close();
            };
            document.addEventListener("mousedown", this._outsideClickHandler);

            // Esc → close (global)
            this._keyHandler = (e) => {
                if (this.isOpen && e.key === "Escape") {
                    e.preventDefault();
                    this.close();   // v1.5.1 — odak restorasyonu close() içinde
                }
            };
            document.addEventListener("keydown", this._keyHandler);

            // Backdrop click (mobile) → close
            this.backdrop.addEventListener("click", () => this.close());

            // Reposition on resize/scroll (sadece desktop)
            this._reposHandler = () => {
                if (this.isOpen && window.innerWidth > 768) {
                    this._positionPopover();
                }
            };
            window.addEventListener("resize", this._reposHandler);
            window.addEventListener("scroll", this._reposHandler, { capture: true, passive: true });

            // Native input dışarıdan programmatic değiştirilirse sync
            this._nativeChangeHandler = () => {
                if (this._suppressNativeSync) return;
                this._syncFromNative();
            };
            this.nativeInput.addEventListener("change", this._nativeChangeHandler);

            // Range harici bitiş input'u dışarıdan değişirse de sync
            if (this.rangeEndTarget) {
                this._rangeEndChangeHandler = () => {
                    if (this._suppressNativeSync) return;
                    this._syncFromNative();
                };
                this.rangeEndTarget.addEventListener("change", this._rangeEndChangeHandler);
            }
        }

        // ── v2: GRID KLAVYE NAVİGASYONU ───────────────────────────

        _onGridKeydown(e) {
            const k = e.key;
            let handled = true;
            const base = new Date(this.focusDate || this._defaultFocus());

            switch (k) {
                case "ArrowLeft":  base.setDate(base.getDate() - 1); break;
                case "ArrowRight": base.setDate(base.getDate() + 1); break;
                case "ArrowUp":    base.setDate(base.getDate() - 7); break;
                case "ArrowDown":  base.setDate(base.getDate() + 7); break;
                case "Home": {
                    // Hafta başı (locale.weekStart'a göre)
                    const off = (base.getDay() - this.locale.weekStart + 7) % 7;
                    base.setDate(base.getDate() - off);
                    break;
                }
                case "End": {
                    const off = (base.getDay() - this.locale.weekStart + 7) % 7;
                    base.setDate(base.getDate() + (6 - off));
                    break;
                }
                case "PageUp":
                    if (e.shiftKey) base.setFullYear(base.getFullYear() - 1);
                    else this._addMonthsClamped(base, -1);
                    break;
                case "PageDown":
                    if (e.shiftKey) base.setFullYear(base.getFullYear() + 1);
                    else this._addMonthsClamped(base, +1);
                    break;
                case "Enter":
                case " ":
                    e.preventDefault();
                    if (this._isSelectable(this.focusDate)) this._pickDate(this.focusDate);
                    return;
                case "Escape":
                    e.preventDefault();
                    this.close();   // v1.5.1 — odak restorasyonu close() içinde
                    return;
                default:
                    // Numarik klavyeyle tarih yazımı (DDMMYYYY) — date/datetime
                    if (/^[0-9]$/.test(k) && this.type !== "time") {
                        e.preventDefault();
                        this._typeDate(k);
                        return;
                    }
                    handled = false;
            }

            if (!handled) return;
            e.preventDefault();

            // min/max sınırına kelepçele
            if (this.minDate && dayBefore(base, this.minDate)) base.setTime(this.minDate.getTime());
            if (this.maxDate && dayBefore(this.maxDate, base)) base.setTime(this.maxDate.getTime());

            // Devre dışı güne oturmasın: hareket yönünde en yakın seçilebilir
            // güne atla (data-disabled / hafta günü / aralık ortası kapalı gün).
            // Hiç seçilebilir gün yoksa odağı değiştirme (tuzağa düşmeyi önle).
            if (!this._isSelectable(base)) {
                const fwdKeys = { ArrowRight: 1, ArrowDown: 1, PageDown: 1, End: 1 };
                const dir = fwdKeys[k] ? +1 : -1;
                const near = this._nearestSelectable(base, dir);
                if (!near) return;
                base.setTime(near.getTime());
            }

            this.focusDate = base;
            // Görünen pencere odak gününü kapsamıyorsa pencereyi kaydır
            // (tek-ayda "o aya geç"; çoklu-ayda yalnız pencere dışına çıkınca).
            this._ensureMonthVisible(base);
            // Range hover önizlemesi (başlangıç seçiliyken)
            if (this.isRange && this.rangeStart && !this.rangeEnd) {
                this._hoverDate = base;
            }
            this._renderCalendar();
            this._focusActiveCell();
        }

        /** Odak günü görünen ay penceresinde değilse viewMonth/viewYear'ı kaydır.
         *  Pencere = [anchor, anchor+monthCount-1] (ay indeksi = yıl*12+ay).
         *  Tek-ayda klasik "o aya geç"; çoklu-ayda pencere içindeyse kaydırmaz. */
        _ensureMonthVisible(d) {
            const anchorIdx = this.viewYear * 12 + this.viewMonth;
            const baseIdx = d.getFullYear() * 12 + d.getMonth();
            let newAnchor = anchorIdx;
            if (baseIdx < anchorIdx) newAnchor = baseIdx;
            else if (baseIdx > anchorIdx + this.monthCount - 1) newAnchor = baseIdx - (this.monthCount - 1);
            if (newAnchor !== anchorIdx) {
                this.viewYear = Math.floor(newAnchor / 12);
                this.viewMonth = ((newAnchor % 12) + 12) % 12;
            }
        }

        /** Ay ekle ama gün taşmasını (31 → 30 vb.) güvenli yap */
        _addMonthsClamped(d, delta) {
            const day = d.getDate();
            d.setDate(1);
            d.setMonth(d.getMonth() + delta);
            const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
            d.setDate(Math.min(day, lastDay));
        }

        /** Odaklı güne karşılık gelen hücreye gerçek DOM focus ver */
        _focusActiveCell() {
            const host = this.calEl || this.daysGrid;
            if (!host) return;
            // Disabled <button> odak alamaz; tabindex=0 hücresi her zaman
            // seçilebilir (render fallback'i garantiler) ama yine de guard'la.
            // Çoklu-ayda hücre herhangi bir panelde olabilir → calEl üstünden ara.
            // Spillover (görünmez dış-ay) hücre odak alamaz → hariç tut.
            let cell = host.querySelector(".glint-picker-day[tabindex='0']:not(:disabled):not(.is-spillover)");
            if (!cell) {
                cell = host.querySelector(".glint-picker-day:not(:disabled):not(.is-spillover)");
            }
            if (cell) cell.focus();
        }

        _bindTimeField(field, role) {
            const { input, up, down, min, max } = field;

            this._wireSpinnerButton(up, () => this._adjustTime(role, +1));
            this._wireSpinnerButton(down, () => this._adjustTime(role, -1));

            input.addEventListener("beforeinput", (e) => {
                if (!e.inputType || !e.inputType.startsWith("insert")) return;
                const data = e.data ?? "";
                if (!/^\d*$/.test(data)) {
                    e.preventDefault();
                    return;
                }
                const cur = input.value;
                const s = input.selectionStart || 0;
                const eIdx = input.selectionEnd || 0;
                const next = cur.slice(0, s) + data + cur.slice(eIdx);
                if (next.length > 2) {
                    e.preventDefault();
                    return;
                }
                if (next.length === 2) {
                    const num = parseInt(next, 10);
                    if (!isNaN(num) && num > max) {
                        e.preventDefault();
                    }
                }
            });

            input.addEventListener("input", () => {
                this._commitTimeFromInputs();
            });

            input.addEventListener("blur", () => {
                let n = parseInt(input.value, 10);
                if (isNaN(n)) n = 0;
                if (n < min) n = min;
                if (n > max) n = max;
                input.value = pad2(n);
                // v1.5.1 — blur'da HER ZAMAN snap'li commit: eski erken-çıkış
                // ("değer zaten formatlıysa dokunma") 13:33'ün step=5'te
                // 13:35'e oturmasını atlıyordu. Snap sonrası _renderTime
                // alanları güncel değerle yeniden boyar.
                this._commitTimeFromInputs(true);
            });

            input.addEventListener("keydown", (e) => {
                if (e.key === "ArrowUp") {
                    e.preventDefault();
                    this._adjustTime(role, +1);
                } else if (e.key === "ArrowDown") {
                    e.preventDefault();
                    this._adjustTime(role, -1);
                } else if (e.key === "Enter") {
                    e.preventDefault();
                    input.blur();
                }
            });

            input.addEventListener("focus", () => {
                requestAnimationFrame(() => input.select());
            });
        }

        _wireSpinnerButton(btn, action) {
            let holdTimer = null;
            let repeatTimer = null;
            const start = (e) => {
                e.preventDefault();
                action();
                holdTimer = setTimeout(() => {
                    repeatTimer = setInterval(action, 80);
                }, 420);
            };
            const stop = () => {
                clearTimeout(holdTimer);
                clearInterval(repeatTimer);
                holdTimer = null;
                repeatTimer = null;
            };
            // destroy() basılı-tut sırasında gelirse interval sızmasın → stop'ları kaydet
            (this._spinnerStops || (this._spinnerStops = [])).push(stop);
            btn.addEventListener("mousedown", start);
            btn.addEventListener("touchstart", start, { passive: false });
            ["mouseup", "mouseleave", "touchend", "touchcancel"].forEach(ev => {
                btn.addEventListener(ev, stop);
            });
        }

        // ── State & Sync ──────────────────────────────────────────

        /** Native input value'sundan internal state'i yenile */
        _syncFromNative() {
            if (this.isRange) {
                const raw = this.nativeInput.value;
                const parts = raw.split("/");
                this.rangeStart = parseISODate((parts[0] || "").slice(0, 10));
                let endRaw = parts[1] || "";
                if (this.rangeEndTarget) endRaw = this.rangeEndTarget.value || endRaw;
                this.rangeEnd = parseISODate(endRaw.slice(0, 10));
                const ref = this.rangeStart || new Date();
                this.viewYear = ref.getFullYear();
                this.viewMonth = ref.getMonth();
                this.focusDate = this.rangeStart || this._defaultFocus();
                this._renderAll();
                return;
            }

            const raw = this.nativeInput.value;
            let d = null;
            if (this.type === "date") {
                d = parseISODate(raw);
            } else if (this.type === "time") {
                const t = parseISOTime(raw);
                if (t) {
                    d = new Date();
                    d.setHours(t.h, t.m, 0, 0);
                }
            } else if (this.type === "datetime-local") {
                d = parseISODateTime(raw);
            }
            this.value = d;
            const ref = d || new Date();
            this.viewYear = ref.getFullYear();
            this.viewMonth = ref.getMonth();
            this.focusDate = d || this._defaultFocus();
            this._renderAll();
        }

        /** Internal state'i UI'a yansıt + native input + display'i güncelle */
        _commit() {
            if (this.isRange) {
                this._commitRange();
                return;
            }

            const d = this.value;
            let nativeVal = "";
            let displayVal = "";

            if (d) {
                if (this.type === "date") {
                    nativeVal = formatISODate(d);
                    displayVal = formatDisplayDate(d);
                } else if (this.type === "time") {
                    nativeVal = formatISOTime(d.getHours(), d.getMinutes());
                    displayVal = nativeVal;
                } else if (this.type === "datetime-local") {
                    nativeVal = formatISODateTime(d);
                    displayVal = formatDisplayDateTime(d);
                }
            }

            this._suppressNativeSync = true;
            this.nativeInput.value = nativeVal;
            this.nativeInput.dispatchEvent(new Event("change", { bubbles: true }));
            this._suppressNativeSync = false;

            this._writeDisplay(displayVal);
        }

        /** Range commit — native input + (varsa) harici/mirror bitiş input'u */
        _commitRange() {
            const s = this.rangeStart;
            const e = this.rangeEnd;
            const sIso = s ? formatISODate(s) : "";
            const eIso = e ? formatISODate(e) : "";

            // Birincil native input: "start/end" (tek alanda da binding mümkün)
            let nativeVal = "";
            if (sIso && eIso) nativeVal = `${sIso}/${eIso}`;
            else if (sIso) nativeVal = sIso;

            this._suppressNativeSync = true;
            this.nativeInput.value = nativeVal;
            this.nativeInput.dispatchEvent(new Event("change", { bubbles: true }));

            // Bitişi ayrı taşıyan hedef/mirror varsa onları da senkron tut
            if (this.rangeEndTarget) {
                this.rangeEndTarget.value = eIso;
                this.rangeEndTarget.dispatchEvent(new Event("change", { bubbles: true }));
            }
            if (this.rangeEndMirror) {
                this.rangeEndMirror.value = eIso;
            }
            this._suppressNativeSync = false;

            this._writeDisplay(this._formatRangeDisplay());
        }

        /** Display input'a yeni değeri Glint.Input animasyon zinciriyle yaz */
        _writeDisplay(displayVal) {
            if (this.display.value !== displayVal) {
                this.display.dispatchEvent(new Event("beforeinput", {
                    bubbles: true, cancelable: true
                }));
                this.display.value = displayVal;
                this.display.dispatchEvent(new Event("input", { bubbles: true }));
            }
        }

        // ── Calendar render ───────────────────────────────────────

        _renderAll() {
            this._renderCalendar();
            this._renderTime();
        }

        _onTitle() {
            this._setView(this._view === "days" ? "months" : this._view === "months" ? "years" : "days");
        }
        _onPrev() {
            if (this._view === "months") { this.viewYear--; this._renderCalendar(); }
            else if (this._view === "years") { this.viewYear -= 10; this._renderCalendar(); }
            else this._navMonth(-1);
        }
        _onNext() {
            if (this._view === "months") { this.viewYear++; this._renderCalendar(); }
            else if (this._view === "years") { this.viewYear += 10; this._renderCalendar(); }
            else this._navMonth(+1);
        }
        _setView(v) {
            this._view = v;
            this._renderCalendar();
        }
        _renderMonths() {
            this._setDayViewVisible(false);
            this.altGrid.className = "glint-picker-altgrid glint-picker-altgrid--months";
            this.titleBtn.textContent = String(this.viewYear);
            this.altGrid.innerHTML = "";
            this.locale.months.forEach((mName, mi) => {
                const b = document.createElement("button");
                b.type = "button";
                b.className = "glint-picker-altcell";
                b.textContent = mName;
                if (mi === this.viewMonth) b.classList.add("is-selected");
                b.addEventListener("click", () => { this.viewMonth = mi; this._setView("days"); });
                this.altGrid.appendChild(b);
            });
        }
        _renderYears() {
            this._setDayViewVisible(false);
            this.altGrid.className = "glint-picker-altgrid glint-picker-altgrid--years";
            const start = Math.floor(this.viewYear / 10) * 10;
            this.titleBtn.textContent = start + " – " + (start + 9);
            this.altGrid.innerHTML = "";
            for (let y = start - 1; y <= start + 10; y++) {
                const b = document.createElement("button");
                b.type = "button";
                b.className = "glint-picker-altcell";
                b.textContent = String(y);
                if (y < start || y > start + 9) b.classList.add("is-outside");
                if (y === this.viewYear) b.classList.add("is-selected");
                b.addEventListener("click", () => { this.viewYear = y; this._setView("months"); });
                this.altGrid.appendChild(b);
            }
        }

        _renderCalendar() {
            if (!this.daysGrid) return;

            // Ay/Yıl atlama görünümleri
            if (this._view === "months") return this._renderMonths();
            if (this._view === "years") return this._renderYears();

            // Gün görünümü: alt grid gizli, paneller/weekdays görünür
            this._setDayViewVisible(true);

            const today = new Date();

            // Range vurgulama sınırları (önizleme dahil) — tüm paneller paylaşır
            let rngLo = null, rngHi = null;
            if (this.isRange && this.rangeStart) {
                const other = this.rangeEnd || this._hoverDate;
                if (other) {
                    if (dayBefore(other, this.rangeStart)) { rngLo = other; rngHi = this.rangeStart; }
                    else { rngLo = this.rangeStart; rngHi = other; }
                }
            }

            // Render bağlamı — paneller arası paylaşılır. assignedRoving tüm
            // panellerde TEK bir tabindex=0 hücresi garantisi sağlar.
            const ctx = {
                today,
                rngLo, rngHi,
                focusKey: this.focusDate ? dayKey(this.focusDate) : null,
                assignedRoving: false
            };

            // Her panel için ilgili ayı çiz + başlığını güncelle
            for (let i = 0; i < this.dayGrids.length; i++) {
                const ym = this._panelYearMonth(i);
                this._renderMonthInto(this.dayGrids[i], ym.y, ym.m, ctx);
                const label = `${this.locale.months[ym.m]} ${ym.y}`;
                if (this.monthCount > 1) {
                    if (this.panelTitles[i]) this.panelTitles[i].textContent = label;
                } else {
                    this.titleBtn.textContent = label;
                }
            }

            // Hiçbir panelde roving atanmadıysa (odak günü görünen pencerenin
            // dışında) → ilk seçilebilir görünür güne ver, yoksa 1'ine
            if (!ctx.assignedRoving) {
                const cells = this.calEl.querySelectorAll(
                    ".glint-picker-day:not(.is-outside):not(.is-spillover)");
                let fallback = null;
                for (const c of cells) {
                    if (!c.disabled) { fallback = c; break; }
                }
                if (!fallback && cells.length) fallback = cells[0];
                if (fallback) fallback.tabIndex = 0;
            }
        }

        /** Panel i'nin gösterdiği yıl/ay (anchor = viewYear/viewMonth + i, rollover) */
        _panelYearMonth(i) {
            let m = this.viewMonth + i;
            let y = this.viewYear + Math.floor(m / 12);
            m = ((m % 12) + 12) % 12;
            return { y, m };
        }

        /** Gün görünümü ⇄ ay/yıl atlama görünümü arası görünürlük anahtarı.
         *  Tek-ayda weekdays+grid; çoklu-ayda tüm panelleri toplu gizler/gösterir. */
        _setDayViewVisible(visible) {
            if (this.monthCount > 1 && this.panelEls) {
                // Gün görünümü: tüm paneller tam görünür.
                // Atlama görünümü: panel 0 görünür kalır (başlığı için) ama
                // weekdays+grid'i gizlenir → altGrid (panel 0 içinde) açılır;
                // panel 1..n tamamen gizlenir.
                this.panelEls.forEach((p, i) => {
                    if (i === 0) {
                        p.style.display = "";
                        this.weekdayRows[0].style.display = visible ? "" : "none";
                        this.dayGrids[0].style.display = visible ? "" : "none";
                    } else {
                        p.style.display = visible ? "" : "none";
                    }
                });
            } else {
                if (this.weekdaysRow) this.weekdaysRow.style.display = visible ? "" : "none";
                if (this.daysGrid) this.daysGrid.style.display = visible ? "" : "none";
            }
            if (this.altGrid) this.altGrid.style.display = visible ? "none" : "";
        }

        /** Tek bir ayı verilen grid'e çiz (tek-ay + çoklu-ay ortak yolu).
         *  ctx: { today, rngLo, rngHi, focusKey, assignedRoving } — paylaşılır. */
        _renderMonthInto(grid, year, month, ctx) {
            const gridDays = buildMonthGrid(year, month, this.locale.weekStart);
            grid.innerHTML = "";
            const multi = this.monthCount > 1;

            gridDays.forEach((d, idx) => {
                // Her satır başında (7'nin katı) ISO hafta no hücresi ekle
                if (this.showWeekNumbers && idx % 7 === 0) {
                    const wkCell = document.createElement("div");
                    wkCell.className = "glint-picker-week";
                    wkCell.setAttribute("aria-hidden", "true");
                    wkCell.textContent = String(getISOWeek(d));
                    grid.appendChild(wkCell);
                }

                const cell = document.createElement("button");
                cell.type = "button";
                cell.className = "glint-picker-day";
                cell.textContent = d.getDate();
                cell.setAttribute("role", "gridcell");
                cell._date = new Date(d);

                const outside = d.getMonth() !== month;
                if (outside) {
                    cell.classList.add("is-outside");
                    // Çoklu-ayda komşu paneller tarihi tekrarlamasın: dış-ay
                    // günlerini görünmez yap (grid yeri korunur, hizalama bozulmaz).
                    if (multi) cell.classList.add("is-spillover");
                }
                if (isSameDay(d, ctx.today)) cell.classList.add("is-today");

                const selectable = this._isSelectable(d);
                if (!selectable) {
                    cell.classList.add("is-disabled");
                    cell.disabled = true;
                    cell.setAttribute("aria-disabled", "true");
                    cell.title = (this.locale && this.locale.disabledHint) || "Bu tarih seçilemez";
                }

                // Seçili durumu
                let isSel = false;
                if (this.isRange) {
                    if (isSameDay(d, this.rangeStart)) { cell.classList.add("is-selected", "is-range-start"); isSel = true; }
                    if (isSameDay(d, this.rangeEnd)) { cell.classList.add("is-selected", "is-range-end"); isSel = true; }
                    if (ctx.rngLo && ctx.rngHi && dayKey(d) > dayKey(ctx.rngLo) && dayKey(d) < dayKey(ctx.rngHi)) {
                        cell.classList.add("is-in-range");
                    }
                } else if (isSameDay(d, this.value)) {
                    cell.classList.add("is-selected");
                    isSel = true;
                }
                cell.setAttribute("aria-selected", isSel ? "true" : "false");

                // Roving tabindex — odaklı güne 0, diğerlerine -1. Disabled hücreye
                // 0 VERME (DOM odağı alamaz). assignedRoving paneller arası TEK 0
                // garantisi: aynı tarih iki panelde belirebilir (biri dış-ay).
                let roving = false;
                if (ctx.focusKey !== null && dayKey(d) === ctx.focusKey &&
                    !outside && selectable && !ctx.assignedRoving) {
                    roving = true;
                }
                cell.tabIndex = roving ? 0 : -1;
                if (roving) ctx.assignedRoving = true;

                if (selectable) {
                    cell.addEventListener("click", () => this._pickDate(d));
                }
                grid.appendChild(cell);
            });
        }

        _renderTime() {
            if (!this.hourField) return;
            const d = this.value;
            const h24 = d ? d.getHours() : 0;
            const m = d ? d.getMinutes() : 0;
            // 12h görünümünde saat 1-12 gösterilir; iç değer (h24) korunur.
            const hShown = this.is12h ? this._hourTo12(h24) : h24;
            if (document.activeElement !== this.hourField.input) {
                this.hourField.input.value = pad2(hShown);
            }
            if (document.activeElement !== this.minuteField.input) {
                this.minuteField.input.value = pad2(m);
            }
            // AM/PM rozetini iç saate göre yenile (spinner ile 11→12→13 geçişinde
            // AM/PM otomatik flip). Hour input odaktayken bile rozet doğru kalsın
            // diye guard dışında çağrılır.
            if (this.is12h) this._renderMeridiem();
        }

        // ── Actions ───────────────────────────────────────────────

        _navMonth(delta) {
            this.viewMonth += delta;
            if (this.viewMonth < 0) {
                this.viewMonth = 11;
                this.viewYear--;
            } else if (this.viewMonth > 11) {
                this.viewMonth = 0;
                this.viewYear++;
            }
            this._renderCalendar();
        }

        _jumpToToday() {
            const t = new Date();
            this.viewYear = t.getFullYear();
            this.viewMonth = t.getMonth();
            this._renderCalendar();
        }

        /** Range hover önizlemesi — başlangıç seçiliyken fare gezdirme */
        _onRangeHover(d) {
            if (!this.rangeStart || this.rangeEnd) return;
            const newKey = d ? dayKey(d) : null;
            const oldKey = this._hoverDate ? dayKey(this._hoverDate) : null;
            if (newKey === oldKey) return;
            this._hoverDate = d;
            this._renderCalendar();
        }

        /** Numarik klavyeyle DD.MM.YYYY yazımı: 8 hane → o tarihe atla, seçilebilirse seç. */
        _typeDate(ch) {
            clearTimeout(this._typeTimer);
            this._typeBuf = (this._typeBuf || "") + ch;
            this._typeTimer = setTimeout(() => { this._typeBuf = ""; }, 1500);
            if (this._typeBuf.length < 8) return;

            const buf = this._typeBuf.slice(0, 8);
            this._typeBuf = "";
            const day = parseInt(buf.slice(0, 2), 10);
            const mon = parseInt(buf.slice(2, 4), 10);
            const yr = parseInt(buf.slice(4, 8), 10);
            if (mon < 1 || mon > 12 || day < 1 || day > 31) return;

            const cand = new Date(yr, mon - 1, day);
            cand.setHours(0, 0, 0, 0);
            // Gerçek (taşmayan) tarih mi? (31.02 gibi geçersizleri ele)
            if (cand.getFullYear() !== yr || cand.getMonth() !== mon - 1 || cand.getDate() !== day) return;

            this.viewYear = yr;
            this.viewMonth = mon - 1;
            this.focusDate = cand;
            this._renderCalendar();
            // Seçilebilirse doğrudan seç ("yazdım → girdi"); değilse yalnız odakla.
            if (this._isSelectable(cand)) this._pickDate(cand);
        }

        _pickDate(d) {
            // Seçilemez günü reddet (klavye/fare ne olursa olsun)
            if (!this._isSelectable(d)) return;

            if (this.isRange) {
                this._pickRange(d);
                return;
            }

            const newDate = new Date(d);
            if (this.value && this.type === "datetime-local") {
                newDate.setHours(this.value.getHours(), this.value.getMinutes(), 0, 0);
            } else if (this.type === "datetime-local") {
                newDate.setHours(0, 0, 0, 0);
            }
            this._clampTimeToBounds(newDate);
            this.value = newDate;
            this.focusDate = new Date(d);
            this._renderCalendar();
            this._renderTime();
            this._commit();

            if (this.type === "date") {
                this.close();
            }
        }

        /** Range seçim mantığı — ilk tık başlangıç, ikinci bitiş, üçüncü reset */
        _pickRange(d) {
            this.focusDate = new Date(d);

            if (!this.rangeStart || (this.rangeStart && this.rangeEnd)) {
                // Yeni aralık başlat
                this.rangeStart = new Date(d);
                this.rangeEnd = null;
                this._hoverDate = null;
                this._renderCalendar();
                this._commit(); // başlangıç hemen yazılsın (tek değer)
                return;
            }

            // Başlangıç var, bitiş yok → bitişi belirle
            let s = this.rangeStart;
            let e = new Date(d);
            if (dayBefore(e, s)) { const tmp = s; s = e; e = tmp; }
            this.rangeStart = s;
            this.rangeEnd = e;
            this._hoverDate = null;
            this._renderCalendar();
            this._commit();
            // Range artık OTOMATİK KAPANMAZ — kullanıcı footer'daki ✓ (okBtn) ile
            // onaylayınca kapanır ("onay tiki olmadan kapanmasın"). Böylece aralığı
            // gözden geçirip düzeltebilir (kırılmaz akış).
        }

        _getMinuteStep() {
            if (this._minStep == null) {
                const v = parseInt(this.group.getAttribute("data-minute-step"), 10);
                this._minStep = (!isNaN(v) && v > 0 && v < 60) ? v : 1;
            }
            return this._minStep;
        }

        _adjustTime(role, delta) {
            const d = this.value || new Date();
            let h = d.getHours();
            let m = d.getMinutes();
            if (role === "hour") {
                h = (h + delta + 24) % 24;
            } else {
                const step = this._getMinuteStep();   // data-minute-step (15dk slot vb.)
                // v1.5.1 — Dakika taşması SAATE taşınır: 13:55 +15 artık
                // 14:10 (eskiden %60 sarmalı saat sabitken 13:10'a
                // düşürüyordu). Gün sınırında gün içinde sarmal kalır.
                const aligned = Math.round(m / step) * step;   // step'e hizala
                let total = h * 60 + aligned + delta * step;
                total = ((total % 1440) + 1440) % 1440;
                h = Math.floor(total / 60);
                m = total % 60;
            }
            const newDate = new Date(d);
            newDate.setHours(h, m, 0, 0);
            this._clampTimeToBounds(newDate);
            this.value = newDate;
            this._renderTime();
            this._commit();
        }

        /**
         * v1.5.1 — Yazılan saati step ızgarasına oturt (en yakın adım; tam
         * ortada YUKARI): step=5 → 13:33 ⇒ 13:35; step=30 → 13:48 ⇒ 14:00.
         * Yalnız commit anlarında çağrılır (blur/Enter/onay) — canlı yazım
         * asla bozulmaz. Gün sonu taşması gün içindeki son adımda kalır.
         */
        _snapToStep(d) {
            const step = this._getMinuteStep();
            if (!d || step <= 1) return d;
            const total = d.getHours() * 60 + d.getMinutes();
            let snapped = Math.round(total / step) * step;
            if (snapped >= 1440) snapped = 1440 - step;
            if (snapped !== total) d.setHours(Math.floor(snapped / 60), snapped % 60, 0, 0);
            return d;
        }

        _commitTimeFromInputs(snap) {
            let h = parseInt(this.hourField.input.value, 10);
            const m = parseInt(this.minuteField.input.value, 10);
            if (isNaN(h) || isNaN(m)) return;
            // 12h görünümünde input 1-12 tutar → mevcut meridiem ile 24h'e çevir.
            if (this.is12h) h = this._hourTo24(h, this.meridiem);
            const d = this.value || new Date();
            const newDate = new Date(d);
            newDate.setHours(h, m, 0, 0);
            if (snap) this._snapToStep(newDate);
            this._clampTimeToBounds(newDate);
            this.value = newDate;
            // Snap değeri değiştirmiş olabilir → alanlar yeniden boyanır
            // (canlı yazımda snap=false olduğundan yazım hiç bozulmaz).
            if (snap) this._renderTime();
            this._commit();
        }

        _setToToday() {
            const t = new Date();
            t.setSeconds(0, 0);
            if (this.type === "date") {
                t.setHours(0, 0, 0, 0);
            }
            // Bugün seçilemezse (min/max/disabled) → işlem yapma, sadece o aya git
            if (!this._isSelectable(t) && (this.type === "date" || this.type === "datetime-local")) {
                this.viewYear = t.getFullYear();
                this.viewMonth = t.getMonth();
                this.focusDate = this._defaultFocus();
                this._renderCalendar();
                this._focusActiveCell();
                return;
            }
            if (this.isRange) {
                this.rangeStart = new Date(t);
                this.rangeStart.setHours(0, 0, 0, 0);
                this.rangeEnd = null;
                this._hoverDate = null;
            } else {
                this.value = t;
            }
            this.viewYear = t.getFullYear();
            this.viewMonth = t.getMonth();
            this.focusDate = new Date(t);
            this._renderAll();
            this._commit();
            if (this.type === "date" && !this.isRange) this.close();
        }

        _clear() {
            this.value = null;
            this.rangeStart = null;
            this.rangeEnd = null;
            this._hoverDate = null;
            const t = new Date();
            this.viewYear = t.getFullYear();
            this.viewMonth = t.getMonth();
            this.focusDate = this._defaultFocus();
            this._renderAll();
            this._commit();
            this.close();
        }

        // ── Open / Close ──────────────────────────────────────────

        open() {
            if (this.isOpen) return;
            this.isOpen = true;
            this._view = "days";       // her açılışta gün görünümüne dön
            this._hoverDate = null;
            this._renderAll();

            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                this.backdrop.classList.add("is-open");
                this._prevBodyOverflow = document.body.style.overflow;
                document.body.style.overflow = "hidden";
            } else {
                this._positionPopover();
            }

            requestAnimationFrame(() => {
                this.popover.classList.add("is-open");
                // Takvim varsa odaklı hücreye fokus ver (klavye nav hazır)
                if (this.daysGrid) {
                    requestAnimationFrame(() => this._focusActiveCell());
                }
            });

            this.group.classList.add("glint-picker-open");
            this.toggleBtn.setAttribute("aria-expanded", "true");
        }

        close() {
            if (!this.isOpen) return;
            this.isOpen = false;
            // v1.5.1 — Odak restorasyonu MERKEZİ: odak popover'ın içindeyse
            // (gün hücresi / saat alanı — açılışta _focusActiveCell odağı
            // oraya taşımıştı) display input'a geri verilir. Böylece onaysız
            // pickerlarda seçim-kapanış sonrası odak body'ye düşüp border'ın
            // yarıda sönmesi biter; kapanışın hemen ardından klavyeyle tarih
            // yazmak da çalışır. Display readonly + inputMode=none olduğundan
            // mobilde klavye açılmaz.
            const restoreFocus = this.popover.contains(document.activeElement);
            this.popover.classList.remove("is-open");
            this.backdrop.classList.remove("is-open");
            if (this._prevBodyOverflow !== undefined) {
                document.body.style.overflow = this._prevBodyOverflow;
                this._prevBodyOverflow = undefined;
            }
            this.group.classList.remove("glint-picker-open");
            this.toggleBtn.setAttribute("aria-expanded", "false");
            if (restoreFocus) { try { this.display.focus(); } catch (e) { } }
        }

        toggle() {
            this.isOpen ? this.close() : this.open();
        }

        // ── Positioning (desktop) ─────────────────────────────────

        _positionPopover() {
            const rect = this.group.getBoundingClientRect();
            this.popover.classList.remove("glint-picker-popover--flip-up");

            const popH = this.popover.offsetHeight || 320;
            const popW = this.popover.offsetWidth || 296;
            const vpH = window.innerHeight;
            const vpW = window.innerWidth;
            const margin = 8;

            let top = rect.bottom + margin;
            let flip = false;
            if (top + popH > vpH - 16 && rect.top - margin - popH > 16) {
                top = rect.top - popH - margin;
                flip = true;
            }

            let left = rect.left;
            if (left + popW > vpW - 16) {
                left = vpW - popW - 16;
            }
            if (left < 16) left = 16;

            this.popover.style.top = (window.scrollY + top) + "px";
            this.popover.style.left = (window.scrollX + left) + "px";
            if (flip) this.popover.classList.add("glint-picker-popover--flip-up");
        }

        // ── Cleanup ───────────────────────────────────────────────

        destroy() {
            clearTimeout(this._typeTimer);
            // v1.5.1 — Açıkken destroy edilirse close() çağrılmadan gidiyordu:
            // mobilde body.style.overflow "hidden" takılı kalıyor, grup
            // .glint-picker-open sınıfını taşımaya devam ediyordu.
            if (this.isOpen) { try { this.close(); } catch (e) { } }
            // Basılı-tut spinner interval'leri (varsa) durdur — destroy-mid-hold sızıntısı
            if (this._spinnerStops) this._spinnerStops.forEach(s => { try { s(); } catch (e) {} });
            document.removeEventListener("mousedown", this._outsideClickHandler);
            document.removeEventListener("keydown", this._keyHandler);
            window.removeEventListener("resize", this._reposHandler);
            window.removeEventListener("scroll", this._reposHandler, true);
            this.nativeInput.removeEventListener("change", this._nativeChangeHandler);
            if (this.rangeEndTarget && this._rangeEndChangeHandler) {
                this.rangeEndTarget.removeEventListener("change", this._rangeEndChangeHandler);
            }
            // v1.5.1 — İç GlintInput örneği aynı grup üzerinde AYRI kayıtlıydı
            // ama Glint.register çakışması (WeakMap tek instance) yüzünden
            // çekirdek teardown ona hiç ulaşamıyordu: odaklı bir picker DOM'dan
            // kaldırılınca onFocus'un rAF scroll-poll döngüsü 60fps'te sonsuza
            // dek dönüyordu. Burada açıkça yıkılır.
            const inner = this.group._glintInstance;
            if (inner && typeof inner.destroy === "function") {
                try { inner.destroy(); } catch (e) { }
            }
            this.popover.remove();
            this.backdrop.remove();
            // v1.5.1 — Görsel katman sökülür, native input ESKİ haline döner:
            // eskiden display/toggle DOM'da kalıyor, native input hidden +
            // aria-hidden + tabIndex=-1 + claim bayrağıyla kalıcı ölü
            // kalıyordu (Glint.destroy sonrası alan bir daha canlanamazdı).
            this.display?.remove();
            this.toggleBtn?.remove();
            this.rangeEndMirror?.remove();
            this.nativeInput.hidden = false;
            this.nativeInput.removeAttribute("tabindex");
            this.nativeInput.removeAttribute("aria-hidden");
            this.nativeInput.classList.add("glint-input");
            const lbl = this.group.querySelector(".glint-label");
            if (lbl && this.nativeInput.id) lbl.setAttribute("for", this.nativeInput.id);
            this.group._glintClaimed = false;
            this.group.classList.remove(
                "glint-input-group--picker", "glint-input-group--date",
                "glint-input-group--time", "glint-input-group--datetime",
                "glint-input-group--range", "glint-picker-open"
            );
            delete this.group._glintPickerInit;
            delete this.group._glintPickerInstance;
            window.Glint.unregister(this.group);
        }
    }


    // ══════════════════════════════════════════════════════════════
    //  OTOMATİK BAŞLATMA — paylaşılan çekirdeğe kayıt
    // ══════════════════════════════════════════════════════════════
    //
    // v2: Modül artık KENDİ MutationObserver'ını kurmaz. Çekirdek
    // (glint-input.js) tek bir observer ile tüm Glint bileşenlerini
    // tarar; picker yalnızca defineComponent ile kaydolur. Çekirdek
    // henüz yüklenmediyse DOMContentLoaded'da register etmeyi dener;
    // o da yoksa kendi guard'lı taraması ile geriye dönük çalışır.

    function isPickerGroup(group) {
        return !!group.querySelector(
            "input[type='date'], input[type='time'], input[type='datetime-local']"
        );
    }

    function initPickerForGroup(group) {
        if (group._glintPickerInit) return;
        const nativeInput = group.querySelector(
            "input[type='date'], input[type='time'], input[type='datetime-local']"
        );
        if (!nativeInput) return;
        group._glintPickerInit = true;
        new GlintPicker(group, nativeInput);
    }

    function register() {
        window.Glint.defineComponent("picker", {
            selector: ".glint-input-group",
            match: g => !g._glintPickerInit && isPickerGroup(g),
            mount: g => initPickerForGroup(g)
        });
    }

    /** Çekirdek yoksa fallback: kendi taraması (observer YOK — kontrat gereği
     *  modül observer kurmaz; tek seferlik tarama + refresh API'sine bırak). */
    function fallbackScan() {
        document.querySelectorAll(".glint-input-group").forEach(g => {
            if (isPickerGroup(g)) initPickerForGroup(g);
        });
    }

    // Global API — Glint çatısı altında birleşik namespace
    window.Glint = window.Glint || {};
    window.Glint.Picker = GlintPicker;
    window.Glint.Picker.LOCALE_TR = LOCALE_TR;
    // Programatik tarama yardımcısı (dinamik içerik için)
    window.Glint.Picker.scan = fallbackScan;

    if (window.Glint && window.Glint.defineComponent) {
        register();
    } else {
        // Çekirdek henüz yüklenmemiş — yükleme sırası guard'ı
        document.addEventListener("DOMContentLoaded", function () {
            if (window.Glint && window.Glint.defineComponent) register();
            else fallbackScan();
        });
    }

})();
