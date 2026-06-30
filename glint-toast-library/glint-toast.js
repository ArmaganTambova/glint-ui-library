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
        releaseRingMs: 900
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

    function ensureContainer() {
        if (container && document.contains(container)) return container;
        container = document.createElement("div");
        container.id = "glint-toast-container";
        document.body.appendChild(container);
        return container;
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

    function buildToastEl(type, messages) {
        const toast = document.createElement("div");
        toast.className = `glint-toast ${CSS_CLASSES[type] ?? ""}`;
        toast.setAttribute("role", "alert");
        toast.setAttribute("aria-live", type === TYPE.ERROR ? "assertive" : "polite");

        const inner = document.createElement("div");
        inner.className = "glint-toast-inner";

        const header = document.createElement("div");
        header.className = "glint-toast-header";

        const iconWrap = document.createElement("span");
        iconWrap.className = "glint-toast-icon";
        iconWrap.innerHTML = ICONS[type] ?? ICONS[TYPE.INFO];

        const title = document.createElement("span");
        title.className = "glint-toast-title";
        title.textContent = LABELS[type] ?? "Bildirim";

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

        inner.append(header, body);
        toast.appendChild(inner);

        const autoDismissMs = CONFIG.autoDismiss[type];
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

    function show(type, messages, staggerMs = 0) {
        if (!messages?.length) return;

        // Akıllı alan-hata politikası (SENKRON): görünür alanlar inline'lanır,
        // toast'ta yalnız genel + görünmeyen-alan mesajları kalır. Hepsi
        // inline'landıysa toast HİÇ gösterilmez (gereksiz bildirim olmaz).
        const policy = applyFieldErrorPolicy(type, messages);
        messages = policy.messages;
        if (!messages.length) return;

        const toastEl = buildToastEl(type, messages);

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
        const autoDismissMs = CONFIG.autoDismiss[type] ?? 0;

        const entry = {
            el: toastEl,
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
            // Alan köprüsü artık show() başında SENKRON uygulanıyor (applyFieldErrorPolicy).
        }, staggerMs);
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

    // Single namespace exposure: window.Glint.Toast
    const GlintToast = {
        show(type, messages) {
            const t = parseType(type);
            const arr = typeof messages === "string"
                ? [{ message: messages }]
                : Array.isArray(messages) ? messages
                    : [{ message: String(messages) }];
            show(t, arr);
        },
        success(msg) { show(TYPE.SUCCESS, [{ message: msg }]); },
        error(msg, fieldId) { show(TYPE.ERROR, [{ message: msg, fieldId }]); },
        warning(msg) { show(TYPE.WARNING, [{ message: msg }]); },
        info(msg) { show(TYPE.INFO, [{ message: msg }]); },
        dismiss(el) { dismiss(el); },
        dismissAll() { dismissAll(); },
        TYPE
    };
    window.Glint = window.Glint || {};
    window.Glint.Toast = GlintToast;

})();