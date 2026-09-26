// ── ONJJEM landing page engine ───────────────────────────────────────────────
// Used by mug.html, magnets.html, blanket.html (and the promo/reviews on
// index.html + tiktok.html). Each product page sets window.PAGE = {...} and
// has an empty <div id="app"></div>.

const API_BASE = "https://onjjem-production-5ef8.up.railway.app";

// ── EDIT THESE TWO THINGS IN ONE PLACE ──────────────────────────────────────
// 1. The current offer. The code MUST exist in Stripe as a *promotion code*
//    (Stripe → Product catalogue → Coupons → create coupon → add promotion code).
//    Set active:false to hide the offer everywhere.
const ONJJEM_PROMO = {
  active: true,
  code: "XMAS15",
  headline: "🎃 Halloween cartoons are here! Plus 15% off everything",
  small: "Enter the code at checkout. Ends 30 November."
};

// 2. Real customer reviews only. Add new ones to the top as they come in.
const ONJJEM_REVIEWS = [
  { name: "Kelly W.", bought: "Photo print", text: "I purchased a print of my children — fantastic quality, great value and super fast delivery. Will definitely be using ONJJEM again." },
  { name: "Niamh", bought: "Colour-changing mug", text: "Love the mug I ordered. Such a cute design and the heat-activated effect works perfectly. Really happy with it!" }
];
// ─────────────────────────────────────────────────────────────────────────────

function onjjemGa() { if (typeof gtag === "function") { try { gtag.apply(null, arguments); } catch (e) {} } }
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function money(p) { return "£" + Number(p).toFixed(2); }

function ONJJEM_offerBarHtml() {
  if (!ONJJEM_PROMO.active) return "";
  return `<div class="offer-bar">${ONJJEM_PROMO.headline} — use code <code>${esc(ONJJEM_PROMO.code)}</code></div>`;
}

function ONJJEM_reviewsHtml() {
  if (!ONJJEM_REVIEWS.length) return "";
  return `
  <section class="l-section wrap">
    <h2>What customers say <span class="gold">★★★★★</span></h2>
    <div class="reviews">
      ${ONJJEM_REVIEWS.map(r => `
        <div class="review">
          <div class="stars">★★★★★</div>
          <p>“${esc(r.text)}”</p>
          <div class="who">${esc(r.name)} · ${esc(r.bought)}</div>
        </div>`).join("")}
    </div>
  </section>`;
}

function ONJJEM_headerHtml() {
  return `
  ${ONJJEM_offerBarHtml()}
  <header class="l-header">
    <a href="/" class="l-logo">ONJJEM</a>
    <nav class="l-nav"><a href="/">Shop</a><a href="/#faq">Help</a></nav>
  </header>`;
}

function ONJJEM_footerHtml() {
  return `
  <footer class="l-footer">
    <p style="margin-bottom:0.5rem">Personalised gifts, handmade to order in the UK · <a href="mailto:hello@onjjem.com">hello@onjjem.com</a></p>
    <a href="/delivery.html">Delivery</a><a href="/terms.html">Terms</a><a href="/privacy.html">Privacy</a>
  </footer>`;
}

// Shrink very large phone photos so upload + checkout stay fast.
function ONJJEM_readPhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Couldn't read that photo — please try another."));
    reader.onload = () => {
      const dataUrl = reader.result;
      if (file.size < 6 * 1024 * 1024) { resolve(dataUrl); return; }
      const img = new Image();
      img.onload = () => {
        const max = 3600;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", 0.92));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

// Lay 1–9 photos out as a square grid (print-ready, 1800px = 6" at 300dpi).
// 2–3 photos fill a 2x2 grid and 5–8 fill a 3x3 grid by repeating photos.
function ONJJEM_buildCollage(dataUrls) {
  const load = src => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
  return Promise.all(dataUrls.map(load)).then(imgs => {
    imgs = imgs.filter(Boolean);
    const n = imgs.length;
    const cols = n <= 1 ? 1 : n <= 4 ? 2 : 3;
    const size = 1800, gap = 18;
    const cell = (size - gap * (cols + 1)) / cols;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    for (let k = 0; k < cols * cols; k++) {
      const img = imgs[k % n];
      const s = Math.min(img.width, img.height);
      const sx = (img.width - s) / 2, sy = (img.height - s) / 2;
      const x = gap + (k % cols) * (cell + gap), y = gap + Math.floor(k / cols) * (cell + gap);
      ctx.drawImage(img, sx, sy, s, s, x, y, cell, cell);
    }
    return c.toDataURL("image/jpeg", 0.92);
  });
}

// Convert a photo to PNG (some print products, like stickers, need PNG files).
function ONJJEM_toPng(dataUrl, maxPx) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL("image/png"));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function ONJJEM_printAnythingHtml() {
  const items = [
    ["📸", "Photos", "Family, friends, holidays"],
    ["🐶", "Pets", "Dogs, cats, even the hamster"],
    ["✏️", "Your words", "Slogans, names, in-jokes, quotes"],
    ["🖍️", "Kids' drawings", "Snap a photo of their artwork"],
    ["🎨", "Cartoons", "We turn your photo into one"],
    ["📱", "Screenshots", "A funny message or a sweet text"]
  ];
  return `
  <section class="l-section wrap">
    <h2>Print <span class="gold">anything</span></h2>
    <p style="text-align:center;color:var(--muted);margin:-0.4rem auto 1rem;max-width:520px">If it's on your phone, we can print it. No photo? Type your words and we'll design it for you.</p>
    <div class="tiles" style="grid-template-columns:repeat(3,1fr)">
      ${items.map(i => `<div class="tile" style="padding:0.9rem 0.6rem;text-align:center"><div style="font-size:1.8rem">${i[0]}</div><h3 style="margin-top:0.3rem">${i[1]}</h3><div class="t-tag">${i[2]}</div></div>`).join("")}
    </div>
  </section>`;
}

// ── Text maker: customer types words, we draw a print-ready design ──────────
const ONJJEM_TEXT_THEMES = [
  { name: "Classic", bg: "#ffffff", fg: "#111111" },
  { name: "Gold", bg: "#141414", fg: "#e8c75a" },
  { name: "Pink", bg: "#ffd6e5", fg: "#b0144f" },
  { name: "Halloween", bg: "#2b1240", fg: "#ff9a2e" },
  { name: "Christmas", bg: "#b3121f", fg: "#ffffff" },
  { name: "Mint", bg: "#d8f3e6", fg: "#0f5a3c" }
];
const ONJJEM_TEXT_FONTS = [
  { name: "Bold", css: "800 {px}px -apple-system, 'Helvetica Neue', Arial, sans-serif" },
  { name: "Fun", css: "700 {px}px 'Chalkboard SE', 'Comic Sans MS', 'Marker Felt', cursive" },
  { name: "Elegant", css: "italic 600 {px}px Georgia, 'Times New Roman', serif" }
];

function ONJJEM_drawText(canvas, text, theme, font) {
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  ctx.fillStyle = theme.bg; ctx.fillRect(0, 0, W, H);
  // Keep words in the middle so nothing is cut off when the print is trimmed.
  const boxW = Math.min(W, H * 1.4) * 0.72, boxH = Math.min(H, W * 1.4) * 0.62;
  const words = (text.trim() || "Your words here").split(/\s+/);
  let size = Math.round(boxH / 2), lines = [];
  for (; size > 16; size -= 4) {
    ctx.font = font.css.replace("{px}", size);
    lines = []; let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > boxW && line) { lines.push(line); line = w; } else { line = test; }
    }
    lines.push(line);
    const widest = Math.max(...lines.map(l => ctx.measureText(l).width));
    if (lines.length * size * 1.2 <= boxH && widest <= boxW) break;
  }
  ctx.fillStyle = theme.fg; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const top = H / 2 - ((lines.length - 1) * size * 1.2) / 2;
  lines.forEach((l, i) => ctx.fillText(l, W / 2, top + i * size * 1.2));
}

function ONJJEM_openTextMaker(aspect, onDone) {
  let theme = ONJJEM_TEXT_THEMES[0], font = ONJJEM_TEXT_FONTS[0];
  const long = 2400;
  const W = aspect >= 1 ? long : Math.round(long * aspect);
  const H = aspect >= 1 ? Math.round(long / aspect) : long;
  const overlay = document.createElement("div");
  overlay.className = "cartoon-preview-overlay";
  overlay.innerHTML = `
    <div class="cartoon-preview-card" style="max-width:440px">
      <div class="cartoon-preview-title">Type your words ✏️</div>
      <p class="cartoon-email-note">A slogan, a name, an in-joke or a message. Emojis work too 🎉</p>
      <textarea id="tmText" rows="3" maxlength="120" placeholder="e.g. World's Best Grandad" style="width:100%;border-radius:10px;padding:0.7rem;font-size:1rem;border:1px solid #ccc;font-family:inherit"></textarea>
      <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin:0.7rem 0 0.4rem" id="tmThemes">
        ${ONJJEM_TEXT_THEMES.map((t, i) => `<button type="button" data-t="${i}" title="${t.name}" style="width:38px;height:38px;border-radius:50%;border:3px solid ${i === 0 ? "#d4af37" : "transparent"};background:linear-gradient(135deg,${t.bg} 50%,${t.fg} 50%);cursor:pointer"></button>`).join("")}
      </div>
      <div style="display:flex;gap:0.4rem;margin-bottom:0.7rem" id="tmFonts">
        ${ONJJEM_TEXT_FONTS.map((f, i) => `<button type="button" data-f="${i}" style="flex:1;padding:0.5rem;border-radius:8px;border:2px solid ${i === 0 ? "#d4af37" : "#ccc"};background:#fff;color:#111;font:${f.css.replace("{px}", 15)};cursor:pointer">${f.name}</button>`).join("")}
      </div>
      <canvas id="tmCanvas" width="${W}" height="${H}" style="width:100%;border-radius:10px;border:1px solid #ddd;display:block"></canvas>
      <button class="cartoon-btn-primary" id="tmUse" style="width:100%;margin-top:0.8rem">Use this design →</button>
      <button class="cartoon-btn-secondary" id="tmCancel" style="width:100%;margin-top:0.5rem">Cancel</button>
    </div>`;
  document.body.appendChild(overlay);
  const canvas = overlay.querySelector("#tmCanvas");
  const textEl = overlay.querySelector("#tmText");
  const redraw = () => ONJJEM_drawText(canvas, textEl.value, theme, font);
  textEl.addEventListener("input", redraw);
  overlay.querySelectorAll("[data-t]").forEach(b => b.addEventListener("click", () => {
    theme = ONJJEM_TEXT_THEMES[+b.dataset.t];
    overlay.querySelectorAll("[data-t]").forEach(x => x.style.borderColor = x === b ? "#d4af37" : "transparent");
    redraw();
  }));
  overlay.querySelectorAll("[data-f]").forEach(b => b.addEventListener("click", () => {
    font = ONJJEM_TEXT_FONTS[+b.dataset.f];
    overlay.querySelectorAll("[data-f]").forEach(x => x.style.borderColor = x === b ? "#d4af37" : "#ccc");
    redraw();
  }));
  overlay.querySelector("#tmCancel").addEventListener("click", () => overlay.remove());
  overlay.querySelector("#tmUse").addEventListener("click", () => {
    if (!textEl.value.trim()) { textEl.focus(); textEl.placeholder = "Type something first 🙂"; return; }
    redraw();
    const url = canvas.toDataURL("image/jpeg", 0.95);
    overlay.remove();
    onDone(url);
  });
  redraw();
  setTimeout(() => textEl.focus(), 50);
}

function ONJJEM_renderLanding(P) {
  const app = document.getElementById("app");
  const opts = P.options;
  let selected = Math.max(0, opts.findIndex(o => o.default));
  let photo = null;

  const fromPrice = Math.min(...opts.map(o => o.price));

  app.innerHTML = `
  ${ONJJEM_headerHtml()}
  <main>
    <section class="wrap l-hero">
      <div class="l-hero-img"><img src="${P.heroImg}" alt="${esc(P.heroAlt || P.title)}"></div>
      <div>
        <div class="l-kicker">${esc(P.kicker)}</div>
        <h1>${esc(P.title)}</h1>
        <p class="sub">${esc(P.sub)}</p>
        <div class="l-price">${opts.length > 1 ? "From " : ""}${money(fromPrice)} <small>· free UK delivery</small></div>
        <ul class="l-ticks">${P.ticks.map(t => `<li>${esc(t)}</li>`).join("")}</ul>
        <a href="#order" class="btn">${esc(P.cta || "Create yours now")}</a>
      </div>
    </section>

    <section class="l-section wrap">
      <h2>How it works</h2>
      <div class="steps">
        <div class="step"><div class="step-num">1</div><div><h3>Pick a photo or type words</h3><p>Pets, kids, family, a drawing, or your own slogan.</p></div></div>
        <div class="step"><div class="step-num">2</div><div><h3>${P.cartoon ? "Cartoon it (optional)" : "Choose your option"}</h3><p>${P.cartoon ? "See a free preview of your photo as a cartoon. Add it for £1.99, or keep the original." : "Pick the size or style you want."}</p></div></div>
        <div class="step"><div class="step-num">3</div><div><h3>We make it &amp; post it</h3><p>Printed to order in the UK and sent with free tracked delivery.</p></div></div>
      </div>
    </section>

    ${ONJJEM_printAnythingHtml()}

    <section class="l-section wrap" id="order">
      <div class="order-box">
        <h2>${esc(P.orderTitle || "Make yours")}</h2>

        <span class="order-label">1. Choose ${esc(P.optionWord || "your option")}</span>
        <div class="options" id="options">
          ${opts.map((o, i) => `
            <label class="option${i === selected ? " selected" : ""}" data-i="${i}">
              <input type="radio" name="opt" value="${i}"${i === selected ? " checked" : ""}>
              <span class="o-name">${esc(o.name)}${o.badge ? `<span class="o-badge">${esc(o.badge)}</span>` : ""}${o.note ? `<small>${esc(o.note)}</small>` : ""}</span>
              <span class="o-price">${money(o.price)}</span>
            </label>`).join("")}
        </div>

        <span class="order-label">2. Add your photo${opts.some(o => o.multi) ? "s" : ""}, drawing or words</span>
        <input type="file" id="photoInput" accept="image/*" style="display:none">
        <div class="upload" id="uploadBox" role="button" tabindex="0"></div>
        <button type="button" class="btn btn-ghost" id="typeBtn" style="margin-top:0.6rem;font-size:0.95rem;padding:0.75rem">✏️ No photo? Type your own words or slogan</button>

        <div class="order-total"><span>Total <small style="color:var(--muted)">(free UK delivery)</small></span><strong id="total">${money(opts[selected].price)}</strong></div>
        <button class="btn" id="buyBtn">${P.cartoon ? "Continue — preview & checkout" : "Continue to secure checkout"}</button>
        <div class="order-status" id="status"></div>
        <p class="order-note">🔒 Secure payment by Stripe${ONJJEM_PROMO.active ? ` · Code <strong>${esc(ONJJEM_PROMO.code)}</strong> goes in at checkout` : ""}</p>
      </div>
    </section>

    ${ONJJEM_reviewsHtml()}

    ${P.faq && P.faq.length ? `
    <section class="l-section wrap faq">
      <h2>Questions</h2>
      ${P.faq.map(f => `<details><summary>${esc(f[0])}</summary><p>${esc(f[1])}</p></details>`).join("")}
    </section>` : ""}
  </main>
  ${ONJJEM_footerHtml()}
  <div class="sticky-buy" id="stickyBuy"><a href="#order" class="btn">${esc(P.cta || "Create yours now")} — ${money(fromPrice)}</a></div>
  `;

  // Option selection
  const optionEls = app.querySelectorAll(".option");
  const input = document.getElementById("photoInput");
  const box = document.getElementById("uploadBox");
  const status = document.getElementById("status");
  let photos = []; // every photo the customer picked (for collage options)
  const isMulti = () => !!opts[selected].multi;
  const emptyBox = () => `<div class="u-icon">📸</div><div class="u-text">${isMulti() ? "Tap to choose up to " + opts[selected].multi + " photos" : "Tap to choose a photo"}</div><div class="u-hint">${esc(isMulti() ? (opts[selected].multiHint || "Pick 1, 4 or 9 photos for a perfect grid.") : (P.photoHint || "Clear, bright photos print best."))}</div>`;

  async function refreshPhoto() {
    if (!photos.length) { photo = null; box.classList.remove("has-photo"); box.innerHTML = emptyBox(); return; }
    if (isMulti() && photos.length > 1) {
      box.innerHTML = `<div class="u-text">Building your collage…</div>`;
      photo = await ONJJEM_buildCollage(photos.slice(0, opts[selected].multi));
    } else {
      photo = photos[0];
    }
    const n = isMulti() ? Math.min(photos.length, opts[selected].multi) : 1;
    box.classList.add("has-photo");
    box.innerHTML = `<img class="u-preview" src="${photo}" alt="Your photo"><div class="u-text">✓ ${n > 1 ? n + " photos added" : "Photo added"}</div><div class="u-hint">Tap to change</div>`;
  }

  optionEls.forEach(el => el.addEventListener("click", async () => {
    const wasMulti = isMulti();
    selected = Number(el.dataset.i);
    optionEls.forEach(e => e.classList.toggle("selected", e === el));
    el.querySelector("input").checked = true;
    document.getElementById("total").textContent = money(opts[selected].price);
    input.multiple = isMulti();
    if (wasMulti !== isMulti()) await refreshPhoto();
  }));
  input.multiple = isMulti();
  box.innerHTML = emptyBox();

  // Photo upload
  box.addEventListener("click", () => input.click());
  box.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") input.click(); });
  input.addEventListener("change", async () => {
    const files = Array.from(input.files || []);
    if (!files.length) return;
    status.textContent = "";
    box.innerHTML = `<div class="u-text">Loading your photo${files.length > 1 ? "s" : ""}…</div>`;
    try {
      const max = isMulti() ? opts[selected].multi : 1;
      if (files.length > max) status.textContent = `We've used your first ${max} photos.`;
      photos = await Promise.all(files.slice(0, max).map(ONJJEM_readPhoto));
      await refreshPhoto();
      input.value = "";
      onjjemGa("event", "add_to_cart", { currency: "GBP", value: opts[selected].price, items: [{ item_id: opts[selected].sku, item_name: opts[selected].name, price: opts[selected].price }] });
    } catch (err) {
      photos = []; await refreshPhoto();
      status.textContent = err.message;
    }
  });

  // Typed words / slogans
  let isTextDesign = false;
  document.getElementById("typeBtn").addEventListener("click", () => {
    const o = opts[selected];
    ONJJEM_openTextMaker(o.aspect || P.textAspect || 1, async dataUrl => {
      photos = [dataUrl];
      isTextDesign = true;
      await refreshPhoto();
      box.querySelector(".u-text").textContent = "✓ Your words are ready";
      box.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
  input.addEventListener("change", () => { isTextDesign = false; });

  // Buy
  const buyBtn = document.getElementById("buyBtn");
  buyBtn.addEventListener("click", () => {
    if (!photo) { status.textContent = "Please add your photo first 📸"; box.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    status.textContent = "";
    const collage = isMulti() && photos.length > 1; // cartoons are for single photos
    if (P.cartoon && !collage && !isTextDesign && typeof ONJJEM_showPhotoPreview === "function") {
      ONJJEM_showPhotoPreview(photo, cartoonOpts => checkout(cartoonOpts));
    } else {
      checkout(null);
    }
  });

  async function checkout(cartoonOpts) {
    const o = opts[selected];
    buyBtn.disabled = true;
    status.style.color = "var(--muted)";
    status.textContent = "Taking you to secure checkout…";
    onjjemGa("event", "begin_checkout", { currency: "GBP", value: o.price, items: [{ item_id: o.sku, item_name: o.name, price: o.price }] });
    try {
      const photoToSend = P.pngMaxPx ? await ONJJEM_toPng(photo, P.pngMaxPx) : photo;
      const res = await fetch(`${API_BASE}/api/stripe/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.assign({
          sku: o.sku,
          photoBase64: photoToSend,
          successUrl: window.location.origin + "/?order=success&session_id={CHECKOUT_SESSION_ID}",
          cancelUrl: window.location.href.split("#")[0] + "#order"
        }, cartoonOpts || {}))
      });
      const data = await res.json().catch(() => ({}));
      if (data.url) { window.location.href = data.url; return; }
      throw new Error(data.error || "Checkout didn't start");
    } catch (err) {
      buyBtn.disabled = false;
      status.style.color = "#ffb4a8";
      status.textContent = "Sorry — something went wrong. Please try again, or email hello@onjjem.com and we'll sort it.";
    }
  }

  // Sticky buy bar on mobile until the order box is on screen
  const sticky = document.getElementById("stickyBuy");
  const orderBox = document.getElementById("order");
  document.body.classList.add("has-sticky");
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(entries => {
      sticky.classList.toggle("show", !entries[0].isIntersecting && window.scrollY > 200);
    }).observe(orderBox);
    window.addEventListener("scroll", () => {
      const r = orderBox.getBoundingClientRect();
      const visible = r.top < window.innerHeight && r.bottom > 0;
      sticky.classList.toggle("show", !visible && window.scrollY > 200);
    }, { passive: true });
  }

  onjjemGa("event", "view_item", { currency: "GBP", value: fromPrice, items: opts.map(o => ({ item_id: o.sku, item_name: o.name, price: o.price })) });
}

if (window.PAGE) {
  document.addEventListener("DOMContentLoaded", () => ONJJEM_renderLanding(window.PAGE));
}
