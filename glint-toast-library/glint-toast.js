/* ════════════════════════════════════════════════════════════════════════
 *  ✎ DÜZENLEYİNİZ — projeye özel değiştirilebilir veriler
 *  • Süreler/limitler → aşağıdaki CONFIG:
 *      autoDismiss[tür] · maxVisible · staggerDelay · collapseDelay · releaseRingMs
 *  • Başlık metinleri → LABELS (Başarılı/Hata/Uyarı/Bilgi)
 *  • Renk/konum token'ları → glint-toast.css (--_toast-accent, --_glow-rgb,
 *      #glint-toast-container konumu)
 *  • Akıllı köprü politikası → Glint.config.fieldErrors (input paketinden)
 * ════════════════════════════════════════════════════════════════════════ */

/**
 * glint-toast Notification Engine v1.5.0
 * Exposed as:    window.Glint.Toast.success(msg)
 * Server bridge: window.__glintToasts = [...]   (processed on init)
 * Field bridge:  error toasts forward to Glint.Input.setError() when present
 */

(function () {
    "use strict";

    const TYPE = { SUCCESS: 0, ERROR: 1, WARNING: 2, INFO: 3 };
    const NAME_TO_TYPE = { success: 0, error: 1, warning: 2, info: 3 };

    const CONFIG = {
        autoDismiss: {
            [TYPE.SUCCESS]: 3500,
            [TYPE.ERROR]: 8000,
            [TYPE.WARNING]: 6000,
            [TYPE.INFO]: 5000
        },
        staggerDelay: 140,
        maxVisible: 5,
        collapseDelay: 320,
        releaseRingMs: 900,
        // v1.6 — konum: top-right | top-left | top-center | bottom-right | bottom-left
        position: "top-right",
        // v1.6 — aynı tür+metin görünürken tekrar istenirse yeni toast yerine
        // mevcuda ×N rozeti işlenir ve süresi tazelenir (bildirim spam'i biter)
        dedupe: true,
        // v1.6 — mobilde/kalemde yatay kaydırarak kapatma
        swipeToDismiss: true
    };

    const LABELS = {
        [TYPE.SUCCESS]: "Başarılı",
        [TYPE.ERROR]: "Hata",
        [TYPE.WARNING]: "Uyarı",
        [TYPE.INFO]: "Bilgi"
    };

    const CSS_CLASSES = {
        [TYPE.SUCCESS]: "glint-toast--success",
        [TYPE.ERROR]: "glint-toast--error",
        [TYPE.WARNING]: "glint-toast--warning",
        [TYPE.INFO]: "glint-toast--info"
    };

    const ICONS = {
        [TYPE.SUCCESS]: `<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/></svg>`,
        [TYPE.ERROR]: `<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"/></svg>`,
        [TYPE.WARNING]: `<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>`,
        [TYPE.INFO]: `<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd"/></svg>`
    };

    let container = null;
    let activeToasts = [];

    const POSITIONS = ["top-right", "top-left", "top-center", "bottom-right", "bottom-left"];

    function ensureContainer() {
        if (container && document.contains(container)) {
            applyPosition(container);
            return container;
        }
        container = document.createElement("div");
        container.id = "glint-toast-container";
        applyPosition(container);
        document.body.appendChild(container);
        return container;
    }

    /** v1.6 — konum sınıfını uygula (CONFIG.position). */
    function applyPosition(c) {
        const pos = POSITIONS.includes(CONFIG.position) ? CONFIG.position : "top-right";
        POSITIONS.forEach(p => c.classList.remove("glint-pos-" + p));
        c.classList.add("glint-pos-" + pos);
    }

    /** v1.6 — entegrasyon eventleri (document üzerinde). */
    function emit(name, detail) {
        try {
            document.dispatchEvent(new CustomEvent(name, { detail }));
        } catch (e) { /* sessiz */ }
    }

    function parseType(raw) {
        if (typeof raw === "number") return raw;
        if (typeof raw === "string") {
            const n = Number(raw);
            if (!isNaN(n)) return n;
            return NAME_TO_TYPE[raw.toLowerCase()] ?? TYPE.INFO;
        }
        return TYPE.INFO;
    }


    // ══════════════════════════════════════════════════════════════
    //  TOAST DOM
    // ══════════════════════════════════════════════════════════════

    // v1.6 — Yükleme (promise) görünümü: dönen halka spinner (SVG değil,
    // border tabanlı — CSS'te .glint-toast-spinner).
    const ICON_LOADING = `<span class="glint-toast-spinner" aria-hidden="true"></span>`;

    function buildToastEl(type, messages, opts) {
        opts = opts || {};
        const toast = document.createElement("div");
        toast.className = `glint-toast ${CSS_CLASSES[type] ?? ""}`;
        if (opts.loading) toast.classList.add("glint-toast--loading");
        toast.setAttribute("role", type === TYPE.ERROR ? "alert" : "status");
        toast.setAttribute("aria-live", type === TYPE.ERROR ? "assertive" : "polite");

        const inner = document.createElement("div");
        inner.className = "glint-toast-inner";

        const header = document.createElement("div");
        header.className = "glint-toast-header";

        const iconWrap = document.createElement("span");
        iconWrap.className = "glint-toast-icon";
        iconWrap.innerHTML = opts.loading ? ICON_LOADING : (ICONS[type] ?? ICONS[TYPE.INFO]);

        const title = document.createElement("span");
        title.className = "glint-toast-title";
        title.textContent = opts.title || (opts.loading ? "İşleniyor" : (LABELS[type] ?? "Bildirim"));

        const closeBtn = document.createElement("button");
        closeBtn.className = "glint-toast-close";
        closeBtn.type = "button";
        closeBtn.setAttribute("aria-label", "Bildirimi kapat");
        closeBtn.innerHTML = `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/></svg>`;
        closeBtn.addEventListener("click", () => dismiss(toast));

        header.append(iconWrap, title, closeBtn);

        const body = document.createElement("div");
        body.className = "glint-toast-body";

        if (messages.length === 1) {
            const p = document.createElement("p");
            p.textContent = messages[0].message;
            body.appendChild(p);
        } else {
            const ul = document.createElement("ul");
            messages.forEach(({ message }) => {
                const li = document.createElement("li");
                li.textContent = message;
                ul.appendChild(li);
            });
            body.appendChild(ul);
        }

        // v1.6 — Aksiyon butonu ("Geri Al" gibi): opts.action = { label,
        // onClick(ev), keepOpen? }. Tıklamada varsayılan davranış kapatmadır.
        if (opts.action && opts.action.label) {
            const act = document.createElement("button");
            act.type = "button";
            act.className = "glint-toast-action";
            act.textContent = opts.action.label;
            act.addEventListener("click", (ev) => {
                ev.stopPropagation();
                try { opts.action.onClick && opts.action.onClick(ev); } catch (e) { }
                if (!opts.action.keepOpen) dismiss(toast);
            });
            body.appendChild(act);
        }

        inner.append(header, body);
        toast.appendChild(inner);

        const autoDismissMs = opts.sticky ? 0
            : (typeof opts.duration === "number" ? opts.duration : CONFIG.autoDismiss[type]);
        if (autoDismissMs > 0) {
            const progress = document.createElement("div");
            progress.className = "glint-toast-progress";
            toast.appendChild(progress);
        }

        return toast;
    }


    // ══════════════════════════════════════════════════════════════
    //  HOVER PAUSE / RESUME + DUAL PULSE RING
    // ══════════════════════════════════════════════════════════════

    function attachHoverPause(toastEl, entry) {
        const progress = toastEl.querySelector(".glint-toast-progress");
        let releaseTimer = null;

        toastEl.addEventListener("mouseenter", () => {
            if (entry.paused) return;
            entry.paused = true;

            if (entry.timerId) {
                clearTimeout(entry.timerId);
                entry.timerId = null;
            }

            const elapsed = Date.now() - entry.startedAt;
            entry.remaining = Math.max(0, entry.remaining - elapsed);

            if (progress) progress.classList.add("glint-progress-paused");

            // Dual ring breathing başlat
            if (releaseTimer) { clearTimeout(releaseTimer); releaseTimer = null; }
            toastEl.classList.remove("glint-toast-releasing");
            toastEl.classList.add("glint-toast-held");
        });

        toastEl.addEventListener("mouseleave", () => {
            if (!entry.paused) return;
            entry.paused = false;

            if (progress) progress.classList.remove("glint-progress-paused");

            // Dual ring release — zarif son dalga
            toastEl.classList.remove("glint-toast-held");
            toastEl.classList.add("glint-toast-releasing");

            releaseTimer = setTimeout(() => {
                toastEl.classList.remove("glint-toast-releasing");
                releaseTimer = null;
            }, CONFIG.releaseRingMs);

            if (entry.remaining <= 0) {
                dismiss(toastEl);
                return;
            }

            entry.startedAt = Date.now();
            entry.timerId = setTimeout(() => dismiss(toastEl), entry.remaining);
        });
    }


    // ══════════════════════════════════════════════════════════════
    //  GÖSTER / KAPAT
    // ══════════════════════════════════════════════════════════════

    /** v1.6 — Aynı tür + aynı tek-mesaj zaten görünürse yenisini açma:
     *  mevcut toast'a ×N rozeti bas, süresini tazele, pulse ver. */
    function tryCoalesce(type, messages, opts) {
        if (!CONFIG.dedupe || opts.loading || messages.length !== 1 || messages[0].fieldId) return false;
        const msg = messages[0].message;
        const entry = activeToasts.find(t =>
            t.type === type && t.text === msg && !t.el.classList.contains("glint-toast-exit"));
        if (!entry) return false;
        entry.count = (entry.count || 1) + 1;
        let badge = entry.el.querySelector(".glint-toast-count");
        if (!badge) {
            badge = document.createElement("span");
            badge.className = "glint-toast-count";
            const header = entry.el.querySelector(".glint-toast-header");
            const closeB = header && header.querySelector(".glint-toast-close");
            if (header) header.insertBefore(badge, closeB || null);
        }
        badge.textContent = "×" + entry.count;
        badge.classList.remove("glint-count-pop");
        void badge.offsetWidth;
        badge.classList.add("glint-count-pop");
        // Süreyi tazele + progress'i yeniden başlat
        if (entry.timerId) clearTimeout(entry.timerId);
        if (entry.baseDuration > 0 && !entry.paused) {
            entry.remaining = entry.baseDuration;
            entry.startedAt = Date.now();
            entry.timerId = setTimeout(() => dismiss(entry.el), entry.baseDuration);
            const progress = entry.el.querySelector(".glint-toast-progress");
            if (progress) {
                progress.classList.remove("glint-progress-running");
                void progress.offsetWidth;
                progress.classList.add("glint-progress-running");
            }
        }
        return true;
    }

    function show(type, messages, staggerMs = 0, opts = {}) {
        if (!messages?.length) return null;

        // Akıllı alan-hata politikası (SENKRON): görünür alanlar inline'lanır,
        // toast'ta yalnız genel + görünmeyen-alan mesajları kalır. Hepsi
        // inline'landıysa toast HİÇ gösterilmez (gereksiz bildirim olmaz).
        const policy = applyFieldErrorPolicy(type, messages);
        messages = policy.messages;
        if (!messages.length) return null;

        // v1.6 — bildirim spam'i önleme (×N rozeti)
        if (tryCoalesce(type, messages, opts)) return null;

        const toastEl = buildToastEl(type, messages, opts);

        // Görünmeyen/genel hatalar toast'ta → tıkla ilk hatalı alana kaydır+odakla.
        if (policy.scrollTargetId) {
            toastEl.classList.add("glint-toast--actionable");
            toastEl.setAttribute("title", "Hatalı alana git");
            toastEl.addEventListener("click", (e) => {
                if (e.target.closest && e.target.closest(".glint-toast-close")) return;
                scrollToField(policy.scrollTargetId);
                dismiss(toastEl);
            });
        }

        const c = ensureContainer();
        const autoDismissMs = opts.sticky ? 0
            : (typeof opts.duration === "number" ? opts.duration : (CONFIG.autoDismiss[type] ?? 0));

        const entry = {
            el: toastEl,
            type,
            text: messages.length === 1 ? messages[0].message : null,
            count: 1,
            baseDuration: autoDismissMs,
            timerId: null,
            remaining: autoDismissMs,
            startedAt: 0,
            paused: false
        };

        setTimeout(() => {
            // maxVisible tahliyesi BURADA yapılır (fonksiyon başında değil):
            // sunucu burst'ünde toast'lar staggerMs ile sırayla eklenir; erken
            // tahliye henüz eklenmemişlere göre yanlış karar verir (yarış →
            // maxVisible aşılır). O anki gerçek uzunluğa göre tahliye et.
            while (activeToasts.length >= CONFIG.maxVisible) {
                dismiss(activeToasts[activeToasts.length - 1].el, false);
            }

            c.prepend(toastEl);

            requestAnimationFrame(() => {
                toastEl.classList.add("glint-toast-enter");

                const progress = toastEl.querySelector(".glint-toast-progress");
                if (progress && autoDismissMs > 0) {
                    progress.style.animationDuration = autoDismissMs + "ms";
                    progress.classList.add("glint-progress-running");
                }
            });

            if (autoDismissMs > 0) {
                entry.startedAt = Date.now();
                entry.timerId = setTimeout(() => dismiss(toastEl), autoDismissMs);
            }

            activeToasts.unshift(entry);

            if (autoDismissMs > 0) {
                attachHoverPause(toastEl, entry);
            }
            if (CONFIG.swipeToDismiss) attachSwipe(toastEl);
            emit("glint:toast-open", { type, element: toastEl });
            // Alan köprüsü artık show() başında SENKRON uygulanıyor (applyFieldErrorPolicy).
        }, staggerMs);

        return toastEl;
    }

    /**
     * v1.6 — Kaydırarak kapatma (mobil öncelikli, her işaretçiyle çalışır):
     * yatay sürükleme toast'ı takip eder; eşik aşılırsa savrularak kapanır,
     * aşılmazsa yayla yerine döner. Dikey kaydırma (sayfa scroll'u) bozulmaz
     * (CSS: touch-action: pan-y).
     */
    function attachSwipe(toastEl) {
        let startX = 0, dx = 0, dragging = false, pid = null;
        const THRESHOLD = 72;

        toastEl.addEventListener("pointerdown", (e) => {
            if (e.button != null && e.button !== 0) return;
            if (e.target.closest(".glint-toast-close, .glint-toast-action")) return;
            dragging = true; pid = e.pointerId; startX = e.clientX; dx = 0;
            // glint-toast-in fill:forwards inline transform'u ezer → final
            // durumu sabitleyen sınıfa geçip enter animasyonunu bırak.
            toastEl.classList.add("glint-toast-settled");
            toastEl.classList.remove("glint-toast-enter");
            toastEl.classList.add("glint-toast-swiping");
            try { toastEl.setPointerCapture(pid); } catch (err) { }
        });
        toastEl.addEventListener("pointermove", (e) => {
            if (!dragging || e.pointerId !== pid) return;
            dx = e.clientX - startX;
            toastEl.style.transform = "translateX(" + dx + "px)";
            toastEl.style.opacity = String(Math.max(0.25, 1 - Math.abs(dx) / 260));
        });
        const end = (e) => {
            if (!dragging || (e.pointerId != null && e.pointerId !== pid)) return;
            dragging = false;
            try { toastEl.releasePointerCapture(pid); } catch (err) { }
            toastEl.classList.remove("glint-toast-swiping");
            if (Math.abs(dx) > THRESHOLD) {
                // Savrulma: mevcut yönde uç + kapat (exit animasyonu yerine)
                toastEl.style.transition = "transform 0.22s cubic-bezier(0.4, 0, 0.7, 0.2), opacity 0.22s ease-out";
                toastEl.style.transform = "translateX(" + (dx > 0 ? 420 : -420) + "px)";
                toastEl.style.opacity = "0";
                setTimeout(() => dismiss(toastEl, false), 200);
            } else {
                // Yayla yerine dön
                toastEl.style.transition = "transform 0.3s var(--glint-ease-pop, cubic-bezier(0.34, 1.56, 0.64, 1)), opacity 0.2s ease-out";
                toastEl.style.transform = "";
                toastEl.style.opacity = "";
                setTimeout(() => { toastEl.style.transition = ""; }, 320);
            }
        };
        toastEl.addEventListener("pointerup", end);
        toastEl.addEventListener("pointercancel", end);
    }

    function dismiss(toastEl, animate = true) {
        if (!toastEl) return;
        if (toastEl.classList.contains("glint-toast-exit")) return;

        const idx = activeToasts.findIndex(t => t.el === toastEl);
        if (idx !== -1) {
            const entry = activeToasts[idx];
            if (entry.timerId) clearTimeout(entry.timerId);
            activeToasts.splice(idx, 1);
        }
        emit("glint:toast-close", { element: toastEl });

        if (!animate) {
            toastEl.remove();
            return;
        }

        const progress = toastEl.querySelector(".glint-toast-progress");
        if (progress) progress.style.animationPlayState = "paused";

        toastEl.classList.remove("glint-toast-enter", "glint-toast-held", "glint-toast-releasing");
        toastEl.classList.add("glint-toast-exit");

        setTimeout(() => {
            // Collapse animasyonu: max-height auto→0 ANİMATLANMAZ. Önce somut
            // başlangıç yüksekliğini ölç + inline yaz, reflow ile sabitle, sonra
            // collapse class'ı (max-height:0 !important + transition) ekle →
            // yığın gerçekten yumuşak daralır, "zıplama" biter.
            toastEl.style.maxHeight = toastEl.scrollHeight + "px";
            void toastEl.offsetHeight;
            toastEl.classList.add("glint-toast-collapse");

            // transitionend'i toast'ın KENDİ max-height'ına filtrele (çocuk
            // elemanların / margin-padding'in transition'ı erken tetiklemesin).
            const onEnd = (e) => {
                if (e.target !== toastEl || e.propertyName !== "max-height") return;
                toastEl.removeEventListener("transitionend", onEnd);
                clearTimeout(safety);
                toastEl.remove();
            };
            toastEl.addEventListener("transitionend", onEnd);
            const safety = setTimeout(() => {
                toastEl.removeEventListener("transitionend", onEnd);
                toastEl.remove();
            }, 500);
        }, CONFIG.collapseDelay);
    }

    function dismissAll() {
        [...activeToasts].forEach(t => dismiss(t.el));
    }


    // ══════════════════════════════════════════════════════════════
    //  AKILLI ALAN-HATA KÖPRÜSÜ  (input ↔ toast, gevşek-bağlı)
    // ══════════════════════════════════════════════════════════════
    //
    // İki paket BAĞIMSIZ kalır; ikisi de yüklüyse işbirliği yapar. Politika
    // (`Glint.config.fieldErrors`): "smart" (varsayılan) | "inline" | "toast".
    //   • inline → alan-bağlı hatalar her zaman alan içinde (toast'tan düşer).
    //   • toast  → alan-bağlı hatalar inline + özet toast'ta da kalır.
    //   • smart  → alan GÖRÜNÜRSE inline-only; GÖRÜNMÜYORSA inline + toast
    //     (toast'a tıkla → ilk görünmeyen hatalı alana kaydır+odakla).
    // Görünür alanların hepsi inline'a alınınca toast tamamen GÖSTERİLMEZ.
    // Görünürlük + scroll + focus saf DOM; inline için Glint.Input/setState.

    function reducedMotionToast() {
        const G = window.Glint;
        if (G && typeof G.reducedMotion === "function") return G.reducedMotion();
        return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    }

    function fieldErrorMode() {
        const G = window.Glint;
        const m = (G && G.config && G.config.fieldErrors) || "smart";
        return (m === "inline" || m === "toast" || m === "smart") ? m : "smart";
    }

    function inlineErrorText() {
        const G = window.Glint;
        return !!(G && G.config && G.config.fieldErrorText);
    }

    /** Alan (ya da grubu) kullanıcı için GERÇEKTEN görünür mü?
     *  "Görünür" = algılanabilir + viewport ile kesişiyor. Sadece rect'e güvenmek
     *  yetmez: visibility:hidden / opacity:0 / display:none-ata / content-visibility
     *  alanlar düzene sahip olup non-zero rect döndürebilir → bunları "görünür"
     *  sayarsak smart modda hata inline-only'e gider ve görünmez → SESSİZCE KAYBOLUR.
     *  Bu yüzden önce algılanabilirliği (checkVisibility + computed-style), sonra
     *  viewport kesişimini kontrol ederiz. Şüphede "görünür DEĞİL" → toast'a düşer
     *  (fail-safe: hata her zaman bir yerde görünür). */
    function isFieldVisible(el) {
        const target = (el.closest && el.closest(".glint-input-group")) || el;

        // Modern tarayıcı: display/visibility/opacity/content-visibility tek çağrıda
        // (ata zincirini de kapsar). false → kesinlikle görünmez.
        if (typeof target.checkVisibility === "function") {
            try {
                if (!target.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false;
            } catch (e) { /* eski imza → manuel kontrole düş */ }
        }

        const r = target.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return false;     // display:none / detached / 0-boyut

        // visibility (kalıtsal → ata visibility:hidden burada yakalanır) + opacity
        const cs = window.getComputedStyle ? window.getComputedStyle(target) : null;
        if (cs) {
            if (cs.visibility === "hidden" || cs.visibility === "collapse") return false;
            if (parseFloat(cs.opacity) === 0) return false;
        }

        // viewport ile kesişiyor mu (kısmi görünürlük yeter)
        const vh = window.innerHeight || document.documentElement.clientHeight;
        const vw = window.innerWidth || document.documentElement.clientWidth;
        return r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw;
    }

    /** Alan içi hatayı uygula: yönetilen Input → zengin border-draw (yazısız/yazılı);
     *  diğer bileşenler (Select/OTP/Upload…) → jenerik Glint.setState.
     *  Dönüş: inline GERÇEKTEN uygulandı mı (true). Uygulanamadıysa (ör. uyumsuz/eski
     *  input build: ne yönetilen örnek ne setState) → false; çağıran mesajı toast'ta
     *  TUTAR ki hata sessizce kaybolmasın (fail-safe). */
    function applyInlineError(el, message) {
        const G = window.Glint;
        if (!G || !el) return false;
        const withText = inlineErrorText() ? message : undefined;
        const inst = (G.Input && typeof G.Input._getInstance === "function")
            ? G.Input._getInstance(el) : null;
        if (inst && typeof G.Input.setError === "function") { G.Input.setError(el, withText); return true; }
        if (typeof G.setState === "function") { G.setState(el, "error", withText || null); return true; }
        return false;
    }

    /** Toast'a tıklayınca ilgili hatalı alana kaydır + odakla (gizli native ise
     *  grubun görünür kontrolünü odakla — ör. picker display input'u). */
    function scrollToField(fieldId) {
        const el = document.getElementById(fieldId);
        if (!el) return;
        const group = (el.closest && el.closest(".glint-input-group")) || el;
        group.scrollIntoView({ behavior: reducedMotionToast() ? "auto" : "smooth", block: "center" });
        const focusable = group.querySelector(
            "input:not([type=hidden]):not([hidden]), select, textarea, button, [tabindex]"
        ) || el;
        try { focusable.focus({ preventScroll: true }); }
        catch (e) { try { focusable.focus(); } catch (_) {} }
    }

    /** Politikayı uygula. Dönüş: { messages: toast'ta KALACAK mesajlar,
     *  scrollTargetId: toast tıklanınca gidilecek ilk alan }. Inline hatalar
     *  SENKRON uygulanır (anında geri bildirim). Yalnız ERROR'da işler. */
    function applyFieldErrorPolicy(type, messages) {
        if (type !== TYPE.ERROR) return { messages: messages, scrollTargetId: null };
        const G = window.Glint;
        const inputLoaded = !!(G && ((G.Input && G.Input.setError) || G.setState));
        if (!inputLoaded) return { messages: messages, scrollTargetId: null };  // inline imkânsız

        const mode = fieldErrorMode();
        const toastMsgs = [];
        let scrollTargetId = null;

        for (const m of messages) {
            const el = m.fieldId ? document.getElementById(m.fieldId) : null;
            if (!el) { toastMsgs.push(m); continue; }       // alan yok → genel mesaj → toast

            const inlined = applyInlineError(el, m.message);

            if (mode === "inline") {
                // inline uygulandıysa toast'tan düş; uygulanamadıysa FAIL-SAFE: toast'ta tut
                if (!inlined) { toastMsgs.push(m); if (!scrollTargetId) scrollTargetId = m.fieldId; }
                continue;
            }
            if (mode === "toast") {
                toastMsgs.push(m);                          // inline + toast'ta her zaman tut
                if (!scrollTargetId) scrollTargetId = m.fieldId;
                continue;
            }
            // smart: GÖRÜNÜR ve inline UYGULANDIYSA toast'a koyma; aksi halde
            // (görünmez VEYA inline uygulanamadı) → toast'a düşür (hata kaybolmasın).
            if (!inlined || !isFieldVisible(el)) {
                toastMsgs.push(m);
                if (!scrollTargetId) scrollTargetId = m.fieldId;
            }
        }
        return { messages: toastMsgs, scrollTargetId: scrollTargetId };
    }


    // ══════════════════════════════════════════════════════════════
    //  BAŞLANGIÇ
    // ══════════════════════════════════════════════════════════════

    function processServerToasts() {
        const toasts = window.__glintToasts;
        if (!Array.isArray(toasts) || !toasts.length) return;

        const priority = { 1: 0, 2: 1, 3: 2, 0: 3 };
        const ordered = [...toasts].sort((a, b) => {
            const ta = parseType(a.type ?? a.Type ?? 3);
            const tb = parseType(b.type ?? b.Type ?? 3);
            return (priority[ta] ?? 4) - (priority[tb] ?? 4);
        });

        ordered.forEach((dto, i) => {
            const type = parseType(dto.type ?? dto.Type ?? 3);
            const messages = (dto.messages ?? dto.Messages ?? []).map(m => ({
                message: m.message ?? m.Message ?? "",
                fieldId: m.fieldId ?? m.FieldId ?? m.fieldID ?? m.FieldID ?? null
            })).filter(m => m.message);
            if (!messages.length) return;
            show(type, messages, i * CONFIG.staggerDelay);
        });

        window.__glintToasts = null;
    }

    function init() {
        ensureContainer();
        processServerToasts();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    /**
     * v1.6 — Yükleme toast'ını sonuca MORF et: ikon/başlık/mesaj/renk aynı
     * kutuda değişir, otomatik kapanma + progress o anda başlar.
     */
    function morphToast(toastEl, newType, message, opts) {
        opts = opts || {};
        if (!toastEl || !document.contains(toastEl)) {
            // Toast bu arada kapatıldıysa sonucu normal yolla göster
            show(newType, [{ message }], 0, opts);
            return;
        }
        toastEl.classList.remove("glint-toast--loading",
            CSS_CLASSES[TYPE.SUCCESS], CSS_CLASSES[TYPE.ERROR],
            CSS_CLASSES[TYPE.WARNING], CSS_CLASSES[TYPE.INFO]);
        toastEl.classList.add(CSS_CLASSES[newType] ?? "");
        toastEl.setAttribute("role", newType === TYPE.ERROR ? "alert" : "status");
        toastEl.setAttribute("aria-live", newType === TYPE.ERROR ? "assertive" : "polite");

        const iconWrap = toastEl.querySelector(".glint-toast-icon");
        if (iconWrap) {
            iconWrap.classList.remove("glint-icon-morph");
            void iconWrap.offsetWidth;
            iconWrap.innerHTML = ICONS[newType] ?? ICONS[TYPE.INFO];
            iconWrap.classList.add("glint-icon-morph");
        }
        const title = toastEl.querySelector(".glint-toast-title");
        if (title) title.textContent = opts.title || (LABELS[newType] ?? "Bildirim");
        const p = toastEl.querySelector(".glint-toast-body p");
        if (p) p.textContent = message;

        // Otomatik kapanma + progress şimdi başlar
        const ms = opts.sticky ? 0
            : (typeof opts.duration === "number" ? opts.duration : (CONFIG.autoDismiss[newType] ?? 0));
        const entry = activeToasts.find(t => t.el === toastEl);
        if (entry) {
            entry.type = newType;
            entry.text = message;
            entry.baseDuration = ms;
            if (entry.timerId) clearTimeout(entry.timerId);
            if (ms > 0) {
                entry.remaining = ms;
                entry.startedAt = Date.now();
                entry.timerId = setTimeout(() => dismiss(toastEl), ms);
                let progress = toastEl.querySelector(".glint-toast-progress");
                if (!progress) {
                    progress = document.createElement("div");
                    progress.className = "glint-toast-progress";
                    toastEl.appendChild(progress);
                }
                progress.style.animationDuration = ms + "ms";
                progress.classList.remove("glint-progress-running");
                void progress.offsetWidth;
                progress.classList.add("glint-progress-running");
                attachHoverPause(toastEl, entry);
            }
        }
    }

    // Single namespace exposure: window.Glint.Toast
    const GlintToast = {
        /** show(type, mesaj|mesajlar, opts?) — opts: {duration, sticky, title,
         *  action: {label, onClick, keepOpen}} */
        show(type, messages, opts) {
            const t = parseType(type);
            const arr = typeof messages === "string"
                ? [{ message: messages }]
                : Array.isArray(messages) ? messages
                    : [{ message: String(messages) }];
            return show(t, arr, 0, opts || {});
        },
        success(msg, opts) { return show(TYPE.SUCCESS, [{ message: msg }], 0, opts || {}); },
        error(msg, fieldId, opts) { return show(TYPE.ERROR, [{ message: msg, fieldId }], 0, opts || {}); },
        warning(msg, opts) { return show(TYPE.WARNING, [{ message: msg }], 0, opts || {}); },
        info(msg, opts) { return show(TYPE.INFO, [{ message: msg }], 0, opts || {}); },

        /**
         * v1.6 — Promise toast'ı: yükleme görünümüyle açılır, promise
         * çözülünce AYNI kutu başarı/hataya morf olur. Ağ işini KULLANICI
         * yapar (kütüphane fetch etmez); bu yalnız görsel akıştır.
         *   Glint.Toast.promise(fetchYerineKendiIsin(), {
         *     loading: "Kaydediliyor…",
         *     success: "Kaydedildi!",            // veya (sonuc) => "..."
         *     error:   "Kaydedilemedi."          // veya (hata)  => "..."
         *   });
         * Dönüş: aynı promise (zincirlenebilir).
         */
        promise(promise, msgs) {
            msgs = msgs || {};
            const el = show(TYPE.INFO, [{ message: msgs.loading || "İşleniyor…" }], 0,
                { loading: true, sticky: true });
            const resolveMsg = (m, arg, fallback) =>
                (typeof m === "function" ? m(arg) : m) || fallback;
            Promise.resolve(promise).then(
                (val) => { morphToast(el, TYPE.SUCCESS, resolveMsg(msgs.success, val, "Tamamlandı."), msgs.opts); },
                (err) => { morphToast(el, TYPE.ERROR, resolveMsg(msgs.error, err, "Bir hata oluştu."), msgs.opts); }
            );
            return promise;
        },

        /** v1.6 — Çalışma zamanı yapılandırması: {position, maxVisible,
         *  dedupe, swipeToDismiss, staggerDelay, autoDismiss:{success|error|
         *  warning|info: ms}} */
        configure(partial) {
            if (partial && typeof partial === "object") {
                const p = Object.assign({}, partial);   // çağıranın objesini bozma
                if (p.autoDismiss && typeof p.autoDismiss === "object") {
                    for (const k in p.autoDismiss) {
                        const t = NAME_TO_TYPE[String(k).toLowerCase()];
                        if (t != null) CONFIG.autoDismiss[t] = p.autoDismiss[k];
                    }
                    delete p.autoDismiss;
                }
                Object.assign(CONFIG, p);
                if (container) applyPosition(container);
            }
            return CONFIG;
        },

        dismiss(el) { dismiss(el); },
        dismissAll() { dismissAll(); },
        TYPE
    };
    window.Glint = window.Glint || {};
    window.Glint.Toast = GlintToast;

})();