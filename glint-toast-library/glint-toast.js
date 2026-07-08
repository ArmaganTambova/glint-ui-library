/* ════════════════════════════════════════════════════════════════════════
 *  ✎ DÜZENLEYİNİZ — TEMA KAPAĞI (glint-toast.js)
 *  Davranış / süre / limit anahtarlarının TAMAMI aşağıdaki CONFIG objesinde;
 *  çalışma zamanında Glint.Toast.configure({...}) ile de değiştirilebilir.
 *  Renk · tipografi · hareket · yerleşim token'ları → glint-toast.css
 *  tepesindeki Tema Kapağı (:root bloğu).
 *
 *  HIZLI BAŞLANGIÇ — en sık 3 senaryo:
 *  1) Marka rengi → glint-toast.css kapağı: --glint-toast-accent-info +
 *       --glint-toast-glow-info (örnek mor: #7c3aed / 124, 58, 237)
 *  2) Hareketi kısma → OS "hareketi azalt" ayarına OTOMATİK uyulur; koddan,
 *       tüm kit için: Glint.configure({ reducedMotion: true })  (input paketi yüklüyse)
 *  3) Yoğunluk → Glint.Toast.configure({ density: "compact" })  (tek satır kompakt)
 *
 *  CONFIG — anahtar · tip · varsayılan · açıklama:
 *    autoDismiss      obje   {success:3500, error:8000, warning:6000, info:5000}
 *                              — tür başına otomatik kapanma süresi (ms; 0 = süresiz)
 *    staggerDelay     ms     140            — sunucu burst'ünde ardışık toast'lar arası gecikme
 *    maxVisible       sayı   5              — aynı anda görünür toast üst sınırı
 *    collapseDelay    ms     320            — çıkış animasyonu → yükseklik daralması gecikmesi
 *    releaseRingMs    ms     900            — hover bırakılınca son halka dalgasının süresi
 *    position         metin  "top-right"    — top-right | top-left | top-center |
 *                                             bottom-right | bottom-left
 *    dedupe           bool   true           — aynı tür+metin görünürken yeni toast yerine
 *                                             ×N rozeti + süre tazeleme (bildirim spam'i biter)
 *    swipeToDismiss   bool   true           — yatay kaydırarak kapatma (hıza duyarlı savurma)
 *    stacking [v1.7]  metin  "list"         — "list" dikey liste | "stack" Sonner tarzı yığın
 *                                             (önde 1, arkada 2 kademeli; hover/odakta açılır,
 *                                             hover tüm sayaçları duraklatır)
 *    overflow [v1.7]  metin  "evict"        — maxVisible dolunca: "evict" en eski hızlı çıkışla
 *                                             atılır | "queue" yenisi FIFO kuyrukta bekler
 *                                             (boşalan slota 80ms arayla girer)
 *    pauseAllOnHover  bool   false          — [v1.7] container hover'ı TÜM sayaçları duraklatır
 *                                             (stack modunda her zaman otomatik devrede)
 *    density  [v1.7]  metin  "comfortable"  — | "compact": başlık + soluk mesaj tek satırda;
 *                                             dar dolgu, 16px ikon, 4px progress
 *    group    [v1.7]  bool   false          — aynı türden toast'lar tek kutuda satır olarak
 *                                             birikir; 5 satırdan sonrası "+N daha";
 *                                             grup etkinken dedupe atlanır
 *
 *  Toast-bazlı opts (show/success/error/warning/info son argüman):
 *    duration (ms) · sticky (bool, süresiz) · title (özel başlık) ·
 *    action: { label, onClick(ev), keepOpen?, countdown? } — aksiyon/"Geri Al"
 *      butonu; countdown:true → butonda süreye senkron geri sayım çizgisi [v1.7] ·
 *    group: "anahtar" | true | false — toast bazında gruplama (CONFIG.group'u ezer) [v1.7]
 *
 *  Başlık metinleri → LABELS (Başarılı/Hata/Uyarı/Bilgi)
 *  Akıllı alan köprüsü politikası → Glint.config.fieldErrors:
 *      "smart" | "inline" | "toast"  (input paketinin kapağından yönetilir)
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
        swipeToDismiss: true,
        // v1.7 — yerleşim: "list" (dikey liste, mevcut davranış) | "stack"
        // (Sonner tarzı yığın: önde 1 toast, arkadaki 2'si kademeli görünür,
        // container hover/odakta listeye açılır; hover tüm sayaçları duraklatır)
        stacking: "list",
        // v1.7 — maxVisible dolunca taşma davranışı: "evict" (en eski toast
        // hızlı çıkışla atılır, varsayılan) | "queue" (yenisi FIFO kuyrukta
        // bekler; her kapanışta sıradaki 80ms arayla gösterilir)
        overflow: "evict",
        // v1.7 — true: container'a hover TÜM sayaçları duraklatır (stack
        // modunda bu davranış her zaman otomatik devrededir)
        pauseAllOnHover: false,
        // v1.7 — yoğunluk: "comfortable" (varsayılan) | "compact" (başlık +
        // soluk mesaj tek satırda; dar dolgu, 16px ikon, 4px progress)
        density: "comfortable",
        // v1.7 — true: aynı türden toast'lar tek kutuda satır olarak birikir
        // (toast bazında opts.group:"anahtar" ile de açılır; grup etkinken
        // dedupe atlanır; 5 satırdan sonrası "+N daha" olarak özetlenir)
        group: false
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
    let stackExpanded = false;   // v1.7 — yığın modu hover/odakla açık mı
    let allPaused = false;       // v1.7 — container-hover tüm sayaçları duraklattı mı
    let queuedToasts = [];       // v1.7 — overflow:"queue" FIFO bekleme dizisi ({el, entry})
    let queueDrainTimer = null;  // v1.7 — kuyruk boşaltma zamanlayıcısı (80ms stagger)
    let pendingShows = [];       // v1.7 — show edildi, mount'u (setTimeout) bekliyor
                                 //        ({el, entry, cancelled}) — aynı tick'te gelen
                                 //        dedupe/grup/update/dismiss çağrıları bunları da görür
    let keysBound = false;       // v1.7 — document keydown yalnız bir kez bağlanır

    const POSITIONS = ["top-right", "top-left", "top-center", "bottom-right", "bottom-left"];

    function ensureContainer() {
        if (container && document.contains(container)) {
            applyPosition(container);
            applyDensity(container);
            return container;
        }
        container = document.createElement("div");
        container.id = "glint-toast-container";
        // v1.7 — klavye erişimi: adlandırılmış bildirim bölgesi
        container.setAttribute("role", "region");
        container.setAttribute("aria-label", "Bildirimler");
        applyPosition(container);
        applyDensity(container);
        bindKeys();

        // v1.7 — yığın modu aç/kapa + hover'da tümünü duraklat (stack'te otomatik).
        // mouseenter/leave köpürmez ama torun-öğe geçişlerinde ancestor'da tetiklenir;
        // odak (klavye) için focusin/focusout da bağlanır.
        container.addEventListener("mouseenter", onContainerHoverStart);
        container.addEventListener("mouseleave", onContainerHoverEnd);
        container.addEventListener("focusin", onContainerHoverStart);
        container.addEventListener("focusout", (e) => {
            if (!container.contains(e.relatedTarget)) onContainerHoverEnd();
        });

        document.body.appendChild(container);
        return container;
    }

    function stackEnabled() { return CONFIG.stacking === "stack"; }

    function isBottomPos() {
        const pos = POSITIONS.includes(CONFIG.position) ? CONFIG.position : "top-right";
        return pos.indexOf("bottom") === 0;
    }

    /** v1.7 — container-hover'da tümünü duraklatma: stack modunda otomatik;
     *  CONFIG.pauseAllOnHover === true ise her modda. */
    function pauseAllActive() {
        return stackEnabled() || CONFIG.pauseAllOnHover === true;
    }

    function onContainerHoverStart() {
        if (stackEnabled() && !stackExpanded) { stackExpanded = true; layoutStack(); }
        if (pauseAllActive()) pauseAll();
    }

    function onContainerHoverEnd() {
        if (stackEnabled() && stackExpanded) { stackExpanded = false; layoutStack(); }
        if (allPaused) resumeAll();
    }

    /** v1.7 — yoğunluk sınıfını uygula (CONFIG.density: "compact"). */
    function applyDensity(c) {
        c.classList.toggle("glint-density-compact", CONFIG.density === "compact");
    }

    /** v1.7 — taşma davranışı (geçersiz/eski değer → "evict"). */
    function overflowMode() {
        return CONFIG.overflow === "queue" ? "queue" : "evict";
    }

    // ── v1.7 klavye erişimi ────────────────────────────────────────
    //  Esc          → en yeni toast'ı kapat (yazı alanı odaklıyken karışmaz)
    //  Alt+Shift+T  → ilk (en yeni) toast'a odak
    //  ↑/↓          → toast'lar arasında görsel sıraya göre gezinme
    //  (toast'lar tabindex -1 alır; odakta :focus-visible halkası — CSS)

    function isTypingTarget(t) {
        return !!(t && t.matches && t.matches(
            "input, textarea, select, [contenteditable='true'], [contenteditable='']"));
    }

    /** Görsel sıraya (ekran üstü → altı) göre komşu toast'a odak taşı;
     *  bottom konumları/stack modu için DOM sırasına güvenilmez. */
    function focusSibling(current, dir) {
        const els = activeToasts.map(t => t.el).filter(el => el.isConnected);
        if (!els.length) return;
        els.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
        const i = els.indexOf(current);
        if (i === -1) return;
        const next = els[i + dir];
        if (next) { try { next.focus(); } catch (e) { /* sessiz */ } }
    }

    function onDocKeydown(e) {
        // Alt+Shift+T → ilk toast'a odak (e.code: klavye düzeninden bağımsız)
        if (e.altKey && e.shiftKey && e.code === "KeyT") {
            const first = activeToasts.find(t => t.el.isConnected);
            if (first) {
                e.preventDefault();
                try { first.el.focus(); } catch (err) { /* sessiz */ }
            }
            return;
        }
        if (e.key === "Escape") {
            if (isTypingTarget(e.target)) return;   // form elemanı odaklı → karışma
            const newest = activeToasts.find(t => t.el.isConnected);
            if (newest) dismiss(newest.el, true, "user");
            return;
        }
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            const cur = e.target;
            if (!cur || !cur.classList || !cur.classList.contains("glint-toast")) return;
            if (!container || !container.contains(cur)) return;
            e.preventDefault();
            focusSibling(cur, e.key === "ArrowDown" ? 1 : -1);
        }
    }

    function bindKeys() {
        if (keysBound) return;
        keysBound = true;
        document.addEventListener("keydown", onDocKeydown);
    }

    // ── v1.7 hareket yardımcıları ──────────────────────────────────

    /** Marka token'ını ms olarak oku (toast tek başına da yüklenebilir → fallback). */
    function readMs(varName, fallback) {
        try {
            const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
            if (v.endsWith("ms")) return parseFloat(v) || fallback;
            if (v.endsWith("s")) return (parseFloat(v) * 1000) || fallback;
        } catch (e) { /* sessiz */ }
        return fallback;
    }

    function readEase(varName, fallback) {
        try {
            const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
            if (v) return v;
        } catch (e) { /* sessiz */ }
        return fallback;
    }

    /**
     * v1.7 — Yığın FLIP: bir DOM mutasyonu (prepend/remove) komşu toast'ları
     * zıplatmasın. Mutasyondan önce görünür toast'ların rect'leri ölçülür,
     * mutasyon çalışır, fark inverse-transform'dan sıfıra animatlanır.
     * Bottom konumlarda yön rect farkından otomatik doğru çıkar.
     * Yalnız INSERT ve EVICT/anında-remove yollarında kullanılır (collapse
     * zaten max-height geçişiyle yumuşak). Stack modunda gerek yok (yerleşim
     * transform-transition ile taşınır).
     */
    function flipReflow(mutate, excludeEl) {
        if (!container || reducedMotionToast()) { mutate(); return; }
        const others = [...container.children].filter(el =>
            el !== excludeEl &&
            !el.classList.contains("glint-toast-exit") &&
            !el.classList.contains("glint-toast-evict") &&
            !el.classList.contains("glint-toast-stack-exit"));
        const rects = new Map(others.map(el => [el, el.getBoundingClientRect()]));
        mutate();
        const dur = readMs("--glint-dur-4", 240);
        const ease = readEase("--glint-ease-out", "cubic-bezier(0.22, 1, 0.36, 1)");
        others.forEach(el => {
            if (!el.isConnected || typeof el.animate !== "function") return;
            const prev = rects.get(el);
            const now = el.getBoundingClientRect();
            const dx = prev.left - now.left;
            const dy = prev.top - now.top;
            if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
            el.animate(
                [{ transform: "translate(" + dx + "px, " + dy + "px)" }, { transform: "translate(0px, 0px)" }],
                { duration: dur, easing: ease }
            );
        });
    }

    /** v1.7 — enter animasyonunun fill:forwards kalıntısını tek merkezden bırak:
     *  final durumu .glint-toast-settled sınıfı sabitler (inline transform'lar
     *  — swipe vb. — artık animasyon tarafından ezilmez). */
    function settle(toastEl) {
        toastEl.classList.add("glint-toast-settled");
    }

    /** v1.6 — konum sınıfını uygula (CONFIG.position). */
    function applyPosition(c) {
        const pos = POSITIONS.includes(CONFIG.position) ? CONFIG.position : "top-right";
        POSITIONS.forEach(p => c.classList.remove("glint-pos-" + p));
        c.classList.add("glint-pos-" + pos);
    }

    /**
     * v1.7 — Sonner tarzı yığın yerleşimi. Stack modunda tüm toast'lar absolute
     * konumlanır; yer değişimi salt transform-transition ile yapılır (CSS:
     * #glint-toast-container.glint-stack-mode). Kapalıyken önde 1 toast tam,
     * arkadaki 2'si kademeli scale/offset ile görünür, 4.+ tamamen gizli.
     * Açıkken (hover/odak) normal liste ofsetlerine kayar. Liste moduna
     * dönüşte inline yığın stilleri temizlenir.
     */
    function layoutStack() {
        if (!container) return;
        const isStack = stackEnabled();
        container.classList.toggle("glint-stack-mode", isStack);
        if (!isStack) {
            stackExpanded = false;
            container.classList.remove("glint-stack-expanded");
            container.style.height = "";
            [...container.children].forEach(el => {
                el.classList.remove("glint-stack-hidden");
                el.style.removeProperty("--_stack-y");
                el.style.removeProperty("--_stack-scale");
                el.style.removeProperty("--_stack-opacity");
                el.style.zIndex = "";
            });
            return;
        }

        const bottom = isBottomPos();
        const expanded = stackExpanded;
        container.classList.toggle("glint-stack-expanded", expanded);

        const GAP = 8;      // açık liste boşluğu (container gap ile aynı)
        const PEEK = 10;    // kapalıyken arkadakilerin kademeli ofseti (px)
        let offset = 0;
        activeToasts.forEach((t, i) => {
            const el = t.el;
            el.style.zIndex = String(200 - i);   // yeni olan önde
            if (expanded) {
                el.classList.remove("glint-stack-hidden");
                el.style.setProperty("--_stack-y", (bottom ? -offset : offset) + "px");
                el.style.setProperty("--_stack-scale", "1");
                el.style.setProperty("--_stack-opacity", "1");
                offset += el.offsetHeight + GAP;
            } else {
                const j = Math.min(i, 3);
                el.style.setProperty("--_stack-y", ((bottom ? -1 : 1) * j * PEEK) + "px");
                el.style.setProperty("--_stack-scale", String(1 - j * 0.05));
                el.style.setProperty("--_stack-opacity",
                    i === 0 ? "1" : i === 1 ? "0.85" : i === 2 ? "0.7" : "0");
                el.classList.toggle("glint-stack-hidden", i >= 3);
            }
        });

        // Hover alanı doğru olsun diye container yüksekliği içerikle eşitlenir
        const front = activeToasts[0];
        if (!front) {
            container.style.height = "";
        } else if (expanded) {
            container.style.height = Math.max(offset - GAP, 0) + "px";
        } else {
            const peekCount = Math.min(activeToasts.length - 1, 2);
            container.style.height = (front.el.offsetHeight + peekCount * 10) + "px";
        }
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
        // v1.7 — klavye erişimi: ↑/↓ gezinme + Alt+Shift+T odak hedefi
        // (actionable toast show() içinde tabindex 0'a yükseltilir)
        toast.tabIndex = -1;

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
        closeBtn.addEventListener("click", () => dismiss(toast, true, "user"));

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

        const autoDismissMs = opts.sticky ? 0
            : (typeof opts.duration === "number" ? opts.duration : (CONFIG.autoDismiss[type] ?? 0));

        // v1.6 — Aksiyon butonu ("Geri Al" gibi): opts.action = { label,
        // onClick(ev), keepOpen?, countdown? }. Tıklamada varsayılan davranış
        // kapatmadır. v1.7 — countdown: butonda süreyle daralan çizgi.
        if (opts.action && opts.action.label) {
            body.appendChild(buildActionButton(toast, opts.action, autoDismissMs));
        }

        inner.append(header, body);
        toast.appendChild(inner);

        if (autoDismissMs > 0) {
            const progress = document.createElement("div");
            progress.className = "glint-toast-progress";
            toast.appendChild(progress);
        }

        return toast;
    }

    /** v1.7 — Aksiyon butonu üretici (show + update ortak). action =
     *  { label, onClick(ev), keepOpen?, countdown? }. countdown:true + süreli
     *  toast → butonun altında toast süresine senkron daralan ince çizgi;
     *  süre dolunca buton devre dışı bırakılır (dismiss'in "timeout" yolu). */
    function buildActionButton(toastEl, action, autoDismissMs) {
        const act = document.createElement("button");
        act.type = "button";
        act.className = "glint-toast-action";
        act.textContent = action.label;
        if (action.countdown && autoDismissMs > 0) {
            act.classList.add("glint-toast-action--countdown");
            const line = document.createElement("span");
            line.className = "glint-toast-action-line";
            line.setAttribute("aria-hidden", "true");
            act.appendChild(line);
        }
        act.addEventListener("click", (ev) => {
            ev.stopPropagation();
            if (act.disabled) return;
            try { action.onClick && action.onClick(ev); } catch (e) { }
            if (!action.keepOpen) dismiss(toastEl, true, "user");
        });
        return act;
    }


    // ══════════════════════════════════════════════════════════════
    //  HOVER PAUSE / RESUME + DUAL PULSE RING
    // ══════════════════════════════════════════════════════════════

    /** v1.7 — süreyle senkron akan çizgiler: progress hüzmesi + undo geri
     *  sayım çizgisi (action.countdown). Duraklat/sürdür/tazele işlemleri
     *  hepsine birden uygulanır. */
    function timerBars(toastEl) {
        return toastEl.querySelectorAll(".glint-toast-progress, .glint-toast-action-line");
    }

    /** v1.7 — sayaç duraklat (toast hover'ı VEYA container-hover/stack). */
    function pauseEntry(entry) {
        if (entry.paused) return;
        entry.paused = true;
        if (entry.timerId) {
            clearTimeout(entry.timerId);
            entry.timerId = null;
        }
        if (entry.baseDuration > 0 && entry.startedAt > 0) {
            const elapsed = Date.now() - entry.startedAt;
            entry.remaining = Math.max(0, entry.remaining - elapsed);
        }
        timerBars(entry.el).forEach(b => b.classList.add("glint-progress-paused"));
    }

    /** v1.7 — sayaç sürdür. Duraklıyken dedupe/grup süreyi tazelediyse
     *  (_refreshProgress) çizgiler tazelenmiş süreyle baştan çizilir. */
    function resumeEntry(entry) {
        if (!entry.paused) return;
        entry.paused = false;
        const bars = timerBars(entry.el);
        bars.forEach(b => b.classList.remove("glint-progress-paused"));
        if (entry.baseDuration <= 0) return;

        if (entry._refreshProgress) {
            bars.forEach(bar => {
                bar.style.animationDuration = entry.remaining + "ms";
                bar.classList.remove("glint-progress-running");
                void bar.offsetWidth;
                bar.classList.add("glint-progress-running");
            });
        }
        entry._refreshProgress = false;

        if (entry.remaining <= 0) {
            dismiss(entry.el, true, "timeout");
            return;
        }
        entry.startedAt = Date.now();
        entry.timerId = setTimeout(() => dismiss(entry.el, true, "timeout"), entry.remaining);
    }

    /** v1.7 — container-hover: tüm sayaçlar duraklar (stack modunda otomatik). */
    function pauseAll() {
        if (allPaused) return;
        allPaused = true;
        activeToasts.forEach(pauseEntry);
    }

    function resumeAll() {
        if (!allPaused) return;
        allPaused = false;
        activeToasts.forEach(resumeEntry);
    }

    function attachHoverPause(toastEl, entry) {
        // v1.7 (hata 6) — morphToast hem show hem morph yolunda çağırabilir:
        // çifte listener bağlanmasın.
        if (entry._hoverBound) return;
        entry._hoverBound = true;

        let releaseTimer = null;

        toastEl.addEventListener("mouseenter", () => {
            pauseEntry(entry);

            // Dual ring breathing başlat
            if (releaseTimer) { clearTimeout(releaseTimer); releaseTimer = null; }
            toastEl.classList.remove("glint-toast-releasing");
            toastEl.classList.add("glint-toast-held");
        });

        toastEl.addEventListener("mouseleave", () => {
            if (!entry.paused) return;

            // Dual ring release — zarif son dalga
            toastEl.classList.remove("glint-toast-held");
            toastEl.classList.add("glint-toast-releasing");

            releaseTimer = setTimeout(() => {
                toastEl.classList.remove("glint-toast-releasing");
                releaseTimer = null;
            }, CONFIG.releaseRingMs);

            // Container-hover duraklatması sürüyorsa (stack modu) sayaç
            // container'dan çıkışta (resumeAll) sürdürülür.
            if (allPaused) return;
            resumeEntry(entry);
        });
    }


    // ══════════════════════════════════════════════════════════════
    //  GÖSTER / KAPAT
    // ══════════════════════════════════════════════════════════════

    /** v1.6 — Aynı tür + aynı tek-mesaj zaten görünürse yenisini açma:
     *  mevcut toast'a ×N rozeti bas, süresini tazele, pulse ver.
     *  v1.7 (hata 7) — anahtar karşılaştırmasına title + action.label da dahil:
     *  farklı başlıklı/aksiyonlu toast'lar yanlışlıkla birleştirilmez. */
    function tryCoalesce(type, messages, opts) {
        if (!CONFIG.dedupe || opts.loading || messages.length !== 1 || messages[0].fieldId) return false;
        const msg = messages[0].message;
        const wantTitle = opts.title || null;
        const wantAction = (opts.action && opts.action.label) || null;
        const match = t =>
            t.type === type && t.text === msg &&
            (t.title || null) === wantTitle &&
            (t.actionLabel || null) === wantAction &&
            !t.el.classList.contains("glint-toast-exit") &&
            !t.el.classList.contains("glint-toast-evict") &&
            !t.el.classList.contains("glint-toast-stack-exit");
        // v1.7 — mount bekleyenler (aynı tick burst'ü) ve kuyruktakiler de
        // aranır; aksi hâlde art arda çağrılarda dedupe hiç işlemezdi.
        const live = activeToasts.find(match);
        const entry = live ||
            (queuedToasts.find(q => match(q.entry)) || {}).entry ||
            (pendingShows.find(p => !p.cancelled && match(p.entry)) || {}).entry;
        if (!entry) return false;
        entry.count = (entry.count || 1) + 1;
        renderCountBadge(entry);
        if (live) refreshEntryTimer(entry);   // mount edilmemişin süresi mount'ta başlar
        return true;
    }

    /** v1.7 — ×N rozetini işle/tazele (dedupe + grup ortak; sayacı
     *  ÇAĞIRAN artırır, burası yalnız çizer + pop verir). */
    function renderCountBadge(entry) {
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
    }

    /** v1.7 — süreyi tazele + progress/geri-sayım çizgilerini baştan başlat
     *  (dedupe + grup ortak). v1.7 (hata 4) — hover'dayken (paused) de
     *  remaining tazelenir; timer + çizgiler mouseleave'de (resumeEntry)
     *  tazelenmiş süreyle kurulur. */
    function refreshEntryTimer(entry) {
        if (entry.timerId) clearTimeout(entry.timerId);
        if (entry.baseDuration <= 0) return;
        entry.remaining = entry.baseDuration;
        if (entry.paused) {
            entry._refreshProgress = true;
            return;
        }
        entry.startedAt = Date.now();
        entry.timerId = setTimeout(() => dismiss(entry.el, true, "timeout"), entry.baseDuration);
        timerBars(entry.el).forEach(bar => {
            // resume tazelemesi kısmi süre yazmış olabilir → tam süreye dön
            bar.style.animationDuration = entry.baseDuration + "ms";
            bar.classList.remove("glint-progress-running");
            void bar.offsetWidth;
            bar.classList.add("glint-progress-running");
        });
    }

    /** v1.7 — grup anahtarı çözümü: opts.group ("anahtar" | true) öncelikli,
     *  yoksa CONFIG.group === true → tür bazlı otomatik anahtar.
     *  opts.group === false toast bazında gruplamayı kapatır. */
    function resolveGroupKey(type, opts) {
        if (opts.group === false) return null;
        if (typeof opts.group === "string" && opts.group) return opts.group;
        if (opts.group === true || (opts.group == null && CONFIG.group === true)) {
            return "__glint-type-" + type;
        }
        return null;
    }

    const GROUP_MAX_LINES = 5;   // v1.7 — grupta görünen satır sınırı ("+N daha")

    /** v1.7 — grup/özet modu: aynı gruptan görünür (veya mount bekleyen /
     *  kuyruktaki) toast'a yeni mesaj <li> olarak eklenir (mevcut li giriş
     *  animasyonu + komşulara FLIP + başlıkta ×N). 5 satırdan sonrası
     *  "+N daha" satırında özetlenir. Grup etkinken dedupe atlanır
     *  (show'daki dallanma) — çakışmazlar. */
    function tryGroup(groupKey, messages) {
        const live = activeToasts.find(t =>
            t.groupKey === groupKey && t.el.isConnected &&
            !t.el.classList.contains("glint-toast-exit") &&
            !t.el.classList.contains("glint-toast-evict") &&
            !t.el.classList.contains("glint-toast-stack-exit"));
        const qItem = !live ? queuedToasts.find(q => q.entry.groupKey === groupKey) : null;
        const pItem = (!live && !qItem)
            ? pendingShows.find(p => !p.cancelled && p.entry.groupKey === groupKey) : null;
        const entry = live || (qItem && qItem.entry) || (pItem && pItem.entry);
        if (!entry) return false;

        const body = entry.el.querySelector(".glint-toast-body");
        if (!body) return false;

        const grow = () => {
            let ul = body.querySelector("ul");
            if (!ul) {
                // Tek mesajlı gövdeyi listeye çevir (ilk mesaj yeniden animatlanmasın)
                ul = document.createElement("ul");
                const p = body.querySelector("p");
                if (p) {
                    const first = document.createElement("li");
                    first.textContent = p.textContent;
                    first.style.animation = "none";
                    ul.appendChild(first);
                    p.remove();
                }
                body.insertBefore(ul, body.querySelector(".glint-toast-action"));
            }
            messages.forEach(m => {
                entry.count = (entry.count || 1) + 1;
                const visible = ul.querySelectorAll("li:not(.glint-toast-more)").length;
                if (visible >= GROUP_MAX_LINES) {
                    // Sınır aşıldı → "+N daha" özet satırı (yeniden pop'lanır)
                    entry.groupExtra = (entry.groupExtra || 0) + 1;
                    let more = ul.querySelector("li.glint-toast-more");
                    if (!more) {
                        more = document.createElement("li");
                        more.className = "glint-toast-more";
                        ul.appendChild(more);
                    }
                    more.textContent = "+" + entry.groupExtra + " daha";
                    more.style.animation = "none";
                    void more.offsetWidth;
                    more.style.animation = "";
                    more.style.animationDelay = "0s";
                } else {
                    const li = document.createElement("li");
                    li.textContent = m.message;
                    li.style.animationDelay = "0s";   // nth-child gecikmesi eklemede anlamsız
                    ul.appendChild(li);
                    const more = ul.querySelector("li.glint-toast-more");
                    if (more && more !== ul.lastElementChild) ul.appendChild(more);
                }
            });
        };

        // Toast büyür → liste modunda komşular FLIP ile yumuşak kayar;
        // stack modunda yerleşimi layoutStack/transition taşır.
        if (live && !stackEnabled()) {
            flipReflow(grow, entry.el);
        } else {
            grow();
            if (live && stackEnabled()) layoutStack();
        }

        renderCountBadge(entry);
        if (live) refreshEntryTimer(entry);   // kuyruktakinin süresini mount başlatır
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

        // v1.7 — grup/özet modu: aynı gruptan görünür toast'a satır olarak
        // eklenir. Grup etkinken dedupe atlanır (çakışmazlar).
        const groupKey = opts.loading ? null : resolveGroupKey(type, opts);
        if (groupKey) {
            if (tryGroup(groupKey, messages)) return null;
        } else if (tryCoalesce(type, messages, opts)) {
            // v1.6 — bildirim spam'i önleme (×N rozeti)
            return null;
        }

        const toastEl = buildToastEl(type, messages, opts);

        // Görünmeyen/genel hatalar toast'ta → tıkla ilk hatalı alana kaydır+odakla.
        // v1.7 (hata 1) — klavye erişimi: tabindex + Enter/Space aynı işi yapar.
        if (policy.scrollTargetId) {
            toastEl.classList.add("glint-toast--actionable");
            toastEl.setAttribute("title", "Hatalı alana git");
            toastEl.tabIndex = 0;
            toastEl.setAttribute("aria-label",
                messages.map(m => m.message).join(". ") + " — hatalı alana gitmek için Enter");
            const goToField = () => {
                scrollToField(policy.scrollTargetId);
                dismiss(toastEl, true, "user");
            };
            toastEl.addEventListener("click", (e) => {
                if (e.target.closest && e.target.closest(".glint-toast-close, .glint-toast-action")) return;
                goToField();
            });
            toastEl.addEventListener("keydown", (e) => {
                if (e.target !== toastEl) return;   // kapat/aksiyon butonları karışmasın
                if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
                    e.preventDefault();
                    goToField();
                }
            });
        }

        const autoDismissMs = opts.sticky ? 0
            : (typeof opts.duration === "number" ? opts.duration : (CONFIG.autoDismiss[type] ?? 0));

        const entry = {
            el: toastEl,
            type,
            text: messages.length === 1 ? messages[0].message : null,
            title: opts.title || null,                              // v1.7 — dedupe anahtarı
            actionLabel: (opts.action && opts.action.label) || null, // v1.7 — dedupe anahtarı
            groupKey,                                                // v1.7 — grup/özet anahtarı
            groupExtra: 0,                                           // v1.7 — "+N daha" sayacı
            count: 1,
            baseDuration: autoDismissMs,
            timerId: null,
            remaining: autoDismissMs,
            startedAt: 0,
            paused: false
        };

        // v1.7 — mount'a kadar "beklemede" izlenir: aynı tick'te gelen
        // dedupe/grup/update/dismiss çağrıları bu toast'ı da görebilsin.
        const pending = { el: toastEl, entry, cancelled: false };
        pendingShows.push(pending);

        setTimeout(() => {
            const pi = pendingShows.indexOf(pending);
            if (pi !== -1) pendingShows.splice(pi, 1);
            if (pending.cancelled) return;   // mount'tan önce dismiss edildi

            // v1.7 — kuyruk modu: maxVisible doluysa FIFO beklemeye alınır;
            // her kapanışta drainQueue sıradakini 80ms arayla gösterir.
            if (overflowMode() === "queue" && activeToasts.length >= CONFIG.maxVisible) {
                queuedToasts.push({ el: toastEl, entry });
                return;
            }
            mountToast(toastEl, entry);
        }, staggerMs);

        return toastEl;
    }

    /** v1.7 — toast'ı DOM'a tak (show'un montaj bölümü; kuyruk modunda
     *  drainQueue da çağırır). Süre/progress entry.baseDuration'dan okunur:
     *  kuyrukta beklerken update() ile değişmiş olabilir. */
    function mountToast(toastEl, entry) {
        const c = ensureContainer();
        const autoDismissMs = entry.baseDuration;

        // maxVisible tahliyesi BURADA yapılır (show başında değil): sunucu
        // burst'ünde toast'lar staggerMs ile sırayla eklenir; erken tahliye
        // henüz eklenmemişlere göre yanlış karar verir (yarış → maxVisible
        // aşılır). O anki gerçek uzunluğa göre tahliye et. v1.7 (hata 3) —
        // anında remove yerine hızlı mini-çıkış (evictOldest). Kuyruk modunda
        // buraya yalnız yer varken gelinir → tahliye çalışmaz.
        if (overflowMode() !== "queue") {
            while (activeToasts.length > 0 && activeToasts.length >= CONFIG.maxVisible) {
                evictOldest();
            }
        }

        if (stackEnabled()) {
            c.prepend(toastEl);   // yerleşimi layoutStack + transition taşır
        } else {
            // v1.7 (hata 2) — prepend komşuları zıplatmasın: yığın FLIP
            flipReflow(() => c.prepend(toastEl), toastEl);
        }

        // v1.7 (hata 5) — enter animasyonu fill:forwards kalıntısı tek
        // merkezde temizlenir: toast girişi bitince final durum
        // .glint-toast-settled ile sabitlenir; dekoratif halka dalgası
        // (ring-outer-entry, ~1.15s) bitince enter sınıfı da bırakılır.
        const onAnimEnd = (e) => {
            if (e.target === toastEl &&
                (e.animationName === "glint-toast-in" || e.animationName === "glint-toast-in-mobile")) {
                settle(toastEl);
            }
            if (e.animationName === "glint-ring-outer-entry") {
                toastEl.classList.remove("glint-toast-enter");
                toastEl.removeEventListener("animationend", onAnimEnd);
                clearTimeout(settleSafety);
            }
        };
        toastEl.addEventListener("animationend", onAnimEnd);
        const settleSafety = setTimeout(() => {
            settle(toastEl);
            toastEl.classList.remove("glint-toast-enter");
            toastEl.removeEventListener("animationend", onAnimEnd);
        }, 1600);

        requestAnimationFrame(() => {
            toastEl.classList.add("glint-toast-enter");

            if (autoDismissMs > 0) {
                // v1.7 — progress hüzmesi + undo geri sayım çizgisi birlikte başlar
                timerBars(toastEl).forEach(bar => {
                    bar.style.animationDuration = autoDismissMs + "ms";
                    bar.classList.add("glint-progress-running");
                });
            }

            if (stackEnabled()) layoutStack();
        });

        if (autoDismissMs > 0) {
            entry.remaining = autoDismissMs;
            entry.startedAt = Date.now();
            entry.timerId = setTimeout(() => dismiss(toastEl, true, "timeout"), autoDismissMs);
        }

        activeToasts.unshift(entry);

        // Container şu an hover'lıysa (stack/pauseAll) yeni gelen de duraksın
        if (allPaused) pauseEntry(entry);

        if (autoDismissMs > 0) {
            attachHoverPause(toastEl, entry);
        }
        if (CONFIG.swipeToDismiss) attachSwipe(toastEl);
        emit("glint:toast-open", { type: entry.type, element: toastEl });
        // Alan köprüsü show() başında SENKRON uygulanıyor (applyFieldErrorPolicy).
    }

    /** v1.7 — kuyruk boşaltma: boşalan her slot için sıradaki toast 80ms
     *  arayla gösterilir (birden çok slot açılırsa zincirleme stagger).
     *  Tek zamanlayıcı üzerinden çalışır → yarış oluşmaz. */
    function drainQueue() {
        if (overflowMode() !== "queue" || !queuedToasts.length) return;
        if (queueDrainTimer) return;   // zaten planlı
        queueDrainTimer = setTimeout(() => {
            queueDrainTimer = null;
            if (!queuedToasts.length) return;
            if (activeToasts.length >= CONFIG.maxVisible) return;
            const item = queuedToasts.shift();
            mountToast(item.el, item.entry);
            drainQueue();
        }, 80);
    }

    /**
     * v1.7 (hata 3) — maxVisible tahliyesi: en eski toast anında remove yerine
     * hızlı mini-çıkışla (140ms opacity+scale .96) gider. activeToasts'tan
     * çıkarım SENKRON kalır (stagger burst'ünde yarış olmasın).
     */
    function evictOldest() {
        const entry = activeToasts[activeToasts.length - 1];
        if (!entry) return;
        activeToasts.splice(activeToasts.length - 1, 1);
        if (entry.timerId) clearTimeout(entry.timerId);
        const el = entry.el;
        emit("glint:toast-close", { element: el, reason: "evict" }); // v1.7 — kapanış nedeni dışa açık
        el.classList.remove("glint-toast-enter", "glint-toast-held", "glint-toast-releasing");
        el.classList.add("glint-toast-evict");
        if (stackEnabled()) layoutStack();
        setTimeout(() => {
            if (stackEnabled()) {
                el.remove();
                layoutStack();
            } else {
                flipReflow(() => el.remove());
            }
        }, 150);
    }

    /**
     * v1.6 — Kaydırarak kapatma (mobil öncelikli, her işaretçiyle çalışır):
     * yatay sürükleme toast'ı takip eder; eşik aşılırsa savrularak kapanır,
     * aşılmazsa yayla yerine döner. Dikey kaydırma (sayfa scroll'u) bozulmaz
     * (CSS: touch-action: pan-y).
     * v1.7 — hıza duyarlı: pointermove örneklerinden hız (px/ms) çıkarılır;
     * |v| > 0.5 ise mesafe eşiği aşılmasa da savrulur; savurma süresi hıza
     * orantılıdır. Sürüklerken hafif rotate(dx·0.02deg) doğallık katar.
     * Yavaş sürüklemede v1.6 mesafe eşiği (72px) aynen korunur.
     */
    function attachSwipe(toastEl) {
        let startX = 0, dx = 0, dragging = false, pid = null;
        let samples = [];               // v1.7 — {t, x} hız örnekleri
        const THRESHOLD = 72;           // yavaş sürükleme mesafe eşiği (px)
        const FLING_V = 0.5;            // savurma hız eşiği (px/ms)

        toastEl.addEventListener("pointerdown", (e) => {
            if (e.button != null && e.button !== 0) return;
            if (e.target.closest(".glint-toast-close, .glint-toast-action")) return;
            dragging = true; pid = e.pointerId; startX = e.clientX; dx = 0;
            samples = [{ t: e.timeStamp, x: e.clientX }];
            // Enter animasyonu inline transform'u ezmesin → final durumu sabitle
            // (animationend'deki merkezî settle ile aynı sınıf — hata 5).
            settle(toastEl);
            toastEl.classList.add("glint-toast-swiping");
            try { toastEl.setPointerCapture(pid); } catch (err) { }
        });
        toastEl.addEventListener("pointermove", (e) => {
            if (!dragging || e.pointerId !== pid) return;
            dx = e.clientX - startX;
            samples.push({ t: e.timeStamp, x: e.clientX });
            if (samples.length > 8) samples.shift();
            toastEl.style.transform = "translateX(" + dx + "px) rotate(" + (dx * 0.02).toFixed(2) + "deg)";
            toastEl.style.opacity = String(Math.max(0.25, 1 - Math.abs(dx) / 260));
        });
        const end = (e) => {
            if (!dragging || (e.pointerId != null && e.pointerId !== pid)) return;
            dragging = false;
            try { toastEl.releasePointerCapture(pid); } catch (err) { }
            toastEl.classList.remove("glint-toast-swiping");

            // v1.7 — bırakma hızı: son ~40ms+ pencereden px/ms
            let v = 0;
            const last = samples[samples.length - 1];
            for (let i = samples.length - 2; i >= 0; i--) {
                if (last.t - samples[i].t >= 40 || i === 0) {
                    const dt = last.t - samples[i].t;
                    if (dt > 0) v = (last.x - samples[i].x) / dt;
                    break;
                }
            }

            const byVelocity = Math.abs(v) > FLING_V;
            if (Math.abs(dx) > THRESHOLD || byVelocity) {
                // Savrulma: yön hızdan (varsa), süre/mesafe hıza orantılı
                const dir = byVelocity ? (Math.sign(v) || Math.sign(dx) || 1) : (dx > 0 ? 1 : -1);
                const speed = Math.max(Math.abs(v), 0.9);                 // px/ms taban
                const rest = Math.max(460 - Math.abs(dx), 160);           // kalan yol (px)
                const dur = Math.round(Math.min(300, Math.max(110, rest / speed)));
                toastEl.style.transition = "transform " + dur + "ms cubic-bezier(0.3, 0, 0.8, 0.4), opacity " + dur + "ms ease-out";
                toastEl.style.transform = "translateX(" + (dir * 460) + "px) rotate(" + (dir * 9) + "deg)";
                toastEl.style.opacity = "0";
                setTimeout(() => dismiss(toastEl, false, "swipe"), dur);
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

    /**
     * v1.7 — kapanış nedeni `glint:toast-close` detail'inde dışa açılır:
     * reason: "timeout" | "user" | "swipe" | "evict" | "api".
     * (timeout: süre doldu · user: kapat/aksiyon/Esc · swipe: savurma ·
     *  evict: maxVisible tahliyesi · api: Glint.Toast.dismiss/dismissAll)
     */
    function dismiss(toastEl, animate = true, reason = "api") {
        if (!toastEl) return;

        // v1.7 — mount bekleyen (aynı tick'te show edilmiş) toast: iptal et
        const pIdx = pendingShows.findIndex(p => p.el === toastEl);
        if (pIdx !== -1) {
            pendingShows[pIdx].cancelled = true;
            pendingShows.splice(pIdx, 1);
            emit("glint:toast-close", { element: toastEl, reason });
            return;
        }

        // v1.7 — kuyrukta bekleyen (henüz gösterilmemiş) toast: sessizce düşür
        const qi = queuedToasts.findIndex(q => q.el === toastEl);
        if (qi !== -1) {
            queuedToasts.splice(qi, 1);
            emit("glint:toast-close", { element: toastEl, reason });
            return;
        }

        if (toastEl.classList.contains("glint-toast-exit") ||
            toastEl.classList.contains("glint-toast-evict") ||
            toastEl.classList.contains("glint-toast-stack-exit")) return;

        const idx = activeToasts.findIndex(t => t.el === toastEl);
        if (idx !== -1) {
            const entry = activeToasts[idx];
            if (entry.timerId) clearTimeout(entry.timerId);
            activeToasts.splice(idx, 1);
        }
        emit("glint:toast-close", { element: toastEl, reason });

        // v1.7 — süre doldu → undo geri sayımlı buton devre dışı kalır
        // (çıkış animasyonu sürerken artık tıklanamaz)
        if (reason === "timeout") {
            toastEl.querySelectorAll(".glint-toast-action--countdown")
                .forEach(b => { b.disabled = true; });
        }

        // v1.7 — odak kapanan toast'taysa sıradakine taşı (↑/↓ + Esc akışı
        // odağı body'ye düşürmesin)
        if (toastEl.contains(document.activeElement)) {
            const next = activeToasts.find(t => t.el.isConnected);
            if (next) { try { next.el.focus(); } catch (e) { /* sessiz */ } }
        }

        // v1.7 — kuyruk modunda boşalan slota sıradaki gelir (80ms stagger)
        drainQueue();

        if (!animate) {
            if (stackEnabled()) {
                toastEl.remove();
                layoutStack();
            } else {
                // Swipe savurması sonrası anında remove komşuları zıplatmasın
                flipReflow(() => toastEl.remove());
            }
            return;
        }

        const progress = toastEl.querySelector(".glint-toast-progress");
        if (progress) progress.style.animationPlayState = "paused";

        toastEl.classList.remove("glint-toast-enter", "glint-toast-held",
            "glint-toast-releasing", "glint-toast-settled");

        if (stackEnabled()) {
            // Yığın modunda glint-toast-out kullanılamaz: keyframe transform'u
            // REPLACE eder, toast yığın ofsetinden köşeye sıçrar. Mevcut
            // (yığın) transform'un üstüne bindirilen WAAPI çıkışı kullanılır;
            // kalanlar layoutStack transition'ıyla yerlerine kayar.
            toastEl.classList.add("glint-toast-stack-exit");
            layoutStack();
            if (reducedMotionToast() || typeof toastEl.animate !== "function") {
                toastEl.remove();
                layoutStack();
                return;
            }
            const cs = getComputedStyle(toastEl);
            const base = (cs.transform && cs.transform !== "none") ? cs.transform : "";
            const dirY = isBottomPos() ? "12px" : "-12px";
            const anim = toastEl.animate([
                { transform: base || "none", opacity: cs.opacity, filter: "blur(0px)" },
                {
                    transform: (base ? base + " " : "") + "translateY(" + dirY + ") scale(0.92)",
                    opacity: 0, filter: "blur(2px)"
                }
            ], {
                duration: readMs("--glint-dur-4", 240),
                easing: "cubic-bezier(0.4, 0, 0.7, 0.2)",
                fill: "forwards"
            });
            const fin = () => { toastEl.remove(); };
            anim.onfinish = fin;
            anim.oncancel = fin;
            return;
        }

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

    /** v1.7 — kademeli kapanış: üstten alta 40ms stagger (reduced-motion'da
     *  anlık). Bottom konumlarda görsel üst = dizinin sonu → sıra çevrilir.
     *  Kuyruk + mount bekleyenler de boşaltılır (hiç gösterilmediler →
     *  close eventi yok). */
    function dismissAll() {
        pendingShows.forEach(p => { p.cancelled = true; });
        pendingShows.length = 0;
        queuedToasts.length = 0;
        const list = isBottomPos() ? [...activeToasts].reverse() : [...activeToasts];
        const stagger = reducedMotionToast() ? 0 : 40;
        list.forEach((t, i) => {
            if (i === 0 || stagger === 0) {
                dismiss(t.el, true, "api");
            } else {
                setTimeout(() => dismiss(t.el, true, "api"), i * stagger);
            }
        });
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
     * v1.7 — Görünen toast'ı YERİNDE güncelle (v1.6 morphToast'un
     * genelleştirilmiş hâli; promise() de içten bunu kullanır). changes:
     *   { type, message, title, duration, sticky, action }
     *   • type    → ikon/renk/rol aynı kutuda morf olur; title verilmediyse
     *               başlık yeni türün varsayılan etiketine (LABELS) döner.
     *   • message → gövde metni değişir (çok satırlı gövde tek paragrafa iner).
     *   • action  → buton değiştirilir/eklenir; null → kaldırılır;
     *               undefined (anahtar yok) → dokunulmaz.
     *   • type/duration/sticky'den biri verilirse sayaç + progress + geri
     *     sayım çizgisi baştan kurulur (sticky:true süresiz yapar).
     * Var olmayan/kapanmış el'de güvenli düşüş: mesaj varsa YENİ toast açılır.
     * Mount bekleyen / kuyruktaki toast da güncellenebilir (sayaç mount'ta
     * başlar). Dönüş: güncellenen (veya yeni açılan) toast elementi.
     */
    function updateToast(toastEl, changes) {
        changes = changes || {};
        const live = toastEl ? activeToasts.find(t => t.el === toastEl) : null;
        const qItem = (!live && toastEl) ? queuedToasts.find(q => q.el === toastEl) : null;
        const pItem = (!live && !qItem && toastEl)
            ? pendingShows.find(p => p.el === toastEl && !p.cancelled) : null;
        const entry = live || (qItem && qItem.entry) || (pItem && pItem.entry);
        const gone = !toastEl || !entry ||
            (live && !document.contains(toastEl)) ||
            toastEl.classList.contains("glint-toast-exit") ||
            toastEl.classList.contains("glint-toast-evict") ||
            toastEl.classList.contains("glint-toast-stack-exit");

        if (gone) {
            // Toast bu arada kapatıldıysa sonucu normal yolla göster
            if (changes.message == null) return null;
            return show(changes.type != null ? parseType(changes.type) : TYPE.INFO,
                [{ message: changes.message }], 0, {
                    title: changes.title,
                    duration: changes.duration,
                    sticky: changes.sticky,
                    action: changes.action
                });
        }

        // ── Tür morf'u ──
        if (changes.type != null) {
            const newType = parseType(changes.type);
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
            if (changes.title == null) {
                const t = toastEl.querySelector(".glint-toast-title");
                if (t) t.textContent = LABELS[newType] ?? "Bildirim";
                entry.title = null;                     // dedupe anahtarı güncel kalsın
            }
            entry.type = newType;
        }

        // ── Başlık / mesaj ──
        if (changes.title != null) {
            const t = toastEl.querySelector(".glint-toast-title");
            if (t) t.textContent = changes.title;
            entry.title = changes.title;                // dedupe anahtarı güncel kalsın
        }
        const body = toastEl.querySelector(".glint-toast-body");
        if (changes.message != null && body) {
            let p = body.querySelector("p");
            if (!p) {
                const ul = body.querySelector("ul");    // çok satırlı gövde → tek paragraf
                if (ul) ul.remove();
                p = document.createElement("p");
                body.insertBefore(p, body.firstChild);
            }
            p.textContent = changes.message;
            entry.text = changes.message;
        }

        // ── Sayaç hedefi: type/duration/sticky'den biri verildiyse baştan ──
        const timerTouch = changes.type != null || changes.duration != null || changes.sticky != null;
        const newMs = changes.sticky ? 0
            : (typeof changes.duration === "number" ? changes.duration
                : (timerTouch ? (CONFIG.autoDismiss[entry.type] ?? 0) : entry.baseDuration));

        // ── Aksiyon butonu: null → kaldır; {label,...} → değiştir/ekle ──
        if (changes.action !== undefined && body) {
            const old = body.querySelector(".glint-toast-action");
            if (old) old.remove();
            entry.actionLabel = null;
            if (changes.action && changes.action.label) {
                body.appendChild(buildActionButton(toastEl, changes.action, newMs));
                entry.actionLabel = changes.action.label;
            }
        }

        if (timerTouch) {
            // Otomatik kapanma + progress + geri sayım çizgisi şimdi (yeniden) başlar
            if (entry.timerId) { clearTimeout(entry.timerId); entry.timerId = null; }
            entry.baseDuration = newMs;
            entry.remaining = newMs;
            if (newMs > 0) {
                let progress = toastEl.querySelector(".glint-toast-progress");
                if (!progress) {
                    progress = document.createElement("div");
                    progress.className = "glint-toast-progress";
                    toastEl.appendChild(progress);
                }
                if (live) {
                    if (entry.paused) {
                        // hover sürüyor → çizgiler resumeEntry'de tazelenmiş süreyle kurulur
                        entry._refreshProgress = true;
                    } else {
                        entry.startedAt = Date.now();
                        entry.timerId = setTimeout(() => dismiss(toastEl, true, "timeout"), newMs);
                        timerBars(toastEl).forEach(bar => {
                            bar.style.animationDuration = newMs + "ms";
                            bar.classList.remove("glint-progress-running");
                            void bar.offsetWidth;
                            bar.classList.add("glint-progress-running");
                        });
                    }
                    // v1.7 (hata 6) — _hoverBound guard'ı çifte bağlanmayı önler
                    attachHoverPause(toastEl, entry);
                }
                // kuyruktaysa sayaç/çizgiler mount'ta entry.baseDuration'dan kurulur
            } else {
                const progress = toastEl.querySelector(".glint-toast-progress");
                if (progress) progress.remove();
                const line = toastEl.querySelector(".glint-toast-action-line");
                if (line) line.remove();   // süresiz toast'ta geri sayım çizgisi anlamsız
            }
        } else if (changes.action !== undefined && live && entry.baseDuration > 0) {
            // Sayaç sıfırlanmadı ama buton yenilendi → yeni geri sayım çizgisi
            // kalan süreye senkron başlasın (negatif delay geçen kısmı atlar)
            const line = toastEl.querySelector(".glint-toast-action-line");
            if (line && !entry.paused) {
                const elapsed = entry.startedAt > 0 ? (Date.now() - entry.startedAt) : 0;
                const total = entry.baseDuration;
                const spent = Math.max(0, total - Math.max(0, entry.remaining - elapsed));
                line.style.animationDuration = total + "ms";
                line.style.animationDelay = "-" + spent + "ms";
                line.classList.add("glint-progress-running");
            } else if (line && entry.paused) {
                line.classList.add("glint-progress-paused");
                entry._refreshProgress = true;   // resume'da kalan süreyle kurulur
            }
        }

        // Yükseklik değişmiş olabilir → yığın yerleşimini tazele
        if (live && stackEnabled()) layoutStack();
        return toastEl;
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
            // v1.7 — morf artık genel update() altyapısını kullanır
            Promise.resolve(promise).then(
                (val) => {
                    updateToast(el, Object.assign({}, msgs.opts, {
                        type: TYPE.SUCCESS,
                        message: resolveMsg(msgs.success, val, "Tamamlandı.")
                    }));
                },
                (err) => {
                    updateToast(el, Object.assign({}, msgs.opts, {
                        type: TYPE.ERROR,
                        message: resolveMsg(msgs.error, err, "Bir hata oluştu.")
                    }));
                }
            );
            return promise;
        },

        /**
         * v1.7 — Görünen toast'ı yerinde güncelle:
         *   Glint.Toast.update(el, {type, message, title, duration, sticky, action})
         * action: null → butonu kaldırır; verilmezse dokunulmaz. type/duration/
         * sticky verilirse sayaç baştan kurulur. Kapanmış/bulunamayan el'de
         * mesaj varsa yeni toast açılır (güvenli düşüş). Dönüş: toast elementi.
         */
        update(el, changes) { return updateToast(el, changes); },

        /** v1.6 — Çalışma zamanı yapılandırması: {position, maxVisible,
         *  dedupe, swipeToDismiss, staggerDelay, autoDismiss:{success|error|
         *  warning|info: ms}}
         *  v1.7 — {stacking: "list"|"stack", overflow: "evict"|"queue",
         *  pauseAllOnHover: bool, density: "comfortable"|"compact",
         *  group: bool} (ayrıntılar dosya tepesindeki ✎ bloğunda). */
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
                if (p.stacking != null && p.stacking !== "list" && p.stacking !== "stack") {
                    delete p.stacking;                  // geçersiz değer → mevcut kalır
                }
                // v1.7 — yeni anahtar doğrulamaları
                if (p.overflow != null && p.overflow !== "evict" && p.overflow !== "queue") {
                    delete p.overflow;
                }
                if (p.density != null && p.density !== "comfortable" && p.density !== "compact") {
                    delete p.density;
                }
                if ("pauseAllOnHover" in p) p.pauseAllOnHover = !!p.pauseAllOnHover;
                if ("group" in p) p.group = !!p.group;
                Object.assign(CONFIG, p);
                if (container) {
                    applyPosition(container);
                    applyDensity(container);            // v1.7 — yoğunluk sınıfı
                    layoutStack();                      // v1.7 — mod/konum değişimini uygula
                }
                drainQueue();                           // v1.7 — maxVisible büyüdüyse kuyruğu boşalt
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